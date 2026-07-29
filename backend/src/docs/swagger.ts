import type { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

type Method = "get" | "post" | "put" | "patch" | "delete";
type RouteDoc = {
  method: Method;
  path: string;
  tag: string;
  summary: string;
  public?: boolean;
  body?: string;
};

const routes: RouteDoc[] = [
  {
    method: "post",
    path: "/api/auth/register",
    tag: "Authentication",
    summary: "Register customer",
    public: true,
    body: "RegisterInput",
  },
  {
    method: "post",
    path: "/api/auth/login",
    tag: "Authentication",
    summary: "Login and set HTTP-only cookie",
    public: true,
    body: "LoginInput",
  },
  {
    method: "get",
    path: "/api/auth/google/config",
    tag: "Authentication",
    summary: "Get the public Google web client ID",
    public: true,
  },
  {
    method: "post",
    path: "/api/auth/google",
    tag: "Authentication",
    summary: "Verify Google ID token and set HTTP-only cookie",
    public: true,
    body: "GoogleLoginInput",
  },
  {
    method: "post",
    path: "/api/auth/verify-email",
    tag: "Authentication",
    summary: "Verify registration OTP",
    public: true,
    body: "VerifyOtpInput",
  },
  {
    method: "post",
    path: "/api/auth/forgot-password",
    tag: "Authentication",
    summary: "Request password reset OTP",
    public: true,
  },
  {
    method: "post",
    path: "/api/auth/reset-password",
    tag: "Authentication",
    summary: "Reset password with OTP",
    public: true,
  },
  {
    method: "get",
    path: "/api/auth/me",
    tag: "Authentication",
    summary: "Get authenticated session",
  },
  {
    method: "post",
    path: "/api/auth/logout",
    tag: "Authentication",
    summary: "Clear authentication cookie",
  },
  {
    method: "get",
    path: "/api/otp-codes",
    tag: "OTP codes",
    summary: "List masked OTP records (admin)",
  },
  {
    method: "delete",
    path: "/api/otp-codes/expired",
    tag: "OTP codes",
    summary: "Purge expired OTP records (admin)",
  },
  {
    method: "get",
    path: "/api/users/me",
    tag: "Users",
    summary: "Get own profile",
  },
  {
    method: "patch",
    path: "/api/users/me",
    tag: "Users",
    summary: "Update own profile",
  },
  {
    method: "get",
    path: "/api/users",
    tag: "Users",
    summary: "List users (admin)",
  },
  {
    method: "get",
    path: "/api/users/{id}",
    tag: "Users",
    summary: "Get user (admin)",
  },
  {
    method: "patch",
    path: "/api/users/{id}",
    tag: "Users",
    summary: "Update user (admin)",
  },
  {
    method: "delete",
    path: "/api/users/{id}",
    tag: "Users",
    summary: "Deactivate user (admin)",
  },
  {
    method: "get",
    path: "/api/addresses",
    tag: "Addresses",
    summary: "List own addresses",
  },
  {
    method: "post",
    path: "/api/addresses",
    tag: "Addresses",
    summary: "Create own address",
  },
  {
    method: "patch",
    path: "/api/addresses/{id}",
    tag: "Addresses",
    summary: "Update own address",
  },
  {
    method: "delete",
    path: "/api/addresses/{id}",
    tag: "Addresses",
    summary: "Delete own address",
  },
  {
    method: "get",
    path: "/api/brands",
    tag: "Brands",
    summary: "List brands",
    public: true,
  },
  {
    method: "post",
    path: "/api/brands",
    tag: "Brands",
    summary: "Create brand (admin)",
  },
  {
    method: "patch",
    path: "/api/brands/{id}",
    tag: "Brands",
    summary: "Update brand (admin)",
  },
  {
    method: "delete",
    path: "/api/brands/{id}",
    tag: "Brands",
    summary: "Delete brand (admin)",
  },
  {
    method: "get",
    path: "/api/categories",
    tag: "Categories",
    summary: "List categories",
    public: true,
  },
  {
    method: "post",
    path: "/api/categories",
    tag: "Categories",
    summary: "Create category (admin)",
  },
  {
    method: "patch",
    path: "/api/categories/{id}",
    tag: "Categories",
    summary: "Update category (admin)",
  },
  {
    method: "delete",
    path: "/api/categories/{id}",
    tag: "Categories",
    summary: "Delete category (admin)",
  },
  {
    method: "get",
    path: "/api/products",
    tag: "Products",
    summary: "List products",
    public: true,
  },
  {
    method: "get",
    path: "/api/products/{id}",
    tag: "Products",
    summary: "Get product by ID or slug",
    public: true,
  },
  {
    method: "post",
    path: "/api/products",
    tag: "Products",
    summary: "Create product (admin)",
  },
  {
    method: "patch",
    path: "/api/products/{id}",
    tag: "Products",
    summary: "Update product (admin)",
  },
  {
    method: "delete",
    path: "/api/products/{id}",
    tag: "Products",
    summary: "Archive product (admin)",
  },
  ...resourceDocs("product-images", "Product images", true),
  ...resourceDocs("product-variants", "Product variants", true),
  ...resourceDocs("product-details", "Product details", true),
  ...resourceDocs("product-options", "Product options", true),
  ...resourceDocs("product-option-values", "Product option values", true),
  {
    method: "get",
    path: "/api/variant-option-values",
    tag: "Variant option values",
    summary: "List assignments",
  },
  {
    method: "post",
    path: "/api/variant-option-values",
    tag: "Variant option values",
    summary: "Create assignment (admin)",
  },
  {
    method: "delete",
    path: "/api/variant-option-values",
    tag: "Variant option values",
    summary: "Delete assignment (admin)",
  },
  {
    method: "get",
    path: "/api/product-relations",
    tag: "Product relations",
    summary: "List related products",
    public: true,
  },
  {
    method: "post",
    path: "/api/product-relations",
    tag: "Product relations",
    summary: "Create relation (admin)",
  },
  {
    method: "delete",
    path: "/api/product-relations",
    tag: "Product relations",
    summary: "Delete relation (admin)",
  },
  {
    method: "get",
    path: "/api/inventory",
    tag: "Inventory",
    summary: "List inventory (admin)",
  },
  {
    method: "get",
    path: "/api/inventory/{id}",
    tag: "Inventory",
    summary: "Get inventory (admin)",
  },
  {
    method: "patch",
    path: "/api/inventory/{id}",
    tag: "Inventory",
    summary: "Update inventory (admin)",
  },
  {
    method: "get",
    path: "/api/inventory-movements",
    tag: "Inventory movements",
    summary: "List movements (admin)",
  },
  {
    method: "post",
    path: "/api/inventory-movements",
    tag: "Inventory movements",
    summary: "Adjust inventory (admin)",
  },
  {
    method: "get",
    path: "/api/carts",
    tag: "Carts",
    summary: "Get active cart",
  },
  {
    method: "delete",
    path: "/api/carts",
    tag: "Carts",
    summary: "Clear active cart",
  },
  {
    method: "post",
    path: "/api/cart-items",
    tag: "Cart items",
    summary: "Add cart item",
  },
  {
    method: "patch",
    path: "/api/cart-items/{id}",
    tag: "Cart items",
    summary: "Update cart item",
  },
  {
    method: "delete",
    path: "/api/cart-items/{id}",
    tag: "Cart items",
    summary: "Delete cart item",
  },
  {
    method: "get",
    path: "/api/wishlist-items",
    tag: "Wishlist items",
    summary: "List wishlist",
  },
  {
    method: "post",
    path: "/api/wishlist-items",
    tag: "Wishlist items",
    summary: "Add wishlist item",
  },
  {
    method: "delete",
    path: "/api/wishlist-items/{productId}",
    tag: "Wishlist items",
    summary: "Delete wishlist item",
  },
  {
    method: "get",
    path: "/api/reviews",
    tag: "Reviews",
    summary: "List approved reviews",
    public: true,
  },
  {
    method: "post",
    path: "/api/reviews",
    tag: "Reviews",
    summary: "Create review",
  },
  {
    method: "patch",
    path: "/api/reviews/{id}",
    tag: "Reviews",
    summary: "Update own review",
  },
  {
    method: "delete",
    path: "/api/reviews/{id}",
    tag: "Reviews",
    summary: "Delete own review",
  },
  {
    method: "patch",
    path: "/api/reviews/{id}/moderate",
    tag: "Reviews",
    summary: "Moderate review (admin)",
  },
  {
    method: "post",
    path: "/api/coupons/validate",
    tag: "Coupons",
    summary: "Validate coupon",
  },
  ...resourceDocs("coupons", "Coupons"),
  {
    method: "get",
    path: "/api/coupon-redemptions",
    tag: "Coupon redemptions",
    summary: "List redemptions (admin)",
  },
  {
    method: "get",
    path: "/api/orders",
    tag: "Orders",
    summary: "List own orders or all orders for admin",
  },
  {
    method: "post",
    path: "/api/orders",
    tag: "Orders",
    summary: "Create order from validated product data",
  },
  {
    method: "get",
    path: "/api/orders/{id}",
    tag: "Orders",
    summary: "Get order",
  },
  {
    method: "patch",
    path: "/api/orders/{id}",
    tag: "Orders",
    summary: "Update order (admin)",
  },
  {
    method: "post",
    path: "/api/orders/{id}/cancel",
    tag: "Orders",
    summary: "Cancel own order",
  },
  ...resourceDocs("order-items", "Order items"),
  ...resourceDocs("order-addresses", "Order addresses"),
  {
    method: "post",
    path: "/api/payments/checkout-intent",
    tag: "Payments",
    summary: "Create an order-linked Stripe PaymentIntent",
  },
  {
    method: "post",
    path: "/api/payments/checkout-confirm",
    tag: "Payments",
    summary: "Verify Stripe payment and complete the customer order",
  },
  {
    method: "get",
    path: "/api/payments",
    tag: "Payments",
    summary: "List Stripe payments (admin)",
  },
  {
    method: "get",
    path: "/api/payments/{id}",
    tag: "Payments",
    summary: "Get Stripe payment (admin)",
  },
  {
    method: "post",
    path: "/api/payments",
    tag: "Payments",
    summary: "Record Stripe payment (admin)",
  },
  {
    method: "patch",
    path: "/api/payments/{id}",
    tag: "Payments",
    summary: "Update Stripe payment (admin)",
  },
  {
    method: "get",
    path: "/api/refunds",
    tag: "Refunds",
    summary: "List refunds (admin)",
  },
  {
    method: "post",
    path: "/api/refunds",
    tag: "Refunds",
    summary: "Create refund record (admin)",
  },
  {
    method: "patch",
    path: "/api/refunds/{id}",
    tag: "Refunds",
    summary: "Update refund record (admin)",
  },
  {
    method: "get",
    path: "/api/fulfillments",
    tag: "Fulfillments",
    summary: "List fulfillments (admin)",
  },
  {
    method: "post",
    path: "/api/fulfillments",
    tag: "Fulfillments",
    summary: "Create fulfillment (admin)",
  },
  {
    method: "patch",
    path: "/api/fulfillments/{id}",
    tag: "Fulfillments",
    summary: "Update fulfillment (admin)",
  },
  {
    method: "get",
    path: "/api/fulfillment-items",
    tag: "Fulfillment items",
    summary: "List fulfillment items (admin)",
  },
  {
    method: "post",
    path: "/api/fulfillment-items",
    tag: "Fulfillment items",
    summary: "Create fulfillment item (admin)",
  },
  {
    method: "delete",
    path: "/api/fulfillment-items",
    tag: "Fulfillment items",
    summary: "Delete fulfillment item (admin)",
  },
  ...contentDocs("articles", "Articles"),
  ...contentDocs("portfolio-projects", "Portfolio projects"),
  {
    method: "post",
    path: "/api/newsletter-subscribers",
    tag: "Newsletter subscribers",
    summary: "Subscribe",
    public: true,
  },
  {
    method: "post",
    path: "/api/newsletter-subscribers/unsubscribe",
    tag: "Newsletter subscribers",
    summary: "Unsubscribe",
    public: true,
  },
  {
    method: "get",
    path: "/api/newsletter-subscribers",
    tag: "Newsletter subscribers",
    summary: "List subscribers (admin)",
  },
  {
    method: "get",
    path: "/api/store-settings/storefront",
    tag: "Store settings",
    summary: "Get public storefront appearance",
    public: true,
  },
  {
    method: "put",
    path: "/api/store-settings/storefront",
    tag: "Store settings",
    summary: "Update storefront appearance (admin)",
    body: "StorefrontAppearanceInput",
  },
  {
    method: "get",
    path: "/api/store-settings",
    tag: "Store settings",
    summary: "List settings (admin)",
  },
  {
    method: "put",
    path: "/api/store-settings/{key}",
    tag: "Store settings",
    summary: "Upsert setting (admin)",
  },
  {
    method: "delete",
    path: "/api/store-settings/{key}",
    tag: "Store settings",
    summary: "Delete setting (admin)",
  },
  {
    method: "get",
    path: "/api/audit-logs",
    tag: "Audit logs",
    summary: "List audit logs (admin)",
  },
  {
    method: "post",
    path: "/api/media/images",
    tag: "Media",
    summary: "Upload image to Cloudinary (admin)",
    body: "CloudinaryUploadInput",
  },
  {
    method: "delete",
    path: "/api/media/images",
    tag: "Media",
    summary: "Delete image from Cloudinary (admin)",
  },
];

function resourceDocs(
  path: string,
  tag: string,
  publicRead = false,
): RouteDoc[] {
  return [
    {
      method: "get",
      path: `/api/${path}`,
      tag,
      summary: `List ${tag.toLowerCase()}`,
      public: publicRead,
    },
    {
      method: "post",
      path: `/api/${path}`,
      tag,
      summary: `Create ${tag.toLowerCase()} (admin)`,
    },
    {
      method: "patch",
      path: `/api/${path}/{id}`,
      tag,
      summary: `Update ${tag.toLowerCase()} (admin)`,
    },
    {
      method: "delete",
      path: `/api/${path}/{id}`,
      tag,
      summary: `Delete ${tag.toLowerCase()} (admin)`,
    },
  ];
}

function contentDocs(path: string, tag: string): RouteDoc[] {
  return [
    {
      method: "get",
      path: `/api/${path}`,
      tag,
      summary: `List ${tag.toLowerCase()}`,
      public: true,
    },
    {
      method: "get",
      path: `/api/${path}/{id}`,
      tag,
      summary: `Get ${tag.toLowerCase()} by ID or slug`,
      public: true,
    },
    {
      method: "post",
      path: `/api/${path}`,
      tag,
      summary: `Create ${tag.toLowerCase()} (admin)`,
    },
    {
      method: "patch",
      path: `/api/${path}/{id}`,
      tag,
      summary: `Update ${tag.toLowerCase()} (admin)`,
    },
    {
      method: "delete",
      path: `/api/${path}/{id}`,
      tag,
      summary: `Archive ${tag.toLowerCase()} (admin)`,
    },
  ];
}

const paths = routes.reduce<Record<string, Record<string, unknown>>>(
  (result, route) => {
    const parameters = [...route.path.matchAll(/\{([^}]+)\}/g)].map(
      (match) => ({
        name: match[1],
        in: "path",
        required: true,
        schema: { type: "string" },
      }),
    );
    result[route.path] ??= {};
    result[route.path][route.method] = {
      tags: [route.tag],
      summary: route.summary,
      security: route.public ? [] : [{ cookieAuth: [] }],
      parameters,
      ...(route.method === "post" ||
      route.method === "put" ||
      route.method === "patch"
        ? {
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: route.body
                    ? { $ref: `#/components/schemas/${route.body}` }
                    : { type: "object", additionalProperties: true },
                },
              },
            },
          }
        : {}),
      responses: {
        "200": { description: "Successful response" },
        "201": { description: "Resource created" },
        "204": { description: "Resource deleted" },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    };
    return result;
  },
  {},
);

