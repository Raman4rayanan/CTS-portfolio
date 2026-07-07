require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import databases to trigger connections
require('./config/db');

// Import Route Handlers
const portfolioRoutes = require('./routes/portfolio');
const ecommRoutes = require('./routes/ecomm');
const ecommConfigRoutes = require('./routes/ecommConfig');
const adminRoutes = require('./routes/admin');
const customerAuthRoutes = require('./routes/customerAuth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ecomm/config', ecommConfigRoutes);
app.use('/api/ecomm', ecommRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerAuthRoutes);

// Fallback Route
app.get('/', (req, res) => {
  res.json({
    message: 'CTS segregated multi-database API is active.',
    databases: ['cts_portfolio', 'cts_ecomm', 'cts_admin']
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(` CTS Backend Server running on Port ${PORT}`);
  console.log(` Mode: Development`);
  console.log(`========================================`);
});

// Auto-restart trigger comment

