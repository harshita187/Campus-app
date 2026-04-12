import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiMessageCircle, FiX, FiExternalLink } from "react-icons/fi";
import { productService } from "../services/productService";
import { SOCKET_URL } from "../services/api";
import { CategoryFlatIcon } from "./CategoryFlatIcon";
import "./ProductQuickViewModal.css";

function resolveImageSrc(first) {
  if (!first || typeof first !== "string") return null;
  if (first.startsWith("http://") || first.startsWith("https://")) return first;
  if (first.startsWith("/")) return `${SOCKET_URL}${first}`;
  return `${SOCKET_URL}/uploads/${first}`;
}

const ProductQuickViewModal = ({ productId, onClose }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!productId) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await productService.getById(productId);
        if (!cancelled) setProduct(data);
      } catch {
        if (!cancelled) {
          setErr("Could not load this listing.");
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!productId) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [productId, onClose]);

  const imgSrc = useMemo(() => {
    if (!product?.images?.[0]) return null;
    return resolveImageSrc(product.images[0]);
  }, [product]);

  if (!productId) return null;

  return (
    <div
      className="qv-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qv-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="qv-panel">
        <button type="button" className="qv-close" onClick={onClose} aria-label="Close">
          <FiX />
        </button>

        {loading ? (
          <div className="qv-loading">Loading…</div>
        ) : err || !product ? (
          <div className="qv-error">{err || "Not found."}</div>
        ) : (
          <div className="qv-body">
            <div className="qv-media">
              {imgSrc ? (
                <img src={imgSrc} alt={product.title} className="qv-img" />
              ) : (
                <div className="qv-placeholder">
                  <CategoryFlatIcon name={product.category || "Others"} size={80} />
                  <span>No photo</span>
                </div>
              )}
            </div>
            <div className="qv-detail">
              <p className="qv-category">{product.category}</p>
              <h2 id="qv-title" className="qv-title">
                {product.title}
              </h2>
              <p className="qv-price">₹{Number(product.price).toLocaleString()}</p>
              <p className="qv-desc">{product.description}</p>
              <div className="qv-actions">
                <Link
                  to={`/product/${product._id || product.id}`}
                  className="qv-btn qv-btn--primary"
                  onClick={onClose}
                >
                  <FiExternalLink aria-hidden />
                  Full listing
                </Link>
                <Link
                  to={`/chat/product/${product._id || product.id}`}
                  className="qv-btn qv-btn--secondary"
                  onClick={onClose}
                >
                  <FiMessageCircle aria-hidden />
                  Chat with seller
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductQuickViewModal;
