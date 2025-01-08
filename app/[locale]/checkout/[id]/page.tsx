import { notFound } from "next/navigation";
import React from "react";
import { auth } from "@/auth";
import { getOrderById } from "@/lib/actions/order.actions";
import PaymentForm from "./payment-form";
import Stripe from "stripe";

export const metadata = {
  title: "Payment",
};

const CheckoutPaymentPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params; // Await the params promise

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await auth();
  let client_secret = null;

  if (order.paymentMethod === "Stripe" && !order.isPaid) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2024-12-18.acacia",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100),
      currency: "USD",
      metadata: { orderId: order._id.toString() }, // Ensure this is set properly
    });

    console.log("Metadata sent to Stripe:", { orderId: order._id.toString() });
    client_secret = paymentIntent.client_secret;
  }

  return (
    <PaymentForm
      order={order}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      clientSecret={client_secret}
      isAdmin={session?.user?.role === "Admin"}
    />
  );
};

export default CheckoutPaymentPage;
