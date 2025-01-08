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

  const { type, data } = event;
  processEventAsync(type, data); // Offload to async processing
  return new NextResponse("Received", { status: 200 });
}

async function processEventAsync(type: string, data: Stripe.Event.Data.Object) {
  if (type === "charge.succeeded") {
    console.log("Received Event Data:", data); // Log full event data for inspection

    const charge = data as Stripe.Charge; // Cast to Stripe.Charge to ensure the correct type
    console.log("Charge Object:", charge); // Log the full charge object to check its structure

    // Check if the charge has a metadata field
    if (charge && charge.metadata) {
      console.log("Charge metadata:", charge.metadata); // Log metadata to confirm it contains orderId
    } else {
      console.error("Charge metadata is missing");
    }

    // Access metadata directly and log it
    const metadata = charge.metadata || {};
    const orderId = metadata.orderId;
    if (!orderId) {
      console.error("Order ID missing in metadata. Charge ID:", charge.id);
      return;
    }

    console.log("Order ID from metadata:", orderId); // Log the order ID

    try {
      const order = await Order.findById(orderId).populate("user");
      if (!order) {
        console.error("Order not found for ID:", orderId);
        return;
      }

      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: charge.id,
        status: "COMPLETED",
        email_address: charge.billing_details?.email || "No email provided",
        pricePaid: (charge.amount / 100).toFixed(2),
      };

      await order.save();
      console.log("Order updated successfully:", orderId);

      await sendPurchaseReceipt({ order });
    } catch (error) {
      console.error("Error processing charge.succeeded:", error);
    }
  } else {
    console.log(`Unhandled event type: ${type}`);
  }
}
