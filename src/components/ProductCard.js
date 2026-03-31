import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiUser, FiTag } from "react-icons/fi";
import { SOCKET_URL } from "../services/api";
import "./ProductCard.css";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'><rect width='640' height='420' fill='%23eef2ff'/><rect x='210' y='130' width='220' height='140' rx='16' fill='%23c7d2fe'/><text x='320' y='305' text-anchor='middle' fill='%23475569' font-family='Arial' font-size='24'>No Image</text></svg>";

const ProductCard = ({ product }) => {
  const resolvedImage = useMemo(() => {
    const src = product?.images?.[0];
    if (!src || typeof src !== "string") return FALLBACK_IMAGE;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("/")) return `${SOCKET_URL}${src}`;
    return `${SOCKET_URL}/uploads/${src}`;
  }, [product]);

  const [imageSrc, setImageSrc] = useState(resolvedImage);

  useEffect(() => {
    setImageSrc(resolvedImage);
  }, [resolvedImage]);

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

  return (
    <div className="product-card">
      <Link to={`/product/${product._id || product.id}`} className="product-link">
        <div className="product-image">
          <img
            src={imageSrc}
            alt={product.title}
            onError={() => setImageSrc(FALLBACK_IMAGE)}
            loading="lazy"
          />
          <div className="product-condition">
            <FiTag />
            {product.condition}
          </div>
        </div>

        <div className="product-info">
          <h3 className="product-title">{product.title}</h3>
          <div className="product-price">₹{product.price.toLocaleString()}</div>
          <div className="product-category">{product.category}</div>

          <div className="product-meta">
            <div className="product-seller">
              <FiUser />
              {product.sellerId?.name || product.seller || "Unknown seller"}
            </div>
            <div className="product-date">
              <FiClock />
              {formatDate(product.createdAt || product.datePosted)}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
