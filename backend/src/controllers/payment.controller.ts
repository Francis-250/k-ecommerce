import type { Request, Response } from "express";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import {
  idParamsSchema,
  paginated,
  pagination,
  validationError,
} from "../utils/http";
const schema = z.object({
  orderId: z.string().min(1),
  provider: z.literal("STRIPE").default("STRIPE"),
  status: z.enum([
    "REQUIRES_PAYMENT_METHOD",
    "REQUIRES_CONFIRMATION",
    "PROCESSING",
    "SUCCEEDED",
    "FAILED",
    "CANCELLED",
    "PARTIALLY_REFUNDED",
    "REFUNDED",
  ]),
  amount: z.coerce.number().nonnegative(),
  currency: z.string().length(3).default("USD"),
  stripePaymentIntentId: z.string().nullable().optional(),
  stripeChargeId: z.string().nullable().optional(),
  stripeCustomerId: z.string().nullable().optional(),
  paymentMethodType: z.string().nullable().optional(),
  paymentMethodLast4: z.string().length(4).nullable().optional(),
  idempotencyKey: z.string().nullable().optional(),
  failureCode: z.string().nullable().optional(),
  failureMessage: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  processedAt: z.coerce.date().nullable().optional(),
});

const intentSchema = z.object({ orderId: z.string().min(1) });

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export const createCheckoutIntent = async (req: Request, res: Response) => {
  const parsed = intentSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const order = await prisma.order.findFirst({
    where: {
      id: parsed.data.orderId,
      userId: req.auth!.sub,
      status: "PENDING_PAYMENT",
    },
    include: {
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      addresses: true,
      items: { include: { product: { include: { category: true } } } },
    },
  });
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Pending order not found",
    });
  }

  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return res.status(503).json({
      success: false,
      message: "Stripe is not configured",
    });
  }

  const stripe = stripeClient();
  const shippingAddress = order.addresses.find(
    (address) => address.type === "SHIPPING",
  );
  if (!shippingAddress) {
    return res.status(409).json({
      success: false,
      message: "A shipping address is required to calculate sales tax",
    });
  }

  const taxableSubtotal = Math.max(
    0,
    Number(order.subtotal) - Number(order.discountTotal),
  );
  const subtotalRatio =
    Number(order.subtotal) > 0 ? taxableSubtotal / Number(order.subtotal) : 1;
  const lineItems = order.items.map((item) => ({
    amount: Math.max(1, Math.round(Number(item.total) * subtotalRatio * 100)),
    quantity: item.quantity,
    reference: item.id,
    tax_behavior: "exclusive" as const,
    tax_code:
      item.product?.category?.slug === "dresses" ||
      item.product?.category?.slug === "tops"
        ? "txcd_30011000"
        : "txcd_99999999",
  }));
  const taxCalculation = await stripe.tax.calculations.create({
    currency: order.currency.toLowerCase(),
    line_items: lineItems,
    customer_details: {
      address_source: "shipping",
      address: {
        line1: shippingAddress.line1,
        line2: shippingAddress.line2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.countryCode,
      },
    },
    ...(Number(order.shippingTotal) > 0
      ? {
          shipping_cost: {
            amount: Math.round(Number(order.shippingTotal) * 100),
            tax_behavior: "exclusive" as const,
            tax_code: "txcd_92010001",
          },
        }
      : {}),
  });
  const calculatedTax = taxCalculation.tax_amount_exclusive / 100;
  const calculatedTotal = taxCalculation.amount_total / 100;
  await prisma.order.update({
    where: { id: order.id },
    data: {
      taxTotal: calculatedTax,
      total: calculatedTotal,
    },
  });

  const existingPayment = order.payments[0];
  let intent: Stripe.PaymentIntent | null = null;

  if (existingPayment?.stripePaymentIntentId) {
    intent = await stripe.paymentIntents.retrieve(
      existingPayment.stripePaymentIntentId,
    );
  }

  if (intent?.status === "canceled") {
    return res.status(409).json({
      success: false,
      message: "This payment was cancelled. Start a new order to try again.",
    });
  }

  if (!intent) {
    intent = await stripe.paymentIntents.create(
      {
        amount: taxCalculation.amount_total,
        currency: order.currency.toLowerCase(),
        payment_method_types: ["card"],
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId: req.auth!.sub,
        },
        receipt_email: order.email,
        hooks: {
          inputs: {
            tax: { calculation: taxCalculation.id },
          },
        },
      },
      { idempotencyKey: `order:${order.id}:payment-intent` },
    );

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "STRIPE",
        status: "REQUIRES_PAYMENT_METHOD",
        amount: calculatedTotal,
        currency: order.currency,
        stripePaymentIntentId: intent.id,
        idempotencyKey: `order:${order.id}:payment-intent`,
      },
    });
  }

  return res.json({
    success: true,
    orderId: order.id,
    amount: calculatedTotal,
    clientSecret: intent.client_secret,
    publishableKey,
  });
};

