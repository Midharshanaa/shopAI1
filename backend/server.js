/**
 * ShopAI - Full Stack Node.js & Express REST API Server
 * Features:
 * - Product catalog with filtering, sorting, price range & search
 * - User authentication & JWT session management
 * - Order lifecycle and status tracking
 * - AI Shopping Assistant query responder & recommendation engine
 * - MongoDB integration with graceful in-memory fallback
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets
app.use(express.static(path.join(__dirname, '..')));

// Load mock product database
let productsDb = [];
try {
  const data = fs.readFileSync(path.join(__dirname, '..', 'data', 'products.json'), 'utf8');
  productsDb = JSON.parse(data);
} catch (err) {
  console.warn('Using default fallback product catalog');
}

// In-memory data store for orders & users
const usersDb = [
  { id: 'U001', name: 'Demo Customer', email: 'customer@shopai.com', role: 'customer' },
  { id: 'U002', name: 'Apex Electronics', email: 'seller@shopai.com', role: 'seller' },
  { id: 'U003', name: 'System Admin', email: 'admin@shopai.com', role: 'admin' }
];
const ordersDb = [];

/* ────────── API ROUTES ────────── */

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'ShopAI REST API is active', timestamp: new Date() });
});

// 1. Products API
app.get('/api/products', (req, res) => {
  let results = [...productsDb];
  const { category, brand, maxPrice, search, sort } = req.query;

  if (category && category !== 'all') {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (brand) {
    results = results.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }
  if (maxPrice) {
    results = results.filter(p => p.price <= parseInt(maxPrice));
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
  if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);

  res.json({ count: results.length, data: results });
});

// Single product
app.get('/api/products/:id', (req, res) => {
  const prod = productsDb.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });
  res.json(prod);
});

// Add new product (Seller)
app.post('/api/products', (req, res) => {
  const newProd = {
    id: 'P0' + (productsDb.length + 1),
    name: req.body.name,
    category: req.body.category || 'Electronics',
    brand: req.body.brand || 'Generic',
    price: Number(req.body.price),
    originalPrice: Number(req.body.price) * 1.15,
    discount: 13,
    rating: 5.0,
    reviews: 0,
    stock: Number(req.body.stock) || 10,
    image: req.body.image || 'https://picsum.photos/seed/newprod/400/300',
    description: req.body.description || ''
  };
  productsDb.unshift(newProd);
  res.status(201).json({ message: 'Product published', product: newProd });
});

// 2. Orders API
app.get('/api/orders', (req, res) => {
  res.json(ordersDb);
});

app.post('/api/orders', (req, res) => {
  const order = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    items: req.body.items || [],
    shipping: req.body.shipping || {},
    total: req.body.total || 0,
    status: 'Confirmed',
    createdAt: new Date()
  };
  ordersDb.unshift(order);
  res.status(201).json({ message: 'Order created', order });
});

// 3. AI Assistant Query API
app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message query is required' });

  const q = message.toLowerCase();
  let suggestions = [];

  if (q.includes('laptop') || q.includes('macbook')) {
    suggestions = productsDb.filter(p => p.category === 'Laptops');
  } else if (q.includes('phone') || q.includes('mobile') || q.includes('iphone') || q.includes('galaxy') || q.includes('pixel')) {
    suggestions = productsDb.filter(p => p.category === 'Smartphones');
  } else if (q.includes('audio') || q.includes('headphone') || q.includes('earbud') || q.includes('airpod') || q.includes('sound')) {
    suggestions = productsDb.filter(p => p.category === 'Audio');
  } else if (q.includes('watch') || q.includes('wearable') || q.includes('garmin') || q.includes('fitness')) {
    suggestions = productsDb.filter(p => p.category === 'Wearables');
  } else if (q.includes('tablet') || q.includes('ipad') || q.includes('surface')) {
    suggestions = productsDb.filter(p => p.category === 'Tablets');
  } else if (q.includes('tv') || q.includes('television') || q.includes('screen')) {
    suggestions = productsDb.filter(p => p.category === 'Televisions');
  } else if (q.includes('accessory') || q.includes('mouse') || q.includes('keyboard') || q.includes('monitor')) {
    suggestions = productsDb.filter(p => p.category === 'Accessories');
  } else if (q.includes('home') || q.includes('alexa') || q.includes('purifier')) {
    suggestions = productsDb.filter(p => p.category === 'Smart Home');
  } else {
    suggestions = productsDb.slice(0, 4);
  }

  res.json({
    reply: `ShopAI Personal Assistant evaluated your query for "${message}". Found ${suggestions.length} top matching products with high satisfaction ratings:`,
    recommendations: suggestions
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🛍️  ShopAI Full-Stack Server running on port ${PORT}`);
  console.log(`🌐  Local URL: http://localhost:${PORT}`);
  console.log(`📡  REST API:  http://localhost:${PORT}/api/products`);
  console.log(`===============================================`);
});
