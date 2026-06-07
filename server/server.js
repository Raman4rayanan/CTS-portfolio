require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import databases to trigger connections
require('./config/db');

// Import Route Handlers
const portfolioRoutes = require('./routes/portfolio');
const ecommRoutes = require('./routes/ecomm');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ecomm', ecommRoutes);
app.use('/api/admin', adminRoutes);

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

