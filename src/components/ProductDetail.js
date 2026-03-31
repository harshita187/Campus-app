import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiClock,
  FiTag,
  FiMapPin,
} from "react-icons/fi";
import "./ProductDetail.css";
import { productService } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import { SOCKET_URL } from "../services/api";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='600' viewBox='0 0 900 600'><rect width='900' height='600' fill='%23eef2ff'/><rect x='300' y='180' width='300' height='190' rx='20' fill='%23c7d2fe'/><text x='450' y='420' text-anchor='middle' fill='%23475569' font-family='Arial' font-size='32'>No Image</text></svg>";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const isOwnProduct = product && (product.sellerId?._id === user?.id || product.sellerId?._id === user?._id);
  const firstImage = product?.images?.[0];
  const resolvedImage =
    !firstImage
      ? FALLBACK_IMAGE
      : firstImage.startsWith("http://") || firstImage.startsWith("https://")
        ? firstImage
        : firstImage.startsWith("/")
          ? `${SOCKET_URL}${firstImage}`
          : `${SOCKET_URL}/uploads/${firstImage}`;

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
              <img
                src={resolvedImage}
                alt={product.title}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <div className="condition-badge">
                <FiTag />
                {product.condition}
              </div>
            </div>
          </div>

          <div className="product-info">
            <div className="product-header">
              <h1>{product.title}</h1>
              <div className="product-price">
                ₹{product.price.toLocaleString()}
              </div>
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
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">On Campus</span>
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
                  <h4>{product.sellerId?.name || "Seller"}</h4>
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
