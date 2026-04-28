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
  FiEdit2,
  FiTrash2,
  FiMessageCircle,
  FiHeart,
} from "react-icons/fi";
import "./ProductDetail.css";
import { productService } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import { recordProductView } from "../utils/recentViewed";
import { CategoryFlatIcon } from "./CategoryFlatIcon";
import { isCampusEmail } from "../utils/campusEmail";
import { isWishlisted, toggleWishlist } from "../utils/wishlist";
import { resolveListingImageUrl, alternateListingImageUrl } from "../utils/listingImageUrl";
import { isListingOwner } from "../utils/isListingOwner";

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
  const [failedUrls, setFailedUrls] = useState(() => new Set());
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  /** Per-slide retry URL (e.g. strip query on Unsplash) before marking canonical URL failed */
  const [srcOverrideByIdx, setSrcOverrideByIdx] = useState({});

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
    if (product?._id) setSaved(isWishlisted(product._id));
  }, [product?._id]);

  const galleryUrls = useMemo(() => {
    if (!product?.images?.length) return [];
    const out = [];
    for (const s of product.images) {
      const u = resolveListingImageUrl(s);
      if (u) out.push(u);
    }
    return out;
  }, [product]);

  const galleryKey = galleryUrls.join("\0");

  useEffect(() => {
    setActiveIdx(0);
    setFailedUrls(new Set());
    setSrcOverrideByIdx({});
  }, [id, product?._id, galleryKey]);

  const markUrlFailed = (url) => {
    if (!url) return;
    setFailedUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  useEffect(() => {
    if (!galleryUrls.length) return;
    const safeIdx = Math.min(activeIdx, galleryUrls.length - 1);
    const current = galleryUrls[safeIdx];
    if (!current || !failedUrls.has(current)) return;
    for (let o = 1; o < galleryUrls.length; o++) {
      const i = (safeIdx + o) % galleryUrls.length;
      const u = galleryUrls[i];
      if (!failedUrls.has(u)) {
        setActiveIdx(i);
        return;
      }
    }
  }, [galleryUrls, activeIdx, failedUrls]);

  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="pdp-loading">Loading product…</div>
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

  const isOwnProduct = isListingOwner(product, user);

  const productId = product._id || id;

  const handleDelete = async () => {
    if (!product?._id) return;
    const ok = window.confirm(
      "Delete this listing permanently? This cannot be undone."
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await productService.remove(product._id);
      navigate("/products", { replace: true });
    } catch (err) {
      window.alert(
        err.response?.data?.message || err.message || "Could not delete listing."
      );
    } finally {
      setDeleting(false);
    }
  };

  const mainIdx =
    galleryUrls.length > 0 ? Math.min(activeIdx, galleryUrls.length - 1) : 0;

  const galleryEffective = (idx) =>
    typeof idx === "number" && idx >= 0 && idx < galleryUrls.length
      ? srcOverrideByIdx[idx] ?? galleryUrls[idx]
      : null;

  let displayMainIdx = null;
  if (galleryUrls.length) {
    for (let o = 0; o < galleryUrls.length; o++) {
      const i = (mainIdx + o) % galleryUrls.length;
      const u = galleryUrls[i];
      if (!failedUrls.has(u)) {
        displayMainIdx = i;
        break;
      }
    }
  }

  const displayMainResolved =
    displayMainIdx != null ? galleryEffective(displayMainIdx) : null;

  const handleGalleryImgError = (idx) => {
    const canonical = galleryUrls[idx];
    const shown = srcOverrideByIdx[idx] ?? canonical;
    const alt = alternateListingImageUrl(shown);
    if (alt && alt !== shown) {
      setSrcOverrideByIdx((prev) => ({ ...prev, [idx]: alt }));
      return;
    }
    markUrlFailed(canonical);
  };

  const allGalleryFailed =
    galleryUrls.length > 0 && galleryUrls.every((u) => failedUrls.has(u));

  /** Only show thumbnails for images that actually load (hides broken slots). */
  const thumbIndices = galleryUrls
    .map((url, i) => i)
    .filter((i) => !failedUrls.has(galleryUrls[i]));

  const sellerVerified = isCampusEmail(product.sellerId?.email);
  const urgencyEnum =
    product.urgency && product.urgency !== "none" ? product.urgency : null;
  const urgencyLabel = urgencyEnum ? URGENCY_LABEL[urgencyEnum] : null;
  const urgencyCustom = product.urgencyNote?.trim() || "";

  const goPrev = () => {
    if (galleryUrls.length < 2) return;
    setActiveIdx((i) => (i <= 0 ? galleryUrls.length - 1 : i - 1));
  };

  const goNext = () => {
    if (galleryUrls.length < 2) return;
    setActiveIdx((i) => (i >= galleryUrls.length - 1 ? 0 : i + 1));
  };

  const goToChat = () => navigate(`/chat/product/${productId}`);
  const mailtoHref = `mailto:${product.sellerId?.email || ""}?subject=${encodeURIComponent(`Interest in ${product.title}`)}&body=${encodeURIComponent(
    `Hi ${product.sellerId?.name || "there"},\n\nI'm interested in your "${product.title}" listed for ₹${product.price}. Can we arrange a meeting on campus?\n\nThanks!`
  )}`;

  const onWishlistClick = () => {
    setSaved(toggleWishlist(productId));
  };

  return (
    <div className="product-detail">
      <div className="container pdp-container">
        <nav className="product-detail-nav" aria-label="Breadcrumb">
          <Link to="/products" className="btn-back">
            <FiArrowLeft aria-hidden />
            Back to products
          </Link>
        </nav>

        <div className="pdp-shell">
          {/* Left: title, price, description, details */}
          <div className="pdp-main-column">
            <div className="pdp-main-lead">
            <header className="pdp-header">
              <div className="pdp-title-row">
                <h1 className="product-title pdp-title">{product.title}</h1>
                {isOwnProduct ? (
                  <div className="pdp-owner-actions" role="group" aria-label="Manage your listing">
                    <Link
                      to={`/edit-product/${productId}`}
                      className="pdp-icon-btn"
                      title="Edit listing"
                      aria-label="Edit listing"
                    >
                      <FiEdit2 aria-hidden />
                    </Link>
                    <button
                      type="button"
                      className="pdp-icon-btn pdp-icon-btn--delete"
                      title="Delete listing"
                      aria-label="Delete listing"
                      disabled={deleting}
                      onClick={handleDelete}
                    >
                      <FiTrash2 aria-hidden />
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="product-meta-pills pdp-meta">
                <span className="product-category-pill">{product.category}</span>
                <span className="product-condition-chip">
                  <FiTag aria-hidden className="product-condition-chip__icon" />
                  {product.condition}
                </span>
              </div>
              {urgencyLabel ? (
                <p className="product-urgency-banner">
                  <FiZap aria-hidden />
                  {urgencyLabel}
                </p>
              ) : urgencyCustom ? (
                <p className="product-urgency-banner product-urgency-banner--custom">
                  <FiZap aria-hidden />
                  {urgencyCustom}
                </p>
              ) : null}
              <p className="product-price pdp-price">
                <span className="product-price-currency">₹</span>
                {product.price.toLocaleString("en-IN")}
              </p>
            </header>
            </div>

            <div className="pdp-main-rest">
            <section className="pdp-card pdp-description" aria-labelledby="pdp-desc-heading">
              <h2 id="pdp-desc-heading" className="pdp-section-title">
                Description
              </h2>
              <p className="pdp-body">{product.description}</p>
            </section>

            <section className="pdp-card pdp-details" aria-labelledby="pdp-details-heading">
              <h2 id="pdp-details-heading" className="pdp-section-title">
                Details
              </h2>
              <ul className="pdp-detail-list">
                <li className="pdp-detail-row">
                  <span className="pdp-detail-icon" aria-hidden>
                    <FiClock />
                  </span>
                  <div className="pdp-detail-copy">
                    <span className="pdp-detail-label">Posted</span>
                    <span className="pdp-detail-value">
                      {formatDate(product.createdAt || product.datePosted)}
                    </span>
                  </div>
                </li>
                <li className="pdp-detail-row">
                  <span className="pdp-detail-icon" aria-hidden>
                    <FiMapPin />
                  </span>
                  <div className="pdp-detail-copy">
                    <span className="pdp-detail-label">Meet / pickup</span>
                    <span className="pdp-detail-value">
                      {product.pickupLocation?.trim() || "On campus (confirm with seller)"}
                    </span>
                  </div>
                </li>
                {product.collegeLabel ? (
                  <li className="pdp-detail-row">
                    <span className="pdp-detail-icon" aria-hidden>
                      <FiTag />
                    </span>
                    <div className="pdp-detail-copy">
                      <span className="pdp-detail-label">Listing campus</span>
                      <span className="pdp-detail-value">{product.collegeLabel}</span>
                    </div>
                  </li>
                ) : null}
                <li className="pdp-detail-row">
                  <span className="pdp-detail-icon" aria-hidden>
                    <FiDollarSign />
                  </span>
                  <div className="pdp-detail-copy">
                    <span className="pdp-detail-label">Negotiation</span>
                    <span className="pdp-detail-value">
                      {product.negotiable === false ? "Firm price" : "Open to offers"}
                    </span>
                  </div>
                </li>
              </ul>
            </section>
            </div>
          </div>

          {/* Right: photos on top, seller + actions below */}
          <div className="pdp-side-column">
            <section className="pdp-gallery" aria-label="Product photos">
            <div className="pdp-gallery-inner">
              <div className="main-image pdp-main-image">
                {displayMainResolved ? (
                  <img
                    key={`${displayMainIdx}-${displayMainResolved}`}
                    src={displayMainResolved}
                    alt={product.title}
                    onError={() =>
                      displayMainIdx != null && handleGalleryImgError(displayMainIdx)
                    }
                  />
                ) : (
                  <div className="main-image-placeholder">
                    <div className="main-image-placeholder-ring" aria-hidden>
                      <CategoryFlatIcon name={product.category || "Others"} size={72} />
                    </div>
                    <span className="main-image-placeholder-title">
                      {allGalleryFailed ? "Could not load photos" : "No photos yet"}
                    </span>
                    <span className="main-image-placeholder-hint">
                      {allGalleryFailed
                        ? isOwnProduct
                          ? "Check your connection or try refreshing, then re-upload images from Edit listing."
                          : "The photo link from the seller could not load. Only they can replace images—use chat or email below. You can still save this listing from your wishlist."
                        : isOwnProduct
                          ? "Add images from Edit listing so buyers can see the item clearly."
                          : "The seller has not uploaded photos for this listing."}
                    </span>
                    {isOwnProduct ? (
                      <div className="pdp-placeholder-actions">
                        <Link
                          to={`/edit-product/${productId}`}
                          className="pdp-btn pdp-btn--primary pdp-btn--block"
                        >
                          <FiEdit2 aria-hidden />
                          {allGalleryFailed ? "Edit listing & fix photos" : "Edit listing & add photos"}
                        </Link>
                      </div>
                    ) : null}
                  </div>
                )}
                {galleryUrls.length > 1 && displayMainResolved ? (
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
              </div>
              {thumbIndices.length > 1 ? (
                <div className="gallery-thumbs" role="tablist" aria-label="Product photos">
                  {thumbIndices.map((i) => {
                    const url = galleryUrls[i];
                    return (
                      <button
                        key={`${i}-${url}`}
                        type="button"
                        role="tab"
                        aria-selected={i === activeIdx}
                        className={`gallery-thumb ${i === activeIdx ? "gallery-thumb--active" : ""}`}
                        onClick={() => setActiveIdx(i)}
                      >
                        <img
                          src={galleryEffective(i)}
                          alt=""
                          onError={() => handleGalleryImgError(i)}
                        />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            </section>

            <aside className="pdp-rail" aria-label="Seller and actions">
            <div className="pdp-card pdp-seller-card">
              <div className="pdp-seller-top">
                <div className="seller-avatar pdp-seller-avatar" aria-hidden>
                  <FiUser />
                </div>
                <div className="pdp-seller-text">
                  <h2 className="pdp-seller-heading">Seller</h2>
                  <div className="pdp-seller-name-row">
                    <span className="pdp-seller-name">{product.sellerId?.name || "Seller"}</span>
                    {sellerVerified ? (
                      <span className="seller-verified" title="Campus email on file">
                        <FiCheck aria-hidden />
                      </span>
                    ) : null}
                  </div>
                  <p className="pdp-seller-role">Student</p>
                  {product.sellerId?.collegeLabel ? (
                    <p className="pdp-seller-campus">{product.sellerId.collegeLabel}</p>
                  ) : null}
                  {product.sellerId?.email ? (
                    <a className="pdp-seller-email" href={mailtoHref}>
                      <FiMail aria-hidden className="pdp-seller-email-icon" />
                      <span>{product.sellerId.email}</span>
                    </a>
                  ) : (
                    <div className="pdp-seller-email pdp-seller-email--na">
                      <FiMail aria-hidden className="pdp-seller-email-icon" />
                      <span>Not available</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pdp-rail-actions">
                {!isOwnProduct ? (
                  <>
                    {isAuthenticated ? (
                      <button type="button" className="pdp-btn pdp-btn--primary pdp-btn--block" onClick={goToChat}>
                        <FiMessageCircle aria-hidden />
                        Chat with Seller
                      </button>
                    ) : (
                      <Link to="/login" className="pdp-btn pdp-btn--primary pdp-btn--block">
                        <FiMessageCircle aria-hidden />
                        Log in to chat
                      </Link>
                    )}
                    <a href={mailtoHref} className="pdp-btn pdp-btn--secondary pdp-btn--block">
                      <FiMail aria-hidden />
                      Email seller
                    </a>
                    <button
                      type="button"
                      className={`pdp-btn pdp-btn--ghost pdp-btn--block ${saved ? "pdp-btn--saved" : ""}`}
                      onClick={onWishlistClick}
                      aria-pressed={saved}
                    >
                      <FiHeart aria-hidden className={saved ? "pdp-heart-filled" : ""} />
                      {saved ? "Saved" : "Add to wishlist"}
                    </button>
                    <Link to="/wishlist" className="pdp-wishlist-manage">
                      View all saved items →
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/edit-product/${productId}`}
                      className="pdp-btn pdp-btn--secondary pdp-btn--block"
                    >
                      <FiEdit2 aria-hidden />
                      Edit listing
                    </Link>
                    <button
                      type="button"
                      className="pdp-btn pdp-btn--secondary pdp-btn--block"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      <FiTrash2 aria-hidden />
                      {deleting ? "Deleting…" : "Delete listing"}
                    </button>
                    <p className="pdp-own-hint">
                      This is your listing — buyers can still message you from their account.
                    </p>
                  </>
                )}
              </div>
            </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
