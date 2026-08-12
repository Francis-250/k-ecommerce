import type { Request, Response } from "express";
import { z } from "zod";
import cloudinary from "../lib/cloudinary";
import { validationError } from "../utils/http";
import {
  searchProductsByImage,
  backfillProductEmbeddings,
} from "../services/visual-search.service";

const imageSearchSchema = z.object({
  imageUrl: z.string().url().optional(),
  dataUri: z.string().startsWith("data:image/").optional(),
  limit: z.coerce.number().min(1).max(50).default(12),
});

/**
 * Controller for searching products by uploaded image (URL or dataUri)
 */
export const searchByImage = async (req: Request, res: Response) => {
  try {
    const parsed = imageSearchSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error);
    }

    const { imageUrl, dataUri, limit } = parsed.data;

    if (!imageUrl && !dataUri) {
      return res.status(400).json({
        success: false,
        message: "Please provide either imageUrl or dataUri for visual search.",
      });
    }

    let finalImageUrl = imageUrl || "";

    // If dataUri is provided, upload to Cloudinary visual-search temp folder
    if (!imageUrl && dataUri) {
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "iras-styles/visual-searches",
        resource_type: "image",
        transformation: [
          { width: 1000, height: 1000, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
      finalImageUrl = uploadResult.secure_url;
    }

    const searchResult = await searchProductsByImage(
      finalImageUrl,
      limit,
      finalImageUrl
    );

    return res.status(200).json({
      success: true,
      uploadedImageUrl: finalImageUrl,
      products: searchResult.products,
      analysis: searchResult.analysis,
      totalFound: searchResult.totalFound,
    });
  } catch (error) {
    console.error("Image search error:", error);
    return res.status(500).json({
      success: false,
      message: `Visual search failed: ${(error as Error).message}`,
    });
  }
};

/**
 * Backfill embeddings for all product images missing vectors in DB
 */
export const triggerBackfillEmbeddings = async (
  req: Request,
  res: Response
) => {
  try {
    // Run backfill asynchronously in background
    backfillProductEmbeddings().catch((err) =>
      console.error("Backfill background error:", err)
    );

    return res.status(202).json({
      success: true,
      message: "Product image embedding backfill initiated in background.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to trigger backfill.",
    });
  }
};
