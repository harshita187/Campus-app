import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiShield,
  FiArrowRight,
} from 'react-icons/fi';
import ProductCard from './ProductCard';
import './Home.css';

const Home = ({ products }) => {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">Built for serious campus commerce</span>
            <h1 className="hero-title">
              The Marketplace Students Actually Trust
            </h1>
            <p className="hero-description">
              Buy and sell books, electronics, furniture, and essentials inside your
              verified college network. Faster deals, better prices, safer meetups.
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">
                <FiSearch />
                Explore Products
              </Link>
              <Link to="/add-product" className="btn btn-secondary">
                <FiShoppingBag />
                Sell in 2 Minutes
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-card">
                <strong>24x7</strong>
                <span>Live listings</span>
              </div>
              <div className="stat-card">
                <strong>Campus-only</strong>
                <span>Verified users</span>
              </div>
              <div className="stat-card">
                <strong>Zero fees</strong>
                <span>Student friendly</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-graphic">
              <span>📚</span>
              <span>💻</span>
              <span>🪑</span>
              <span>🚲</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Campus Market Wins</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FiUsers className="feature-icon" />
              <h3>Student Community</h3>
              <p>Connect with verified students from your college</p>
            </div>
            <div className="feature-card">
              <FiShield className="feature-icon" />
              <h3>Safe Trading</h3>
              <p>Meet on campus for secure transactions</p>
            </div>
            <div className="feature-card">
              <FiTrendingUp className="feature-icon" />
              <h3>Best Prices</h3>
              <p>Get the best deals from fellow students</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all">
              View marketplace <FiArrowRight />
            </Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {featuredProducts.length === 0 && (
              <div className="empty-state">
                <h3>No featured products yet</h3>
                <p>Fresh listings will appear here as students add products.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">
          <h2>Popular Categories</h2>
          <div className="categories-grid">
            <Link className="category-card" to="/products">
              <span className="category-icon">📚</span>
              <h3>Notes & Books</h3>
              <p>Textbooks, study materials, notes</p>
            </Link>
            <Link className="category-card" to="/products">
              <span className="category-icon">🚲</span>
              <h3>Vehicles</h3>
              <p>Bicycles, scooters, bikes</p>
            </Link>
            <Link className="category-card" to="/products">
              <span className="category-icon">👕</span>
              <h3>Clothing</h3>
              <p>Formal wear, casual clothes</p>
            </Link>
            <Link className="category-card" to="/products">
              <span className="category-icon">❄️</span>
              <h3>Electronics</h3>
              <p>Coolers, gadgets, appliances</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;