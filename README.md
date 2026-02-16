# 🏦 Bank Mock API Server

Mock Banking API Server for **Contact Center Automation & Customer Assist** hackathon project.

This server simulates a core banking system (like Finacle/Flexcube) with REST APIs for account management, transactions, OTP verification, and cheque operations.

---

## 🚀 Features

- ✅ Express.js REST API
- ✅ MongoDB (Atlas compatible) with Mongoose
- ✅ Simulated Bearer Token Authentication
- ✅ OTP Generation & Validation
- ✅ Fund Transfer with OTP Verification
- ✅ Cheque Deposit & Status Tracking
- ✅ Transaction History
- ✅ Auto-expiring OTPs (TTL Index)
- ✅ Proper Error Handling
- ✅ API Versioning (/api/v1/)
- ✅ CORS Enabled

---

## 📁 Project Structure

```
BankMock/
├── config/
│   └── database.js          # MongoDB connection setup
├── models/
│   ├── Customer.js          # Customer schema
│   ├── Account.js           # Account schema
│   ├── Transaction.js       # Transaction schema
│   ├── Cheque.js            # Cheque schema
│   └── OTP.js               # OTP schema (with TTL index)
├── routes/
│   └── banking.js           # All banking API routes
├── middleware/
│   ├── authenticate.js      # Bearer token authentication
│   └── errorHandler.js      # Global error handler
├── server.js                # Main Express server
├── seedData.js              # Database seeding script
├── .env                     # Environment variables
├── .env.example             # Example environment variables
├── package.json             # Dependencies
└── README.md                # This file
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites

- Node.js (v16 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### 2. Clone & Install

```bash
cd BankMock
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your MongoDB connection string:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bankMock?retryWrites=true&w=majority
API_VERSION=v1
OTP_EXPIRY_MINUTES=5
```

### 4. Seed Database

Run the seed script to populate the database with sample data:

```bash
npm run seed
```

This will create:
- 3 sample customers
- 3 sample accounts
- 3 sample transactions

### 5. Start Server

**Development mode (with nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## 🔑 Authentication

All API endpoints (except `/health`) require Bearer token authentication.

**Token Format:**
```
Authorization: Bearer TOKEN_<customerId>
```

**Example:**
```
Authorization: Bearer TOKEN_CUST001
```

### Sample Credentials

After seeding, you'll have these credentials:

| Customer Name | Token | Account Number |
|--------------|-------|----------------|
| Rahul Sharma | `Bearer TOKEN_CUST001` | ACC1234567890 |
| Priya Patel | `Bearer TOKEN_CUST002` | ACC1234567891 |
| Amit Kumar | `Bearer TOKEN_CUST003` | ACC1234567892 |

---

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/v1`

### 1. Health Check
```
GET /health
```
No authentication required.

**Response:**
```json
{
  "success": true,
  "message": "Bank Mock API Server is running",
  "timestamp": "2026-02-16T10:30:00.000Z"
}
```

---

### 2. Get Customer Profile
```
GET /api/v1/customer
```

**Headers:**
```
Authorization: Bearer TOKEN_CUST001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "CUST001",
    "name": "Rahul Sharma",
    "mobile": "+91-9876543210",
    "email": "rahul.sharma@example.com",
    "accountNumber": "ACC1234567890"
  }
}
```

---

### 3. Get Account Balance
```
GET /api/v1/balance
```

**Headers:**
```
Authorization: Bearer TOKEN_CUST001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accountNumber": "ACC1234567890",
    "balance": 50000,
    "type": "Savings"
  }
}
```

---

### 4. Generate OTP
```
POST /api/v1/generate-otp
```

**Headers:**
```
Authorization: Bearer TOKEN_CUST001
```

**Response:**
```json
{
  "success": true,
  "message": "OTP generated successfully",
  "data": {
    "otp": "123456",
    "expiresIn": "5 minutes"
  }
}
```

> **Note:** OTP is returned in response for demo purposes only. In production, it would be sent via SMS/Email.

---

### 5. Initiate Transfer
```
POST /api/v1/transfer
```

**Headers:**
```
Authorization: Bearer TOKEN_CUST001
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verification required to complete the transfer",
  "data": {
    "amount": 5000,
    "currentBalance": 50000,
    "note": "Please verify OTP to proceed with the transaction"
  }
}
```

---