export const confirmCheckoutPayment = async (req: Request, res: Response) => {
  const parsed = z
    .object({
      orderId: z.string().min(1),
      paymentIntentId: z.string().startsWith("pi_"),
    })
    .safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: req.auth!.sub },
    include: { items: true },
  });
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  const intent = await stripeClient().paymentIntents.retrieve(
    parsed.data.paymentIntentId,
    { expand: ["latest_charge"] },
  );
  if (
    intent.metadata.orderId !== order.id ||
    intent.metadata.userId !== req.auth!.sub
  ) {
    return res.status(403).json({
      success: false,
      message: "Payment does not belong to this order",
    });
  }

  const succeeded = intent.status === "succeeded";
  const processing = intent.status === "processing";
  const paymentStatus = succeeded
    ? "SUCCEEDED"
    : processing
      ? "PROCESSING"
      : "FAILED";

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { stripePaymentIntentId: intent.id },
      data: {
        status: paymentStatus,
        stripeChargeId:
          typeof intent.latest_charge === "string"
            ? intent.latest_charge
            : intent.latest_charge?.id,
        paymentMethodType: "card",
        processedAt: succeeded ? new Date() : null,
      },
    });

    if (succeeded && order.paymentStatus !== "SUCCEEDED") {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentStatus: "SUCCEEDED",
          placedAt: new Date(),
        },
      });

      for (const item of order.items) {
        if (!item.variantId) continue;
        const inventory = await tx.inventory.findUnique({
          where: { variantId: item.variantId },
        });
        if (!inventory) continue;
        const quantityAfter = Math.max(0, inventory.quantity - item.quantity);
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: quantityAfter,
            reserved: Math.max(0, inventory.reserved - item.quantity),
            version: { increment: 1 },
          },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: "SALE",
            quantity: -item.quantity,
            quantityAfter,
            referenceType: "ORDER",
            referenceId: order.id,
            createdById: req.auth!.sub,
          },
        });
      }

      const cart = await tx.cart.findFirst({
        where: { userId: req.auth!.sub, status: "ACTIVE" },
      });
      if (cart) {
        await tx.cart.update({
          where: { id: cart.id },
          data: { status: "CONVERTED" },
        });
      }
    } else if (processing) {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PROCESSING" },
      });
    }
  });

  return res.json({
    success: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentStatus,
  });
};
export const listPayments = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const where = req.query.orderId
    ? { orderId: String(req.query.orderId) }
    : undefined;
  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      include: { order: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({ where }),
  ]);
  return res.json(paginated(payments, total, page, limit));
};
export const getPayment = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { order: true, refunds: true },
  });
  if (!payment)
    return res
      .status(404)
      .json({ success: false, message: "Payment not found" });
  return res.json({ success: true, payment });
};
export const createPayment = async (req: Request, res: Response) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res.status(201).json({
    success: true,
    payment: await prisma.payment.create({ data: p.data as any }),
  });
};
export const updatePayment = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const p = schema.partial().safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res.json({
    success: true,
    payment: await prisma.payment.update({
      where: { id },
      data: p.data as any,
    }),
  });
};
