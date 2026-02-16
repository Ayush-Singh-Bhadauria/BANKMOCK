# 🚀 Quick Start Guide

## Step-by-Step Setup (5 minutes)

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Configure MongoDB
Edit `.env` file and add your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/bankMock
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bankMock?retryWrites=true&w=majority
```

### 3️⃣ Seed Database
```bash
npm run seed
```

**Expected Output:**
```
✓ MongoDB Connected
✓ Existing data cleared
✓ Created 3 customers
✓ Created 3 accounts
✓ Created 3 transactions
✅ Database seeded successfully!

Sample Customer Credentials:
Customer: Rahul Sharma
Token: Bearer TOKEN_CUST001
Account: ACC1234567890
...
```

### 4️⃣ Start Server
```bash
npm run dev
```

**Expected Output:**
```
===========================================
🏦  BANK MOCK API SERVER
===========================================
✓ Server running on port 5000
✓ Environment: development
✓ API Version: v1
✓ Health check: http://localhost:5000/health
✓ API Base URL: http://localhost:5000/api/v1
===========================================
```

### 5️⃣ Test It!

**Test 1: Health Check (No Auth Required)**
```bash
curl http://localhost:5000/health
```

**Test 2: Get Balance (Auth Required)**
```bash
curl -X GET http://localhost:5000/api/v1/balance \
  -H "Authorization: Bearer TOKEN_CUST001"
```

**Expected Response:**
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

## 🎯 Common Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start server in development mode |
| `npm start` | Start server in production mode |
| `npm run seed` | Populate database with sample data |

---

## 🔑 Test Credentials

| Customer | Token | Initial Balance |
|----------|-------|-----------------|
| Rahul Sharma | `Bearer TOKEN_CUST001` | ₹50,000 |
| Priya Patel | `Bearer TOKEN_CUST002` | ₹1,25,000 |
| Amit Kumar | `Bearer TOKEN_CUST003` | ₹75,000 |

---

## 📋 Complete Transfer Flow Example

**1. Generate OTP:**
```bash
curl -X POST http://localhost:5000/api/v1/generate-otp \
  -H "Authorization: Bearer TOKEN_CUST001"
```

**Response:** Note the OTP (e.g., "123456")

**2. Initiate Transfer:**
```bash
curl -X POST http://localhost:5000/api/v1/transfer \
  -H "Authorization: Bearer TOKEN_CUST001" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000}'
```

**3. Validate OTP:**
```bash
curl -X POST http://localhost:5000/api/v1/validate-otp \
  -H "Authorization: Bearer TOKEN_CUST001" \
  -H "Content-Type: application/json" \
  -d '{"otp": "123456", "amount": 5000}'
```

**4. Check Updated Balance:**
```bash
curl -X GET http://localhost:5000/api/v1/balance \
  -H "Authorization: Bearer TOKEN_CUST001"
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check if MongoDB is running
- Verify connection string in `.env`
- For Atlas, check IP whitelist and credentials

### Port Already in Use
- Change PORT in `.env` file
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### Dependencies Error
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

## 📚 Next Steps

1. ✅ Read [README.md](README.md) for complete documentation
2. ✅ Check [API_TESTING.md](API_TESTING.md) for detailed test scenarios
3. ✅ Integrate with your Contact Center AI system
4. ✅ Customize as needed for your hackathon project

---

## 💡 Pro Tips

- OTPs expire in 5 minutes (configurable in `.env`)
- Use Postman or Thunder Client for easier testing
- Check server logs for debugging
- Database is automatically cleaned when you run `npm run seed`

---

**You're all set! Happy coding! 🎉**
