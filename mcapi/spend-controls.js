const config = require('../config');
const spendcontrols = require('mastercard-spendcontrols');

const mockCardNumbers = [
  '52047314690007',
  '52047314690015',
  '52047314690023',
  '52047314690031',
  '52047314690049',
  '52047314690056',
  '52047314690064',
  '52047314690072',
  '52047314690080',
  '52047314690098',
  '52047314690106',
  '52047314690114',
  '52047314690122',
  '52047314690130',
  '52047314690148',
  '52047314690155',
  '52047314690163',
  '52047314690171',
];
let index = 0;

const getMockCardNumber = () => {
  const cardNumber = mockCardNumbers[index];

  if (mockCardNumbers[++index] == null) {
    index = 0;
  }

  return cardNumber;
}

const createCard = (pan) => (new Promise((resolve, reject) => {
  spendcontrols.Card.create({
    'accountNumber': pan
  }, (error, data) => {
    if (error) {
      return reject(error);
    }
    resolve(data);
  });
}));

const createMerchantCategoryCodeAlert = (uuid) => (new Promise((resolve, reject) => {
  spendcontrols.Merchantcategorycodealert.create({
    uuid,
    // food mcc codes
    'mccs': [
      '5811',
      '5812',
      '5813',
      '5814'
    ],
    "blackWhite": "white"
  }, (error, data) => {
    if (error) {
      return reject(error);
    }
    resolve(data);
  })
}));

const createMerchantCategoryCodeDecline = (uuid) => (new Promise((resolve, reject) => {
  spendcontrols.Merchantcategorycodedecline.create({
    uuid,
    // food mcc codes
    'mccs': [
      '5811',
      '5812',
      '5813',
      '5814'
    ],
    'blackWhite': 'white'
  }, (error, data) => {
    if (error) {
      return reject(error);
    }
    resolve(data);
  })
}))

const createNotification = (uuid, amount, panLast4) => (new Promise((resolve, reject) => {
  spendcontrols.Notification.create({
    'x-request-endpoint-uri': `${config.serverUrl}/spend-controls/notification`,
    uuid,
    'transactionAmount': amount,
    'transactionCurrency': 'USD',
    'cardholderAmount': amount,
    'emsIssuingCountry': 'US',
    'referenceNumber': '39594770386375550',
    'cardAcceptorId': '123',
    'cardAcceptorName': 'The Art of Coffee',
    'cardAcceptorCity': 'NY',
    'cardAcceptorStateOrCountry': 'USA',
    'merchantCategoryCode': '5811',
    'posCountryCode': 'US',
    'acquirerId': '123975',
    'preAuthorizedTransaction': 'true',
    'recurringTransaction': 'true',
    'channel': 'MOTO',
    'controlsTriggered': [
      "DTA",
      "ATA"
    ],
    'issuerResponse': '05',
    'panLastFour': panLast4
  }, (error, data) => {
    if (error) {
      return reject(error);
    }
    resolve(data);
  });
}));

module.exports = {
  createCard,
  createMerchantCategoryCodeAlert,
  createMerchantCategoryCodeDecline,
  createNotification,
  getMockCardNumber,
};