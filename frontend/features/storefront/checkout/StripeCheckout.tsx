"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { CartItem } from "@/features/storefront/cart/types";
import { useCart } from "@/features/storefront/cart";

function PaymentForm({
  total,
  onClose,
}: {
  total: number;
  onClose: () => void;
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
        return_url: `${window.location.origin}/checkout?payment=success`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error("Payment was not completed", {
        description: error.message ?? "Please check your payment details.",
      });
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      clearCart();
      toast.success("Payment successful", {
        description: "Thank you. Your Stripe payment has been received.",
      });
    } else {
      toast.success("Payment submitted", {
        description: "Stripe is processing your payment.",
      });
    }

    setSubmitting(false);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="stripe-payment-title" className="text-xl font-semibold">
            Secure Stripe payment
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Complete your ${total.toFixed(2)} payment securely.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close Stripe payment"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <X size={19} aria-hidden="true" />
        </button>
      </div>
      <PaymentElement
        options={{
          layout: "tabs",
          paymentMethodOrder: ["card"],
        }}
      />
      <div className="order_button mt-5">
        <button type="submit" disabled={!stripe || submitting}>
          {submitting
            ? "Processing payment..."
            : `Pay $${total.toFixed(2)} with Stripe`}
        </button>
      </div>
      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="mt-3 w-full rounded border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Cancel
      </button>
    </form>
  );
}

export function StripeCheckout({
  items,
  total,
}: {
  items: CartItem[];
  total: number;
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] =
    useState<PromiseLike<Stripe | null> | null>(null);
  const [error, setError] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const cartPayload = useMemo(
    () =>
      items.map(({ slug, quantity }) => ({
        slug,
        quantity,
      })),
    [items],
  );

  useEffect(() => {
    if (cartPayload.length === 0) return;

    const controller = new AbortController();

    void fetch("/api/stripe/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartPayload }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          clientSecret?: string;
          publishableKey?: string;
          error?: string;
        };

        if (!response.ok || !data.clientSecret || !data.publishableKey) {
          throw new Error(data.error ?? "Unable to start Stripe checkout.");
        }

        setError("");
        setClientSecret(data.clientSecret);
        setStripePromise(loadStripe(data.publishableKey));
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        )
          return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to start Stripe checkout.",
        );
      });

    return () => controller.abort();
  }, [cartPayload]);

  useEffect(() => {
    if (!paymentOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPaymentOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [paymentOpen]);

  if (items.length === 0) {
    return (
      <div className="order_button">
        <button type="button" disabled>
          Cart is empty
        </button>
      </div>
    );
  }

  if (error) return <p role="alert">{error}</p>;
  if (!clientSecret || !stripePromise)
    return <p>Loading secure payment form…</p>;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: { colorPrimary: "#111111" },
        },
      }}
    >
      <div className="order_button">
        <button type="button" onClick={() => setPaymentOpen(true)}>
          Pay ${total.toFixed(2)} with Stripe
        </button>
      </div>
      {paymentOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-black/65 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPaymentOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stripe-payment-title"
            className="my-auto w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <PaymentForm total={total} onClose={() => setPaymentOpen(false)} />
          </div>
        </div>
      )}
    </Elements>
  );
}
