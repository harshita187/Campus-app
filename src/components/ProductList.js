import React, { useState } from "react";

// Mock ProductCard component for demonstration
const ProductCard = ({ product }) => (
  <div className="product-card">
    <div className="product-image">
      <img src={product.images[0]} alt={product.title} />
      <div className="product-badge">{product.condition}</div>
    </div>
    <div className="product-info">
      <div className="product-header">
        <h3 className="product-title">{product.title}</h3>
        <span className="product-category">{product.category}</span>
      </div>
      <p className="product-description">{product.description}</p>
      <div className="product-footer">
        <div className="product-price">₹{product.price.toLocaleString()}</div>
        <div className="product-meta">
          <span className="seller">By {product.seller}</span>
          <span className="date">
            {new Date(product.datePosted).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const products = [
    {
      id: 1,
      title: "Engineering Textbooks Set",
      price: 1500,
      category: "Notes",
      condition: "Good",
      description:
        "Complete set of mechanical engineering textbooks for 3rd year. All books in good condition with minimal highlighting.",
      seller: "Rajesh Kumar",
      contact: "rajesh.kumar@college.edu",
      images: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
      ],
      datePosted: "2025-06-01",
    },
    {
      id: 2,
      title: "Hero Splendor Bike",
      price: 25000,
      category: "Cycle",
      condition: "Excellent",
      description:
        "Well maintained Hero Splendor, regular servicing done. Perfect for campus commute.",
      seller: "Priya Sharma",
      contact: "priya.sharma@college.edu",
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      ],
      datePosted: "2025-05-28",
    },
    {
      id: 3,
      title: "Designer Kurta Set",
      price: 800,
      category: "Dress",
      condition: "Like New",
      description:
        "Beautiful designer kurta set, worn only twice. Perfect for college events and festivals.",
      seller: "Ananya Patel",
      contact: "ananya.patel@college.edu",
      images: [
        "https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=400&h=300&fit=crop",
      ],
      datePosted: "2025-06-03",
    },
    {
      id: 4,
      title: "Mini Refrigerator",
      price: 3500,
      category: "Cooler",
      condition: "Good",
      description:
        "Compact mini fridge perfect for hostel rooms. Energy efficient and in working condition.",
      seller: "Amit Singh",
      contact: "amit.singh@college.edu",
      images: [
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop",
      ],
      datePosted: "2025-05-30",
    },
    {
      id: 5,
      title: "Gaming Laptop",
      price: 45000,
      category: "Electronics",
      condition: "Excellent",
      description:
        "High-performance gaming laptop with GTX graphics. Perfect for both gaming and programming.",
      seller: "Vikash Patel",
      contact: "vikash.patel@college.edu",
      images: [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
      ],
      datePosted: "2025-06-04",
    },
    {
      id: 6,
      title: "Study Table & Chair",
      price: 2500,
      category: "Furniture",
      condition: "Good",
      description:
        "Wooden study table with matching chair. Perfect for hostel or PG accommodation.",
      seller: "Neha Gupta",
      contact: "neha.gupta@college.edu",
      images: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      ],
      datePosted: "2025-06-02",
    },
  ];

  const categories = [
    "All",
    "Notes",
    "Cycle",
    "Dress",
    "Cooler",
    "Electronics",
    "Furniture",
  ];

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.datePosted) - new Date(a.datePosted);
        case "oldest":
          return new Date(a.datePosted) - new Date(b.datePosted);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

  return (
    <div className="product-list">
      <style jsx>{`
        .product-list {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 0;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 3rem;
          color: white;
        }

        .page-header h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .page-header p {
          font-size: 1.2rem;
          opacity: 0.9;
          font-weight: 300;
        }

        .filters-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .search-bar {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 1.2rem;
          z-index: 2;
        }

        .search-input {
          width: 100%;
          padding: 1.2rem 1.5rem 1.2rem 4rem;
          border: 2px solid transparent;
          border-radius: 50px;
          font-size: 1rem;
          background: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 4px 25px rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
        }

        .filters {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-weight: 600;
          color: #4a5568;
        }

        .filter-icon {
          color: #667eea;
          font-size: 1.1rem;
        }

        .filter-select {
          padding: 0.8rem 1.2rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          min-width: 140px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .results-info {
          margin-bottom: 2rem;
          text-align: center;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .products-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .product-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          display: flex;
          min-height: 200px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.15);
        }

        .product-image {
          position: relative;
          width: 280px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .product-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-info {
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .product-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0;
          line-height: 1.3;
        }

        .product-category {
          background: #f7fafc;
          color: #667eea;
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
          border: 1px solid #e2e8f0;
        }

        .product-description {
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
        }

        .product-price {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .product-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.3rem;
        }

        .seller {
          color: #2d3748;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .date {
          color: #64748b;
          font-size: 0.8rem;
        }

        .no-products {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .no-products h3 {
          font-size: 1.8rem;
          color: #2d3748;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .no-products p {
          color: #4a5568;
          font-size: 1.1rem;
        }

        @media (max-width: 1024px) {
          .product-card {
            flex-direction: column;
            min-height: auto;
          }

          .product-image {
            width: 100%;
            height: 250px;
          }

          .product-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .product-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .product-meta {
            align-items: flex-start;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }

          .page-header h1 {
            font-size: 2.2rem;
          }

          .filters-section {
            padding: 1.5rem;
          }

          .filters {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .filter-group {
            justify-content: space-between;
          }

          .filter-select {
            flex: 1;
            margin-left: 1rem;
          }

          .product-info {
            padding: 1.5rem;
          }
        }
      `}</style>

      <div className="container">
        <div className="page-header">
          <h1>Student Marketplace</h1>
          <p>Discover amazing deals from your fellow students</p>
        </div>

        <div className="filters-section">
          <div className="search-bar">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="Search for products, books, electronics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <span className="filter-icon">🏷️</span>
              <span>Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-icon">📊</span>
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="results-info">
          <span>📦 {filteredProducts.length} products found</span>
        </div>

        <div className="products-container">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-products">
              <h3>🔍 No products found</h3>
              <p>
                Try adjusting your search criteria or browse different
                categories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
