import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Home from "./components/Home";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import ProductDetail from "./components/ProductDetail";
import ChatPage from "./components/ChatPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { productService } from "./services/productService";
import "./App.css";

function App() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const loadFeatured = async () => {
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
    };
    loadFeatured();
  }, []);

  return (
    <AuthProvider>
      <Router>
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/add-product"
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
