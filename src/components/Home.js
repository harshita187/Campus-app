import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiArrowRight,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiMessageCircle,
  FiSearch,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import ProductCard from "./ProductCard";
import { CategoryFlatIcon } from "./CategoryFlatIcon";
import { MiniSparkline } from "./MiniSparkline";
import { productService } from "../services/productService";
import {
  isCategoryNotifyOn,
  toggleCategoryNotify,
} from "../utils/categoryNotify";
import { getRecentProductIds } from "../utils/recentViewed";
import { resolveListingImageUrl } from "../utils/listingImageUrl";
import { useAuth } from "../context/AuthContext";
import { canSell } from "../utils/roleHelpers";
import { API_URL } from "../services/api";
import "./Home.css";

const TRENDING_SEARCHES = [
  "Calculators",
  "Lab coats",
  "Cycle",
  "Gaming laptop",
  "Semester notes",
];

/** Demo listings for hero preview + trending when API is empty (UI only). */
const PLACEHOLDER_LISTINGS = [
  {
    _id: "ph-1",
    title: "TI-84 Plus CE — semester ready",
    price: 4200,
    category: "Electronics",
    images: ["https://picsum.photos/seed/hero-ph1/640/480"],
  },
  {
    _id: "ph-2",
    title: "Printed notes bundle + solved papers",
    price: 450,
    category: "Notes",
    images: ["https://picsum.photos/seed/hero-ph2/640/480"],
  },
  {
    _id: "ph-3",
    title: "Hybrid cycle, 21-speed, with lock",
    price: 6800,
    category: "Cycle",
    images: ["https://picsum.photos/seed/hero-ph3/640/480"],
  },
  {
    _id: "ph-4",
    title: "Desk lamp + extension board",
    price: 650,
    category: "Furniture",
    images: ["https://picsum.photos/seed/hero-ph4/640/480"],
  },
  {
    _id: "ph-5",
    title: "AirPods Pro (1st gen) — good battery",
    price: 9200,
    category: "Electronics",
    images: ["https://picsum.photos/seed/hero-ph5/640/480"],
  },
  {
    _id: "ph-6",
    title: "Formal blazer — worn twice",
    price: 2100,
    category: "Dress",
    images: ["https://picsum.photos/seed/hero-ph6/640/480"],
  },
  {
    _id: "ph-7",
    title: "Mini fridge for hostel",
    price: 4500,
    category: "Cooler",
    images: ["https://picsum.photos/seed/hero-ph7/640/480"],
  },
  {
    _id: "ph-8",
    title: "Scientific calculator + case",
    price: 890,
    category: "Electronics",
    images: ["https://picsum.photos/seed/hero-ph8/640/480"],
  },
];

const BROWSE_CHIPS = [
  { to: "/products?sort=price-low", label: "Lowest price" },
  { to: "/products?condition=Brand%20New", label: "Brand new" },
  { to: "/products?urgency=flash_sale", label: "Flash sales" },
  { to: "/products?urgency=moving_out", label: "Moving out" },
];

