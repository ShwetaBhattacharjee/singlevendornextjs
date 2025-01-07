import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { sendPurchaseReceipt } from "@/emails";
import Order from "@/lib/db/models/order.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  // Acknowledge Stripe immediately
  const { type, data } = event;
  processEventAsync(type, data); // Offload actual processing
  return new NextResponse("Received", { status: 200 });
}

async function processEventAsync(type: string, data: any) {
  if (type === "charge.succeeded") {
    const charge = data.object;
    const orderId = charge.metadata.orderId;
    const email = charge.billing_details.email;
    const pricePaidInCents = charge.amount;
    const order = await Order.findById(orderId).populate("user", "email");
    if (order == null) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: event.id,
      status: "COMPLETED",
      email_address: email!,
      pricePaid: (pricePaidInCents / 100).toFixed(2),
    };
    await order.save();
    try {
      await sendPurchaseReceipt({ order });
    } catch (err) {
      console.log("email error", err);
    }
    return NextResponse.json({
      message: "updateOrderToPaid was successful",
    });
  }
  return new NextResponse();
}

/*export async function POST(req: NextRequest) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );*/
