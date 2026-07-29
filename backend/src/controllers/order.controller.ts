import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  idParamsSchema,
  paginated,
  pagination,
  validationError,
} from "../utils/http";
const adminUpdateSchema = z.object({
  status: z
    .enum([
      "DRAFT",
      "PENDING_PAYMENT",
      "PAID",
      "PROCESSING",
      "COMPLETED",
      "CANCELLED",
      "PARTIALLY_REFUNDED",
      "REFUNDED",
      "RETURNED",
    ])
    .optional(),
  paymentStatus: z
    .enum([
      "REQUIRES_PAYMENT_METHOD",
      "REQUIRES_CONFIRMATION",
      "PROCESSING",
      "SUCCEEDED",
      "FAILED",
      "CANCELLED",
      "PARTIALLY_REFUNDED",
      "REFUNDED",
    ])
    .optional(),
  fulfillmentStatus: z
    .enum([
      "UNFULFILLED",
      "PROCESSING",
      "PARTIALLY_FULFILLED",
      "FULFILLED",
      "RETURNED",
    ])
    .optional(),
  adminNote: z.string().max(3000).nullable().optional(),
});
const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().nullable().optional(),
  phone: z.string().min(7),
  countryCode: z.string().length(2).default("US"),
  country: z.string().default("United States"),
  state: z.string().min(1),
  city: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().nullable().optional(),
  postalCode: z.string().min(1),
});
const createSchema = z.object({
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  customerNote: z.string().max(3000).nullable().optional(),
  couponCode: z.string().trim().nullable().optional(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  items: z
    .array(
      z
        .object({
          productId: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
          variantId: z.string().nullable().optional(),
          quantity: z.number().int().min(1).max(99),
          options: z.record(z.string(), z.string()).optional(),
        })
        .refine((item) => item.productId || item.slug, {
          message: "Product ID or slug is required",
        }),
    )
    .min(1),
});
const orderInclude = {
  items: true,
  addresses: true,
  payments: true,
  refunds: true,
  couponRedemptions: { include: { coupon: true } },
  fulfillments: { include: { items: true } },
} as const;
export const listOrders = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const where =
    req.auth!.role === "ADMIN" || req.auth!.role === "SUPER_ADMIN"
      ? req.query.status
        ? { status: String(req.query.status) as never }
        : undefined
      : { userId: req.auth!.sub };
  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);
  return res.json(paginated(orders, total, page, limit));
};
export const createOrder = async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const order = await prisma.$transaction(async (tx) => {
    const snapshots = [];
    let subtotal = 0;

    for (const requested of parsed.data.items) {
      const product = await tx.product.findFirstOrThrow({
        where: {
          status: "ACTIVE",
          ...(requested.productId
            ? { id: requested.productId }
            : { slug: requested.slug }),
        },
        include: {
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
          },
        },
      });
      const variant = requested.variantId
        ? await tx.productVariant.findFirstOrThrow({
            where: {
              id: requested.variantId,
              productId: product.id,
              isActive: true,
            },
            include: {
              inventory: true,
              optionValues: {
                include: { optionValue: { include: { option: true } } },
              },
            },
          })
        : null;
      if (
        variant?.inventory &&
        !variant.inventory.continueSelling &&
        variant.inventory.quantity - variant.inventory.reserved <
          requested.quantity
      ) {
        throw new Error(`${product.name} does not have enough inventory`);
      }
      const unitPrice = Number(variant?.price ?? product.price);
      const lineTotal = unitPrice * requested.quantity;
      subtotal += lineTotal;
      snapshots.push({
        requested,
        product,
        variant,
        unitPrice,
        lineTotal,
        options: variant
          ? Object.fromEntries(
              variant.optionValues.map((item) => [
                item.optionValue.option.name,
                item.optionValue.value,
              ]),
            )
          : requested.options,
      });
    }

    let coupon = null;
    let discountTotal = 0;
    if (parsed.data.couponCode) {
      coupon = await tx.coupon.findUnique({
        where: { code: parsed.data.couponCode.toUpperCase() },
        include: { _count: { select: { redemptions: true } } },
      });
      const now = new Date();
      if (
        !coupon ||
        coupon.status !== "ACTIVE" ||
        (coupon.startsAt && coupon.startsAt > now) ||
        (coupon.endsAt && coupon.endsAt < now)
      ) {
        throw new Error("Coupon is invalid or expired");
      }
      if (coupon.type === "PERCENTAGE")
        discountTotal = subtotal * (Number(coupon.value ?? 0) / 100);
      if (coupon.type === "FIXED_AMOUNT")
        discountTotal = Number(coupon.value ?? 0);
      discountTotal = Math.min(
        subtotal,
        coupon.maximumDiscount
          ? Math.min(discountTotal, Number(coupon.maximumDiscount))
          : discountTotal,
      );
    }

    const shippingTotal = subtotal - discountTotal >= 100 ? 0 : 12;
    // Final U.S. sales tax is calculated from the delivery address by Stripe
    // Tax immediately before the PaymentIntent is created.
    const taxTotal = 0;
    const total = Number(
      (subtotal - discountTotal + shippingTotal + taxTotal).toFixed(2),
    );
    const orderNumber = `IRAS-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: req.auth!.sub,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        customerNote: parsed.data.customerNote,
        status: "PENDING_PAYMENT",
        paymentStatus: "REQUIRES_PAYMENT_METHOD",
        subtotal,
        discountTotal,
        shippingTotal,
        taxTotal,
        total,
        items: {
          create: snapshots.map(
            ({
              requested,
              product,
              variant,
              unitPrice,
              lineTotal,
              options,
            }) => ({
              productId: product.id,
              variantId: variant?.id,
              productName: product.name,
              productSlug: product.slug,
              sku: variant?.sku ?? product.sku,
              imageUrl: product.images[0]?.url,
              options,
              quantity: requested.quantity,
              unitPrice,
              total: lineTotal,
            }),
          ),
        },
        addresses: {
          create: [
            { ...parsed.data.shippingAddress, type: "SHIPPING" },
            { ...parsed.data.billingAddress, type: "BILLING" },
          ],
        },
      },
      include: orderInclude,
    });

    for (const snapshot of snapshots) {
      if (snapshot.variant?.inventory) {
        await tx.inventory.update({
          where: { id: snapshot.variant.inventory.id },
          data: {
            reserved: { increment: snapshot.requested.quantity },
            version: { increment: 1 },
          },
        });
        await tx.inventoryMovement.create({
          data: {
            variantId: snapshot.variant.id,
            type: "RESERVATION",
            quantity: -snapshot.requested.quantity,
            quantityAfter: snapshot.variant.inventory.quantity,
            referenceType: "ORDER",
            referenceId: created.id,
            createdById: req.auth!.sub,
          },
        });
      }
    }
    if (coupon) {
      await tx.couponRedemption.create({
        data: {
          couponId: coupon.id,
          orderId: created.id,
          userId: req.auth!.sub,
          discountAmount: discountTotal,
        },
      });
    }
    return created;
  });
  return res.status(201).json({ success: true, order });
};
export const getOrder = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const order = await prisma.order.findFirst({
    where: {
      id,
      ...(req.auth!.role === "ADMIN" || req.auth!.role === "SUPER_ADMIN"
        ? {}
        : { userId: req.auth!.sub }),
    },
    include: orderInclude,
  });
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });
  return res.json({ success: true, order });
};
export const updateOrder = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = adminUpdateSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const order = await prisma.order.update({ where: { id }, data: parsed.data });
  return res.json({ success: true, order });
};
export const cancelOrder = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: req.auth!.sub,
      status: { in: ["DRAFT", "PENDING_PAYMENT", "PAID"] },
    },
  });
  if (!order)
    return res
      .status(409)
      .json({ success: false, message: "Order cannot be cancelled" });
  const updated = await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  return res.json({ success: true, order: updated });
};
