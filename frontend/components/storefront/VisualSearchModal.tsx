"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Camera,
  UploadCloud,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VisualAnalysis {
  productType: string;
  colors: string[];
  style: string;
  searchKeywords: string[];
  description: string;
}

interface ProductMatch {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number | string;
  similarityScore: number;
  category?: { name: string };
  brand?: { name: string };
  images: { id: string; url: string; altText: string | null }[];
}

const SAMPLE_TEST_IMAGES = [
  {
    label: "Red Sneaker",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
  },
  {
    label: "Leather Jacket",
    url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
  },
  {
    label: "Luxury Watch",
    url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
  },
];

export function VisualSearchModal({ isOpen, onClose }: VisualSearchModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState<string>("Analyzing image...");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<VisualAnalysis | null>(null);
  const [results, setResults] = useState<ProductMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Image size must be under 8MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setSelectedImage(dataUri);
      performVisualSearch({ dataUri });
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setSelectedImage(urlInput.trim());
    performVisualSearch({ imageUrl: urlInput.trim() });
  };

  const handleSampleClick = (url: string) => {
    setSelectedImage(url);
    performVisualSearch({ imageUrl: url });
  };

  const performVisualSearch = async (payload: { imageUrl?: string; dataUri?: string }) => {
    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    setAnalysis(null);
    setResults([]);
    setSearchStep("1/3 Uploading visual payload...");

    const stepTimer = setTimeout(() => {
      setSearchStep("2/3 Extracting CLIP vector embeddings & Groq AI tags...");
    }, 800);

    const stepTimer2 = setTimeout(() => {
      setSearchStep("3/3 Matching vectors in Neon PostgreSQL...");
    }, 1800);

    try {
      const response = await fetch(`${API_URL}/visual-search/search-by-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, limit: 12 }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to complete visual search.");
      }

      setAnalysis(data.analysis || null);
      setResults(data.products || []);
    } catch (err: any) {
      console.error("Visual search error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setUrlInput("");
    setShowUrlInput(false);
    setAnalysis(null);
    setResults([]);
    setHasSearched(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="vs-backdrop" onClick={onClose}>
      <div
        className="vs-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="vs-modal-title"
      >
        {/* Header */}
        <div className="vs-header">
          <div className="vs-title-box">
            <div className="vs-sparkle-badge">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 id="vs-modal-title">AI Visual Search</h3>
              <p className="vs-subtitle">
                Search products by image using CLIP Vector Embeddings & Groq AI
              </p>
            </div>
          </div>
          <button className="vs-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="vs-body">
          {!selectedImage ? (
            /* Upload / Dropzone Section */
            <div className="vs-upload-wrapper">
              <div
                className="vs-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="vs-hidden-input"
                  onChange={handleFileChange}
                />
                <div className="vs-dropzone-inner">
                  <div className="vs-camera-glow">
                    <Camera size={34} />
                  </div>
                  <h4>Drag & Drop your photo here</h4>
                  <p>Upload any picture of clothing, shoes, bags or accessories</p>
                  <span className="vs-supported-formats">JPG, PNG, WEBP up to 8MB</span>
                </div>
              </div>

              {/* URL or Demo option */}
              <div className="vs-options-bar">
                {!showUrlInput ? (
                  <button
                    className="vs-text-link-btn"
                    onClick={() => setShowUrlInput(true)}
                  >
                    <LinkIcon size={14} /> Paste Image URL instead
                  </button>
                ) : (
                  <form onSubmit={handleUrlSubmit} className="vs-url-form">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="vs-url-input"
                      autoFocus
                    />
                    <button type="submit" className="vs-url-submit-btn">
                      Search URL
                    </button>
                    <button
                      type="button"
                      className="vs-url-cancel-btn"
                      onClick={() => setShowUrlInput(false)}
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {/* Sample Test Images */}
                <div className="vs-samples-box">
                  <span className="vs-samples-label">Or try a sample photo:</span>
                  <div className="vs-samples-grid">
                    {SAMPLE_TEST_IMAGES.map((sample, idx) => (
                      <button
                        key={idx}
                        className="vs-sample-pill"
                        onClick={() => handleSampleClick(sample.url)}
                      >
                        <img src={sample.url} alt={sample.label} />
                        <span>{sample.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Selected Image Active Layout */
            <div className="vs-active-layout">
              {/* Left Column: Image Preview + AI Visual Insight */}
              <div className="vs-left-panel">
                <div className="vs-preview-card">
                  <div className="vs-preview-img-container">
                    <img src={selectedImage} alt="Visual Search Source" />
                    <button
                      className="vs-reselect-btn"
                      onClick={handleReset}
                      title="Upload a different photo"
                    >
                      <RefreshCw size={14} /> Change Photo
                    </button>
                  </div>
                </div>

                {/* Groq AI Analysis Card */}
                {analysis && (
                  <div className="vs-ai-card">
                    <div className="vs-ai-header">
                      <Sparkles size={16} />
                      <span>Groq AI Visual Insight</span>
                    </div>
                    <p className="vs-ai-desc">{analysis.description}</p>
                    <div className="vs-ai-tags">
                      {analysis.productType && (
                        <span className="vs-tag primary">
                          {analysis.productType}
                        </span>
                      )}
                      {analysis.style && (
                        <span className="vs-tag accent">{analysis.style}</span>
                      )}
                      {analysis.colors?.map((c, i) => (
                        <span key={i} className="vs-tag outline">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Search Results */}
              <div className="vs-right-panel">
                {isSearching ? (
                  <div className="vs-loading-box">
                    <div className="vs-spinner-ring">
                      <Loader2 size={36} className="vs-spin" />
                    </div>
                    <h4>Running Vector Search...</h4>
                    <p className="vs-loading-step">{searchStep}</p>
                    <div className="vs-loading-skeletons">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="vs-skeleton-card" />
                      ))}
                    </div>
                  </div>
                ) : error ? (
                  <div className="vs-error-box">
                    <AlertCircle size={36} className="vs-error-icon" />
                    <h4>Search Error</h4>
                    <p>{error}</p>
                    <button
                      className="vs-retry-btn"
                      onClick={() => performVisualSearch({ imageUrl: selectedImage })}
                    >
                      Try Again
                    </button>
                  </div>
                ) : hasSearched && results.length === 0 ? (
                  <div className="vs-empty-box">
                    <ShoppingBag size={44} className="vs-empty-icon" />
                    <h4>No Similar Products Found</h4>
                    <p>
                      We couldn't find close matches in the database. Try a clearer item photo.
                    </p>
                    <button className="vs-retry-btn" onClick={handleReset}>
                      Try another photo
                    </button>
                  </div>
                ) : (
                  <div className="vs-results-box">
                    <div className="vs-results-header">
                      <div className="vs-matches-count">
                        <CheckCircle2 size={16} className="vs-check-icon" />
                        <span>Found <strong>{results.length}</strong> visually matching items</span>
                      </div>
                    </div>

                    <div className="vs-products-grid">
                      {results.map((product) => {
                        const mainImg = product.images?.[0]?.url || "/placeholder.png";
                        const similarityPct = Math.round(product.similarityScore * 100);

                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="vs-product-card"
                            onClick={onClose}
                          >
                            <div className="vs-product-img-box">
                              <img src={mainImg} alt={product.name} />
                              <span className="vs-match-badge">
                                🎯 {similarityPct}% Match
                              </span>
                            </div>
                            <div className="vs-product-details">
                              {product.brand && (
                                <span className="vs-brand">{product.brand.name}</span>
                              )}
                              <h5 className="vs-product-name">{product.name}</h5>
                              <div className="vs-price-line">
                                <span className="vs-price">
                                  ${Number(product.basePrice || 0).toFixed(2)}
                                </span>
                                <span className="vs-view-btn">
                                  View <ArrowRight size={12} />
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .vs-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
        }

        .vs-modal {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35),
                      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          width: 100%;
          max-width: 960px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: vsModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes vsModalPop {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .vs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.75rem;
          border-bottom: 1px solid #f1f5f9;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }

        .vs-title-box {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .vs-sparkle-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .vs-title-box h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .vs-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        .vs-close-btn {
          background: #f1f5f9;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vs-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
          transform: rotate(90deg);
        }

        .vs-body {
          padding: 1.5rem 1.75rem;
          overflow-y: auto;
          flex: 1;
        }

        .vs-hidden-input {
          display: none;
        }

        .vs-upload-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .vs-dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 3.5rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
          background: #fafafa;
        }

        .vs-dropzone:hover {
          border-color: #6366f1;
          background: #f4f5ff;
          transform: translateY(-2px);
        }

        .vs-camera-glow {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: #e0e7ff;
          color: #4338ca;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem auto;
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.25);
          transition: transform 0.3s ease;
        }

        .vs-dropzone:hover .vs-camera-glow {
          transform: scale(1.08);
          background: #4f46e5;
          color: #ffffff;
        }

        .vs-dropzone-inner h4 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.35rem 0;
        }

        .vs-dropzone-inner p {
          color: #64748b;
          margin: 0 0 0.5rem 0;
          font-size: 0.92rem;
        }

        .vs-supported-formats {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .vs-options-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .vs-text-link-btn {
          background: none;
          border: none;
          color: #4f46e5;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .vs-text-link-btn:hover {
          text-decoration: underline;
        }

        .vs-url-form {
          display: flex;
          gap: 8px;
          width: 100%;
          max-width: 540px;
        }

        .vs-url-input {
          flex: 1;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 0.88rem;
          outline: none;
        }

        .vs-url-input:focus {
          border-color: #6366f1;
        }

        .vs-url-submit-btn {
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .vs-url-cancel-btn {
          background: #f1f5f9;
          color: #64748b;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .vs-samples-box {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .vs-samples-label {
          font-size: 0.82rem;
          color: #64748b;
          font-weight: 500;
        }

        .vs-samples-grid {
          display: flex;
          gap: 8px;
        }

        .vs-sample-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 4px 10px 4px 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vs-sample-pill:hover {
          border-color: #6366f1;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.15);
          transform: translateY(-1px);
        }

        .vs-sample-pill img {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
        }

        .vs-sample-pill span {
          font-size: 0.78rem;
          font-weight: 600;
          color: #334155;
        }

        .vs-active-layout {
          display: grid;
          grid-template-columns: 290px 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .vs-active-layout {
            grid-template-columns: 1fr;
          }
        }

        .vs-left-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .vs-preview-card {
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .vs-preview-img-container {
          position: relative;
          width: 100%;
          height: 250px;
          background: #090d16;
        }

        .vs-preview-img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vs-reselect-btn {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(15, 23, 42, 0.82);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          backdrop-filter: blur(6px);
          transition: all 0.2s;
        }

        .vs-reselect-btn:hover {
          background: #0f172a;
        }

        .vs-ai-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1rem;
        }

        .vs-ai-header {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6366f1;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.5rem;
        }

        .vs-ai-desc {
          font-size: 0.85rem;
          color: #334155;
          margin-bottom: 0.75rem;
          line-height: 1.45;
        }

        .vs-ai-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .vs-tag {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .vs-tag.primary {
          background: #e0e7ff;
          color: #3730a3;
        }

        .vs-tag.accent {
          background: #f3e8ff;
          color: #6b21a8;
        }

        .vs-tag.outline {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
        }

        .vs-right-panel {
          min-height: 360px;
        }

        .vs-loading-box,
        .vs-error-box,
        .vs-empty-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 340px;
          text-align: center;
          color: #64748b;
        }

        .vs-spinner-ring {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #e0e7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
          margin-bottom: 1rem;
        }

        .vs-spin {
          animation: vsSpin 1s linear infinite;
        }

        @keyframes vsSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .vs-loading-box h4 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.25rem 0;
        }

        .vs-loading-step {
          font-size: 0.85rem;
          color: #6366f1;
          font-weight: 600;

        }

        .vs-loading-skeletons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          width: 100%;
          margin-top: 1.5rem;
        }

        .vs-skeleton-card {
          height: 140px;
          border-radius: 12px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: vsShimmer 1.5s infinite;
        }

        @keyframes vsShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .vs-error-icon {
          color: #ef4444;
          margin-bottom: 0.75rem;
        }

        .vs-empty-icon {
          color: #94a3b8;
          margin-bottom: 0.75rem;
        }

        .vs-retry-btn {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          margin-top: 1rem;
        }

        .vs-results-box {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .vs-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .vs-matches-count {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          color: #334155;
        }

        .vs-check-icon {
          color: #10b981;
        }

        .vs-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .vs-product-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .vs-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.12);
          border-color: #cbd5e1;
        }

        .vs-product-img-box {
          position: relative;
          width: 100%;
          height: 160px;
          background: #f8fafc;
          overflow: hidden;
        }

        .vs-product-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .vs-product-card:hover .vs-product-img-box img {
          transform: scale(1.06);
        }

        .vs-match-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(16, 185, 129, 0.92);
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .vs-product-details {
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vs-brand {
          font-size: 0.68rem;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .vs-product-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .vs-price-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px solid #f1f5f9;
        }

        .vs-price {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
        }

        .vs-view-btn {
          font-size: 0.75rem;
          color: #4f46e5;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 3px;
        }
      `}</style>
    </div>
  );
}
