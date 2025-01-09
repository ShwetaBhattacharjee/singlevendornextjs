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
    console.log("Connecting to the database...");
    await connectToDatabase();
    console.log("Database connection established.");

    if (type === "charge.succeeded") {
      const charge = data as Stripe.Charge;
      const meta = charge.metadata as Stripe.Metadata;

      console.log("Charge metadata:", meta);

      const orderId = meta?.orderId;

      if (!orderId) {
        console.error("Order ID missing in metadata.");
        return;
      }

      const order = await Order.findById(orderId);
      if (!order) {
        console.error(`Order not found for ID: ${orderId}`);
        return;
      }

      // Log current order status
      console.log("Current order status:", order.isPaid);

      // Update order status
      order.isPaid = true;
      order.paidAt = new Date();

      // Log updated order status
      console.log("Updated order:", order);

      try {
        // Attempt to save the updated order
        await order.save();
        console.log("Order saved:", order);

        // Fetch the order again to confirm the update
        const updatedOrder = await Order.findById(orderId);
        console.log("Updated order status after save:", updatedOrder?.isPaid);
      } catch (err) {
        console.error("Error saving order:", err);
      }

      // Send purchase receipt email
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
