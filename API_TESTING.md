# API Testing Guide

## Quick Start Testing

### Using Postman

1. Import this collection or manually create requests
2. Set base URL: `http://localhost:5000/api/v1`
3. Add Authorization header to each request

---

## Test Scenarios

### Scenario 1: View Account Information

**Step 1 - Get Customer Profile**
```
GET http://localhost:5000/api/v1/customer
Authorization: Bearer TOKEN_CUST001
```

**Step 2 - Get Balance**
```
GET http://localhost:5000/api/v1/balance
Authorization: Bearer TOKEN_CUST001
```

---

### Scenario 2: Complete Money Transfer

**Step 1 - Generate OTP**
```
POST http://localhost:5000/api/v1/generate-otp
Authorization: Bearer TOKEN_CUST001
```

Save the OTP from response.

**Step 2 - Initiate Transfer**
```
POST http://localhost:5000/api/v1/transfer
Authorization: Bearer TOKEN_CUST001
Content-Type: application/json

{
  "amount": 5000
}
```

**Step 3 - Validate OTP and Complete Transfer**
```
POST http://localhost:5000/api/v1/validate-otp
Authorization: Bearer TOKEN_CUST001
Content-Type: application/json

{
  "otp": "123456",
  "amount": 5000
}
```

Replace "123456" with actual OTP from Step 1.

**Step 4 - Verify Updated Balance**
```
GET http://localhost:5000/api/v1/balance
Authorization: Bearer TOKEN_CUST001
```

---

### Scenario 3: Cheque Operations

**Step 1 - Deposit Cheque**
```
POST http://localhost:5000/api/v1/deposit-cheque
Authorization: Bearer TOKEN_CUST001
Content-Type: application/json

{
  "amount": 15000
}
```

Save the `chequeNumber` from response.

**Step 2 - Check Cheque Status**
```
GET http://localhost:5000/api/v1/cheque/CHQ17397072001234
Authorization: Bearer TOKEN_CUST001
```

Replace cheque number with actual value from Step 1.

---

## Error Testing

### Test Invalid Token
```
GET http://localhost:5000/api/v1/customer
Authorization: Bearer TOKEN_INVALID
```

Expected: 401 Unauthorized

### Test Insufficient Balance
```
POST http://localhost:5000/api/v1/transfer
Authorization: Bearer TOKEN_CUST001
Content-Type: application/json

{
  "amount": 1000000
}
```

Expected: 400 Bad Request - Insufficient balance

### Test Invalid OTP
```
POST http://localhost:5000/api/v1/validate-otp
Authorization: Bearer TOKEN_CUST001
Content-Type: application/json

{
  "otp": "999999",
  "amount": 5000
}
```

Expected: 400 Bad Request - Invalid or expired OTP

### Test Expired OTP

1. Generate OTP
2. Wait 6 minutes (OTP expires in 5 minutes)
3. Try to validate OTP

Expected: 400 Bad Request - Invalid or expired OTP

---

## Sample Test Data

After running `npm run seed`, you'll have:

### Customer 1: Rahul Sharma
- **Token:** `Bearer TOKEN_CUST001`
- **Account:** ACC1234567890
- **Balance:** ₹50,000
- **Type:** Savings

### Customer 2: Priya Patel
- **Token:** `Bearer TOKEN_CUST002`
- **Account:** ACC1234567891
- **Balance:** ₹1,25,000
- **Type:** Current

### Customer 3: Amit Kumar
- **Token:** `Bearer TOKEN_CUST003`
- **Account:** ACC1234567892
- **Balance:** ₹75,000
- **Type:** Savings

---

## Testing with JavaScript (Node.js)

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const TOKEN = 'Bearer TOKEN_CUST001';

async function testAPI() {
  try {
    // Get balance
    const balance = await axios.get(`${BASE_URL}/balance`, {
      headers: { Authorization: TOKEN }
    });
    console.log('Balance:', balance.data);

    // Generate OTP
    const otpResponse = await axios.post(`${BASE_URL}/generate-otp`, {}, {
      headers: { Authorization: TOKEN }
    });
    const otp = otpResponse.data.data.otp;
    console.log('OTP:', otp);

    // Transfer
    const transfer = await axios.post(`${BASE_URL}/transfer`, 
      { amount: 1000 },
      { headers: { Authorization: TOKEN, 'Content-Type': 'application/json' }}
    );
    console.log('Transfer:', transfer.data);

    // Validate OTP
    const validate = await axios.post(`${BASE_URL}/validate-otp`,
      { otp, amount: 1000 },
      { headers: { Authorization: TOKEN, 'Content-Type': 'application/json' }}
    );
    console.log('Validated:', validate.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPI();
```

---

## Testing with Python

```python
import requests
import time

BASE_URL = 'http://localhost:5000/api/v1'
TOKEN = 'Bearer TOKEN_CUST001'
headers = {'Authorization': TOKEN, 'Content-Type': 'application/json'}

# Get balance
response = requests.get(f'{BASE_URL}/balance', headers=headers)
print('Balance:', response.json())

# Generate OTP
response = requests.post(f'{BASE_URL}/generate-otp', headers=headers)
otp = response.json()['data']['otp']
print('OTP:', otp)

# Transfer
response = requests.post(f'{BASE_URL}/transfer', 
    json={'amount': 1000}, 
    headers=headers)
print('Transfer:', response.json())

# Validate OTP
response = requests.post(f'{BASE_URL}/validate-otp',
    json={'otp': otp, 'amount': 1000},
    headers=headers)
print('Validated:', response.json())
```

---

## Expected Response Times

- GET requests: < 100ms
- POST requests (without OTP): < 200ms
- POST requests (with OTP validation): < 300ms

---

## Notes

- OTPs expire after 5 minutes (configurable via .env)
- OTPs are automatically deleted after validation or expiry
- All monetary amounts are in Indian Rupees (₹)
- Cheques take 3 business days to clear (simulated)
- Transaction IDs and Cheque Numbers are auto-generated

---

Happy Testing! 🧪
