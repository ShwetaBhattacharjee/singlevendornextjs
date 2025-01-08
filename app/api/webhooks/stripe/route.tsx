import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { sendPurchaseReceipt } from "@/emails";
import Order from "@/lib/db/models/order.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
});

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

  console.log("Webhook received:", event.type);

  // Acknowledge Stripe immediately
  const { type, data } = event;
  processEventAsync(type, data); // Offload to async processing
  return new NextResponse("Received", { status: 200 });
}

async function processEventAsync(type: string, data: Stripe.Event.Data.Object) {
  if (type === "charge.succeeded") {
    const charge = data as Stripe.Charge; // Cast to Stripe.Charge
    console.log("Full Charge Object:", charge);

    // Extract metadata explicitly
    const metadata = (charge as any).metadata || {}; // Ensure metadata is extracted even if typing fails
    console.log("Charge Metadata:", metadata);

    const orderId = metadata.orderId; // Safely access orderId
    const email = charge.billing_details?.email;
    const pricePaidInCents = charge.amount;

    if (!orderId) {
      console.error("Order ID not found in metadata.");
      return;
    }

    try {
      const order = await Order.findById(orderId).populate("user");
      if (!order) {
        console.error("Order not found:", orderId);
        return;
      }

      // Update order status
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: charge.id,
        status: "COMPLETED",
        email_address: email || "No email provided",
        pricePaid: (pricePaidInCents / 100).toFixed(2),
      };

      await order.save();
      console.log("Order updated:", order);

      // Send purchase receipt email
      try {
        await sendPurchaseReceipt({ order });
        console.log("Order updated and receipt sent:", orderId);
      } catch (emailError) {
        console.error("Failed to send email receipt:", emailError);
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
    }
  } else {
    console.log(`Unhandled event type: ${type}`);
  }
}
