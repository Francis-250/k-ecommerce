import type { Request, Response } from "express";
import { z } from "zod";
import cloudinary from "../lib/cloudinary";
import { validationError } from "../utils/http";

const uploadSchema = z.object({
  dataUri: z.string().startsWith("data:image/"),
  folder: z
    .enum([
      "products",
      "brands",
      "avatars",
      "content",
      "portfolio",
      "storefront",
    ])
    .default("products"),
  altText: z.string().trim().max(200).optional(),
});

const deleteSchema = z.object({
  publicId: z.string().trim().min(1),
});

export const uploadImage = async (req: Request, res: Response) => {
  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const result = await cloudinary.uploader.upload(parsed.data.dataUri, {
    folder: `iras-styles/${parsed.data.folder}`,
    resource_type: "image",
    transformation: [
      { width: 2400, height: 2400, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return res.status(201).json({
    success: true,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      altText: parsed.data.altText ?? null,
    },
  });
};

export const deleteImage = async (req: Request, res: Response) => {
  const parsed = deleteSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const result = await cloudinary.uploader.destroy(parsed.data.publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    return res.status(502).json({
      success: false,
      message: "Cloudinary could not delete the image",
    });
  }

  return res.status(200).json({ success: true, result: result.result });
};
