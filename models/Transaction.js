const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AccountSchema = require('mongoose').model('Account').schema

const transactionSchema = new Schema({
  from: AccountSchema,
  to: AccountSchema,
  amount: Number,
});

module.exports = mongoose.model('Transaction', transactionSchema);
