import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isBuyerOnly } from '../utils/roleHelpers';
import { productService } from '../services/productService';
import { uploadService } from '../services/uploadService';
import { resolveListingImageUrl } from "../utils/listingImageUrl";
import './AddProduct.css';

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'><rect width='640' height='420' fill='%23eef2ff'/><rect x='210' y='130' width='220' height='140' rx='16' fill='%23c7d2fe'/><text x='320' y='305' text-anchor='middle' fill='%23475569' font-family='Arial' font-size='24'>No Image</text></svg>";

const CATEGORIES = ['Notes', 'Cycle', 'Dress', 'Cooler', 'Electronics', 'Furniture', 'Others'];

const PICKUP_SUGGESTIONS = [
  'Hostel 4',
  'Hostel 7',
  'Library pickup',
  'Main gate',
  'Food court',
  'Academic block',
  'On campus (confirm with seller)',
];

/** Map listing-urgency field (preset labels or free text) to stored urgency + optional note. */
function parseUrgencyInput(input) {
  const raw = (input || '').trim();
  if (!raw) return { urgency: 'none', urgencyNote: '' };
  const lower = raw.toLowerCase();
  if (lower === 'none' || lower === 'no urgency tag' || lower === 'no urgency') {
    return { urgency: 'none', urgencyNote: '' };
  }
  if (lower === 'moving_out' || lower === 'moving out soon') {
    return { urgency: 'moving_out', urgencyNote: '' };
  }
  if (lower === 'flash_sale' || lower === 'flash sale') {
    return { urgency: 'flash_sale', urgencyNote: '' };
  }
  return { urgency: 'none', urgencyNote: raw.slice(0, 120) };
}

const PRODUCT_CONDITIONS = [
  'Brand New',
  'Open Box',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'Heavily Used',
];

