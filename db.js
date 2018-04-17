const mongoose = require('mongoose');

const config = require('./config');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');

mongoose.connect(config.dbUrl, { useMongoClient: true });
mongoose.Promise = global.Promise;

module.exports = {
  Account,
  Transaction,
};
