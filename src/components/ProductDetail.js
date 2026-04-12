import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiClock,
  FiTag,
  FiMapPin,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiZap,
} from "react-icons/fi";
import "./ProductDetail.css";
import { productService } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import { recordProductView } from "../utils/recentViewed";
import { SOCKET_URL } from "../services/api";
import { CategoryFlatIcon } from "./CategoryFlatIcon";
import { isCampusEmail } from "../utils/campusEmail";

function buildImageUrl(src) {
  if (!src || typeof src !== "string" || !src.trim()) return null;
  const t = src.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/")) return `${SOCKET_URL}${t}`;
  return `${SOCKET_URL}/uploads/${t}`;
}

const URGENCY_LABEL = {
  moving_out: "Moving out soon",
  flash_sale: "Flash sale",
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [imgBroken, setImgBroken] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getById(id);
        setProduct(data);
      } catch (_error) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?._id) recordProductView(product._id);
  }, [product?._id]);

  useEffect(() => {
    setActiveIdx(0);
    setImgBroken(false);
  }, [id, product?._id]);

  const galleryUrls = useMemo(() => {
    if (!product?.images?.length) return [];
    const out = [];
    for (const s of product.images) {
      const u = buildImageUrl(s);
      if (u) out.push(u);
    }
    return out;
  }, [product]);

  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="not-found">
            <h2>Product not found</h2>
            <p>The product you're looking for doesn't exist.</p>
            <Link to="/products" className="btn btn-primary">
              <FiArrowLeft />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOwnProduct =
    product &&
    (product.sellerId?._id === user?.id || product.sellerId?._id === user?._id);

  const hasGallery = galleryUrls.length > 0 && !imgBroken;
  const mainSrc = hasGallery ? galleryUrls[Math.min(activeIdx, galleryUrls.length - 1)] : null;

  const sellerVerified = isCampusEmail(product.sellerId?.email);
  const urgencyLabel = product.urgency ? URGENCY_LABEL[product.urgency] : null;

  const goPrev = () => {
    if (galleryUrls.length < 2) return;
    setActiveIdx((i) => (i <= 0 ? galleryUrls.length - 1 : i - 1));
  };

  const goNext = () => {
    if (galleryUrls.length < 2) return;
    setActiveIdx((i) => (i >= galleryUrls.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="product-detail">
      <div className="container">
        <div className="back-button">
          <Link to="/products" className="btn-back">
            <FiArrowLeft />
            Back to Products
          </Link>
        </div>

        <div className="product-content">
          <div className="product-images">
            <div className="main-image">
              {mainSrc ? (
                <img
                  src={mainSrc}
                  alt={product.title}
                  onError={() => setImgBroken(true)}
                />
              ) : (
                <div className="main-image-placeholder">
                  <CategoryFlatIcon name={product.category || "Others"} size={96} />
                  <span>No photos yet</span>
                </div>
              )}
              {galleryUrls.length > 1 && mainSrc ? (
                <>
                  <button
                    type="button"
                    className="gallery-nav gallery-nav--prev"
                    onClick={goPrev}
                    aria-label="Previous photo"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="gallery-nav gallery-nav--next"
                    onClick={goNext}
                    aria-label="Next photo"
                  >
                    <FiChevronRight />
                  </button>
                  <span className="gallery-counter" aria-live="polite">
                    {activeIdx + 1} / {galleryUrls.length}
                  </span>
                </>
              ) : null}
              <div className="condition-badge">
                <FiTag />
                {product.condition}
              </div>
            </div>
            {galleryUrls.length > 1 ? (
              <div className="gallery-thumbs" role="tablist" aria-label="Product photos">
                {galleryUrls.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    role="tab"
                    aria-selected={i === activeIdx}
                    className={`gallery-thumb ${i === activeIdx ? "gallery-thumb--active" : ""}`}
                    onClick={() => setActiveIdx(i)}
                  >
                    <img src={url} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="product-info">
            <div className="product-header">
              <h1>{product.title}</h1>
              {urgencyLabel ? (
                <p className="product-urgency-banner">
                  <FiZap aria-hidden />
                  {urgencyLabel}
                </p>
              ) : null}
              <div className="product-price">₹{product.price.toLocaleString()}</div>
              <div className="product-category">{product.category}</div>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-details">
              <h3>Product Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <FiTag className="detail-icon" />
                  <span className="detail-label">Condition:</span>
                  <span className="detail-value">{product.condition}</span>
                </div>
                <div className="detail-item">
                  <FiClock className="detail-icon" />
                  <span className="detail-label">Posted:</span>
                  <span className="detail-value">
                    {formatDate(product.createdAt || product.datePosted)}
                  </span>
                </div>
                <div className="detail-item">
                  <FiMapPin className="detail-icon" />
                  <span className="detail-label">Meet / pickup:</span>
                  <span className="detail-value">
                    {product.pickupLocation?.trim() || "On campus (confirm with seller)"}
                  </span>
                </div>
                <div className="detail-item">
                  <FiDollarSign className="detail-icon" />
                  <span className="detail-label">Negotiation:</span>
                  <span className="detail-value">
                    {product.negotiable === false ? "Firm price" : "Open to offers"}
                  </span>
                </div>
              </div>
            </div>

            <div className="seller-info">
              <h3>Seller Information</h3>
              <div className="seller-card">
                <div className="seller-avatar">
                  <FiUser />
                </div>
                <div className="seller-details">
                  <h4 className="seller-name-row">
                    {product.sellerId?.name || "Seller"}
                    {sellerVerified ? (
                      <span className="seller-verified" title="Campus email on file">
                        <FiCheck aria-hidden />
                      </span>
                    ) : null}
                  </h4>
                  <p>Fellow Student</p>
                  <div className="contact-info">
                    <FiMail />
                    <span>{product.sellerId?.email || "Not available"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <a
                href={`mailto:${product.sellerId?.email || ""}?subject=Interest in ${product.title}&body=Hi ${product.sellerId?.name || "there"},%0A%0AI'm interested in your ${product.title} listed for ₹${product.price}. Can we arrange a meeting on campus?%0A%0AThanks!`}
                className="btn btn-primary"
              >
                <FiMail />
                Contact Seller
              </a>
              {isAuthenticated && !isOwnProduct && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(`/chat/product/${product._id || id}`)}
                >
                  <FiUser />
                  Chat with Seller
                </button>
              )}
            </div>

            <div className="safety-notice">
              <h4>🛡️ Safety Guidelines</h4>
              <ul>
                <li>Meet in public areas on campus</li>
                <li>Inspect the item before payment</li>
                <li>Use college email for communication</li>
                <li>Report suspicious activity to campus security</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
