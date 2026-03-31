import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { productService } from "../services/productService";
import { FiFilter, FiSearch, FiSliders, FiPackage } from "react-icons/fi";
import "./ProductList.css";

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
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
    setPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productService.list({
          q: searchTerm || undefined,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          sort: sortBy,
          page,
          limit: 12,
        });
        setProducts(data.items || []);
        setTotalProducts(data.total || 0);
        setTotalPages(data.totalPages || Math.max(1, Math.ceil((data.total || 0) / (data.limit || 12))));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchProducts, 250);
    return () => clearTimeout(timeout);
  }, [searchTerm, selectedCategory, sortBy, page]);

  return (
    <div className="product-list">
      <div className="container">
        <div className="page-header marketplace-header">
          <h1>Student Marketplace</h1>
          <p>Search smarter, compare faster, and buy safely within campus.</p>
        </div>

        <div className="filters-section">
          <div className="search-bar">
            <div className="search-icon">
              <FiSearch />
            </div>
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
              <span className="filter-icon">
                <FiFilter />
              </span>
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
              <span className="filter-icon">
                <FiSliders />
              </span>
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
          <span>
            <FiPackage /> {products.length} products found
          </span>
        </div>

        {loading && <div className="status-card">Loading products...</div>}
        {error && (
          <div className="no-products">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        <div className="products-grid">
          {!loading && !error && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))
          ) : (
            !loading && !error && <div className="no-products">
              <h3>No products found</h3>
              <p>
                Try adjusting your search criteria or browse different
                categories.
              </p>
            </div>
          )}
        </div>
        {!loading && !error && totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="page-meta">
              Page {page} of {totalPages} ({totalProducts} total)
            </span>
            <button
              type="button"
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
