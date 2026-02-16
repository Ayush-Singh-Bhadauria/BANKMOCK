const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Cheque = require('../models/Cheque');
const OTP = require('../models/OTP');

/**
 * Helper function to get and validate customer ID from request
 * Accepts customerId from X-Customer-ID header or request body
 */
const getCustomerId = (req) => {
  return req.headers['x-customer-id'] || req.body.customerId || req.query.customerId;
};

/**
 * Helper function to fetch customer by ID
 */
const getCustomer = async (customerId) => {
  if (!customerId) {
    return null;
  }
  return await Customer.findOne({ customerId });
};

/**
 * @route   GET /api/v1/customer
 * @desc    Get customer profile
 * @access  Internal (No auth - called by trusted MCP server)
 */
router.get('/customer', async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'customerId is required (via X-Customer-ID header, query param, or body)',
      });
    }

    const customer = await getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        customerId: customer.customerId,
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
        accountNumber: customer.accountNumber,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/balance
 * @desc    Get account balance
 * @access  Internal (No auth - called by trusted MCP server)
 */
router.get('/balance', async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
    }

    const customer = await getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const account = await Account.findOne({
      accountNumber: customer.accountNumber,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        accountNumber: account.accountNumber,
        balance: account.balance,
        type: account.type,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/generate-otp
 * @desc    Generate 6-digit OTP for transaction
 * @access  Internal (No auth - called by trusted MCP server)
 */
router.post('/generate-otp', async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
    }

    const customer = await getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this customer
    await OTP.deleteMany({ customerId: customer.customerId });

    // Calculate expiry time (5 minutes from now)
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Create new OTP record
    await OTP.create({
      customerId: customer.customerId,
      otp: otpCode,
      expiresAt: expiresAt,
    });

    res.status(200).json({
      success: true,
      message: 'OTP generated successfully',
      data: {
        otp: otpCode, // For demo purposes only - remove in production
        expiresIn: `${expiryMinutes} minutes`,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/transfer
 * @desc    Initiate fund transfer (requires OTP verification)
 * @access  Internal (No auth - called by trusted MCP server)
 */
router.post('/transfer', async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    const { amount } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Amount must be greater than 0.',
      });
    }

    const customer = await getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Fetch account
    const account = await Account.findOne({
      accountNumber: customer.accountNumber,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // Check sufficient balance
    if (account.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
        data: {
          availableBalance: account.balance,
          requestedAmount: amount,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verification required to complete the transfer',
      data: {
        amount: amount,
        currentBalance: account.balance,
        note: 'Please verify OTP to proceed with the transaction',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/validate-otp
 * @desc    Validate OTP and complete fund transfer
 * @access  Internal (No auth - called by trusted MCP server)
 */
router.post('/validate-otp', async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    const { otp, amount } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
    }

    // Validate input
    if (!otp || !amount) {
      return res.status(400).json({
        success: false,
        message: 'OTP and amount are required',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Amount must be greater than 0.',
      });
    }

    const customer = await getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      customerId: customer.customerId,
      otp: otp,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Check if OTP has expired (additional check, TTL index should handle this)
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // Fetch account
    const account = await Account.findOne({
      accountNumber: customer.accountNumber,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // Check sufficient balance
    if (account.balance < amount) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
        data: {
          availableBalance: account.balance,
          requestedAmount: amount,
        },
      });
    }

    // Deduct balance
    account.balance -= amount;
    await account.save();

    // Create transaction record
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const transaction = await Transaction.create({
      transactionId: transactionId,
      accountNumber: account.accountNumber,
      type: 'DEBIT',
      amount: amount,
      status: 'SUCCESS',
      timestamp: new Date(),
    });

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        transactionId: transaction.transactionId,
        amount: amount,
        updatedBalance: account.balance,
        timestamp: transaction.timestamp,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/deposit-cheque
 * @desc    Deposit a cheque
 * @access  Internal (No auth - called by trusted MCP server)
 */
router.post('/deposit-cheque', async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    const { amount } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Amount must be greater than 0.',
      });
    }

    const customer = await getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Generate cheque number
    const chequeNumber = `CHQ${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Calculate expected clearance date (3 business days from now)
    const expectedClearanceDate = new Date();
    expectedClearanceDate.setDate(expectedClearanceDate.getDate() + 3);

    // Create cheque record
    const cheque = await Cheque.create({
      chequeNumber: chequeNumber,
      accountNumber: customer.accountNumber,
      amount: amount,
      status: 'Processing',
      expectedClearanceDate: expectedClearanceDate,
    });

    res.status(201).json({
      success: true,
      message: 'Cheque deposited successfully',
      data: {
        chequeNumber: cheque.chequeNumber,
        amount: cheque.amount,
        status: cheque.status,
        expectedClearanceDate: cheque.expectedClearanceDate,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/cheque/:chequeNumber
 * @desc    Get cheque status
 * @access  Internal (No auth - called by trusted MCP server)
 */
router.get('/cheque/:chequeNumber', async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    const { chequeNumber } = req.params;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
    }

    const customer = await getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Find cheque
    const cheque = await Cheque.findOne({ chequeNumber: chequeNumber });

    if (!cheque) {
      return res.status(404).json({
        success: false,
        message: 'Cheque not found',
      });
    }

    // Verify cheque belongs to this customer's account
    if (cheque.accountNumber !== customer.accountNumber) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to cheque information',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        chequeNumber: cheque.chequeNumber,
        accountNumber: cheque.accountNumber,
        amount: cheque.amount,
        status: cheque.status,
        expectedClearanceDate: cheque.expectedClearanceDate,
        createdAt: cheque.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/transactions
 * @desc    Get transaction history with pagination
 * @access  Internal (No auth - called by trusted MCP server)
 * @query   limit (10, 100, or 1000)
 * @query   page (page number, default 1)
 */
router.get('/transactions', async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
    }

    const customer = await getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Pagination parameters
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    
    // Validate limit (only 10, 100, or 1000 allowed as per requirements)
    if (![10, 100, 1000].includes(limit)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit. Allowed values: 10, 100, 1000',
      });
    }

    const skip = (page - 1) * limit;

    // Get transactions for this account
    const transactions = await Transaction.find({
      accountNumber: customer.accountNumber,
    })
      .sort({ timestamp: -1 }) // Recent first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const totalCount = await Transaction.countDocuments({
      accountNumber: customer.accountNumber,
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        transactions: transactions,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalTransactions: totalCount,
          limit: limit,
          hasMore: page < totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/statement
 * @desc    Get account statement for a date range
 * @access  Internal (No auth - called by trusted MCP server)
 * @query   startDate (optional, defaults to 30 days ago)
 * @query   endDate (optional, defaults to today)
 */
router.get('/statement', async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
    }

    const customer = await getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Get account
    const account = await Account.findOne({
      accountNumber: customer.accountNumber,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // Date range (default to last 30 days)
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date();
    
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Get transactions within date range
    const transactions = await Transaction.find({
      accountNumber: customer.accountNumber,
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ timestamp: -1 });

    // Calculate totals
    const totalCredits = transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDebits = transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        accountNumber: account.accountNumber,
        accountType: account.type,
        currentBalance: account.balance,
        statementPeriod: {
          from: startDate,
          to: endDate,
        },
        summary: {
          openingBalance: account.balance - totalCredits + totalDebits,
          totalCredits: totalCredits,
          totalDebits: totalDebits,
          closingBalance: account.balance,
          transactionCount: transactions.length,
        },
        transactions: transactions,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/account
 * @desc    Get complete account details
 * @access  Internal (No auth - called by trusted MCP server)
 */
router.get('/account', async (req, res, next) => {
  try {
    const customerId = getCustomerId(req);
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
    }

    const customer = await getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Get account
    const account = await Account.findOne({
      accountNumber: customer.accountNumber,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // Get recent transactions (last 10)
    const recentTransactions = await Transaction.find({
      accountNumber: customer.accountNumber,
    })
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        accountNumber: account.accountNumber,
        accountType: account.type,
        balance: account.balance,
        branch: account.branch,
        ifsc: account.ifsc,
        customerInfo: {
          name: customer.name,
          email: customer.email,
          mobile: customer.mobile,
          address: customer.address,
          kycStatus: customer.kyc_status,
        },
        recentTransactions: recentTransactions,
        accountStatus: 'Active',
        openedDate: account.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
