import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AddProduct.css';

const AddProduct = ({ onAddProduct }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Notes',
    condition: 'Good',
    description: '',
    seller: '',
    contact: '',
    images: ['https://via.placeholder.com/400x300?text=Product+Image']
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        seller: user.name || '',
        contact: user.email || ''
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState({});

  const categories = ['Notes', 'Cycle', 'Dress', 'Cooler', 'Electronics', 'Others'];
  const conditions = ['Like New', 'Excellent', 'Good', 'Fair'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddProduct({
        ...formData,
        price: parseFloat(formData.price)
      });
      
      // Show success message and redirect
      alert('Product listed successfully!');
      navigate('/products');
    }
  };

  return (
    <div className="add-product">
      <div className="container">
        <div className="page-header">
          <h1>List Your Product</h1>
          <p>Share your items with fellow students and make some extra money</p>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="title">Product Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Engineering Textbooks Set"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (₹) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={errors.price ? 'error' : ''}
                />
                {errors.price && <span className="error-message">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="condition">Condition *</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                >
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product in detail..."
                rows="4"
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2>Contact Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="seller">Your Name</label>
                <input
                  type="text"
                  id="seller"
                  name="seller"
                  value={formData.seller}
                  onChange={handleChange}
                  placeholder="Your full name"
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact">Contact Email</label>
                <input
                  type="email"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="your.email@college.edu"
                  readOnly
                  className="readonly-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Product Preview</h2>
            <div className="product-preview">
              <div className="preview-image">
                <img src={formData.images[0]} alt="Product preview" />
              </div>
              <div className="preview-info">
                <h3>{formData.title || 'Product Title'}</h3>
                <div className="preview-price">₹{formData.price || 0}</div>
                <div className="preview-category">{formData.category}</div>
                <div className="preview-condition">Condition: {formData.condition}</div>
                <p>{formData.description || 'Product description will appear here...'}</p>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              List Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;