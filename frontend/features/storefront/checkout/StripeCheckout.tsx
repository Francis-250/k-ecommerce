"use client";

import { useState, type FormEvent } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";
import { confirmCheckoutPayment, createCheckoutIntent } from "./api";
import { useCart } from "@/features/storefront/cart";

type PreparedPayment = {
  orderId: string;
  amount: number;
  clientSecret: string;
  publishableKey: string;
};

function PaymentForm({
  payment,
  onClose,
  onSuccess,
}: {
  payment: PreparedPayment;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?payment=return`,
      },
      redirect: "if_required",
    });

    if (error || !paymentIntent) {
      toast.error("Payment was not completed", {
        description: error?.message ?? "Please check your payment details.",
      });
      setSubmitting(false);
      return;
    }

    try {
      const confirmation = await confirmCheckoutPayment(
        payment.orderId,
        paymentIntent.id,
      );
      if (confirmation.paymentStatus === "FAILED") {
        throw new Error("Stripe did not complete this payment.");
      }
      clearCart();
      toast.success(
        confirmation.paymentStatus === "SUCCEEDED"
          ? "Payment successful"
          : "Payment is processing",
      );
      onSuccess(confirmation.orderNumber);
    } catch (confirmationError) {
      toast.error(
        confirmationError instanceof Error
          ? confirmationError.message
          : "Payment status could not be confirmed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
      <div>
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 id="stripe-payment-title" className="text-lg sm:text-xl font-semibold text-slate-900">
              Secure Stripe payment
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Complete your ${payment.amount.toFixed(2)} payment securely.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close Stripe payment"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm disabled:opacity-50"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        <PaymentElement
          options={{ layout: "tabs", paymentMethodOrder: ["card"] }}
        />
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3 pb-8 sm:pb-0">
        <div className="order_button">
          <button type="submit" disabled={!stripe || submitting} className="w-full">
            {submitting
              ? "Processing payment..."
              : `Pay $${payment.amount.toFixed(2)} with Stripe`}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="w-full rounded border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function StripeCheckout({
  disabled,
  estimatedTotal,
  createPendingOrder,
  onSuccess,
}: {
  disabled: boolean;
  estimatedTotal: number;
  createPendingOrder: () => Promise<string>;
  onSuccess: (orderNumber: string) => void;
}) {
  const [payment, setPayment] = useState<PreparedPayment | null>(null);
  const [stripePromise, setStripePromise] =
    useState<PromiseLike<Stripe | null> | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState("");

  async function prepare() {
    setPreparing(true);
    try {
      const orderId = pendingOrderId || (await createPendingOrder());
      setPendingOrderId(orderId);
      const intent = await createCheckoutIntent(orderId);
      setPayment(intent);
      setStripePromise(loadStripe(intent.publishableKey));
    } catch (error) {
      const checkoutError = error as Error & { status?: number };
      toast.error(checkoutError.message);
    } finally {
      setPreparing(false);
    }
  }

  return (
    <>
      <div className="order_button">
        <button
          type="button"
          disabled={disabled || preparing}
          onClick={prepare}
        >
          {preparing ? (
            <>
              <LoaderCircle className="animate-spin" size={16} /> Preparing
              checkout...
            </>
          ) : disabled ? (
            "Cart is empty"
          ) : (
            `Continue to payment · $${estimatedTotal.toFixed(2)}`
          )}
        </button>
      </div>
      {payment && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: payment.clientSecret,
            appearance: {
              theme: "stripe",
              variables: { colorPrimary: "#111111" },
            },
          }}
        >
          <>
            <div
              className="fixed inset-0 z-[1100] bg-black/65 backdrop-blur-sm transition-opacity"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setPayment(null);
              }}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="stripe-payment-title"
              className="fixed inset-0 sm:left-auto sm:right-0 sm:top-0 sm:bottom-0 z-[1101] w-full sm:max-w-lg h-full min-h-[100dvh] bg-white shadow-2xl flex flex-col overflow-y-auto p-4 sm:p-7"
            >
              <PaymentForm
                payment={payment}
                onClose={() => setPayment(null)}
                onSuccess={onSuccess}
              />
            </div>
          </>
        </Elements>
      )}
    </>
  );
}
