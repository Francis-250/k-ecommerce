import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import cloudinary from "../src/lib/cloudinary";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const ids = {
  address: "seed-address-customer",
  otp: "seed-otp-consumed",
  imageDress: "seed-image-dress",
  imageBag: "seed-image-bag",
  imageSneakers: "seed-image-sneakers",
  imageJewelry: "seed-image-jewelry",
  imageShirt: "seed-image-shirt",
  imageSandals: "seed-image-sandals",
  imageHeadwrap: "seed-image-headwrap",
  imageBackpack: "seed-image-backpack",
  detailDress: "seed-detail-dress",
  optionSize: "seed-option-size",
  optionSmall: "seed-option-value-small",
  optionMedium: "seed-option-value-medium",
  inventoryMovement: "seed-inventory-movement",
  cart: "seed-cart-active",
  cartItem: "seed-cart-item",
  orderAddressShipping: "seed-order-address-shipping",
  orderAddressBilling: "seed-order-address-billing",
  orderItem: "seed-order-item",
  payment: "seed-payment-stripe",
  refund: "seed-refund",
  fulfillment: "seed-fulfillment",
  couponRedemption: "seed-coupon-redemption",
  review: "seed-review",
  audit: "seed-audit-log",
} as const;

async function cloudinarySeedImage(
  publicId: string,
  localPath: string,
  existingUrl?: string | null,
) {
  if (existingUrl?.startsWith("https://res.cloudinary.com/"))
    return existingUrl;
  try {
    const uploaded = await cloudinary.uploader.upload(localPath, {
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
      transformation: [
        { width: 2400, height: 2400, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });
    return uploaded.secure_url;
  } catch (e) {
    return localPath.replace("../frontend/public", "");
  }
}

async function main() {
  const password = await bcrypt.hash("Storefront123!", 10);
  const consumedOtp = await bcrypt.hash("000000", 10);
  const existingDressImage = await prisma.productImage.findUnique({
    where: { id: ids.imageDress },
  });
  const existingBagImage = await prisma.productImage.findUnique({
    where: { id: ids.imageBag },
  });
  const existingSneakersImage = await prisma.productImage.findUnique({
    where: { id: ids.imageSneakers },
  });
  const existingJewelryImage = await prisma.productImage.findUnique({
    where: { id: ids.imageJewelry },
  });
  const existingShirtImage = await prisma.productImage.findUnique({
    where: { id: ids.imageShirt },
  });
  const existingSandalsImage = await prisma.productImage.findUnique({
    where: { id: ids.imageSandals },
  });
  const existingHeadwrapImage = await prisma.productImage.findUnique({
    where: { id: ids.imageHeadwrap },
  });
  const existingBackpackImage = await prisma.productImage.findUnique({
    where: { id: ids.imageBackpack },
  });
  const existingArticle = await prisma.article.findUnique({
    where: { slug: "building-a-timeless-wardrobe" },
  });
  const existingPortfolio = await prisma.portfolioProject.findUnique({
    where: { slug: "quiet-luxury-editorial" },
  });
  const existingAppearanceSetting = await prisma.storeSetting.findUnique({
    where: { key: "storefront.appearance" },
  });
  const existingAppearance = existingAppearanceSetting?.value as
    | {
        logo?: { url?: string };
        hero?: { url?: string };
        promotions?: Array<{ url?: string }>;
        sidebar?: {
          top?: { url?: string };
          middle?: { url?: string };
          bottom?: { url?: string };
        };
        shopBanner?: { url?: string };
      }
    | undefined;
  const dressImageUrl = await cloudinarySeedImage(
    "iras-styles/products/indigo-ankara-midi-dress",
    "../frontend/public/storefront/assets/img/african-products/ankara-midi-dress.png",
    existingDressImage?.url,
  );
  const bagImageUrl = await cloudinarySeedImage(
    "iras-styles/products/emerald-ankara-handbag",
    "../frontend/public/storefront/assets/img/african-products/ankara-handbag.png",
    existingBagImage?.url,
  );
  const sneakersImageUrl = await cloudinarySeedImage(
    "iras-styles/products/kente-panel-sneakers",
    "../frontend/public/storefront/assets/img/african-products/kente-sneakers.png",
    existingSneakersImage?.url,
  );
  const jewelryImageUrl = await cloudinarySeedImage(
    "iras-styles/products/maasai-beaded-jewelry-set",
    "../frontend/public/storefront/assets/img/african-products/beaded-jewelry.png",
    existingJewelryImage?.url,
  );
  const shirtImageUrl = await cloudinarySeedImage(
    "iras-styles/products/heritage-ankara-shirt",
    "../frontend/public/storefront/assets/img/african-products/heritage-shirt.png",
    existingShirtImage?.url,
  );
  const sandalsImageUrl = await cloudinarySeedImage(
    "iras-styles/products/indigo-print-leather-sandals",
    "../frontend/public/storefront/assets/img/african-products/leather-sandals.png",
    existingSandalsImage?.url,
  );
  const headwrapImageUrl = await cloudinarySeedImage(
    "iras-styles/products/wax-print-headwrap-set",
    "../frontend/public/storefront/assets/img/african-products/wax-headwrap.png",
    existingHeadwrapImage?.url,
  );
  const backpackImageUrl = await cloudinarySeedImage(
    "iras-styles/products/mudcloth-leather-backpack",
    "../frontend/public/storefront/assets/img/african-products/mudcloth-backpack.png",
    existingBackpackImage?.url,
  );
  const articleImageUrl = await cloudinarySeedImage(
    "iras-styles/content/building-a-timeless-wardrobe",
    "../frontend/public/storefront/assets/img/blog/blog1.jpg",
    existingArticle?.coverImageUrl,
  );
  const portfolioImageUrl = await cloudinarySeedImage(
    "iras-styles/portfolio/quiet-luxury-editorial",
    "../frontend/public/storefront/assets/img/portfolio/port1.jpg",
    existingPortfolio?.coverImageUrl,
  );
  const [
    logoUrl,
    heroUrl,
    promotionOneUrl,
    promotionTwoUrl,
    sidebarTopUrl,
    sidebarMiddleUrl,
    sidebarBottomUrl,
    shopBannerUrl,
  ] = await Promise.all([
    cloudinarySeedImage(
      "iras-styles/storefront/logo",
      "../frontend/public/storefront/assets/img/logo/iras-styles-badge.png",
      existingAppearance?.logo?.url,
    ),
    cloudinarySeedImage(
      "iras-styles/storefront/home-hero",
      "../frontend/public/storefront/assets/img/slider/african-fashion-hero.png",
      existingAppearance?.hero?.url,
    ),
    cloudinarySeedImage(
      "iras-styles/storefront/promotion-one",
      "../frontend/public/storefront/assets/img/banner/african-boutique-collection.png",
      existingAppearance?.promotions?.[0]?.url,
    ),
    cloudinarySeedImage(
      "iras-styles/storefront/promotion-two",
      "../frontend/public/storefront/assets/img/banner/african-dress-editorial.png",
      existingAppearance?.promotions?.[1]?.url,
    ),
    cloudinarySeedImage(
      "iras-styles/storefront/sidebar-top",
      "../frontend/public/storefront/assets/img/banner/african-free-shipping.png",
      existingAppearance?.sidebar?.top?.url,
    ),
    cloudinarySeedImage(
      "iras-styles/storefront/sidebar-middle",
      "../frontend/public/storefront/assets/img/banner/african-fashion-sidebar.png",
      existingAppearance?.sidebar?.middle?.url,
    ),
    cloudinarySeedImage(
      "iras-styles/storefront/sidebar-bottom",
      "../frontend/public/storefront/assets/img/banner/african-style-portrait.png",
      existingAppearance?.sidebar?.bottom?.url,
    ),
    cloudinarySeedImage(
      "iras-styles/storefront/shop-banner",
      "../frontend/public/storefront/assets/img/banner/bannner10.jpg",
      existingAppearance?.shopBanner?.url,
    ),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: "admin@irasstyles.com" },
    update: {
      firstName: "I-RAS",
      lastName: "Administrator",
      role: "ADMIN",
      isVerified: true,
      emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
      isActive: true,
      isBanned: false,
    },
    create: {
      email: "admin@irasstyles.com",
      password,
      firstName: "I-RAS",
      lastName: "Administrator",
      username: "iras-admin",
      role: "ADMIN",
      isVerified: true,
      emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {
      firstName: "Amara",
      lastName: "Johnson",
      isVerified: true,
      emailVerifiedAt: new Date("2026-01-02T00:00:00.000Z"),
      acceptsMarketing: true,
      isActive: true,
      isBanned: false,
    },
    create: {
      email: "customer@example.com",
      password,
      firstName: "Amara",
      lastName: "Johnson",
      username: "amara-johnson",
      phone: "+12025550124",
      isVerified: true,
      emailVerifiedAt: new Date("2026-01-02T00:00:00.000Z"),
      acceptsMarketing: true,
    },
  });

  await prisma.address.upsert({
    where: { id: ids.address },
    update: {
      userId: customer.id,
      fullName: "Amara Johnson",
      phone: "+12025550124",
      province: "New York",
      city: "Brooklyn",
      street: "120 Atlantic Avenue",
      street2: "Apartment 4B",
      postalCode: "11201",
      isDefault: true,
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
    create: {
      id: ids.address,
      userId: customer.id,
      type: "SHIPPING",
      fullName: "Amara Johnson",
      phone: "+12025550124",
      province: "New York",
      city: "Brooklyn",
      street: "120 Atlantic Avenue",
      street2: "Apartment 4B",
      postalCode: "11201",
      isDefault: true,
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
  });

  await prisma.otpCodes.upsert({
    where: { id: ids.otp },
    update: {
      userId: customer.id,
      otp: consumedOtp,
      otp_expiry: new Date("2026-01-01T00:00:00.000Z"),
      consumedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
    create: {
      id: ids.otp,
      userId: customer.id,
      otp: consumedOtp,
      otp_expiry: new Date("2026-01-01T00:00:00.000Z"),
      otp_type: "REGISTRATION",
      consumedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  });

  const brand = await prisma.brand.upsert({
    where: { slug: "iras-styles" },
    update: {
      name: "I-RAS STYLES",
      country: "United States",
      isActive: true,
    },
    create: {
      name: "I-RAS STYLES",
      slug: "iras-styles",
      description: "Heritage-inspired contemporary African fashion.",
      country: "United States",
      websiteUrl: "https://irasstyles.com",
    },
  });

  const fashion = await prisma.category.upsert({
    where: { slug: "fashion" },
    update: { name: "Fashion", isActive: true },
    create: {
      name: "Fashion",
      slug: "fashion",
      description: "Contemporary African fashion and accessories.",
    },
  });

  const dresses = await prisma.category.upsert({
    where: { slug: "dresses" },
    update: { name: "Dresses", parentId: fashion.id, isActive: true },
    create: {
      name: "Dresses",
      slug: "dresses",
      parentId: fashion.id,
      description: "Statement dresses for every occasion.",
    },
  });

  const handbags = await prisma.category.upsert({
    where: { slug: "handbags" },
    update: { name: "Handbags", parentId: fashion.id, isActive: true },
    create: {
      name: "Handbags",
      slug: "handbags",
      parentId: fashion.id,
      description: "Handcrafted bags and carryalls.",
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: { name: "Accessories", parentId: fashion.id, isActive: true },
    create: {
      name: "Accessories",
      slug: "accessories",
      parentId: fashion.id,
      description: "Handmade African jewelry, footwear, and accessories.",
    },
  });

  const tops = await prisma.category.upsert({
    where: { slug: "tops" },
    update: { name: "Tops", parentId: fashion.id, isActive: true },
    create: {
      name: "Tops",
      slug: "tops",
      parentId: fashion.id,
      description: "Tailored African print shirts and blouses.",
    },
  });

  const dress = await prisma.product.upsert({
    where: { slug: "indigo-ankara-midi-dress" },
    update: {
      categoryId: dresses.id,
      brandId: brand.id,
      status: "ACTIVE",
      price: 118,
      compareAtPrice: 145,
      isFeatured: true,
      publishedAt: new Date("2026-01-05T00:00:00.000Z"),
    },
    create: {
      categoryId: dresses.id,
      brandId: brand.id,
      name: "Indigo Ankara Midi Dress",
      slug: "indigo-ankara-midi-dress",
      sku: "IRAS-DRESS-INDIGO",
      shortDescription: "A structured midi dress in indigo Ankara print.",
      description:
        "Designed with a fitted waist, practical pockets, and a flowing midi skirt.",
      price: 118,
      compareAtPrice: 145,
      currency: "USD",
      status: "ACTIVE",
      audience: "WOMEN",
      badge: "Sale",
      isFeatured: true,
      publishedAt: new Date("2026-01-05T00:00:00.000Z"),
    },
  });

  const bag = await prisma.product.upsert({
    where: { slug: "emerald-ankara-handbag" },
    update: {
      categoryId: handbags.id,
      brandId: brand.id,
      status: "ACTIVE",
      price: 96,
      publishedAt: new Date("2026-01-06T00:00:00.000Z"),
    },
    create: {
      categoryId: handbags.id,
      brandId: brand.id,
      name: "Emerald Ankara Handbag",
      slug: "emerald-ankara-handbag",
      sku: "IRAS-BAG-EMERALD",
      shortDescription: "A structured handbag finished with Ankara textile.",
      description:
        "A versatile everyday handbag with a secure closure and internal pocket.",
      price: 96,
      currency: "USD",
      status: "ACTIVE",
      audience: "WOMEN",
      badge: "New",
      publishedAt: new Date("2026-01-06T00:00:00.000Z"),
    },
  });

  const sneakers = await prisma.product.upsert({
    where: { slug: "kente-panel-sneakers" },
    update: {
      categoryId: accessories.id,
      brandId: brand.id,
      status: "ACTIVE",
      price: 84,
      publishedAt: new Date("2026-01-07T00:00:00.000Z"),
    },
    create: {
      categoryId: accessories.id,
      brandId: brand.id,
      name: "Kente Panel Sneakers",
      slug: "kente-panel-sneakers",
      sku: "IRAS-SHOES-KENTE",
      shortDescription: "Low-top sneakers with authentic Kente cloth side panels.",
      description:
        "Handcrafted sneakers combining premium canvas and traditional Ghanaian Kente weave accents.",
      price: 84,
      currency: "USD",
      status: "ACTIVE",
      audience: "MEN",
      publishedAt: new Date("2026-01-07T00:00:00.000Z"),
    },
  });

  const jewelry = await prisma.product.upsert({
    where: { slug: "maasai-beaded-jewelry-set" },
    update: {
      categoryId: accessories.id,
      brandId: brand.id,
      status: "ACTIVE",
      price: 72,
      isFeatured: true,
      publishedAt: new Date("2026-01-08T00:00:00.000Z"),
    },
    create: {
      categoryId: accessories.id,
      brandId: brand.id,
      name: "Maasai Beaded Jewelry Set",
      slug: "maasai-beaded-jewelry-set",
      sku: "IRAS-JEWELRY-MAASAI",
      shortDescription: "Hand-beaded neckpiece and matching drop earrings.",
      description:
        "Vibrant multi-colored beaded necklace and earring set crafted by Kenyan artisans.",
      price: 72,
      currency: "USD",
      status: "ACTIVE",
      audience: "WOMEN",
      isFeatured: true,
      publishedAt: new Date("2026-01-08T00:00:00.000Z"),
    },
  });

  const shirt = await prisma.product.upsert({
    where: { slug: "heritage-ankara-shirt" },
    update: {
      categoryId: tops.id,
      brandId: brand.id,
      status: "ACTIVE",
      price: 78,
      isFeatured: true,
      publishedAt: new Date("2026-01-09T00:00:00.000Z"),
    },
    create: {
      categoryId: tops.id,
      brandId: brand.id,
      name: "Heritage Ankara Shirt",
      slug: "heritage-ankara-shirt",
      sku: "IRAS-TOP-HERITAGE",
      shortDescription: "Short-sleeve button-up in vibrant African wax print.",
      description:
        "Tailored relaxed-fit shirt for men, crafted with premium breathable cotton.",
      price: 78,
      currency: "USD",
      status: "ACTIVE",
      audience: "MEN",
      isFeatured: true,
      publishedAt: new Date("2026-01-09T00:00:00.000Z"),
    },
  });

  const sandals = await prisma.product.upsert({
    where: { slug: "indigo-print-leather-sandals" },
    update: {
      categoryId: accessories.id,
      brandId: brand.id,
      status: "ACTIVE",
      price: 68,
      publishedAt: new Date("2026-01-10T00:00:00.000Z"),
    },
    create: {
      categoryId: accessories.id,
      brandId: brand.id,
      name: "Indigo Print Leather Sandals",
      slug: "indigo-print-leather-sandals",
      sku: "IRAS-SANDALS-INDIGO",
      shortDescription: "Genuine leather flat sandals with printed textile straps.",
      description:
        "Comfortable summer footwear styled with handcrafted leather soles and indigo Ankara fabric.",
      price: 68,
      currency: "USD",
      status: "ACTIVE",
      audience: "WOMEN",
      publishedAt: new Date("2026-01-10T00:00:00.000Z"),
    },
  });

  const headwrap = await prisma.product.upsert({
    where: { slug: "wax-print-headwrap-set" },
    update: {
      categoryId: accessories.id,
      brandId: brand.id,
      status: "ACTIVE",
      price: 48,
      publishedAt: new Date("2026-01-11T00:00:00.000Z"),
    },
    create: {
      categoryId: accessories.id,
      brandId: brand.id,
      name: "Wax Print Headwrap Set",
      slug: "wax-print-headwrap-set",
      sku: "IRAS-HEADWRAP-WAX",
      shortDescription: "Versatile African print crown wraps with matching hoop earrings.",
      description:
        "Extra-long Ankara fabric wrap suitable for creative head wraps and protective styling.",
      price: 48,
      currency: "USD",
      status: "ACTIVE",
      audience: "WOMEN",
      publishedAt: new Date("2026-01-11T00:00:00.000Z"),
    },
  });

  const backpack = await prisma.product.upsert({
    where: { slug: "mudcloth-leather-backpack" },
    update: {
      categoryId: handbags.id,
      brandId: brand.id,
      status: "ACTIVE",
      price: 124,
      isFeatured: true,
      publishedAt: new Date("2026-01-12T00:00:00.000Z"),
    },
    create: {
      categoryId: handbags.id,
      brandId: brand.id,
      name: "Mudcloth Leather Backpack",
      slug: "mudcloth-leather-backpack",
      sku: "IRAS-BAG-MUDCLOTH",
      shortDescription: "Full-grain leather daypack accented with Malian mudcloth fabric.",
      description:
        "Spacious luxury backpack featuring laptop sleeve and hand-dyed Bogolan texture.",
      price: 124,
      currency: "USD",
      status: "ACTIVE",
      audience: "MEN",
      isFeatured: true,
      publishedAt: new Date("2026-01-12T00:00:00.000Z"),
    },
  });

  await prisma.productImage.upsert({
    where: { id: ids.imageDress },
    update: { productId: dress.id, url: dressImageUrl },
    create: {
      id: ids.imageDress,
      productId: dress.id,
      url: dressImageUrl,
      altText: "Indigo Ankara midi dress",
      isPrimary: true,
    },
  });

  await prisma.productImage.upsert({
    where: { id: ids.imageBag },
    update: { productId: bag.id, url: bagImageUrl },
    create: {
      id: ids.imageBag,
      productId: bag.id,
      url: bagImageUrl,
      altText: "Emerald Ankara handbag",
      isPrimary: true,
    },
  });

  await prisma.productImage.upsert({
    where: { id: ids.imageSneakers },
    update: { productId: sneakers.id, url: sneakersImageUrl },
    create: {
      id: ids.imageSneakers,
      productId: sneakers.id,
      url: sneakersImageUrl,
      altText: "Kente Panel Sneakers",
      isPrimary: true,
    },
  });

  await prisma.productImage.upsert({
    where: { id: ids.imageJewelry },
    update: { productId: jewelry.id, url: jewelryImageUrl },
    create: {
      id: ids.imageJewelry,
      productId: jewelry.id,
      url: jewelryImageUrl,
      altText: "Maasai Beaded Jewelry Set",
      isPrimary: true,
    },
  });

  await prisma.productImage.upsert({
    where: { id: ids.imageShirt },
    update: { productId: shirt.id, url: shirtImageUrl },
    create: {
      id: ids.imageShirt,
      productId: shirt.id,
      url: shirtImageUrl,
      altText: "Heritage Ankara Shirt",
      isPrimary: true,
    },
  });

  await prisma.productImage.upsert({
    where: { id: ids.imageSandals },
    update: { productId: sandals.id, url: sandalsImageUrl },
    create: {
      id: ids.imageSandals,
      productId: sandals.id,
      url: sandalsImageUrl,
      altText: "Indigo Print Leather Sandals",
      isPrimary: true,
    },
  });

  await prisma.productImage.upsert({
    where: { id: ids.imageHeadwrap },
    update: { productId: headwrap.id, url: headwrapImageUrl },
    create: {
      id: ids.imageHeadwrap,
      productId: headwrap.id,
      url: headwrapImageUrl,
      altText: "Wax Print Headwrap Set",
      isPrimary: true,
    },
  });

  await prisma.productImage.upsert({
    where: { id: ids.imageBackpack },
    update: { productId: backpack.id, url: backpackImageUrl },
    create: {
      id: ids.imageBackpack,
      productId: backpack.id,
      url: backpackImageUrl,
      altText: "Mudcloth Leather Backpack",
      isPrimary: true,
    },
  });

  await prisma.productDetail.upsert({
    where: { id: ids.detailDress },
    update: { value: "100% cotton Ankara fabric" },
    create: {
      id: ids.detailDress,
      productId: dress.id,
      label: "Material",
      value: "100% cotton Ankara fabric",
    },
  });

  const sizeOption = await prisma.productOption.upsert({
    where: { id: ids.optionSize },
    update: { productId: dress.id, name: "Size" },
    create: {
      id: ids.optionSize,
      productId: dress.id,
      name: "Size",
    },
  });

  const small = await prisma.productOptionValue.upsert({
    where: { id: ids.optionSmall },
    update: { optionId: sizeOption.id, value: "Small" },
    create: {
      id: ids.optionSmall,
      optionId: sizeOption.id,
      value: "Small",
    },
  });

  const medium = await prisma.productOptionValue.upsert({
    where: { id: ids.optionMedium },
    update: { optionId: sizeOption.id, value: "Medium" },
    create: {
      id: ids.optionMedium,
      optionId: sizeOption.id,
      value: "Medium",
      sortOrder: 1,
    },
  });

  const dressSmall = await prisma.productVariant.upsert({
    where: { sku: "IRAS-DRESS-INDIGO-S" },
    update: { productId: dress.id, name: "Small", price: 118, isActive: true },
    create: {
      productId: dress.id,
      name: "Small",
      sku: "IRAS-DRESS-INDIGO-S",
      price: 118,
    },
  });

  const dressMedium = await prisma.productVariant.upsert({
    where: { sku: "IRAS-DRESS-INDIGO-M" },
    update: { productId: dress.id, name: "Medium", price: 118, isActive: true },
    create: {
      productId: dress.id,
      name: "Medium",
      sku: "IRAS-DRESS-INDIGO-M",
      price: 118,
    },
  });

  const bagDefault = await prisma.productVariant.upsert({
    where: { sku: "IRAS-BAG-EMERALD-DEFAULT" },
    update: { productId: bag.id, name: "Default", price: 96, isActive: true },
    create: {
      productId: bag.id,
      name: "Default",
      sku: "IRAS-BAG-EMERALD-DEFAULT",
      price: 96,
    },
  });

  await prisma.variantOptionValue.upsert({
    where: {
      variantId_optionValueId: {
        variantId: dressSmall.id,
        optionValueId: small.id,
      },
    },
    update: {},
    create: { variantId: dressSmall.id, optionValueId: small.id },
  });

  await prisma.variantOptionValue.upsert({
    where: {
      variantId_optionValueId: {
        variantId: dressMedium.id,
        optionValueId: medium.id,
      },
    },
    update: {},
    create: { variantId: dressMedium.id, optionValueId: medium.id },
  });

  await prisma.inventory.upsert({
    where: { variantId: dressSmall.id },
    update: { quantity: 18, reserved: 1, reorderPoint: 5 },
    create: {
      variantId: dressSmall.id,
      quantity: 18,
      reserved: 1,
      reorderPoint: 5,
      location: "US-WAREHOUSE",
    },
  });

  await prisma.inventory.upsert({
    where: { variantId: dressMedium.id },
    update: { quantity: 24, reserved: 0, reorderPoint: 5 },
    create: {
      variantId: dressMedium.id,
      quantity: 24,
      reorderPoint: 5,
      location: "US-WAREHOUSE",
    },
  });

  await prisma.inventory.upsert({
    where: { variantId: bagDefault.id },
    update: { quantity: 12, reserved: 1, reorderPoint: 4 },
    create: {
      variantId: bagDefault.id,
      quantity: 12,
      reserved: 1,
      reorderPoint: 4,
      location: "US-WAREHOUSE",
    },
  });

  await prisma.inventoryMovement.upsert({
    where: { id: ids.inventoryMovement },
    update: { variantId: dressSmall.id, quantityAfter: 18 },
    create: {
      id: ids.inventoryMovement,
      variantId: dressSmall.id,
      type: "STOCK_IN",
      quantity: 18,
      quantityAfter: 18,
      referenceType: "SEED",
      referenceId: "initial-stock",
      note: "Initial seed inventory",
      createdById: admin.id,
    },
  });

  await prisma.productRelation.upsert({
    where: {
      productId_relatedProductId: {
        productId: dress.id,
        relatedProductId: bag.id,
      },
    },
    update: { sortOrder: 0 },
    create: { productId: dress.id, relatedProductId: bag.id },
  });

  const cart = await prisma.cart.upsert({
    where: { id: ids.cart },
    update: { userId: customer.id, status: "ACTIVE", currency: "USD" },
    create: {
      id: ids.cart,
      userId: customer.id,
      status: "ACTIVE",
      currency: "USD",
      expiresAt: new Date("2027-01-01T00:00:00.000Z"),
    },
  });

  await prisma.cartItem.upsert({
    where: { id: ids.cartItem },
    update: {
      cartId: cart.id,
      productId: bag.id,
      variantId: bagDefault.id,
      quantity: 1,
      unitPrice: 96,
    },
    create: {
      id: ids.cartItem,
      cartId: cart.id,
      productId: bag.id,
      variantId: bagDefault.id,
      quantity: 1,
      unitPrice: 96,
      options: { style: "Default" },
    },
  });

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: { userId: customer.id, productId: dress.id },
    },
    update: {},
    create: { userId: customer.id, productId: dress.id },
  });

  const order = await prisma.order.upsert({
    where: { orderNumber: "IRAS-1001" },
    update: {
      userId: customer.id,
      email: customer.email,
      status: "PARTIALLY_REFUNDED",
      paymentStatus: "PARTIALLY_REFUNDED",
      fulfillmentStatus: "FULFILLED",
    },
    create: {
      orderNumber: "IRAS-1001",
      userId: customer.id,
      email: customer.email,
      phone: "+12025550124",
      status: "PARTIALLY_REFUNDED",
      paymentStatus: "PARTIALLY_REFUNDED",
      fulfillmentStatus: "FULFILLED",
      currency: "USD",
      subtotal: 236,
      discountTotal: 10,
      shippingTotal: 12,
      taxTotal: 18.08,
      total: 256.08,
      customerNote: "Please leave the parcel with the concierge.",
      placedAt: new Date("2026-06-15T14:30:00.000Z"),
    },
  });

  const addressData = {
    orderId: order.id,
    firstName: "Amara",
    lastName: "Johnson",
    phone: "+12025550124",
    state: "New York",
    city: "Brooklyn",
    line1: "120 Atlantic Avenue",
    line2: "Apartment 4B",
    postalCode: "11201",
  };

  await prisma.orderAddress.upsert({
    where: { id: ids.orderAddressShipping },
    update: { ...addressData, type: "SHIPPING" },
    create: {
      id: ids.orderAddressShipping,
      ...addressData,
      type: "SHIPPING",
    },
  });

  await prisma.orderAddress.upsert({
    where: { id: ids.orderAddressBilling },
    update: { ...addressData, type: "BILLING" },
    create: {
      id: ids.orderAddressBilling,
      ...addressData,
      type: "BILLING",
    },
  });

  const orderItem = await prisma.orderItem.upsert({
    where: { id: ids.orderItem },
    update: {
      orderId: order.id,
      productId: dress.id,
      variantId: dressSmall.id,
      quantity: 2,
      unitPrice: 118,
      imageUrl: dressImageUrl,
      total: 236,
    },
    create: {
      id: ids.orderItem,
      orderId: order.id,
      productId: dress.id,
      variantId: dressSmall.id,
      productName: dress.name,
      productSlug: dress.slug,
      sku: dressSmall.sku,
      imageUrl: dressImageUrl,
      options: { Size: "Small" },
      quantity: 2,
      unitPrice: 118,
      total: 236,
    },
  });

  const payment = await prisma.payment.upsert({
    where: { id: ids.payment },
    update: {
      orderId: order.id,
      status: "PARTIALLY_REFUNDED",
      amount: 256.08,
    },
    create: {
      id: ids.payment,
      orderId: order.id,
      provider: "STRIPE",
      status: "PARTIALLY_REFUNDED",
      amount: 256.08,
      currency: "USD",
      stripePaymentIntentId: "pi_seed_iras_1001",
      stripeChargeId: "ch_seed_iras_1001",
      paymentMethodType: "card",
      paymentMethodLast4: "4242",
      idempotencyKey: "seed-order-iras-1001",
      processedAt: new Date("2026-06-15T14:31:00.000Z"),
      metadata: { source: "prisma-seed" },
    },
  });

  await prisma.refund.upsert({
    where: { id: ids.refund },
    update: { paymentId: payment.id, orderId: order.id, amount: 20 },
    create: {
      id: ids.refund,
      paymentId: payment.id,
      orderId: order.id,
      stripeRefundId: "re_seed_iras_1001",
      status: "SUCCEEDED",
      amount: 20,
      reason: "Customer requested a partial refund",
      processedAt: new Date("2026-06-20T10:00:00.000Z"),
    },
  });

  const fulfillment = await prisma.fulfillment.upsert({
    where: { id: ids.fulfillment },
    update: { orderId: order.id, status: "DELIVERED" },
    create: {
      id: ids.fulfillment,
      orderId: order.id,
      status: "DELIVERED",
      carrier: "USPS",
      service: "Priority Mail",
      trackingNumber: "IRASSEEDTRACK1001",
      trackingUrl: "https://tools.usps.com/go/TrackConfirmAction",
      shippedAt: new Date("2026-06-16T12:00:00.000Z"),
      deliveredAt: new Date("2026-06-19T16:15:00.000Z"),
    },
  });

  await prisma.fulfillmentItem.upsert({
    where: {
      fulfillmentId_orderItemId: {
        fulfillmentId: fulfillment.id,
        orderItemId: orderItem.id,
      },
    },
    update: { quantity: 2 },
    create: {
      fulfillmentId: fulfillment.id,
      orderItemId: orderItem.id,
      quantity: 2,
    },
  });

  const coupon = await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: { status: "ACTIVE", value: 10, usageLimit: 500 },
    create: {
      code: "WELCOME10",
      name: "Welcome discount",
      description: "$10 off a qualifying first order.",
      type: "FIXED_AMOUNT",
      status: "ACTIVE",
      value: 10,
      minimumSubtotal: 75,
      usageLimit: 500,
      perCustomerLimit: 1,
      startsAt: new Date("2026-01-01T00:00:00.000Z"),
      endsAt: new Date("2027-01-01T00:00:00.000Z"),
    },
  });

  await prisma.couponRedemption.upsert({
    where: { id: ids.couponRedemption },
    update: {
      couponId: coupon.id,
      orderId: order.id,
      userId: customer.id,
      discountAmount: 10,
    },
    create: {
      id: ids.couponRedemption,
      couponId: coupon.id,
      orderId: order.id,
      userId: customer.id,
      discountAmount: 10,
    },
  });

  await prisma.review.upsert({
    where: { id: ids.review },
    update: {
      productId: dress.id,
      userId: customer.id,
      rating: 5,
      status: "APPROVED",
    },
    create: {
      id: ids.review,
      productId: dress.id,
      userId: customer.id,
      rating: 5,
      title: "Beautiful dress",
      body: "The print is vibrant and the fit is exactly as described.",
      status: "APPROVED",
      isVerified: true,
      publishedAt: new Date("2026-06-25T00:00:00.000Z"),
    },
  });

  await prisma.newsletterSubscriber.upsert({
    where: { email: "newsletter@example.com" },
    update: { isActive: true, source: "footer" },
    create: {
      email: "newsletter@example.com",
      source: "footer",
    },
  });

  await prisma.article.upsert({
    where: { slug: "building-a-timeless-wardrobe" },
    update: {
      status: "PUBLISHED",
      coverImageUrl: articleImageUrl,
    },
    create: {
      title: "Building a Timeless Wardrobe",
      slug: "building-a-timeless-wardrobe",
      excerpt: "Thoughtful pieces that remain expressive season after season.",
      content:
        "Choose versatile silhouettes, strong natural fabrics, and details that reflect your personal story.",
      coverImageUrl: articleImageUrl,
      authorName: "I-RAS STYLES",
      status: "PUBLISHED",
      publishedAt: new Date("2026-05-01T00:00:00.000Z"),
    },
  });

  await prisma.portfolioProject.upsert({
    where: { slug: "quiet-luxury-editorial" },
    update: {
      status: "PUBLISHED",
      coverImageUrl: portfolioImageUrl,
    },
    create: {
      title: "Quiet Luxury Editorial",
      slug: "quiet-luxury-editorial",
      client: "I-RAS STYLES",
      category: "Editorial",
      description: "A modern editorial rooted in texture and craftsmanship.",
      content:
        "A study of refined silhouettes paired with heritage-inspired textiles.",
      coverImageUrl: portfolioImageUrl,
      gallery: [],
      status: "PUBLISHED",
      completedAt: new Date("2026-04-15T00:00:00.000Z"),
      publishedAt: new Date("2026-04-20T00:00:00.000Z"),
    },
  });

  await prisma.storeSetting.upsert({
    where: { key: "store.profile" },
    update: {
      value: {
        name: "I-RAS STYLES",
        currency: "USD",
        country: "US",
        paymentProvider: "STRIPE",
      },
      updatedBy: admin.id,
    },
    create: {
      key: "store.profile",
      value: {
        name: "I-RAS STYLES",
        currency: "USD",
        country: "US",
        paymentProvider: "STRIPE",
      },
      updatedBy: admin.id,
    },
  });

  await prisma.storeSetting.upsert({
    where: { key: "storefront.appearance" },
    update: {
      value: {
        logo: {
          url: logoUrl,
          alt: "I-RAS STYLES International Fashion",
        },
        hero: {
          url: heroUrl,
          alt: "Contemporary African fashion collection",
          eyebrow: "African-made. Globally styled.",
          title: "African Fashion",
          description: "Heritage textiles and confident contemporary design.",
          link: "/shop?gender=Women",
          linkLabel: "Shop the collection",
        },
        promotions: [
          {
            url: promotionOneUrl,
            alt: "African-made boutique dress and accessories collection",
            link: "/shop",
            label: "Up to 40% off",
          },
          {
            url: promotionTwoUrl,
            alt: "Contemporary African wax-print dress",
            link: "/shop",
            label: "Sale 30% off",
          },
        ],
        sidebar: {
          top: {
            url: sidebarTopUrl,
            alt: "Shop African-made fashion with free shipping",
          },
          middle: {
            url: sidebarMiddleUrl,
            alt: "Contemporary African fashion",
          },
          bottom: {
            url: sidebarBottomUrl,
            alt: "African style portrait in Ankara fashion",
          },
        },
        shopBanner: {
          url: shopBannerUrl,
          alt: "Discover the latest I-RAS STYLES collection",
        },
      },
      updatedBy: admin.id,
    },
    create: {
      key: "storefront.appearance",
      value: {
        logo: {
          url: logoUrl,
          alt: "I-RAS STYLES International Fashion",
        },
        hero: {
          url: heroUrl,
          alt: "Contemporary African fashion collection",
          eyebrow: "African-made. Globally styled.",
          title: "African Fashion",
          description: "Heritage textiles and confident contemporary design.",
          link: "/shop?gender=Women",
          linkLabel: "Shop the collection",
        },
        promotions: [
          {
            url: promotionOneUrl,
            alt: "African-made boutique dress and accessories collection",
            link: "/shop",
            label: "Up to 40% off",
          },
          {
            url: promotionTwoUrl,
            alt: "Contemporary African wax-print dress",
            link: "/shop",
            label: "Sale 30% off",
          },
        ],
        sidebar: {
          top: {
            url: sidebarTopUrl,
            alt: "Shop African-made fashion with free shipping",
          },
          middle: {
            url: sidebarMiddleUrl,
            alt: "Contemporary African fashion",
          },
          bottom: {
            url: sidebarBottomUrl,
            alt: "African style portrait in Ankara fashion",
          },
        },
        shopBanner: {
          url: shopBannerUrl,
          alt: "Discover the latest I-RAS STYLES collection",
        },
      },
      updatedBy: admin.id,
    },
  });

  await prisma.auditLog.upsert({
    where: { id: ids.audit },
    update: {
      actorId: admin.id,
      action: "DATABASE_SEEDED",
      entityType: "SYSTEM",
    },
    create: {
      id: ids.audit,
      actorId: admin.id,
      action: "DATABASE_SEEDED",
      entityType: "SYSTEM",
      entityId: "prisma-seed",
      after: { status: "complete" },
    },
  });

  console.log("Database seeded successfully");
  console.log("Admin login: admin@irasstyles.com / Storefront123!");
  console.log("Customer login: customer@example.com / Storefront123!");
}

main()
  .catch((error) => {
    console.error("Database seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
