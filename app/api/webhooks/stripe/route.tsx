import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { sendPurchaseReceipt } from "@/emails";
import Order from "@/lib/db/models/order.model";

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

  // Acknowledge Stripe immediately
  const { type, data } = event;
  processEventAsync(type, data); // Offload actual processing
  return new NextResponse("Received", { status: 200 });
}

async function processEventAsync(type: string, data: Stripe.Event.Data.Object) {
  if (type === "charge.succeeded") {
    const charge = data as Stripe.Charge;
    const orderId = charge.metadata?.orderId;
    const email = charge.billing_details.email;
    const pricePaidInCents = charge.amount;

    if (!orderId) {
      console.error("Order ID not found in metadata.");
      return;
    }

    const order = await Order.findById(orderId).populate("user", "email");
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

    // Send purchase receipt email
    try {
      await sendPurchaseReceipt({ order });
    } catch (err) {
      console.error("Failed to send email receipt:", err);
    }

    console.log("Order updated and receipt sent:", orderId);
  } else {
    console.log(`Unhandled event type: ${type}`);
  }
}
