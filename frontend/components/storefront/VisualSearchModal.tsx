"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  UploadCloud,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  Tag,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
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

export function VisualSearchModal({ isOpen, onClose }: VisualSearchModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setIsUploading(false);
      // Auto-trigger search when image is picked
      performVisualSearch(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const performVisualSearch = async (dataUri: string) => {
    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    setAnalysis(null);
    setResults([]);

    try {
      const response = await fetch(`${API_URL}/visual-search/search-by-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUri, limit: 12 }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to search products by image.");
      }

      setAnalysis(data.analysis || null);
      setResults(data.products || []);
    } catch (err: any) {
      console.error("Visual search client error:", err);
      setError(err.message || "Something went wrong while searching.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setResults([]);
    setHasSearched(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="visual-search-backdrop" onClick={onClose}>
      <div
        className="visual-search-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="visual-search-title"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="title-area">
            <div className="icon-badge">
              <Sparkles size={20} className="sparkle-icon" />
            </div>
            <div>
              <h3 id="visual-search-title">Visual AI Search</h3>
              <p className="subtitle">
                Upload a photo to find visually matching products
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {!selectedImage ? (
            /* Dropzone / Upload state */
            <div
              className="dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden-file-input"
                onChange={handleFileChange}
              />
              <div className="dropzone-content">
                <div className="upload-icon-wrapper">
                  <Camera size={36} />
                </div>
                <h4>Drag & Drop your image here</h4>
                <p>or click to browse from your device</p>
                <span className="file-types">Supports JPG, PNG, WEBP up to 8MB</span>
              </div>
            </div>
          ) : (
            /* Selected Image & Search Section */
            <div className="search-active-layout">
              <div className="image-preview-card">
                <div className="preview-image-wrapper">
                  <img src={selectedImage} alt="Search upload preview" />
                  <button className="reselect-btn" onClick={handleReset} title="Upload different image">
                    <RefreshCw size={16} /> New Image
                  </button>
                </div>

                {/* Groq AI Analysis Card */}
                {analysis && (
                  <div className="ai-analysis-card">
                    <div className="ai-card-header">
                      <Sparkles size={16} />
                      <span>Groq AI Visual Insight</span>
                    </div>
                    <p className="analysis-desc">{analysis.description}</p>
                    <div className="tags-list">
                      {analysis.productType && (
                        <span className="tag primary">{analysis.productType}</span>
                      )}
                      {analysis.style && (
                        <span className="tag secondary">{analysis.style}</span>
                      )}
                      {analysis.colors?.map((c, i) => (
                        <span key={i} className="tag outline">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Results Area */}
              <div className="results-container">
                {isSearching ? (
                  <div className="loading-state">
                    <Loader2 size={36} className="spinner" />
                    <h4>Analyzing Visual Embeddings...</h4>
                    <p>Comparing features across database product images with pgvector</p>
                  </div>
                ) : error ? (
                  <div className="error-state">
                    <AlertCircle size={32} />
                    <p>{error}</p>
                    <button onClick={() => performVisualSearch(selectedImage)}>
                      Try Again
                    </button>
                  </div>
                ) : hasSearched && results.length === 0 ? (
                  <div className="empty-state">
                    <ShoppingBag size={40} />
                    <h4>No Visually Similar Products Found</h4>
                    <p>Try uploading a clearer photo of clothing, shoes, or accessories.</p>
                  </div>
                ) : (
                  <div className="results-grid-header">
                    <span className="results-count">
                      Found {results.length} similar items
                    </span>
                    <div className="products-grid">
                      {results.map((product) => {
                        const mainImg = product.images?.[0]?.url || "/placeholder.png";
                        const similarityPct = Math.round(product.similarityScore * 100);

                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="product-match-card"
                            onClick={onClose}
                          >
                            <div className="match-image-container">
                              <img src={mainImg} alt={product.name} />
                              <span className="similarity-badge">
                                {similarityPct}% Match
                              </span>
                            </div>
                            <div className="match-info">
                              {product.brand && (
                                <span className="brand-name">{product.brand.name}</span>
                              )}
                              <h5 className="product-title">{product.name}</h5>
                              <div className="price-row">
                                <span className="price">${Number(product.basePrice || 0).toFixed(2)}</span>
                                <span className="view-link">View <ArrowRight size={14} /></span>
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
        .visual-search-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .visual-search-modal {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modalIn 0.25s ease-out;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .title-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .title-area h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }
        .close-btn {
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
          transition: all 0.2s;
        }
        .close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }
        .hidden-file-input {
          display: none;
        }
        .dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #f8fafc;
        }
        .dropzone:hover {
          border-color: #6366f1;
          background: #f0f3ff;
        }
        .upload-icon-wrapper {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #e0e7ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
        }
        .dropzone h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }
        .dropzone p {
          color: #64748b;
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
        }
        .file-types {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .search-active-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .search-active-layout {
            grid-template-columns: 1fr;
          }
        }
        .image-preview-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .preview-image-wrapper {
          position: relative;
          width: 100%;
          height: 240px;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
        }
        .preview-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .reselect-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.75);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          backdrop-filter: blur(4px);
        }
        .ai-analysis-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
        }
        .ai-card-header {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #7c3aed;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }
        .analysis-desc {
          font-size: 0.85rem;
          color: #334155;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tag {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .tag.primary {
          background: #e0e7ff;
          color: #4338ca;
        }
        .tag.secondary {
          background: #f3e8ff;
          color: #6b21a8;
        }
        .tag.outline {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #475569;
        }
        .results-container {
          min-height: 350px;
        }
        .loading-state, .empty-state, .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 300px;
          text-align: center;
          color: #64748b;
        }
        .spinner {
          animation: spin 1s linear infinite;
          color: #6366f1;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .results-count {
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
          display: block;
          margin-bottom: 1rem;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 1rem;
        }
        .product-match-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .product-match-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }
        .match-image-container {
          position: relative;
          width: 100%;
          height: 150px;
          background: #f8fafc;
        }
        .match-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .similarity-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(16, 185, 129, 0.9);
          color: white;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }
        .match-info {
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .brand-name {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 600;
        }
        .product-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 6px;
        }
        .price {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
        }
        .view-link {
          font-size: 0.72rem;
          color: #6366f1;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 2px;
        }
      `}</style>
    </div>
  );
}
