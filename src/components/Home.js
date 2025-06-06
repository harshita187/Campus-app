import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';
import ProductCard from './ProductCard';
import './Home.css';

const Home = ({ products }) => {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Campus Marketplace
            <span className="hero-subtitle">Buy & Sell within your college community</span>
          </h1>
          <p className="hero-description">
            Connect with fellow students to buy and sell textbooks, electronics, clothing, 
            and more. Safe, convenient, and designed for campus life.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">
              <FiSearch />
              Browse Products
            </Link>
            <Link to="/add-product" className="btn btn-secondary">
              <FiShoppingBag />
              Start Selling
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-graphic">
            📚📱👕🚲
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Campus Market?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FiUsers className="feature-icon" />
              <h3>Student Community</h3>
              <p>Connect with verified students from your college</p>
            </div>
            <div className="feature-card">
              <FiShoppingBag className="feature-icon" />
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
            <Link to="/products" className="view-all">View All Products →</Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">
          <h2>Popular Categories</h2>
          <div className="categories-grid">
            <div className="category-card">
              <span className="category-icon">📚</span>
              <h3>Notes & Books</h3>
              <p>Textbooks, study materials, notes</p>
            </div>
            <div className="category-card">
              <span className="category-icon">🚲</span>
              <h3>Vehicles</h3>
              <p>Bicycles, scooters, bikes</p>
            </div>
            <div className="category-card">
              <span className="category-icon">👕</span>
              <h3>Clothing</h3>
              <p>Formal wear, casual clothes</p>
            </div>
            <div className="category-card">
              <span className="category-icon">❄️</span>
              <h3>Electronics</h3>
              <p>Coolers, gadgets, appliances</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;