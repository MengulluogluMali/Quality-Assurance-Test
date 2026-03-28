const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

// Homepage / Shop
router.get('/', async (req, res) => {
  try {
    const categories = await productService.getCategories();
    const featured = await productService.getAllProducts({ limit: 8 });
    res.render('shop/index', {
      title: 'MobileGear — Premium Mobile Accessories',
      products: featured,
      categories,
      selectedCategory: null,
      search: '',
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
  }
});

// Shop with filters
router.get('/shop', async (req, res) => {
  try {
    const { category, search } = req.query;
    const categories = await productService.getCategories();
    const products = await productService.getAllProducts({ category, search });
    res.render('shop/index', {
      title: category ? `${category} — MobileGear` : 'Shop All — MobileGear',
      products,
      categories,
      selectedCategory: category || null,
      search: search || '',
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
  }
});

// Product detail
router.get('/shop/:id', async (req, res) => {
  try {
    const product = await productService.getProductById(parseInt(req.params.id));
    if (!product) {
      return res.status(404).render('error', { title: 'Not Found', message: 'Product not found', layout: 'layouts/main' });
    }
    const related = await productService.getAllProducts({ category: product.category, limit: 4 });
    res.render('shop/product', {
      title: `${product.name} — MobileGear`,
      product,
      related: related.filter(p => p.id !== product.id).slice(0, 3),
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
  }
});

module.exports = router;
