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

      console.log("Order found:", orderId); // Log to confirm the order is found

      // Check the current value of isPaid before updating
      console.log("Current isPaid status:", order.isPaid);

      // Update the order details
      order.isPaid = true;
      order.paidAt = new Date(); // Set payment date
      order.paymentResult = {
        id: charge.id,
        status: "COMPLETED",
        email_address: charge.billing_details?.email || "No email provided",
        pricePaid: (charge.amount / 100).toFixed(2), // Convert to dollars
      };

      // Save the updated order and check the result
      await order.save();
      console.log("Order updated successfully:", orderId);

      // Log the updated status to verify if isPaid was updated
      const updatedOrder = await Order.findById(orderId);
      console.log("Updated isPaid status:", updatedOrder?.isPaid);

      // Send purchase receipt email
      await sendPurchaseReceipt({ order });
    } catch (error) {
      console.error("Error processing charge.succeeded:", error);
    }
  } else {
    console.log(`Unhandled event type: ${type}`);
  }
}
