import React from "react";
import { Link } from "react-router-dom";
import { FiClock, FiUser, FiTag } from "react-icons/fi";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          <img src={product.images[0]} alt={product.title} />
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
              {product.seller}
            </div>
            <div className="product-date">
              <FiClock />
              {formatDate(product.datePosted)}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
