import { NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "@/features/storefront/products/product-data";

type CheckoutItem = {
  slug?: unknown;
  quantity?: unknown;
};

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!secretKey || !publishableKey) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server." },
      { status: 503 },
    );
  }

  let body: { items?: CheckoutItem[] };

  try {
    body = (await request.json()) as { items?: CheckoutItem[] };
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  let amount = 0;

  for (const item of body.items) {
    if (
      typeof item.slug !== "string" ||
      !Number.isInteger(item.quantity) ||
      (item.quantity as number) < 1 ||
      (item.quantity as number) > 99
    ) {
      return NextResponse.json(
        { error: "Your cart contains an invalid item." },
        { status: 400 },
      );
    }

    const product = products.find((entry) => entry.slug === item.slug);

    if (!product) {
      return NextResponse.json(
        { error: "A product in your cart is no longer available." },
        { status: 400 },
      );
    }

    amount += Math.round(product.price * 100) * (item.quantity as number);
  }

  try {
    const stripe = new Stripe(secretKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        item_count: String(
          body.items.reduce(
            (total, item) => total + (item.quantity as number),
            0,
          ),
        ),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey,
    });
  } catch (error) {
    console.error("Unable to create Stripe PaymentIntent", error);
    return NextResponse.json(
      { error: "Stripe checkout is temporarily unavailable." },
      { status: 502 },
    );
  }
}
