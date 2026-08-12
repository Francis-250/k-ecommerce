import { Groq } from "groq-sdk";
import { pipeline, RawImage } from "@xenova/transformers";

// Initialize Groq client
const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

// Pipeline lazy loaders
let visionFeatureExtractor: any = null;
let textFeatureExtractor: any = null;

async function getVisionExtractor() {
  if (!visionFeatureExtractor) {
    console.log("Loading CLIP Vision pipeline (Xenova/clip-vit-base-patch32)...");
    visionFeatureExtractor = await pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32");
    console.log("✓ CLIP Vision pipeline loaded.");
  }
  return visionFeatureExtractor;
}

async function getTextExtractor() {
  if (!textFeatureExtractor) {
    console.log("Loading Text Embedding pipeline (Xenova/all-MiniLM-L6-v2)...");
    textFeatureExtractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("✓ Text Embedding pipeline loaded.");
  }
  return textFeatureExtractor;
}

/**
 * Generate a 512-dimension vector embedding from an image URL or image Buffer
 */
export async function generateImageEmbedding(imageUrlOrBuffer: string | Buffer): Promise<number[]> {
  try {
    const extractor = await getVisionExtractor();
    const inputImage = Buffer.isBuffer(imageUrlOrBuffer) 
      ? new Blob([new Uint8Array(imageUrlOrBuffer)]) 
      : imageUrlOrBuffer;
    const image = await RawImage.read(inputImage as any);
    const result = await extractor(image);
    
    const data = Array.from(result.data) as number[];
    // Normalize or trim/pad to exactly 512 numbers
    if (data.length >= 512) {
      return data.slice(0, 512);
    }
    const padded = new Array(512).fill(0);
    for (let i = 0; i < data.length; i++) padded[i] = data[i];
    return padded;
  } catch (error) {
    console.error("CLIP Image embedding error:", error);
    // Fallback: create deterministic 512 vector from string if URL
    if (typeof imageUrlOrBuffer === "string") {
      return generateSimpleHashVector(imageUrlOrBuffer, 512);
    }
    return new Array(512).fill(0.01);
  }
}

/**
 * Generate a 512-dimension vector embedding from text
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  try {
    const extractor = await getTextExtractor();
    const result = await extractor(text, { pooling: "mean", normalize: true });
    const data = Array.from(result.data) as number[];
    if (data.length >= 512) {
      return data.slice(0, 512);
    }
    const padded = new Array(512).fill(0);
    for (let i = 0; i < data.length; i++) padded[i] = data[i];
    return padded;
  } catch (error) {
    return generateSimpleHashVector(text, 512);
  }
}

/**
 * Helper fallback pseudo-vector for resilient execution
 */
function generateSimpleHashVector(str: string, size: number): number[] {
  const vec = new Array(size).fill(0);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  for (let i = 0; i < size; i++) {
    vec[i] = Math.sin(hash + i);
  }
  return vec;
}

export interface GroqVisualAnalysis {
  productType: string;
  colors: string[];
  style: string;
  searchKeywords: string[];
  description: string;
}

/**
 * Use Groq Vision (llama-3.2-11b-vision-instruct) to analyze an image and extract e-commerce metadata
 */
export async function analyzeImageWithGroq(imageUrl: string): Promise<GroqVisualAnalysis | null> {
  if (!groq) {
    console.warn("GROQ_API_KEY is not set. Skipping Groq visual analysis.");
    return null;
  }

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this product image for visual search. Return ONLY a JSON object formatted as follows:
{
  "productType": "type of item e.g. jacket, sneakers, handbag, watch, dress",
  "colors": ["primary_color", "secondary_color"],
  "style": "casual / formal / luxury / athletic / streetwear",
  "searchKeywords": ["tag1", "tag2", "tag3"],
  "description": "Short visual summary"
}`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as GroqVisualAnalysis;
  } catch (error) {
    console.error("Groq vision analysis error:", error);
    return null;
  }
}
