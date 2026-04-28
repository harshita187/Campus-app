import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiHeart } from "react-icons/fi";
import ProductCard from "./ProductCard";
import { productService } from "../services/productService";
import { getWishlistIds, removeFromWishlist } from "../utils/wishlist";
import "./WishlistPage.css";

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const ids = getWishlistIds();
    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rows = await Promise.all(
        ids.map((id) => productService.getById(id).catch(() => null))
      );
      const ok = rows.filter(Boolean);
      const missing = ids.filter((id, i) => !rows[i]);
      missing.forEach((id) => removeFromWishlist(id));
      setItems(ok);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onWl = () => load();
    window.addEventListener("campus:wishlist-changed", onWl);
    return () => window.removeEventListener("campus:wishlist-changed", onWl);
  }, [load]);

  return (
    <div className="wishlist-page">
      <div className="container wishlist-page-inner">
        <nav className="wishlist-nav" aria-label="Breadcrumb">
          <Link to="/products" className="wishlist-back">
            <FiArrowLeft aria-hidden />
            Back to products
          </Link>
        </nav>

        <header className="wishlist-header">
          <span className="wishlist-kicker">
            <FiHeart aria-hidden />
            Saved
          </span>
          <h1 className="wishlist-title">Your wishlist</h1>
          <p className="wishlist-lead">
            Listings you saved for later. Open one to chat with the seller or remove it from here.
          </p>
        </header>

        {loading ? (
          <p className="wishlist-loading">Loading saved items…</p>
        ) : items.length === 0 ? (
          <div className="wishlist-empty">
            <FiHeart className="wishlist-empty-icon" aria-hidden />
            <h2>Nothing saved yet</h2>
            <p>Browse products and tap &quot;Add to wishlist&quot; to keep track of deals you like.</p>
            <Link to="/products" className="wishlist-empty-cta">
              Browse marketplace
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
