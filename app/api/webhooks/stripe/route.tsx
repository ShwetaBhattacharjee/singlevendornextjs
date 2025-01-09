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

  console.log("Received Stripe event:", event.type);

  // Acknowledge Stripe immediately
  processEventAsync(event.type, event.data.object);
  return new NextResponse("Received", { status: 200 });
}

async function processEventAsync(type: string, data: Stripe.Event.Data.Object) {
  try {
    await connectToDatabase();
    console.log("Database connection established.");

    if (type === "charge.succeeded") {
      const charge = data as Stripe.Charge;
      const meta = charge.metadata as Stripe.Metadata;

      const orderId = meta?.orderId;
      const email = charge.billing_details?.email || "No email provided";
      const pricePaidInCents = charge.amount;

      if (!orderId) {
        console.error("Order ID missing in metadata.");
        return;
      }

      const order = await Order.findById(orderId);
      if (!order) {
        console.error(`Order not found for ID: ${orderId}`);
        return;
      }

      console.log("Updating order:", order);

      order.isPaid = true;
      order.paidAt = new Date();

      await order.save();
      console.log(`Order updated successfully: ${orderId}`);

      try {
        await sendPurchaseReceipt({ order });
        console.log("Purchase receipt sent successfully.");
      } catch (err) {
        console.error("Error sending purchase receipt:", err);
      }
    } else {
      console.log(`Unhandled event type: ${type}`);
    }
  } catch (err) {
    console.error("Error processing event:", err);
  }
}
