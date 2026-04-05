import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiMessageCircle,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import ProductCard from "./ProductCard";
import "./Home.css";

const categories = [
  {
    name: "Notes",
    icon: "📚",
    description: "Class notes, solved papers, and study bundles.",
  },
  {
    name: "Electronics",
    icon: "💻",
    description: "Laptops, calculators, headphones, and gadgets.",
  },
  {
    name: "Furniture",
    icon: "🪑",
    description: "Desks, chairs, lamps, and room setup essentials.",
  },
  {
    name: "Cycle",
    icon: "🚲",
    description: "Cycles and commuter gear for campus travel.",
  },
  {
    name: "Dress",
    icon: "👕",
    description: "College wear, formals, and occasion outfits.",
  },
  {
    name: "Cooler",
    icon: "❄️",
    description: "Room appliances and practical hostel upgrades.",
  },
];

const trustHighlights = [
  {
    icon: FiUsers,
    title: "Campus-only network",
    description: "Every listing is shared inside a familiar student community.",
  },
  {
    icon: FiMessageCircle,
    title: "Direct student chat",
    description: "Ask questions, negotiate quickly, and finalise plans faster.",
  },
  {
    icon: FiShield,
    title: "Safer meetups",
    description: "Coordinate exchanges in known campus spaces with confidence.",
  },
];

const steps = [
  {
    number: "01",
    title: "Discover what you need",
    description: "Use categories and featured picks to jump straight into relevant listings.",
    icon: FiSearch,
  },
  {
    number: "02",
    title: "Talk before you travel",
    description: "Message sellers, confirm condition, and align on timing before meeting.",
    icon: FiMessageCircle,
  },
  {
    number: "03",
    title: "Close the deal on campus",
    description: "Meet nearby, inspect the item, and finish the exchange smoothly.",
    icon: FiCheckCircle,
  },
];

const testimonials = [
  {
    quote: "Sold my old monitor in one evening and didn’t have to deal with random strangers.",
    author: "Priya",
    detail: "Engineering student",
  },
  {
    quote: "The category shortcuts made it much easier to find notes without scrolling forever.",
    author: "Rohan",
    detail: "Medical student",
  },
  {
    quote: "It feels more trustworthy when the buyer is also from campus and chat happens in-app.",
    author: "Anjali",
    detail: "Arts student",
  },
];

const Home = ({ products = [] }) => {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-shell">
          <div className="hero-copy">
            <span className="eyebrow">Campus marketplace, organised better</span>
            <h1 className="hero-title">Buy and sell with a layout that helps students act fast.</h1>
            <p className="hero-description">
              Browse by category, spot fresh listings quickly, and move from discovery
              to chat without the homepage getting in your way.
            </p>

            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary">
                <FiSearch />
                Browse Marketplace
              </Link>
              <Link to="/add-product" className="btn btn-secondary">
                <FiShoppingBag />
                Post an Item
              </Link>
            </div>

            <div className="hero-insights">
              <div className="insight-card">
                <FiClock />
                <div>
                  <strong>Fresh listings first</strong>
                  <span>See recent products and jump in quickly.</span>
                </div>
              </div>
              <div className="insight-card">
                <FiTrendingUp />
                <div>
                  <strong>Clear category shortcuts</strong>
                  <span>Reach the right aisle without extra filtering steps.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-card spotlight-card">
              <div className="spotlight-label">Why students keep using it</div>
              <h2>Designed around the real campus flow</h2>
              <ul className="spotlight-list">
                <li>Find useful categories immediately</li>
                <li>Compare current listings without clutter</li>
                <li>Move into seller chat with less friction</li>
              </ul>
            </div>

            <div className="hero-metrics">
              <div className="metric-card">
                <strong>Campus-first</strong>
                <span>Made for student-to-student exchanges</span>
              </div>
              <div className="metric-card">
                <strong>Zero extra noise</strong>
                <span>Sections are focused on actions, not filler</span>
              </div>
              <div className="metric-card">
                <strong>Fast scan paths</strong>
                <span>Better rhythm across mobile and desktop</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="container">
          <div className="section-heading section-heading-centered">
            <span className="section-kicker">Trust and clarity</span>
            <h2>A homepage that explains the value before asking for effort</h2>
            <p>
              The first screen should answer three things quickly: who this is for,
              why it feels safer, and what the next action should be.
            </p>
          </div>

          <div className="trust-grid">
            {trustHighlights.map(({ icon: Icon, title, description }) => (
              <article className="trust-card" key={title}>
                <div className="icon-badge">
                  <Icon />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Start with discovery</span>
              <h2>Popular categories students look for most</h2>
            </div>
            <Link to="/products" className="view-all">
              Open all products <FiArrowRight />
            </Link>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                className="category-card"
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
              >
                <span className="category-icon">{category.icon}</span>
                <div className="category-text">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
                <span className="category-arrow">
                  <FiArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Fresh on campus</span>
              <h2>Featured listings worth checking right now</h2>
            </div>
            <Link to="/products" className="view-all">
              View marketplace <FiArrowRight />
            </Link>
          </div>

          <div className="products-grid">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))
            ) : (
              <div className="empty-state">
                <h3>No featured products yet</h3>
                <p>New student listings will show up here as soon as they’re added.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="how-section">
        <div className="container how-shell">
          <div className="section-heading">
            <div>
              <span className="section-kicker">How it works</span>
              <h2>A simpler path from interest to exchange</h2>
            </div>
          </div>

          <div className="steps-grid">
            {steps.map(({ number, title, description, icon: Icon }) => (
              <article className="step-card" key={number}>
                <div className="step-topline">
                  <span className="step-number">{number}</span>
                  <span className="icon-badge subtle">
                    <Icon />
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="container">
          <div className="section-heading section-heading-centered">
            <span className="section-kicker">Student feedback</span>
            <h2>What feels better when the layout is easier to use</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((item) => (
              <article className="testimonial-card" key={item.author}>
                <p>{item.quote}</p>
                <div className="testimonial-meta">
                  <strong>{item.author}</strong>
                  <span>{item.detail}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div>
              <span className="section-kicker">Ready to use it</span>
              <h2>Browse what’s available or post something in minutes.</h2>
            </div>
            <div className="cta-actions">
              <Link to="/products" className="btn btn-primary">
                <FiSearch />
                Browse products
              </Link>
              <Link to="/add-product" className="btn btn-secondary">
                <FiShoppingBag />
                Sell an item
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