const AddProduct = () => {
  const navigate = useNavigate();
  const { id: editProductId } = useParams();
  const isEdit = Boolean(editProductId);
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const categoryFromUrl = searchParams.get('category')?.trim() || '';
  const initialCategory =
    categoryFromUrl.length >= 2 && categoryFromUrl.length <= 40 ? categoryFromUrl : 'Notes';

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: initialCategory,
    condition: 'Good',
    description: '',
    seller: '',
    contact: '',
    pickupLocation: '',
    negotiable: true,
    urgencyInput: 'No urgency tag',
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [editHydrating, setEditHydrating] = useState(isEdit);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        seller: user.name || '',
        contact: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (isEdit) return;
    if (user && isBuyerOnly(user.role)) {
      navigate("/dashboard", {
        replace: true,
        state: {
          message:
            "Buyer accounts cannot post listings. Sign up as Seller or Both to sell on Campus Market.",
        },
      });
    }
  }, [authLoading, isEdit, user, navigate]);

  useEffect(() => {
    if (isEdit) return;
    if (categoryFromUrl.length >= 2 && categoryFromUrl.length <= 40) {
      setFormData((prev) => ({ ...prev, category: categoryFromUrl }));
    }
  }, [isEdit, categoryFromUrl]);

  useEffect(() => {
    if (!isEdit) {
      setEditHydrating(false);
      return;
    }
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    let cancelled = false;
    (async () => {
      setEditHydrating(true);
      try {
        const data = await productService.getById(editProductId);
        const uid = user._id ?? user.id;
        const sid = data.sellerId?._id ?? data.sellerId;
        if (String(sid) !== String(uid)) {
          navigate("/products");
          return;
        }
        if (cancelled) return;
        setFormData((prev) => {
          const note = typeof data.urgencyNote === "string" ? data.urgencyNote.trim() : "";
          let urgencyInput = "No urgency tag";
          if (note) urgencyInput = note;
          else if (data.urgency === "moving_out") urgencyInput = "Moving out soon";
          else if (data.urgency === "flash_sale") urgencyInput = "Flash sale";
          return {
            ...prev,
            title: data.title || "",
            price: data.price != null ? String(data.price) : "",
            category: (data.category && String(data.category).trim()) || prev.category,
            condition: (data.condition && String(data.condition).trim()) || prev.condition,
            description: data.description || "",
            seller: user.name || "",
            contact: user.email || "",
            pickupLocation: typeof data.pickupLocation === "string" ? data.pickupLocation : "",
            negotiable: data.negotiable !== false,
            urgencyInput,
            images: Array.isArray(data.images) ? data.images : [],
          };
        });
      } catch {
        navigate("/products");
      } finally {
        if (!cancelled) setEditHydrating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEdit, editProductId, user, authLoading, navigate]);
  /** Local blob URLs so preview updates immediately while upload runs */
  const [localPreviewUrls, setLocalPreviewUrls] = useState([]);
  const localPreviewUrlsRef = useRef([]);

  const revokePreviewUrls = useCallback((urls) => {
    urls.forEach((u) => {
      if (u && u.startsWith('blob:')) URL.revokeObjectURL(u);
    });
  }, []);

  useEffect(() => {
    localPreviewUrlsRef.current = localPreviewUrls;
  }, [localPreviewUrls]);

  useEffect(() => {
    return () => revokePreviewUrls(localPreviewUrlsRef.current);
  }, [revokePreviewUrls]);

  const getResolvedImage = (src) => {
    const u = resolveListingImageUrl(src);
    return u || FALLBACK_IMAGE;
  };

  const conditions = PRODUCT_CONDITIONS;
  const urgencySuggestions = ['No urgency tag', 'Moving out soon', 'Flash sale'];

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
    const cat = formData.category.trim();
    if (cat.length < 2) newErrors.category = 'Category must be at least 2 characters';
    if (cat.length > 40) newErrors.category = 'Category must be at most 40 characters';
    const cond = formData.condition.trim();
    if (cond.length < 2) newErrors.condition = 'Condition must be at least 2 characters';
    if (cond.length > 40) newErrors.condition = 'Condition must be at most 40 characters';
    const pick = (formData.pickupLocation || '').trim();
    if (pick.length > 80) newErrors.pickupLocation = 'Pickup / meet point: max 80 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.images || formData.images.length === 0) newErrors.images = 'At least one image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const picked = files.slice(0, 5);
    const nextBlobs = picked.map((file) => URL.createObjectURL(file));
    setLocalPreviewUrls((prev) => {
      revokePreviewUrls(prev);
      return nextBlobs;
    });

    setUploading(true);
    setErrors((prev) => ({ ...prev, images: '' }));
    try {
      const uploaded = [];
      for (const file of picked) {
        const result = await uploadService.uploadImage(file);
        uploaded.push(result.url);
      }

      setLocalPreviewUrls((prev) => {
        revokePreviewUrls(prev);
        return [];
      });
      setFormData((prev) => ({
        ...prev,
        images: isEdit
          ? [...(prev.images || []), ...uploaded].slice(0, 5)
          : uploaded,
      }));
    } catch (error) {
      const status = error.response?.status;
      let msg =
        error.response?.data?.message ||
        error.message ||
        "Image upload failed — check that the API is running (e.g. port 5001).";
      if (status === 404) {
        msg =
          "Upload URL returned 404 — redeploy the latest backend (upload routes) or ask your host if /api is stripped from paths.";
      }
      setErrors((prev) => ({
        ...prev,
        images: msg,
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const { seller, contact, urgencyInput, ...rest } = formData;
        const { urgency, urgencyNote } = parseUrgencyInput(urgencyInput);
        const pickupTrim = (formData.pickupLocation || "").trim().slice(0, 80);
        const categoryTrim = formData.category.trim();
        const conditionTrim = formData.condition.trim();
        const payloadBase = {
          ...rest,
          category: categoryTrim,
          condition: conditionTrim,
          price: parseFloat(formData.price),
          pickupLocation: pickupTrim,
          negotiable: formData.negotiable,
          urgency,
          urgencyNote: urgencyNote || "",
        };
        if (isEdit) {
          await productService.update(editProductId, payloadBase);
          alert("Listing updated.");
          navigate(`/product/${editProductId}`);
        } else {
          await productService.create({
            ...payloadBase,
            pickupLocation: pickupTrim || undefined,
          });
          alert("Product listed successfully!");
          navigate("/products");
        }
      } catch (error) {
        alert(
          error.response?.data?.message ||
            (isEdit ? "Failed to update listing" : "Failed to create product")
        );
      }
    }
  };

  if (isEdit && (authLoading || editHydrating)) {
    return (
      <div className="add-product">
        <div className="container">
          <p className="edit-loading-msg">Loading your listing…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-product">
      <div className="container">
        <div className="page-header">
          <h1>{isEdit ? "Edit your listing" : "List Your Product"}</h1>
          <p>
            {isEdit
              ? "Update details or photos — changes save to the same listing."
              : "Share your items with fellow students and make some extra money"}
          </p>
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
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  list="addproduct-dl-category"
                  placeholder="e.g. Notes — or type your own"
                  maxLength={40}
                  autoComplete="off"
                  className={errors.category ? 'error' : ''}
                />
                <datalist id="addproduct-dl-category">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <span className="field-hint">Pick a suggestion or type any category (2–40 characters).</span>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="condition">Condition *</label>
                <input
                  type="text"
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  list="addproduct-dl-condition"
                  placeholder="e.g. Good — or describe your own"
                  maxLength={40}
                  autoComplete="off"
                  className={errors.condition ? 'error' : ''}
                />
                <datalist id="addproduct-dl-condition">
                  {conditions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <span className="field-hint">Suggestions from the list or your own wording.</span>
                {errors.condition && <span className="error-message">{errors.condition}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="urgencyInput">Listing urgency (optional)</label>
                <input
                  type="text"
                  id="urgencyInput"
                  name="urgencyInput"
                  value={formData.urgencyInput}
                  onChange={handleChange}
                  list="addproduct-dl-urgency"
                  placeholder="Preset or your own short tag"
                  maxLength={120}
                  autoComplete="off"
                />
                <datalist id="addproduct-dl-urgency">
                  {urgencySuggestions.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
                <span className="field-hint">
                  Choose a preset, or type a custom line (shows on your listing when not a preset).
                </span>
              </div>
              <div className="form-group">
                <label htmlFor="pickupLocation">Pickup / meet point</label>
                <input
                  type="text"
                  id="pickupLocation"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  list="addproduct-dl-pickup"
                  placeholder="Leave blank for not specified, or type a spot"
                  maxLength={80}
                  autoComplete="off"
                  className={errors.pickupLocation ? 'error' : ''}
                />
                <datalist id="addproduct-dl-pickup">
                  {PICKUP_SUGGESTIONS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
                <span className="field-hint">Campus spots — or any short meet-up detail.</span>
                {errors.pickupLocation && <span className="error-message">{errors.pickupLocation}</span>}
              </div>
              <div className="form-group form-group-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="negotiable"
                    checked={formData.negotiable}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, negotiable: e.target.checked }))
                    }
                  />
                  Price is negotiable
                </label>
              </div>
            </div>

            <div className="form-group form-group-description">
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
            <div className="form-group form-group-file">
              <label htmlFor="images">Product Images *</label>
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="input-file-native"
              />
              <span className="upload-hint">
                {isEdit
                  ? "Add more photos (up to 5 total) — new uploads are appended to your existing images."
                  : "Upload up to 5 images, max 15MB each. Preview appears as soon as you pick files; we then upload them to the server."}
              </span>
              {uploading && <span className="upload-status">Uploading to server…</span>}
              {errors.images && <span className="error-message">{errors.images}</span>}
            </div>
            <div className="product-preview">
              <div className="preview-image">
                {localPreviewUrls[0] || formData.images[0] ? (
                  <img
                    src={localPreviewUrls[0] || getResolvedImage(formData.images[0])}
                    alt="Product preview"
                    onError={(ev) => {
                      ev.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                ) : (
                  <div className="preview-image-empty">
                    <span>Choose photos above to see preview</span>
                  </div>
                )}
                {localPreviewUrls.length > 1 ? (
                  <div className="preview-thumb-strip" aria-hidden>
                    {localPreviewUrls.slice(1, 5).map((url) => (
                      <span key={url} className="preview-thumb-mini">
                        <img src={url} alt="" />
                      </span>
                    ))}
                  </div>
                ) : formData.images.length > 1 && !localPreviewUrls.length ? (
                  <div className="preview-thumb-strip" aria-hidden>
                    {formData.images.slice(1, 5).map((src) => (
                      <span key={src} className="preview-thumb-mini">
                        <img src={getResolvedImage(src)} alt="" />
                      </span>
                    ))}
                  </div>
                ) : null}
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
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/product/${editProductId}` : "/products")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? "Please wait…" : isEdit ? "Save changes" : "List Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;