import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/actions/order.actions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-12-18.acacia",
});

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { payment_intent: string };
}) {
  const { id } = params;
  const { payment_intent } = searchParams;

  const order = await getOrderById(id);
  if (!order) notFound();

  const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);
  const metadata: Record<string, string> = paymentIntent.metadata || {};

  if (metadata.orderId !== order._id.toString()) notFound();

  const isSuccess = paymentIntent.status === "succeeded";
  if (!isSuccess) redirect(`/checkout/${id}`);

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="font-bold text-2xl lg:text-3xl">
          Thanks for your purchase
        </h1>
        <p>We are now processing your order.</p>
        <Button asChild>
          <Link href={`/account/orders/${id}`}>View order</Link>
        </Button>
      </div>
    </div>
  );
}
