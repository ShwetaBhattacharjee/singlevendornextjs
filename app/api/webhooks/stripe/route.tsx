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

  console.log(event);
  // Acknowledge Stripe immediately
  processEventAsync(event.type, event.data.object); // Offload actual processing
  return new NextResponse("Received", { status: 200 });
}

async function processEventAsync(type: string, data: Stripe.Event.Data.Object) {
  if (type === "charge.succeeded") {
    const charge = data as Stripe.Charge;
    const meta = charge.metadata as Stripe.Metadata;
    const orderId = meta.orderId;
    const bill = charge.billing_details as Stripe.Charge.BillingDetails;
    const email = bill.email;
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

    // Update order status
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: charge.id,
      status: "COMPLETED",
      email_address: email || "No email provided",
      pricePaid: (pricePaidInCents / 100).toFixed(2),
    };
    console.error("Before saving");
    try {
      console.error("Attempting to save order...");
      await order.save();
      console.error("Order saved successfully");
    } catch (err) {
      console.error("Error saving order:", err);
    }

    // Send purchase receipt email
    try {
      console.log("Before sending mail");
      await sendPurchaseReceipt({ order });
    } catch (err) {
      console.error("Failed to send email receipt:", err);
    }

    console.log("Order updated and receipt sent:", orderId);
  } else {
    console.log(`Unhandled event type: ${type}`);
  }
}
