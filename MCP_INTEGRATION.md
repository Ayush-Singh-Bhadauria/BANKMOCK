# MCP Server Integration Guide

## 🔓 No Authentication Required!

This API is designed to be called by your **trusted MCP server**. Authentication is handled at the web application layer, so this banking API doesn't require Bearer tokens or JWT.

---

## 📡 How to Call APIs

### Method 1: Using `X-Customer-ID` Header (Recommended)

```bash
curl http://localhost:5001/api/v1/balance \
  -H "X-Customer-ID: CUST001"
```

### Method 2: Using Request Body

```bash
curl -X POST http://localhost:5001/api/v1/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"customerId": "CUST001"}'
```

### Method 3: Using Query Parameter

```bash
curl "http://localhost:5001/api/v1/customer?customerId=CUST001"
```

---

## 🎯 Example MCP Server Flow

```javascript
// MCP Server receives request from web app
// Web app has already authenticated the user and locked customerId in session

async function handleUserQuery(customerId, userQuery) {
  // customerId is already validated by web app
  // MCP server just passes it to banking API
  
  if (userQuery === "What's my balance?") {
    const response = await fetch('http://localhost:5001/api/v1/balance', {
      headers: {
        'X-Customer-ID': customerId  // Pass customerId from session
      }
    });
    
    const data = await response.json();
    return `Your balance is ₹${data.data.balance}`;
  }
  
  if (userQuery.includes("transfer")) {
    // Step 1: Generate OTP
    const otpResponse = await fetch('http://localhost:5001/api/v1/generate-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customerId })
    });
    
    const otpData = await otpResponse.json();
    
    // Step 2: Return OTP to user for verification
    return `OTP sent: ${otpData.data.otp}. Please confirm to proceed.`;
  }
}
```

---

## 🔄 Complete Transfer Flow

```javascript
// 1. User initiates transfer
const transferInit = await fetch('http://localhost:5001/api/v1/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Customer-ID': 'CUST001'
  },
  body: JSON.stringify({ amount: 5000 })
});

// 2. Generate OTP
const otpResp = await fetch('http://localhost:5001/api/v1/generate-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ customerId: 'CUST001' })
});

const { otp } = await otpResp.json();

// 3. User provides OTP, validate and complete transfer
const validateResp = await fetch('http://localhost:5001/api/v1/validate-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Customer-ID': 'CUST001'
  },
  body: JSON.stringify({
    otp: otp,
    amount: 5000
  })
});

const result = await validateResp.json();
console.log(result); // { success: true, data: { transactionId, updatedBalance, ... } }
```

---

## 📋 All API Endpoints

### 1. Get Customer Profile
```bash
GET /api/v1/customer
Header: X-Customer-ID: CUST001
```

### 2. Get Balance
```bash
GET /api/v1/balance
Header: X-Customer-ID: CUST001
```

### 3. Generate OTP
```bash
POST /api/v1/generate-otp
Body: { "customerId": "CUST001" }
```

### 4. Initiate Transfer
```bash
POST /api/v1/transfer
Header: X-Customer-ID: CUST001
Body: { "amount": 5000 }
```

### 5. Validate OTP & Complete Transfer
```bash
POST /api/v1/validate-otp
Header: X-Customer-ID: CUST001
Body: { "otp": "123456", "amount": 5000 }
```

### 6. Deposit Cheque
```bash
POST /api/v1/deposit-cheque
Header: X-Customer-ID: CUST001
Body: { "amount": 15000 }
```

### 7. Check Cheque Status
```bash
GET /api/v1/cheque/:chequeNumber
Header: X-Customer-ID: CUST001
```

---

## ✅ Error Handling

### Missing CustomerID
```json
{
  "success": false,
  "message": "customerId is required"
}
```

### Invalid CustomerID
```json
{
  "success": false,
  "message": "Customer not found"
}
```

### Insufficient Balance
```json
{
  "success": false,
  "message": "Insufficient balance",
  "data": {
    "availableBalance": 50000,
    "requestedAmount": 100000
  }
}
```

---

## 🔒 Security Architecture

```
┌─────────────┐
│  End User   │
└──────┬──────┘
       │
       │ Login (Username/Password)
       ↓
┌─────────────────┐
│   Web App       │ ← Authentication happens here
│   (Auth Layer)  │ ← Session locked to customerId
└──────┬──────────┘
       │
       │ customerId (from session)
       ↓
┌─────────────────┐
│   MCP Server    │ ← Trusted internal service
│   (AI Layer)    │ ← No authentication needed
└──────┬──────────┘
       │
       │ X-Customer-ID: CUST001
       ↓
┌─────────────────┐
│  Banking API    │ ← No authentication
│  (This Server)  │ ← Just validates customerId exists
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│    MongoDB      │
└─────────────────┘
```

---

## 🎯 Key Benefits

✅ **Simpler Integration** - No token management in MCP server  
✅ **Faster Responses** - No auth overhead  
✅ **Cleaner Code** - Auth logic stays in web layer  
✅ **Easier Testing** - Direct API calls without login flow  
✅ **Internal Service Pattern** - Common microservice architecture  

---

## 💡 Best Practices

1. **Always pass customerId** via header for consistency
2. **Validate customerId at web layer** before calling MCP server
3. **Lock customerId in session** - user cannot change it mid-session
4. **Use HTTPS** in production between services
5. **Network isolation** - Keep banking API on internal network
6. **Rate limiting** - Add at API gateway level if needed

---

**Ready to integrate with your MCP server!** 🚀
