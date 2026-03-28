const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');
const productService = require('../services/productService');
const orderService = require('../services/orderService');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'public', 'images', 'products');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `product-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Admin dashboard
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const stats = await orderService.getAdminStats();
    res.render('admin/dashboard', {
      title: 'Admin Dashboard — MobileGear',
      stats,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
  }
});

// Product list
router.get('/products', requireAuth, requireAdmin, async (req, res) => {
  try {
    const products = await productService.getAllProductsAdmin();
    res.render('admin/products', {
      title: 'Manage Products — MobileGear',
      products,
      success: req.query.success || null,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
  }
});

// New product form
router.get('/products/new', requireAuth, requireAdmin, (req, res) => {
  res.render('admin/product-form', {
    title: 'Add Product — MobileGear',
    product: null,
    errors: [],
    layout: 'layouts/main'
  });
});

// Create product
router.post('/products', requireAuth, requireAdmin, upload.single('image'), validateProduct, async (req, res) => {
  try {
    if (req.validationErrors) {
      return res.status(400).render('admin/product-form', {
        title: 'Add Product — MobileGear',
        product: req.body,
        errors: req.validationErrors,
        layout: 'layouts/main'
      });
    }

    const data = {
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      price: req.body.price,
      category: req.body.category.trim(),
      stock: req.body.stock,
      image_url: req.file ? `/images/products/${req.file.filename}` : '/images/placeholder.png'
    };

    await productService.createProduct(data);
    res.redirect('/admin/products?success=Product created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/product-form', {
      title: 'Add Product — MobileGear',
      product: req.body,
      errors: ['An error occurred. Please try again.'],
      layout: 'layouts/main'
    });
  }
});

// Edit product form
router.get('/products/:id/edit', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await productService.getProductById(parseInt(req.params.id));
    if (!product) return res.status(404).render('error', { title: 'Not Found', message: 'Product not found', layout: 'layouts/main' });

    res.render('admin/product-form', {
      title: 'Edit Product — MobileGear',
      product,
      errors: [],
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
  }
});

// Update product
router.post('/products/:id', requireAuth, requireAdmin, upload.single('image'), validateProduct, async (req, res) => {
  try {
    const existing = await productService.getProductById(parseInt(req.params.id));
    if (!existing) return res.status(404).render('error', { title: 'Not Found', message: 'Product not found', layout: 'layouts/main' });

    if (req.validationErrors) {
      return res.status(400).render('admin/product-form', {
        title: 'Edit Product — MobileGear',
        product: { ...existing, ...req.body },
        errors: req.validationErrors,
        layout: 'layouts/main'
      });
    }

    const data = {
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      price: req.body.price,
      category: req.body.category.trim(),
      stock: req.body.stock,
      image_url: req.file ? `/images/products/${req.file.filename}` : existing.image_url,
      is_active: req.body.is_active === 'on' || req.body.is_active === '1' ? 1 : 0
    };

    await productService.updateProduct(parseInt(req.params.id), data);
    res.redirect('/admin/products?success=Product updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
  }
});

// Delete product
router.post('/products/:id/delete', requireAuth, requireAdmin, async (req, res) => {
  try {
    await productService.deleteProduct(parseInt(req.params.id));
    res.redirect('/admin/products?success=Product deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
  }
});

// Orders list
router.get('/orders', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.render('admin/orders', {
      title: 'Orders — MobileGear',
      orders,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
  }
});

module.exports = router;
