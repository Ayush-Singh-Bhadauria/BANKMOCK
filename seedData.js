require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');
const Cheque = require('./models/Cheque');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await Customer.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});
    await Cheque.deleteMany({});
    console.log('✓ Existing data cleared');

    // Bulk create 25 users, 1 account each, 50 transactions each, 2 cheques each
    const userCount = 25;
    const txnsPerUser = 50;
    const chequePerUser = 2;
    const customers = [];
    const accounts = [];
    const transactions = [];
    const cheques = [];
    const baseDate = new Date('2026-01-01T09:00:00');
    for (let i = 1; i <= userCount; i++) {
      const customerId = `CUST${String(i).padStart(3, '0')}`;
      const accountNumber = `ACC${1000000000 + i}`;
      const name = `User${i} Demo`;
      const email = `user${i}@example.com`;
      const mobile = `+91-90000000${String(i).padStart(2, '0')}`;
      const address = `${i} Demo Street, City, State - 4000${i}`;
      const dob = new Date(1990, 0, i);
      customers.push({
        customerId,
        name,
        mobile,
        email,
        accountNumber,
        address,
        date_of_birth: dob,
        kyc_status: 'Verified',
      });
      accounts.push({
        accountNumber,
        customerId,
        type: i % 2 === 0 ? 'Savings' : 'Current',
        balance: 50000 + i * 1000,
        branch: `Branch ${i}`,
        ifsc: `MOCK0001${i.toString().padStart(3, '0')}`,
      });
      // Transactions
      for (let t = 1; t <= txnsPerUser; t++) {
        const isCredit = t % 2 === 1;
        const amount = isCredit ? 1000 + t * 10 : 500 + t * 5;
        const type = isCredit ? 'CREDIT' : 'DEBIT';
        const status = 'SUCCESS';
        const timestamp = new Date(baseDate.getTime() + (i * 100 + t) * 3600 * 1000);
        transactions.push({
          transactionId: `TXN${i.toString().padStart(3, '0')}${t.toString().padStart(3, '0')}`,
          accountNumber,
          type,
          amount,
          status,
          timestamp,
        });
      }
      // Cheques
      for (let c = 1; c <= chequePerUser; c++) {
        cheques.push({
          chequeNumber: `CHQ${i.toString().padStart(3, '0')}${c.toString().padStart(3, '0')}`,
          accountNumber,
          amount: 5000 + c * 1000,
          date: new Date(baseDate.getTime() + (i * 100 + c) * 86400 * 1000),
          status: c === 1 ? 'Cleared' : 'Processing',
          expectedClearanceDate: new Date(baseDate.getTime() + (i * 100 + c + 3) * 86400 * 1000),
        });
      }
    }
    await Customer.insertMany(customers);
    await Account.insertMany(accounts);
    await Transaction.insertMany(transactions);
    await Cheque.insertMany(cheques);
    console.log(`✓ Created ${customers.length} customers, ${accounts.length} accounts, ${transactions.length} transactions, ${cheques.length} cheques`);
    console.log('\n✅ MongoDB cluster populated with demo data!\n');
    console.log('===========================================');
    console.log('Sample Customer Credentials:');
    console.log('===========================================');
    for (let i = 0; i < Math.min(5, customers.length); i++) {
      const c = customers[i];
      console.log(`\nCustomer: ${c.name}`);
      console.log(`Token: Bearer TOKEN_${c.customerId}`);
      console.log(`Account: ${c.accountNumber}`);
    }
    console.log('\n===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run seed
connectDB().then(() => seedData());
