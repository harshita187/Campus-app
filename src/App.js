import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Home from "./components/Home";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import ProductDetail from "./components/ProductDetail";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  const [products, setProducts] = useState([
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
      images: ["https://via.placeholder.com/400x300?text=Textbooks"],
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
      images: ["https://via.placeholder.com/400x300?text=Bike"],
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
      images: ["https://via.placeholder.com/400x300?text=Kurta"],
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
      images: ["https://via.placeholder.com/400x300?text=Fridge"],
      datePosted: "2025-05-30",
    },
  ]);

  const addProduct = (newProduct) => {
    const product = {
      ...newProduct,
      id: Date.now(),
      datePosted: new Date().toISOString().split("T")[0],
    };
    setProducts([product, ...products]);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home products={products} />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/add-product"
              element={
                <ProtectedRoute>
                  <AddProduct onAddProduct={addProduct} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/:id"
              element={<ProductDetail products={products} />}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
