import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { productService } from "../services/productService";
import "./ProductList.css";

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    "All",
    "Notes",
    "Cycle",
    "Dress",
    "Cooler",
    "Electronics",
    "Furniture",
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productService.list({
          q: searchTerm || undefined,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          sort: sortBy,
          page: 1,
          limit: 30,
        });
        setProducts(data.items || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchProducts, 250);
    return () => clearTimeout(timeout);
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <div className="product-list">
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
          <span>📦 {products.length} products found</span>
        </div>

        {loading && <div className="results-info">Loading products...</div>}
        {error && <div className="no-products"><h3>Error</h3><p>{error}</p></div>}

        <div className="products-grid">
          {!loading && !error && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))
          ) : (
            !loading && !error && <div className="no-products">
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
