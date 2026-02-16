const Customer = require('../models/Customer');

/**
 * Authentication Middleware
 * Simulates authentication using Bearer token format: Bearer TOKEN_<customerId>
 * Extracts customerId from token, fetches customer from DB, and attaches to req.customer
 */
const authenticate = async (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    // Check if authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing or invalid format. Use: Bearer TOKEN_<customerId>',
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Parse customerId from token (format: TOKEN_<customerId>)
    if (!token.startsWith('TOKEN_')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Expected: TOKEN_<customerId>',
      });
    }

    const customerId = token.substring(6); // Remove 'TOKEN_' prefix

    // Validate customerId is not empty
    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Customer ID not found in token',
      });
    }

    // Fetch customer from database
    const customer = await Customer.findOne({ customerId });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Customer not found.',
      });
    }

    // Attach customer to request object
    req.customer = customer;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

module.exports = authenticate;
