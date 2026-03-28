function validateRegistration(req, res, next) {
  const { name, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (errors.length > 0) {
    return res.status(400).render('auth/register', {
      title: 'Register',
      errors,
      name,
      email,
      layout: 'layouts/main'
    });
  }
  next();
}

function validateProduct(req, res, next) {
  const { name, description, price, category, stock } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Product name is required');
  }
  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    errors.push('Price must be a positive number');
  }
  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }
  if (stock === undefined || isNaN(stock) || parseInt(stock) < 0) {
    errors.push('Stock must be a non-negative number');
  }

  if (errors.length > 0) {
    req.validationErrors = errors;
  }
  next();
}

module.exports = { validateRegistration, validateProduct };
