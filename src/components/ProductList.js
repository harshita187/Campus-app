import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import { productService } from "../services/productService";
import { FiFilter, FiSearch, FiSliders, FiPackage } from "react-icons/fi";
import "./ProductList.css";

const CATEGORY_OPTIONS = [
  "All",
  "Notes",
  "Cycle",
  "Dress",
  "Cooler",
  "Electronics",
  "Furniture",
];

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialSearch = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "newest";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORY_OPTIONS.includes(initialCategory) ? initialCategory : "All"
  );
  const [sortBy, setSortBy] = useState(initialSort);

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    const nextCategory = searchParams.get("category");
    const nextSearch = searchParams.get("q") || "";
    const nextSort = searchParams.get("sort") || "newest";
    const nextPage = Number(searchParams.get("page")) || 1;

    setSearchTerm(nextSearch);
    setSelectedCategory(
      CATEGORY_OPTIONS.includes(nextCategory) ? nextCategory : "All"
    );
    setSortBy(nextSort);
    setPage(nextPage);
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (sortBy !== "newest") params.sort = sortBy;
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [page, searchTerm, selectedCategory, setSearchParams, sortBy]);

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
                {CATEGORY_OPTIONS.map((category) => (
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
