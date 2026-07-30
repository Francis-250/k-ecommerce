import express, { Request, Response } from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";

import { setupSwagger } from "./docs/swagger";

import usersRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import brandRoutes from "./routes/brand.routes";
import categoryRoutes from "./routes/category.routes";
import productRoutes from "./routes/product.routes";
import productImageRoutes from "./routes/product-image.routes";
import productVariantRoutes from "./routes/product-variant.routes";
import productDetailRoutes from "./routes/product-detail.routes";
import productOptionRoutes from "./routes/product-option.routes";
import productOptionValueRoutes from "./routes/product-option-value.routes";
import variantOptionValueRoutes from "./routes/variant-option-value.routes";
import mediaRoutes from "./routes/media.routes";
import inventoryRoutes from "./routes/inventory.routes";
import inventoryMovementRoutes from "./routes/inventory-movement.routes";
import productRelationRoutes from "./routes/product-relation.routes";
import addressRoutes from "./routes/address.routes";
import cartRoutes from "./routes/cart.routes";
import cartItemRoutes from "./routes/cart-item.routes";
import wishlistItemRoutes from "./routes/wishlist-item.routes";
import reviewRoutes from "./routes/review.routes";
import couponRoutes from "./routes/coupon.routes";
import couponRedemptionRoutes from "./routes/coupon-redemption.routes";
import orderRoutes from "./routes/order.routes";
import orderItemRoutes from "./routes/order-item.routes";
import orderAddressRoutes from "./routes/order-address.routes";
import paymentRoutes from "./routes/payment.routes";
import refundRoutes from "./routes/refund.routes";
import fulfillmentRoutes from "./routes/fulfillment.routes";
import fulfillmentItemRoutes from "./routes/fulfillment-item.routes";
import articleRoutes from "./routes/article.routes";
import portfolioProjectRoutes from "./routes/portfolio-project.routes";
import newsletterSubscriberRoutes from "./routes/newsletter-subscriber.routes";
import storeSettingRoutes from "./routes/store-setting.routes";
import auditLogRoutes from "./routes/audit-log.routes";
import otpCodeRoutes from "./routes/otp-code.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const isProduction = process.env.NODE_ENV === "production";
const envAllowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:4000",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  ...envAllowedOrigins,
].filter(Boolean) as string[];

const devOriginPattern =
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/;

function isAllowedOrigin(origin: string) {
  return (
    allowedOrigins.includes(origin) ||
    (!isProduction && devOriginPattern.test(origin))
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.log(`Blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(express.json({ limit: "12mb" }));
app.use(cookieParser());

setupSwagger(app);

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-images", productImageRoutes);
app.use("/api/product-variants", productVariantRoutes);
app.use("/api/product-details", productDetailRoutes);
app.use("/api/product-options", productOptionRoutes);
app.use("/api/product-option-values", productOptionValueRoutes);
app.use("/api/variant-option-values", variantOptionValueRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/inventory-movements", inventoryMovementRoutes);
app.use("/api/product-relations", productRelationRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/cart-items", cartItemRoutes);
app.use("/api/wishlist-items", wishlistItemRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/coupon-redemptions", couponRedemptionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/order-addresses", orderAddressRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/fulfillments", fulfillmentRoutes);
app.use("/api/fulfillment-items", fulfillmentItemRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/portfolio-projects", portfolioProjectRoutes);
app.use("/api/newsletter-subscribers", newsletterSubscriberRoutes);
app.use("/api/store-settings", storeSettingRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/otp-codes", otpCodeRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the Ecommerce API" });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Api is running" });
});

app.use(notFound);
app.use(errorHandler);

import { initInventoryCron } from "./services/inventory-cron";

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  initInventoryCron();
});