const specs = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "I-RAS STYLES Ecommerce API",
      version: "2.0.0",
      description:
        "Cookie-authenticated ecommerce API. Product, brand, avatar, article, and portfolio images must be uploaded through Cloudinary.",
    },
    servers: [{ url: "http://localhost:4000", description: "Local backend" }],
    components: {
      securitySchemes: {
        cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
      },
      responses: {
        BadRequest: { description: "Invalid request" },
        Unauthorized: { description: "Authentication required" },
        Forbidden: { description: "Insufficient role" },
        NotFound: { description: "Resource not found" },
      },
      schemas: {
        RegisterInput: {
          type: "object",
          required: ["firstName", "lastName", "email", "password"],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password", minLength: 8 },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },
        GoogleLoginInput: {
          type: "object",
          required: ["credential"],
          properties: {
            credential: {
              type: "string",
              description: "ID token returned by Google Identity Services",
            },
          },
        },
        VerifyOtpInput: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", format: "email" },
            otp: { type: "string", minLength: 6, maxLength: 6 },
          },
        },
        CloudinaryUploadInput: {
          type: "object",
          required: ["dataUri"],
          properties: {
            dataUri: { type: "string", description: "Base64 data:image URI" },
            folder: {
              type: "string",
              enum: [
                "products",
                "brands",
                "avatars",
                "content",
                "portfolio",
                "storefront",
              ],
            },
            altText: { type: "string" },
          },
        },
        StorefrontAppearanceInput: {
          type: "object",
          description:
            "Validated logo, hero, promotion, sidebar, and shop banner presentation settings.",
          required: ["logo", "hero", "promotions", "sidebar", "shopBanner"],
        },
      },
    },
    paths,
  },
  apis: [],
});

export const setupSwagger = (app: Express) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, { swaggerOptions: { withCredentials: true } }),
  );
  app.get("/api-docs.json", (_req, res) => res.json(specs));
  console.log("Swagger docs available at http://localhost:4000/api-docs");
};
