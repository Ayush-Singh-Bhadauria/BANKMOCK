require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const bankingRoutes = require('./routes/banking');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bank Mock API Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use(`/api/${process.env.API_VERSION || 'v1'}`, bankingRoutes);

// 404 Handler
app.use(notFound);

// Error Handler
app.use(errorHandler);

// Start server (only for local development)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('\n===========================================');
    console.log('🏦  BANK MOCK API SERVER');
    console.log('===========================================');
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ API Version: ${process.env.API_VERSION || 'v1'}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health`);
    console.log(`✓ API Base URL: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
    console.log('===========================================\n');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
  });
}

// Export the app for Vercel
module.exports = app;