### 6. Validate OTP & Complete Transfer
```
POST /api/v1/validate-otp
```

**Headers:**
```
Authorization: Bearer TOKEN_CUST001
Content-Type: application/json
```

**Body:**
```json
{
  "otp": "123456",
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "transactionId": "TXN1739707200123",
    "amount": 5000,
    "updatedBalance": 45000,
    "timestamp": "2026-02-16T10:30:00.000Z"
  }
}
```

---

### 7. Deposit Cheque
```
POST /api/v1/deposit-cheque
```

**Headers:**
```
Authorization: Bearer TOKEN_CUST001
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 15000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cheque deposited successfully",
  "data": {
    "chequeNumber": "CHQ17397072001234",
    "amount": 15000,
    "status": "Processing",
    "expectedClearanceDate": "2026-02-19T10:30:00.000Z"
  }
}
```

---

### 8. Get Cheque Status
```
GET /api/v1/cheque/:chequeNumber
```

**Headers:**
```
Authorization: Bearer TOKEN_CUST001
```

**Example:**
```
GET /api/v1/cheque/CHQ17397072001234
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chequeNumber": "CHQ17397072001234",
    "accountNumber": "ACC1234567890",
    "amount": 15000,
    "status": "Processing",
    "expectedClearanceDate": "2026-02-19T10:30:00.000Z",
    "createdAt": "2026-02-16T10:30:00.000Z"
  }
}
```

---

## 🧪 Testing with cURL

### Example: Complete Transfer Flow

**1. Get Balance:**
```bash
curl -X GET http://localhost:5000/api/v1/balance \
  -H "Authorization: Bearer TOKEN_CUST001"
```

**2. Generate OTP:**
```bash
curl -X POST http://localhost:5000/api/v1/generate-otp \
  -H "Authorization: Bearer TOKEN_CUST001"
```

**3. Initiate Transfer:**
```bash
curl -X POST http://localhost:5000/api/v1/transfer \
  -H "Authorization: Bearer TOKEN_CUST001" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000}'
```

**4. Validate OTP & Complete Transfer:**
```bash
curl -X POST http://localhost:5000/api/v1/validate-otp \
  -H "Authorization: Bearer TOKEN_CUST001" \
  -H "Content-Type: application/json" \
  -d '{"otp": "123456", "amount": 5000}'
```

---

## 🗄️ Database Collections

### customers
```javascript
{
  customerId: String (unique),
  name: String,
  mobile: String,
  email: String,
  accountNumber: String
}
```

### accounts
```javascript
{
  accountNumber: String (unique),
  customerId: String,
  type: String (Savings/Current),
  balance: Number,
  branch: String,
  ifsc: String
}
```

### transactions
```javascript
{
  transactionId: String (unique),
  accountNumber: String,
  type: String (DEBIT/CREDIT),
  amount: Number,
  status: String (SUCCESS/FAILED),
  timestamp: Date
}
```

### cheques
```javascript
{
  chequeNumber: String (unique),
  accountNumber: String,
  amount: Number,
  status: String (Processing/Cleared/Rejected),
  expectedClearanceDate: Date
}
```

### otps
```javascript
{
  customerId: String,
  otp: String,
  expiresAt: Date (TTL index for auto-deletion)
}
```

---

## 🛡️ Error Handling

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid amount. Amount must be greater than 0."
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid credentials. Customer not found."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Account not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## 🎯 Use Case: Contact Center Automation

This mock API is designed to be called by an **Agentic AI Contact Center** system. The AI assistant can:

1. **Authenticate** customers using their customer ID
2. **Fetch** account information and balance
3. **Perform** secure transactions with OTP verification
4. **Handle** cheque deposits and status queries
5. **Provide** transaction history

### Example AI Flow:

1. Customer calls: "What's my account balance?"
   → AI calls `GET /api/v1/balance`

2. Customer: "Transfer 5000 rupees"
   → AI calls `POST /api/v1/generate-otp`
   → AI reads OTP to customer
   → AI calls `POST /api/v1/transfer`
   → Customer provides OTP
   → AI calls `POST /api/v1/validate-otp`

3. Customer: "I deposited a cheque, what's the status?"
   → AI calls `GET /api/v1/cheque/:chequeNumber`

---

## 📝 License

ISC

---

## 👨‍💻 Support

For issues or questions, please contact the development team.

---

**Happy Hacking! 🚀**
