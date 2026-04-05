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

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <FiSearch className="step-icon" />
              <h3>Browse Products</h3>
              <p>Explore listings from verified students in your college.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <FiUsers className="step-icon" />
              <h3>Chat with Seller</h3>
              <p>Connect directly via real-time messaging to negotiate.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <FiShield className="step-icon" />
              <h3>Meet Safely</h3>
              <p>Complete transactions on campus with trusted peers.</p>
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
            <Link className="category-card" to="/products?category=Notes">
              <span className="category-icon">📚</span>
              <h3>Notes</h3>
              <p>Study materials and notes</p>
            </Link>
            <Link className="category-card" to="/products?category=Cycle">
              <span className="category-icon">🚲</span>
              <h3>Cycle</h3>
              <p>Bicycles and accessories</p>
            </Link>
            <Link className="category-card" to="/products?category=Dress">
              <span className="category-icon">👕</span>
              <h3>Dress</h3>
              <p>Clothing and apparel</p>
            </Link>
            <Link className="category-card" to="/products?category=Cooler">
              <span className="category-icon">❄️</span>
              <h3>Cooler</h3>
              <p>Coolers and appliances</p>
            </Link>
            <Link className="category-card" to="/products?category=Electronics">
              <span className="category-icon">💻</span>
              <h3>Electronics</h3>
              <p>Gadgets and devices</p>
            </Link>
            <Link className="category-card" to="/products?category=Furniture">
              <span className="category-icon">🪑</span>
              <h3>Furniture</h3>
              <p>Chairs, tables, and more</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2>What Students Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p>"Campus App made selling my old laptop so easy! Found a buyer in minutes."</p>
              <cite>- Priya, Engineering Student</cite>
            </div>
            <div className="testimonial-card">
              <p>"Bought study notes at half the price. Super convenient and safe."</p>
              <cite>- Rohan, Medical Student</cite>
            </div>
            <div className="testimonial-card">
              <p>"Love the campus-only network. No scams, just real deals."</p>
              <cite>- Anjali, Arts Student</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Campus App</h3>
              <p>Your trusted campus marketplace for buying and selling essentials.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/products">Browse Products</Link></li>
                <li><Link to="/add-product">Sell Product</Link></li>
                <li><Link to="/chat">Messages</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="mailto:support@campusapp.com">Contact Us</a></li>
                <li><button className="help-button">Help Center</button></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Campus App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;