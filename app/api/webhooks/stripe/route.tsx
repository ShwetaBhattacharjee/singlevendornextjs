import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { sendPurchaseReceipt } from "@/emails";
import Order from "@/lib/db/models/order.model";
import { connectToDatabase } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  console.log("Received event:", event.type);

  // Acknowledge Stripe immediately
  processEventAsync(event.type, event.data.object); // Offload processing
  return new NextResponse("Received", { status: 200 });
}

async function processEventAsync(type: string, data: Stripe.Event.Data.Object) {
  try {
    // Ensure database connection
    await connectToDatabase();
    console.log("Database connection established.");

    if (type === "charge.succeeded") {
      const charge = data as Stripe.Charge;
      console.log("Charge object:", charge);

      const meta = charge.metadata as Stripe.Metadata;
      console.log("Charge metadata:", meta);

      const orderId = meta.orderId;
      const email = charge.billing_details?.email || "No email provided";
      const pricePaidInCents = charge.amount;

      if (!orderId) {
        console.error("Order ID not found in metadata.");
        return;
      }

      const order = await Order.findById(orderId).populate("user email");
      if (!order) {
        console.error("Order not found:", orderId);
        return;
      }

      console.log("Order retrieved:", order);

      // Update order status
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: charge.id,
        status: "COMPLETED",
        email_address: email,
        pricePaid: (pricePaidInCents / 100).toFixed(2),
      };

      try {
        console.log("Saving order...");
        await order.save();
        console.log("Order updated successfully:", orderId);
      } catch (err) {
        console.error("Error saving order:", err);
      }

      // Send purchase receipt email
      try {
        console.log("Sending purchase receipt...");
        await sendPurchaseReceipt({ order });
        console.log("Purchase receipt sent.");
      } catch (err) {
        console.error("Failed to send email receipt:", err);
      }
    } else {
      console.log(`Unhandled event type: ${type}`);
    }
  } catch (err) {
    console.error("Error processing event:", err);
  }
}
