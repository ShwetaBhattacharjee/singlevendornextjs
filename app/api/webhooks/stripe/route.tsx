import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendPurchaseReceipt } from "@/emails";
import Order from "@/lib/db/models/order.model"; // Make sure this is your Order model

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

async function processEventAsync(type: string, data: Stripe.Event.Data) {
  if (type === "charge.succeeded") {
    const charge = data.object as Stripe.Charge; // Cast to Stripe.Charge object

    // Extract orderId from charge metadata
    const metadata: Record<string, string> = charge.metadata || {};
    const orderId = metadata.orderId;

    if (!orderId) {
      console.error("Order ID missing in metadata. Charge ID:", charge.id);
      return;
    }

    try {
      // Find the order in your database using the orderId
      const order = await Order.findById(orderId).populate("user");
      if (!order) {
        console.error("Order not found for ID:", orderId);
        return;
      }

      // Log the current order before updating
      console.log("Current order data:", order);

      // Update the order details
      order.isPaid = true;
      order.paidAt = new Date(); // Set payment date
      order.paymentResult = {
        id: charge.id,
        status: "COMPLETED",
        email_address: charge.billing_details?.email || "No email provided",
        pricePaid: (charge.amount / 100).toFixed(2), // Convert to dollars
      };

      // Save the updated order and check for errors
      const updatedOrder = await order.save();
      console.log("Order updated successfully:", updatedOrder);

      // Log the updated order data to verify if isPaid was updated
      console.log("Updated order data:", updatedOrder);

      // Send purchase receipt email
      await sendPurchaseReceipt({ order });
    } catch (error) {
      console.error("Error processing charge.succeeded:", error);
    }
  } else {
    console.log(`Unhandled event type: ${type}`);
  }
}
