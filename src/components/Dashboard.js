import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiArrowRight,
  FiHeart,
  FiHome,
  FiList,
  FiMessageCircle,
  FiPlus,
  FiShoppingBag,
  FiTag,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { canBuy, canSell, isBuyerOnly } from "../utils/roleHelpers";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const flash = location.state?.message;

  const role = user?.role || "both";
  const showBuy = canBuy(role);
  const showSell = canSell(role);

  return (
    <div className="dashboard-page">
      <div className="container dashboard-inner">
        <header className="dashboard-header">
          <p className="dashboard-kicker">Your space</p>
          <h1>Dashboard</h1>
          <p className="dashboard-lead">
            {isBuyerOnly(role)
              ? "You signed up as a buyer—browse, save, and chat. Create a new account as Seller or Both if you also want to list items."
              : role === "seller"
                ? "Seller tools: manage listings and stay on top of buyer messages."
                : "Buying and selling—pick a lane below whenever you need it."}
          </p>
          {user?.campusName ? (
            <p className="dashboard-campus">
              <FiTag aria-hidden /> Campus on file: <strong>{user.campusName}</strong>
            </p>
          ) : null}
          {flash ? (
            <p className="dashboard-flash" role="status">
              {flash}
            </p>
          ) : null}
        </header>

        <div className={`dashboard-grid ${showBuy && showSell ? "dashboard-grid--both" : ""}`}>
          {showBuy ? (
            <section className="dashboard-panel dashboard-panel--buy" aria-labelledby="dash-buy">
              <h2 id="dash-buy" className="dashboard-panel-title">
                <FiShoppingBag aria-hidden /> Buying
              </h2>
              <p className="dashboard-panel-desc">
                Discover listings, save favourites, and message sellers before you meet.
              </p>
              <ul className="dashboard-links">
                <li>
                  <Link to="/products" className="dashboard-link">
                    Browse marketplace <FiArrowRight aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="dashboard-link">
                    Saved (wishlist) <FiHeart aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link to="/chat" className="dashboard-link">
                    Messages <FiMessageCircle aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link to="/" className="dashboard-link">
                    Home <FiHome aria-hidden />
                  </Link>
                </li>
              </ul>
            </section>
          ) : null}

          {showSell ? (
            <section className="dashboard-panel dashboard-panel--sell" aria-labelledby="dash-sell">
              <h2 id="dash-sell" className="dashboard-panel-title">
                <FiTag aria-hidden /> Selling
              </h2>
              <p className="dashboard-panel-desc">
                Post items, edit your listings, and track interest from buyers on campus.
              </p>
              <ul className="dashboard-links">
                <li>
                  <Link to="/add-product" className="dashboard-link dashboard-link--primary">
                    Post an item <FiPlus aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link to="/products?mine=1" className="dashboard-link">
                    My listings <FiList aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="dashboard-link">
                    Browse marketplace <FiArrowRight aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link to="/chat" className="dashboard-link">
                    Buyer chats <FiMessageCircle aria-hidden />
                  </Link>
                </li>
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
