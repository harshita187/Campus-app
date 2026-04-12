import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheck,
  FiClock,
  FiHeart,
  FiMapPin,
  FiMessageCircle,
  FiUser,
  FiZap,
} from "react-icons/fi";
import { SOCKET_URL } from "../services/api";
import { isWishlisted, toggleWishlist } from "../utils/wishlist";
import { isCampusEmail } from "../utils/campusEmail";
import { CategoryFlatIcon } from "./CategoryFlatIcon";
import "./ProductCard.css";

function resolveImageUrl(src) {
  if (!src || typeof src !== "string" || !src.trim()) return null;
  const t = src.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/")) return `${SOCKET_URL}${t}`;
  return `${SOCKET_URL}/uploads/${t}`;
}

const URGENCY_COPY = {
  moving_out: { label: "Moving out", className: "product-tag--urgency-move" },
  flash_sale: { label: "Flash sale", className: "product-tag--urgency-flash" },
};

const ProductCard = ({ product, onQuickView }) => {
  const id = product._id || product.id;
  const firstImage = product?.images?.[0];
  const primarySrc = useMemo(() => resolveImageUrl(firstImage), [firstImage]);

  const [imageSrc, setImageSrc] = useState(primarySrc);
  const [imageFailed, setImageFailed] = useState(false);
  const [saved, setSaved] = useState(() => isWishlisted(id));

  useEffect(() => {
    setImageSrc(primarySrc);
    setImageFailed(false);
  }, [primarySrc, id]);

  useEffect(() => {
    setSaved(isWishlisted(id));
  }, [id]);

  const showPhoto = Boolean(imageSrc) && !imageFailed;

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Recently";
    }
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const onWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(toggleWishlist(id));
  };

  const negotiable = product.negotiable !== false;
  const pickup =
    typeof product.pickupLocation === "string" && product.pickupLocation.trim()
      ? product.pickupLocation.trim()
      : null;

  const sellerEmail = product.sellerId?.email;
  const sellerVerified = isCampusEmail(sellerEmail);

  const urgencyKey = product.urgency && URGENCY_COPY[product.urgency] ? product.urgency : null;
  const urgencyMeta = urgencyKey ? URGENCY_COPY[urgencyKey] : null;

  const onQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onQuickView === "function") onQuickView(id);
  };

  return (
    <div className="product-card">
      <div className="product-media">
        <Link to={`/product/${id}`} className="product-media-link" tabIndex={-1} aria-hidden>
          <div className="product-image">
            <span className="product-image-category-badge">{product.category}</span>
            {showPhoto ? (
              <img
                src={imageSrc}
                alt={product.title}
                onError={() => setImageFailed(true)}
                loading="lazy"
              />
            ) : (
              <div className="product-image-placeholder">
                <CategoryFlatIcon name={product.category || "Others"} size={72} />
                <span className="product-placeholder-label">No photo yet</span>
              </div>
            )}
          </div>
        </Link>

        <button
          type="button"
          className={`product-wishlist ${saved ? "product-wishlist--active" : ""}`}
          onClick={onWishlistClick}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save listing"}
        >
          <FiHeart />
        </button>

        <Link
          to={`/chat/product/${id}`}
          className="product-quick-chat product-quick-chat--icon-only"
          onClick={(e) => e.stopPropagation()}
          aria-label="Quick chat with seller"
          title="Chat"
        >
          <FiMessageCircle aria-hidden />
        </Link>

        <div className="product-tag-strip">
          {urgencyMeta ? (
            <span className={`product-tag ${urgencyMeta.className}`}>
              <FiZap aria-hidden />
              {urgencyMeta.label}
            </span>
          ) : null}
          {product.condition ? (
            <span className="product-tag product-tag--condition">{product.condition}</span>
          ) : null}
          {negotiable ? (
            <span className="product-tag product-tag--negotiable">Negotiable</span>
          ) : (
            <span className="product-tag product-tag--firm">Firm price</span>
          )}
        </div>
      </div>

      <div className="product-body">
        <Link to={`/product/${id}`} className="product-body-link">
          <div className="product-info">
            <div className="product-price-block">
              <span className="product-price">₹{product.price.toLocaleString()}</span>
            </div>
            <h3 className="product-title">{product.title}</h3>
            <div className="product-category">{product.category}</div>

            <div className="product-meta">
              <div className="product-seller-block">
                <div className="product-seller">
                  <FiUser aria-hidden />
                  <span className="product-seller-name">
                    {product.sellerId?.name || product.seller || "Unknown seller"}
                  </span>
                  {sellerVerified ? (
                    <span className="product-verified" title="Signed up with a campus-style email">
                      <FiCheck aria-hidden />
                      <span className="visually-hidden">Verified student email</span>
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="product-location">
                <FiMapPin aria-hidden />
                <span>{pickup || "Pickup — message to arrange"}</span>
              </div>
              <div className="product-date">
                <FiClock aria-hidden />
                {formatDate(product.createdAt || product.datePosted)}
              </div>
            </div>
          </div>
        </Link>
        {typeof onQuickView === "function" ? (
          <button type="button" className="product-quick-view-btn" onClick={onQuickViewClick}>
            Quick view
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ProductCard;
