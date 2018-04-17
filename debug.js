// For debugging and testing purposes.

const express = require('express');

const router = express.Router();

const config = require('./config');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');

router.get('/accounts', async (req, res) => {
  const list = await Account.find({}).sort({ field: 'asc', _id: -1 });

  res.type('text');
  res.send(JSON.stringify(list, null, 2));
});

router.get('/transactions', async (req, res) => {
  const list = await Transaction.find({}).sort({ field: 'asc', _id: -1 });

  res.type('text');
  res.send(JSON.stringify(list, null, 2));
})

router.get('/db/clear', (req, res) => {
  Account.collection.drop();
  Transaction.collection.drop();
  res.send('Cleared database');
});

module.exports = router;