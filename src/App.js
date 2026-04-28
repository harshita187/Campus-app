import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatNotificationProvider } from "./context/ChatNotificationContext";
import Header from "./components/Header";
import ChatFab from "./components/ChatFab";
import Home from "./components/Home";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import ProductDetail from "./components/ProductDetail";
import WishlistPage from "./components/WishlistPage";
import ChatPage from "./components/ChatPage";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { productService } from "./services/productService";
import "./App.css";

function ChatFabGate() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <ChatFab />;
}

function App() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const refetchFeatured = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFeaturedProducts([]);
      return;
    }
    try {
      const data = await productService.list({ limit: 3, sort: "newest" });
      setFeaturedProducts(data.items || []);
    } catch (_error) {
      setFeaturedProducts([]);
    }
  }, []);

  useEffect(() => {
    refetchFeatured();
  }, [refetchFeatured]);

  useEffect(() => {
    const onDeleted = () => refetchFeatured();
    window.addEventListener("campus:product-deleted", onDeleted);
    return () => window.removeEventListener("campus:product-deleted", onDeleted);
  }, [refetchFeatured]);

  return (
    <AuthProvider>
      <Router>
        <ChatNotificationProvider>
          <div className="App">
            <Header />
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home products={featuredProducts} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <ProductList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-product"
                element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-product/:id"
                element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/product/:productId"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <Home products={featuredProducts} />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <ChatFabGate />
          </div>
        </ChatNotificationProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
