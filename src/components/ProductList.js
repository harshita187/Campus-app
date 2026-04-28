import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import ProductQuickViewModal from "./ProductQuickViewModal";
import { productService } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import { FiFilter, FiSearch, FiSliders, FiPackage, FiZap, FiMapPin } from "react-icons/fi";
import "./ProductList.css";

const CATEGORY_OPTIONS = [
  "All",
  "Notes",
  "Cycle",
  "Dress",
  "Cooler",
  "Electronics",
  "Furniture",
  "Others",
];

const CONDITION_OPTIONS = [
  { value: "", label: "Any condition" },
  { value: "Brand New", label: "Brand New" },
  { value: "Open Box", label: "Open Box" },
  { value: "Like New", label: "Like New" },
  { value: "Excellent", label: "Excellent" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Heavily Used", label: "Heavily Used" },
];

const URGENCY_OPTIONS = [
  { value: "", label: "Any listing" },
  { value: "moving_out", label: "Moving out soon" },
  { value: "flash_sale", label: "Flash sale" },
];

const PRICE_SLIDER_CEILING = 150000;

const SUGGEST_DEBOUNCE_MS = 280;

function parsePriceInput(raw) {
  const t = String(raw).trim();
  if (!t) return undefined;
  const n = Number(t);
  if (Number.isNaN(n) || n < 0) return undefined;
  return n;
}

const ProductList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialSearch = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "newest";
  const initialCondition = searchParams.get("condition") || "";
  const initialUrgency = searchParams.get("urgency") || "";
  const initialMin = searchParams.get("minPrice") || "";
  const initialMax = searchParams.get("maxPrice") || "";
  const initialMine =
    searchParams.get("mine") === "1" || searchParams.get("mine") === "true";
  const rawCampus = searchParams.get("campus") || "";
  const campusQParam = searchParams.get("campusQ") || "";
  const initialCampusScope =
    rawCampus === "my_college" || rawCampus === "nearby" ? rawCampus : "";
  const initialCampusQ = initialCampusScope ? campusQParam : campusQParam || rawCampus || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORY_OPTIONS.includes(initialCategory) ? initialCategory : "All"
  );
  const [sortBy, setSortBy] = useState(initialSort);
  const [conditionFilter, setConditionFilter] = useState(
    CONDITION_OPTIONS.some((o) => o.value === initialCondition) ? initialCondition : ""
  );
  const [urgencyFilter, setUrgencyFilter] = useState(
    URGENCY_OPTIONS.some((o) => o.value === initialUrgency) ? initialUrgency : ""
  );
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [mineOnly, setMineOnly] = useState(initialMine);
  const [campusScope, setCampusScope] = useState(initialCampusScope);
  const [campusNameQuery, setCampusNameQuery] = useState(initialCampusQ);

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchWrapRef = useRef(null);

  const [quickViewId, setQuickViewId] = useState(null);

  const minNum = parsePriceInput(minPrice);
  const maxNum = parsePriceInput(maxPrice);

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    selectedCategory,
    sortBy,
    mineOnly,
    conditionFilter,
    urgencyFilter,
    minPrice,
    maxPrice,
    campusScope,
    campusNameQuery,
  ]);

  useEffect(() => {
    const nextCategory = searchParams.get("category");
    const nextSearch = searchParams.get("q") || "";
    const nextSort = searchParams.get("sort") || "newest";
    const nextCondition = searchParams.get("condition") || "";
    const nextUrgency = searchParams.get("urgency") || "";
    const nextMin = searchParams.get("minPrice") || "";
    const nextMax = searchParams.get("maxPrice") || "";
    const nextPage = Number(searchParams.get("page")) || 1;
    const nextMine =
      searchParams.get("mine") === "1" || searchParams.get("mine") === "true";
    const nextRawCampus = searchParams.get("campus") || "";
    const nextScope =
      nextRawCampus === "my_college" || nextRawCampus === "nearby" ? nextRawCampus : "";
    const nextCampusQ =
      nextRawCampus === "my_college" || nextRawCampus === "nearby"
        ? searchParams.get("campusQ") || ""
        : searchParams.get("campusQ") || nextRawCampus || "";

    setSearchTerm(nextSearch);
    setSelectedCategory(
      CATEGORY_OPTIONS.includes(nextCategory) ? nextCategory : "All"
    );
    setSortBy(nextSort);
    setConditionFilter(
      CONDITION_OPTIONS.some((o) => o.value === nextCondition) ? nextCondition : ""
    );
    setUrgencyFilter(URGENCY_OPTIONS.some((o) => o.value === nextUrgency) ? nextUrgency : "");
    setMinPrice(nextMin);
    setMaxPrice(nextMax);
    setMineOnly(nextMine);
    setCampusScope(nextScope);
    setCampusNameQuery(nextCampusQ);
    setPage(nextPage);
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (sortBy !== "newest") params.sort = sortBy;
    if (conditionFilter) params.condition = conditionFilter;
    if (urgencyFilter) params.urgency = urgencyFilter;
    if (minPrice.trim()) params.minPrice = minPrice.trim();
    if (maxPrice.trim()) params.maxPrice = maxPrice.trim();
    if (page > 1) params.page = String(page);
    if (mineOnly) params.mine = "1";
    if (campusScope === "my_college" || campusScope === "nearby") {
      params.campus = campusScope;
    } else if (campusNameQuery.trim()) {
      params.campusQ = campusNameQuery.trim();
    }
    setSearchParams(params, { replace: true });
  }, [
    page,
    searchTerm,
    selectedCategory,
    setSearchParams,
    sortBy,
    mineOnly,
    conditionFilter,
    urgencyFilter,
    minPrice,
    maxPrice,
    campusScope,
    campusNameQuery,
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      let lo = minNum;
      let hi = maxNum;
      if (lo != null && hi != null && lo > hi) {
        const t = lo;
        lo = hi;
        hi = t;
      }
      try {
        const listParams = {
          q: searchTerm || undefined,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          sort: sortBy,
          condition: conditionFilter || undefined,
          urgency: urgencyFilter || undefined,
          minPrice: lo,
          maxPrice: hi,
          page,
          limit: 12,
          mine: mineOnly ? "1" : undefined,
        };
        if (!mineOnly) {
          if (campusScope === "my_college" || campusScope === "nearby") {
            listParams.collegeScope = campusScope;
          } else {
            listParams.collegeScope = "all";
            const cq = campusNameQuery.trim();
            if (cq) listParams.campusQ = cq;
          }
        }
        const data = await productService.list(listParams);
        setProducts(data.items || []);
        setTotalProducts(data.total || 0);
        setTotalPages(
          data.totalPages ||
            Math.max(1, Math.ceil((data.total || 0) / (data.limit || 12)))
        );
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load products";
        if (
          err.response?.status === 401 &&
          (campusScope === "my_college" || campusScope === "nearby")
        ) {
          setCampusScope("");
          setError(`${msg} Showing all campuses instead.`);
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchProducts, 250);
    return () => clearTimeout(timeout);
  }, [
    searchTerm,
    selectedCategory,
    sortBy,
    page,
    mineOnly,
    conditionFilter,
    urgencyFilter,
    minNum,
    maxNum,
    campusScope,
    campusNameQuery,
  ]);

  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return undefined;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const data = await productService.list({ q, limit: 8, page: 1 });
        if (!cancelled) setSuggestions(data.items || []);
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, SUGGEST_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (!suggestOpen) return undefined;
    const onDoc = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [suggestOpen]);

  const applySuggestion = (title) => {
    setSearchTerm(title);
    setSuggestOpen(false);
  };

  const filtersActive =
    selectedCategory !== "All" ||
    Boolean(conditionFilter) ||
    Boolean(urgencyFilter) ||
    sortBy !== "newest" ||
    Boolean(minPrice.trim()) ||
    Boolean(maxPrice.trim()) ||
    Boolean(campusScope) ||
    Boolean(campusNameQuery.trim());

  const sliderMinVal = minNum ?? 0;
  const sliderMaxVal = maxNum ?? PRICE_SLIDER_CEILING;

  return (
    <div className="product-list">
      <div className="container">
        <div className="page-header marketplace-header">
          <h1>{mineOnly ? "Your listings" : "Student Marketplace"}</h1>
          <p>
            {mineOnly
              ? "Products you’ve posted—edit or share links from the product page."
              : "Browse from students across campuses—filter by school, yours only, or nearby."}
          </p>
        </div>

        {mineOnly ? (
          <div className="mine-banner">
            <span>Showing only your posts</span>
            <Link to="/products" className="mine-banner-link">
              View full marketplace
            </Link>
          </div>
        ) : null}

        <div className="filters-section">
          <div className="search-bar-wrap" ref={searchWrapRef}>
            <div className="search-bar">
              <div className="search-icon">
                <FiSearch />
              </div>
              <input
                type="text"
                placeholder="Search for products, books, electronics..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                className="search-input"
                autoComplete="off"
              />
            </div>
            {suggestOpen && searchTerm.trim().length >= 2 && suggestions.length > 0 ? (
              <ul id="search-suggestions-list" className="search-suggestions">
                {suggestions.map((p) => {
                  const pid = p._id || p.id;
                  return (
                    <li key={pid}>
                      <button
                        type="button"
                        className="search-suggestion-item"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applySuggestion(p.title)}
                      >
                        <span className="search-suggestion-title">{p.title}</span>
                        <span className="search-suggestion-meta">
                          ₹{Number(p.price).toLocaleString()} · {p.category}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {!mineOnly ? (
            <div className="campus-filter-block" aria-label="Campus filters">
              <div className="campus-filter-row campus-filter-row--scope">
                <span className="campus-filter-label">
                  <FiMapPin aria-hidden />
                  Campus
                </span>
                <select
                  className="filter-select campus-filter-select"
                  value={campusScope}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCampusScope(v);
                    if (v === "my_college" || v === "nearby") setCampusNameQuery("");
                  }}
                  aria-label="Campus scope"
                >
                  <option value="">All campuses (search below)</option>
                  <option
                    value="my_college"
                    disabled={!user}
                    title={!user ? "Sign in to use this filter" : ""}
                  >
                    My campus only
                  </option>
                  <option
                    value="nearby"
                    disabled={!user}
                    title={!user ? "Sign in to use this filter" : ""}
                  >
                    My campus + nearby
                  </option>
                </select>
              </div>
              <div className="campus-filter-row campus-filter-row--text">
                <label className="campus-name-filter-label" htmlFor="campus-name-filter">
                  Campus name contains
                </label>
                <input
                  id="campus-name-filter"
                  type="search"
                  className="campus-name-filter-input"
                  placeholder="e.g. IIT Delhi, state university…"
                  value={campusNameQuery}
                  onChange={(e) => {
                    setCampusNameQuery(e.target.value);
                    if (e.target.value.trim()) setCampusScope("");
                  }}
                  maxLength={80}
                  disabled={campusScope === "my_college" || campusScope === "nearby"}
                  title={
                    campusScope === "my_college" || campusScope === "nearby"
                      ? "Clear “My campus” or “Nearby” to search by name"
                      : undefined
                  }
                />
              </div>
            </div>
          ) : null}

          <div className="category-pills" role="group" aria-label="Category">
            <span className="category-pills-label">
              <FiFilter aria-hidden />
              Category
            </span>
            <div className="category-pills-row">
              {CATEGORY_OPTIONS.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`category-pill ${active ? "category-pill--active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="price-range-row" aria-label="Price range">
            <span className="price-range-label">Price (₹)</span>
            <div className="price-range-inputs">
              <label className="price-field">
                <span className="visually-hidden">Minimum price</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="price-input"
                />
              </label>
              <span className="price-range-sep">–</span>
              <label className="price-field">
                <span className="visually-hidden">Maximum price</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="price-input"
                />
              </label>
            </div>
          </div>

          <div className="price-slider-block" aria-label="Price range slider">
            <div className="price-slider-labels">
              <span>₹{sliderMinVal.toLocaleString()}</span>
              <span>
                {maxPrice.trim() ? `₹${sliderMaxVal.toLocaleString()}` : "No max"}
              </span>
            </div>
            <div className="price-slider-dual">
              <input
                type="range"
                min={0}
                max={PRICE_SLIDER_CEILING}
                step={500}
                value={Math.min(sliderMinVal, sliderMaxVal)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  const hi = maxNum ?? PRICE_SLIDER_CEILING;
                  const next = Math.min(v, hi);
                  setMinPrice(next <= 0 ? "" : String(next));
                }}
                className="price-range price-range--min"
                aria-label="Minimum price"
              />
              <input
                type="range"
                min={0}
                max={PRICE_SLIDER_CEILING}
                step={500}
                value={Math.max(sliderMinVal, sliderMaxVal)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  const lo = minNum ?? 0;
                  const next = Math.max(v, lo);
                  if (next >= PRICE_SLIDER_CEILING) setMaxPrice("");
                  else setMaxPrice(String(next));
                }}
                className="price-range price-range--max"
                aria-label="Maximum price"
              />
            </div>
          </div>

          <div className={`filters ${filtersActive ? "filters--active" : ""}`}>
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

            <div className="filter-group">
              <span className="filter-icon">
                <FiPackage />
              </span>
              <span>Condition:</span>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="filter-select"
              >
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt.value || "any"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-icon">
                <FiZap />
              </span>
              <span>Urgency:</span>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="filter-select"
              >
                {URGENCY_OPTIONS.map((opt) => (
                  <option key={opt.value || "any"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!loading && !error ? (
          <div className="results-info">
            <span>
              <FiPackage /> {totalProducts} products found
            </span>
          </div>
        ) : null}

        {error && (
          <div className="no-products">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        <div className="products-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={`sk-${i}`} className="product-card-skeleton" aria-hidden />
              ))
            : null}
          {!loading && !error && products.length > 0
            ? products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onQuickView={setQuickViewId}
                />
              ))
            : null}
          {!loading && !error && products.length === 0 ? (
            <div className="no-products no-products--wide">
              <h3>No products found</h3>
              <p>
                Try adjusting your search criteria or browse different categories.
              </p>
            </div>
          ) : null}
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

      <ProductQuickViewModal productId={quickViewId} onClose={() => setQuickViewId(null)} />
    </div>
  );
};

export default ProductList;
