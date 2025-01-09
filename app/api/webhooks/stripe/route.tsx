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

    try {
      const order = await Order.findById(orderId).populate("user email");
      if (!order) {
        console.error("Order not found:", orderId);
        return;
      }

      if (order.isPaid) {
        console.log("Order already marked as paid:", orderId);
        return; // Avoid processing duplicate events
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

      console.log("Saving order status...");
      await order.save();

      // Send purchase receipt email
      console.log("Sending purchase receipt email...");
      await sendPurchaseReceipt({ order });

      console.log("Order updated and receipt sent:", orderId);
    } catch (err) {
      console.error("Error processing charge.succeeded event:", err);
    }
  } else {
    console.log(`Unhandled event type: ${type}`);
  }
}