/** Auto-rotating quick filters (price / condition / urgency) below hero insights. */
function HeroBrowseSmartRotator() {
  const wrapRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return undefined;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % BROWSE_CHIPS.length);
    }, 3600);
    return () => window.clearInterval(id);
  }, [paused, reducedMotion]);

  const chip = BROWSE_CHIPS[idx];

  const resumeIfFocusLeft = (e) => {
    if (!wrapRef.current?.contains(e.relatedTarget)) setPaused(false);
  };

  return (
    <div
      ref={wrapRef}
      className="hero-browse-rotator hero-benefits-card hero-benefits-card--glass"
      aria-labelledby="hero-browse-smart-label"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={resumeIfFocusLeft}
    >
      <span id="hero-browse-smart-label" className="hero-browse-rotator-label">
        Browse smart
      </span>
      {reducedMotion ? (
        <ul className="hero-browse-rotator-static">
          {BROWSE_CHIPS.map((c) => (
            <li key={c.to}>
              <Link to={c.to} className="hero-browse-rotator-static-link">
                {c.label}
                <FiArrowRight aria-hidden className="hero-browse-rotator-static-arrow" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className="hero-browse-rotator-window">
            <Link
              key={chip.to + idx}
              to={chip.to}
              className="hero-browse-rotator-link"
            >
              <span className="hero-browse-rotator-main">{chip.label}</span>
              <span className="hero-browse-rotator-sub">
                Open filtered listings <FiArrowRight aria-hidden />
              </span>
            </Link>
          </div>
          <div className="hero-browse-rotator-dots" role="tablist" aria-label="Pick a browse mode">
            {BROWSE_CHIPS.map((c, i) => (
              <button
                key={c.to}
                type="button"
                role="tab"
                aria-selected={i === idx}
                className={`hero-browse-rotator-dot ${i === idx ? "is-active" : ""}`}
                aria-label={`Show ${c.label}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function previewThumbUrl(src) {
  return resolveListingImageUrl(src);
}

function formatRupee(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return "—";
  return `₹${x.toLocaleString("en-IN")}`;
}

function HeroPreviewThumb({ product, imgUrl }) {
  const [broken, setBroken] = useState(false);
  if (!imgUrl || broken) {
    return <CategoryFlatIcon name={product.category || "Notes"} size={26} />;
  }
  return (
    <img
      src={imgUrl}
      alt=""
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}

function HeroLivePreview({ items }) {
  const rows =
    items && items.length > 0 ? items.slice(0, 3) : PLACEHOLDER_LISTINGS.slice(0, 3);
  return (
    <div className="hero-live-preview">
      <div className="hero-live-preview-head">
        <div className="hero-live-preview-head-text">
          <span className="hero-live-preview-kicker">On the marketplace</span>
          <span className="hero-live-preview-title">Fresh picks</span>
        </div>
        <FiZap className="hero-live-preview-spark" aria-hidden />
      </div>
      <ul className="hero-live-preview-list">
        {rows.map((p) => {
          const id = p._id || p.id;
          const demo = typeof id === "string" && id.startsWith("ph-");
          const raw = p.images?.[0];
          const imgUrl = raw ? previewThumbUrl(raw) : null;
          return (
            <li key={String(id)}>
              <Link
                to={demo ? "/products" : `/product/${id}`}
                className="hero-live-preview-row"
              >
                <div className="hero-live-preview-thumb">
                  <HeroPreviewThumb product={p} imgUrl={imgUrl} />
                </div>
                <div className="hero-live-preview-meta">
                  <span className="hero-live-preview-name">{p.title}</span>
                  <span className="hero-live-preview-price">{formatRupee(p.price)}</span>
                </div>
                <FiArrowRight className="hero-live-preview-chevron" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const AVATAR_FALLBACK = [
  { name: "Alex Kumar" },
  { name: "Riya Sharma" },
  { name: "Jordan Lee" },
  { name: "Sam Patel" },
  { name: "Casey Singh" },
];

function initialsFromName(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function paddedAvatars(recent) {
  const out = [...(recent || [])].map((u) => ({ name: u.name || "Student" }));
  let i = 0;
  while (out.length < 6 && i < AVATAR_FALLBACK.length) {
    out.push(AVATAR_FALLBACK[i]);
    i += 1;
  }
  return out.slice(0, 6);
}

function DeltaBadge({ pct }) {
  if (pct == null || Number.isNaN(pct)) return null;
  const n = Number(pct);
  if (n === 0) {
    return (
      <span className="delta-badge delta-badge--neutral">
        Live <span className="delta-badge-week">this week</span>
      </span>
    );
  }
  const up = n > 0;
  return (
    <span className={`delta-badge ${up ? "delta-badge--up" : "delta-badge--down"}`}>
      {up ? "+" : ""}
      {n}% <span className="delta-badge-week">this week</span>
    </span>
  );
}

function CategoryNotifyRow({ categoryName }) {
  const [on, setOn] = useState(() => isCategoryNotifyOn(categoryName));
  return (
    <div className="category-notify-row">
      <button
        type="button"
        className={`category-notify-btn ${on ? "category-notify-btn--on" : ""}`}
        onClick={() => setOn(toggleCategoryNotify(categoryName))}
      >
        <FiBell aria-hidden />
        {on ? "You’ll see this category highlighted" : "Notify me when something is listed"}
      </button>
    </div>
  );
}

const categories = [
  {
    name: "Notes",
    description: "Class notes, solved papers, and study bundles.",
  },
  {
    name: "Electronics",
    description: "Laptops, calculators, headphones, and gadgets.",
  },
  {
    name: "Furniture",
    description: "Desks, chairs, lamps, and room setup essentials.",
  },
  {
    name: "Cycle",
    description: "Cycles and commuter gear for campus travel.",
  },
  {
    name: "Dress",
    description: "College wear, formals, and occasion outfits.",
  },
  {
    name: "Cooler",
    description: "Room appliances and practical hostel upgrades.",
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

/** Resume-friendly milestone copy (e.g. 500+ when data supports it). */
function formatMilestone(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 10000) return `${Math.round(n / 1000)}k+`;
  if (n >= 1000) {
    const k = n / 1000;
    const s = k >= 10 ? k.toFixed(0) : k.toFixed(1);
    return `${s.replace(/\.0$/, "")}k+`;
  }
  if (n >= 500) return "500+";
  if (n >= 100) return `${Math.floor(n / 50) * 50}+`;
  return n.toLocaleString();
}

function itemsAvailableLabel(count) {
  if (count == null) return "…";
  if (count === 0) return "No items yet";
  if (count === 1) return "1 item available";
  return `${count} items available`;
}

const ACTIVITY_TICKER_LINES = [
  { text: "Someone saved a Cycle listing", sub: "Moments ago" },
  { text: "A student asked about notes in Electronics", sub: "2 min ago" },
  { text: "Flash sale tag added on a dorm fridge", sub: "8 min ago" },
  { text: "Pickup set near the library entrance", sub: "12 min ago" },
  { text: "New listing: semester bundle under ₹500", sub: "18 min ago" },
];

const SAFE_MEETUP_ZONES = [
  "Main library entrance (daytime)",
  "Student union / common area",
  "Cafeteria patio (busy hours)",
  "Academic block lobby",
  "Sports complex reception",
];

function ActivityTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % ACTIVITY_TICKER_LINES.length), 5500);
    return () => clearInterval(t);
  }, []);
  const line = ACTIVITY_TICKER_LINES[i];
  return (
    <div className="activity-ticker" aria-live="polite">
      <span className="activity-ticker-pulse" aria-hidden />
      <p className="activity-ticker-text">{line.text}</p>
      <span className="activity-ticker-sub">{line.sub}</span>
    </div>
  );
}

const Home = ({ products = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userCanSell = canSell(user?.role);
  const featuredProducts = products.slice(0, 3);

  const [heroQuery, setHeroQuery] = useState("");
  const [heroCategory, setHeroCategory] = useState("");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsLoadFailed, setStatsLoadFailed] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [heroSearchOpen, setHeroSearchOpen] = useState(false);
  const heroSearchRef = useRef(null);

  useEffect(() => {
    if (!heroSearchOpen) return;
    const onDoc = (e) => {
      if (heroSearchRef.current && !heroSearchRef.current.contains(e.target)) {
        setHeroSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [heroSearchOpen]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      try {
        const data = await productService.getStats();
        if (!cancelled) {
          setStats(data);
          setStatsLoadFailed(false);
        }
      } catch {
        if (!cancelled) {
          setStatsLoadFailed(true);
          setStats({
            users: 0,
            activeListings: 0,
            categoryCounts: {},
            recentUsers: [],
            deltas: { usersWeekPct: 0, listingsWeekPct: 0 },
            sparklines: { users: [0, 0, 0, 0, 0, 0, 0], listings: [0, 0, 0, 0, 0, 0, 0] },
          });
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTrendingLoading(true);
      try {
        const data = await productService.list({ limit: 8, sort: "newest" });
        const items = data?.items || [];
        if (!cancelled) setTrendingProducts(Array.isArray(items) ? items : []);
      } catch {
        if (!cancelled) setTrendingProducts([]);
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;
    let cancelled = false;
    (async () => {
      const ids = getRecentProductIds().slice(0, 6);
      if (!ids.length) {
        if (!cancelled) setRecentProducts([]);
        return;
      }
      const items = await Promise.all(
        ids.map((id) => productService.getById(id).catch(() => null))
      );
      if (!cancelled) setRecentProducts(items.filter(Boolean));
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const categoryCounts = stats?.categoryCounts || {};
  const stockedCategories = Object.values(categoryCounts).filter((c) => c > 0).length;
  const usersCount = statsLoading ? null : Number(stats?.users) || 0;
  const listingsCount = statsLoading ? null : Number(stats?.activeListings) || 0;
  const usersText = statsLoading ? "—" : formatMilestone(usersCount);
  const listingsText = statsLoading ? "—" : formatMilestone(listingsCount);

  const onHeroSearch = (e) => {
    e.preventDefault();
    const q = heroQuery.trim();
    const cat = heroCategory.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    const qs = params.toString();
    navigate(qs ? `/products?${qs}` : "/products");
  };

  const trendingDisplay =
    trendingProducts.length > 0 ? trendingProducts : PLACEHOLDER_LISTINGS;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg" aria-hidden />
        <div className="container hero-shell hero-shell--search-first">
          <div className="hero-copy">
            <div className="hero-copy-lead">
              <span className="eyebrow">Peer-to-peer on campus</span>
              <h1 className="hero-title">
                Buy &amp; sell within your campus in minutes.
              </h1>
              <p className="hero-description">
                Find deals fast. Chat instantly. Trade smarter.
              </p>
            </div>

            <div className="hero-search-wrap" ref={heroSearchRef}>
              <form className="hero-search" onSubmit={onHeroSearch} role="search">
                <label htmlFor="hero-search-input" className="visually-hidden">
                  Search listings
                </label>
                <div className="hero-search-main">
                  <div className="hero-search-field">
                    <FiSearch className="hero-search-icon" aria-hidden />
                    <input
                      id="hero-search-input"
                      type="search"
                      value={heroQuery}
                      onChange={(e) => setHeroQuery(e.target.value)}
                      onFocus={() => setHeroSearchOpen(true)}
                      placeholder="Search for books, cycles, electronics..."
                      autoComplete="off"
                      enterKeyHint="search"
                      aria-controls={heroSearchOpen ? "hero-search-suggestions" : undefined}
                    />
                  </div>
                  <div className="hero-search-category-shell">
                    <label htmlFor="hero-category" className="visually-hidden">
                      Category filter
                    </label>
                    <select
                      id="hero-category"
                      className="hero-search-category"
                      value={heroCategory}
                      onChange={(e) => setHeroCategory(e.target.value)}
                      aria-label="Filter by category"
                    >
                      <option value="">All categories</option>
                      {categories.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="hero-search-submit">
                    <FiSearch aria-hidden />
                    <span>Search</span>
                  </button>
                  <Link
                    to={userCanSell ? "/add-product" : "/dashboard"}
                    className="hero-sell-now-btn"
                  >
                    <FiShoppingBag aria-hidden />
                    {userCanSell ? "Sell Now" : "Dashboard"}
                  </Link>
                </div>
              </form>
              {heroSearchOpen ? (
                <div
                  id="hero-search-suggestions"
                  className="hero-search-suggestions"
                  role="listbox"
                  aria-label="Trending searches"
                >
                  <p className="hero-suggestions-label">Trending now</p>
                  <div className="hero-suggestion-tags">
                    {TRENDING_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        className="hero-suggestion-chip"
                        onClick={() => {
                          setHeroQuery(term);
                          navigate(`/products?q=${encodeURIComponent(term)}`);
                          setHeroSearchOpen(false);
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="hero-insights">
              <div className="insight-card">
                <FiClock />
                <div>
                  <strong>Fresh listings first</strong>
                  <span>Newest items surface so you don&apos;t miss deals.</span>
                </div>
              </div>
              <div className="insight-card">
                <FiTrendingUp />
                <div>
                  <strong>Categories that make sense</strong>
                  <span>Notes, gadgets, cycles—pick a lane and start browsing.</span>
                </div>
              </div>
            </div>

            <HeroBrowseSmartRotator />
          </div>

          <aside className="hero-aside" aria-label="Product highlights">
            <HeroLivePreview items={featuredProducts} />

            <div className="hero-benefits-card hero-benefits-card--glass">
              <span className="hero-benefits-kicker">Why it works</span>
              <h2 className="hero-benefits-title">Designed for real campus flow</h2>
              <ul className="hero-benefits-list">
                <li>
                  <FiCheckCircle aria-hidden />
                  <span>Useful categories upfront—no endless scrolling.</span>
                </li>
                <li>
                  <FiCheckCircle aria-hidden />
                  <span>Listings stay easy to scan on phone and laptop.</span>
                </li>
                <li>
                  <FiCheckCircle aria-hidden />
                  <span>Message sellers and agree on meetups in one place.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="trust-section social-proof-section">
        <div className="container">
          <div className="section-heading section-heading-centered">
            <span className="section-kicker">Social proof</span>
            <h2>Students are already using Campus Market</h2>
            <p>
              Real counts from this marketplace—numbers update as more peers join and list
              items.
            </p>
            {statsLoadFailed ? (
              <p className="stats-api-warning" role="status">
                Couldn&apos;t load live stats. The app is calling{" "}
                <code className="stats-api-code">{API_URL}</code>
                {typeof window !== "undefined" &&
                (window.location.hostname === "localhost" ||
                  window.location.hostname === "127.0.0.1") ? (
                  <> (start the backend locally, e.g. port 5001).</>
                ) : (
                  <>
                    . In Vercel → Project → Settings → Environment Variables, set{" "}
                    <code className="stats-api-code">REACT_APP_API_URL</code> to your live API
                    base (must end with <code className="stats-api-code">/api</code>, e.g.{" "}
                    <code className="stats-api-code">https://your-service.run.app/api</code>),
                    then redeploy. Until then, zeros are placeholders—not your real database.
                  </>
                )}
              </p>
            ) : null}
            {!statsLoading ? <ActivityTicker /> : null}
          </div>

          <div className="social-proof-grid">
            {statsLoading ? (
              <>
                <div className="social-proof-skeleton" aria-hidden />
                <div className="social-proof-skeleton" aria-hidden />
                <div className="social-proof-skeleton" aria-hidden />
              </>
            ) : (
              <>
                <article className="social-proof-card social-proof-card--dense">
                  <div className="social-proof-card-top">
                    <div className="social-proof-icon" aria-hidden>
                      <FiUsers />
                    </div>
                    <DeltaBadge pct={stats?.deltas?.usersWeekPct} />
                  </div>
                  <div className="social-proof-main-row">
                    <p className="social-proof-value">{usersText}</p>
                    <div className="avatar-stack" aria-hidden>
                      {paddedAvatars(stats?.recentUsers).map((u, idx) => (
                        <span
                          key={`${u.name}-${idx}`}
                          className="avatar-bubble"
                          style={{ zIndex: 6 - idx }}
                          title={u.name}
                        >
                          {initialsFromName(u.name)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="social-proof-label">Students joined</p>
                  <p className="social-proof-hint">Recent sign-ups on the platform</p>
                  {!statsLoading && usersCount === 0 ? (
                    <Link to="/signup" className="social-proof-cta">
                      Be the first student to join
                    </Link>
                  ) : null}
                  <div className="social-proof-spark">
                    <MiniSparkline values={stats?.sparklines?.users} color="#6366f1" height={32} />
                    <span className="spark-caption">New students · last 7 days</span>
                  </div>
                </article>
                <article className="social-proof-card social-proof-card--dense">
                  <div className="social-proof-card-top">
                    <div className="social-proof-icon" aria-hidden>
                      <FiShoppingBag />
                    </div>
                    <DeltaBadge pct={stats?.deltas?.listingsWeekPct} />
                  </div>
                  <p className="social-proof-value">{listingsText}</p>
                  <p className="social-proof-label">Live listings</p>
                  <p className="social-proof-hint">Active items you can browse today</p>
                  {!statsLoading && listingsCount === 0 ? (
                    <Link
                      to={userCanSell ? "/add-product" : "/products"}
                      className="social-proof-cta"
                    >
                      {userCanSell ? "List something and seed the marketplace" : "Browse the marketplace"}
                    </Link>
                  ) : null}
                  <div className="social-proof-spark">
                    <MiniSparkline values={stats?.sparklines?.listings} color="#8b5cf6" height={32} />
                    <span className="spark-caption">New listings · last 7 days</span>
                  </div>
                </article>
                <article className="social-proof-card social-proof-card--dense">
                  <div className="social-proof-card-top">
                    <div className="social-proof-icon" aria-hidden>
                      <FiLayers />
                    </div>
                  </div>
                  <p className="social-proof-value">
                    {stats != null && !statsLoading
                      ? stockedCategories > 0
                        ? stockedCategories
                        : "—"
                      : "—"}
                  </p>
                  <p className="social-proof-label">Categories with items</p>
                  <p className="social-proof-hint">From notes to electronics and more</p>
                  <div className="social-proof-spark social-proof-spark--muted">
                    {!statsLoading && stockedCategories === 0 ? (
                      <Link
                        to={userCanSell ? "/add-product" : "/products"}
                        className="social-proof-cta social-proof-cta--inline"
                      >
                        {userCanSell
                          ? "Be the first to list something here"
                          : "Browse listings by category"}
                      </Link>
                    ) : (
                      <p className="social-proof-mini-copy">
                        More categories fill in as peers post what they&apos;re selling.
                      </p>
                    )}
                  </div>
                </article>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="home-trending-section" aria-labelledby="trending-heading">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Trending</span>
              <h2 id="trending-heading">Recently added</h2>
              <p className="home-trending-lead">
                New listings from campus—save what you like and chat before someone else grabs it.
              </p>
            </div>
            <Link to="/products?sort=newest" className="view-all">
              View all new <FiArrowRight aria-hidden />
            </Link>
          </div>
          <div className="products-grid products-grid--trending">
            {trendingLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="home-trending-skeleton" aria-hidden />
                ))}
              </>
            ) : (
              trendingDisplay.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))
            )}
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
            {categories.map((category) => {
              const count = categoryCounts[category.name] ?? 0;
              return (
                <div className="category-cell" key={category.name}>
                  <Link
                    className="category-card"
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                  >
                    <span className="category-icon-flat">
                      <CategoryFlatIcon name={category.name} />
                    </span>
                    <div className="category-text">
                      <h3>{category.name}</h3>
                      {count > 0 ? (
                        <p className="category-count">{itemsAvailableLabel(count)}</p>
                      ) : (
                        <>
                          <div className="category-availability-skeleton" aria-hidden>
                            <span className="category-skel-bar category-skel-bar--long" />
                            <span className="category-skel-bar category-skel-bar--short" />
                          </div>
                          <p className="category-pulse-hint">
                            Nothing listed here yet—be the first.
                          </p>
                          <Link
                            to={
                              userCanSell
                                ? `/add-product?category=${encodeURIComponent(category.name)}`
                                : "/products"
                            }
                            className="category-first-list-cta"
                          >
                            {userCanSell ? `List in ${category.name}` : `Browse ${category.name}`}
                          </Link>
                        </>
                      )}
                      <p className="category-desc">{category.description}</p>
                    </div>
                    <span className="category-arrow">
                      <FiArrowRight />
                    </span>
                  </Link>
                  {count === 0 ? <CategoryNotifyRow categoryName={category.name} /> : null}
                </div>
              );
            })}
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
                <Link
                  to={userCanSell ? "/add-product" : "/products"}
                  className="btn btn-primary empty-state-cta"
                >
                  {userCanSell ? "Be the first to list something" : "Browse the marketplace"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {recentProducts.length > 0 ? (
        <section className="recent-section" aria-labelledby="recent-heading">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Keep browsing</span>
                <h2 id="recent-heading">Recently viewed</h2>
                <p className="recent-section-lead">
                  Pick up where you left off—watch for price drops on items you care about.
                </p>
              </div>
              <Link to="/products" className="view-all">
                Marketplace <FiArrowRight />
              </Link>
            </div>
            <div className="products-grid products-grid--recent">
              {              recentProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

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

      <section className="meetup-zones-section" aria-labelledby="meetup-heading">
        <div className="container">
          <div className="meetup-zones-inner">
            <span className="section-kicker">Safe exchanges</span>
            <h2 id="meetup-heading">Suggested meetup spots on campus</h2>
            <p className="meetup-zones-lead">
              Step 3 is easier when you agree on a busy, public place first—daytime is best.
            </p>
            <ul className="meetup-zones-list">
              {SAFE_MEETUP_ZONES.map((spot) => (
                <li key={spot}>{spot}</li>
              ))}
            </ul>
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
              <Link
                to={userCanSell ? "/add-product" : "/dashboard"}
                className="btn btn-secondary"
              >
                <FiShoppingBag />
                {userCanSell ? "Sell an item" : "Open dashboard"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
