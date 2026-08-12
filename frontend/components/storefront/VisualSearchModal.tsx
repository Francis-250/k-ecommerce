"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  X,
  Loader2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Link as LinkIcon,
  CircleX,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ProductMatch[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close drawer on Escape key & manage body lock class (matching CartDrawer)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("visual-search-drawer-open");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("visual-search-drawer-open");
    };
  }, [isOpen, onClose]);

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
      performSearch({ dataUri });
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setSelectedImage(urlInput.trim());
    performSearch({ imageUrl: urlInput.trim() });
  };

  const performSearch = async (payload: { imageUrl?: string; dataUri?: string }) => {
    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    setResults([]);
    setAnalysis(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(`${API_URL}/visual-search/search-by-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, limit: 12 }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to process image search.");
      }

      setResults(data.products || []);
      setAnalysis(data.analysis || null);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Visual search error:", err);
      if (err.name === "AbortError") {
        setError("Search request timed out. Please try again.");
      } else {
        setError(err.message || "An error occurred while searching for products.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setUrlInput("");
    setShowUrlInput(false);
    setResults([]);
    setAnalysis(null);
    setHasSearched(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`vs-drawer-backdrop ${isOpen ? "is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Drawer Panel */}
      <aside
        className={`vs-drawer-panel ${isOpen ? "is-open" : ""}`}
        aria-label="Image Search Drawer"
        aria-hidden={!isOpen}
      >
        {/* Drawer Header */}
        <div className="vs-drawer-header">
          <div className="vs-header-title">
            <Camera size={20} aria-hidden="true" />
            <h3>Search by Image</h3>
          </div>
          <button
            type="button"
            className="vs-drawer-close"
            aria-label="Close image search drawer"
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="vs-drawer-content">
          {!selectedImage ? (
            /* Dropzone / Upload state */
            <div className="vs-upload-container">
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
                  <div className="vs-icon-circle">
                    <Camera size={32} />
                  </div>
                  <h4>Upload a Photo</h4>
                  <p>Drag & drop or click to browse an image of a product</p>
                  <span className="vs-file-hint">JPEG, PNG, WEBP up to 8MB</span>
                </div>
              </div>

              <div className="vs-url-option">
                {!showUrlInput ? (
                  <button
                    type="button"
                    className="vs-link-btn"
                    onClick={() => setShowUrlInput(true)}
                  >
                    <LinkIcon size={14} /> Or paste image URL
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
                    <div className="vs-url-actions">
                      <button type="submit" className="vs-btn-primary">
                        Search
                      </button>
                      <button
                        type="button"
                        className="vs-btn-secondary"
                        onClick={() => setShowUrlInput(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* Selected Image & Search Results */
            <div className="vs-results-container">
              {/* Selected Photo Card */}
              <div className="vs-selected-card">
                <div className="vs-thumb-box">
                  <img src={selectedImage} alt="Search target" />
                </div>
                <div className="vs-selected-info">
                  <span className="vs-search-label">Searching using photo</span>
                  <button
                    type="button"
                    className="vs-change-btn"
                    onClick={handleReset}
                  >
                    <RefreshCw size={14} /> Change Photo
                  </button>
                </div>
              </div>

              {/* Status States */}
              {isSearching ? (
                <div className="vs-loading-state">
                  <Loader2 size={32} className="vs-spinner" />
                  <p>Searching for matching products...</p>
                </div>
              ) : error ? (
                <div className="vs-error-state">
                  <AlertCircle size={28} />
                  <p>{error}</p>
                  <button
                    type="button"
                    className="vs-btn-primary"
                    onClick={() => performSearch({ imageUrl: selectedImage })}
                  >
                    Try Again
                  </button>
                </div>
              ) : hasSearched && results.length === 0 ? (
                <div className="vs-empty-state">
                  <ShoppingBag size={36} />
                  <p>
                    {analysis?.isEcommerceProduct === false
                      ? analysis.rejectionReason || `Detected as ${analysis.productType || "non-retail object"}.`
                      : "No matching products found."}
                  </p>
                  <span className="vs-empty-sub">
                    {analysis?.isEcommerceProduct === false
                      ? "Our AI search matches fashion & retail store items (clothing, shoes, accessories)."
                      : "Try uploading a clearer photo of a retail product item."}
                  </span>
                  <button
                    type="button"
                    className="vs-btn-secondary"
                    onClick={handleReset}
                  >
                    Upload another photo
                  </button>
                </div>
              ) : (
                <div className="vs-matches-section">
                  <div className="vs-matches-header">
                    <span>Matches Found ({results.length})</span>
                    {analysis?.productType && (
                      <span className="vs-ai-tag">
                        AI Detected: {analysis.productType}
                      </span>
                    )}
                  </div>

                  <div className="vs-matches-list">
                    {results.map((product) => {
                      const mainImg = product.images?.[0]?.url || "/placeholder.png";
                      const matchPct = Math.round(product.similarityScore * 100);

                      return (
                        <div className="vs-item-row" key={product.id}>
                          <div className="vs-item-img">
                            <Link href={`/products/${product.slug}`} onClick={onClose}>
                              <Image
                                src={mainImg}
                                alt={product.name}
                                width={75}
                                height={75}
                                unoptimized
                              />
                            </Link>
                          </div>
                          <div className="vs-item-info">
                            {product.brand && (
                              <span className="vs-item-brand">{product.brand.name}</span>
                            )}
                            <Link
                              href={`/products/${product.slug}`}
                              onClick={onClose}
                              className="vs-item-title"
                            >
                              {product.name}
                            </Link>
                            <div className="vs-item-meta">
                              <span className="vs-item-price">
                                ${Number(product.basePrice || 0).toFixed(2)}
                              </span>
                              <span className="vs-match-tag">{matchPct}% Match</span>
                            </div>
                          </div>
                          <div className="vs-item-action">
                            <Link
                              href={`/products/${product.slug}`}
                              onClick={onClose}
                              className="vs-view-arrow"
                              title="View product"
                            >
                              <ArrowRight size={18} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      <style jsx>{`
        .vs-drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9998;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .vs-drawer-backdrop.is-open {
          opacity: 1;
          visibility: visible;
        }

        .vs-drawer-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          width: 100%;
          max-width: 450px;
          background: #ffffff;
          box-shadow: -4px 0 25px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .vs-drawer-panel.is-open {
          transform: translateX(0);
        }

        .vs-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .vs-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #222222;
        }

        .vs-header-title h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #222222;
          margin: 0;
        }

        .vs-drawer-close {
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .vs-drawer-close:hover {
          color: #e84c3d;
        }

        .vs-drawer-content {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .vs-hidden-input {
          display: none;
        }

        .vs-upload-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .vs-dropzone {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 3rem 1.5rem;
          text-align: center;
          cursor: pointer;
          background: #f9fafb;
          transition: background 0.2s, border-color 0.2s;
        }

        .vs-dropzone:hover {
          border-color: #222222;
          background: #f3f4f6;
        }

        .vs-icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          color: #222222;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
        }

        .vs-dropzone-inner h4 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #222222;
          margin: 0 0 0.35rem 0;
        }

        .vs-dropzone-inner p {
          font-size: 0.88rem;
          color: #6b7280;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
        }

        .vs-file-hint {
          font-size: 0.76rem;
          color: #9ca3af;
        }

        .vs-url-option {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .vs-link-btn {
          background: none;
          border: none;
          color: #222222;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px;
        }

        .vs-link-btn:hover {
          color: #e84c3d;
          text-decoration: underline;
        }

        .vs-url-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .vs-url-input {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 0.88rem;
          outline: none;
        }

        .vs-url-input:focus {
          border-color: #222222;
        }

        .vs-url-actions {
          display: flex;
          gap: 8px;
        }

        .vs-btn-primary {
          background: #222222;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .vs-btn-primary:hover {
          background: #e84c3d;
        }

        .vs-btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 14px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .vs-results-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .vs-selected-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px 12px;
        }

        .vs-thumb-box {
          width: 54px;
          height: 54px;
          border-radius: 6px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .vs-thumb-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vs-selected-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vs-search-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
        }

        .vs-change-btn {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          width: fit-content;
        }

        .vs-change-btn:hover {
          color: #e84c3d;
        }

        .vs-loading-state,
        .vs-error-state,
        .vs-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          text-align: center;
          color: #6b7280;
          gap: 8px;
        }

        .vs-spinner {
          animation: spin 1s linear infinite;
          color: #222222;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .vs-empty-sub {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .vs-matches-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .vs-matches-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.88rem;
          font-weight: 700;
          color: #222222;
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 6px;
        }

        .vs-ai-tag {
          font-size: 0.72rem;
          font-weight: 600;
          color: #6366f1;
          background: #eef2ff;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: capitalize;
        }

        .vs-matches-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .vs-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border: 1px solid #f3f4f6;
          border-radius: 8px;
          background: #ffffff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .vs-item-row:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .vs-item-img {
          width: 70px;
          height: 70px;
          border-radius: 6px;
          overflow: hidden;
          background: #f9fafb;
          flex-shrink: 0;
        }

        .vs-item-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vs-item-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }

        .vs-item-brand {
          font-size: 0.68rem;
          text-transform: uppercase;
          color: #9ca3af;
          font-weight: 700;
        }

        .vs-item-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: #222222;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vs-item-title:hover {
          color: #e84c3d;
        }

        .vs-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }

        .vs-item-price {
          font-size: 0.9rem;
          font-weight: 700;
          color: #222222;
        }

        .vs-match-tag {
          font-size: 0.72rem;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .vs-item-action {
          flex-shrink: 0;
        }

        .vs-view-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #374151;
          transition: background 0.2s, color 0.2s;
        }

        .vs-view-arrow:hover {
          background: #e84c3d;
          color: #ffffff;
        }
      `}</style>
    </>
  );
}
