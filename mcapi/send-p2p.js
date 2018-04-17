const p2p = require('mastercard-p2p');

const createTransferReference = () => ((Math.random() *  Math.pow(10, 17)).toString());

const paymentsTransfer = (transaction) => (new Promise((resolve, reject) => {
  // We are using test card numbers here instead of the card numbers in the transaction
  // because our Mastercard Send sandbox environment only supports specific test card numbers.
  const fromPan = '5107559999999903' // transaction.from.pan;
  const toPan = '5107559999999978' // transaction.to.pan;
  const address = {
    'line1': '21 Broadway',
    'line2': 'Apartment A-6',
    'city': 'OFallon',
    'country_subdivision': 'MO',
    'postal_code': '63368',
    'country': 'USA'
  };

  p2p.PaymentTransfer.create({
    'partnerId': 'ptnr_A37V2q91WUqSonkfEG29Q-Bf4s9',
    'payment_transfer': {
      'transfer_reference': createTransferReference(),
      'payment_type': 'P2P',
      'funding_source': 'CREDIT',
      'amount': transaction.amount,
      'currency': 'USD',
      'sender_account_uri': `pan:${fromPan};exp=2099-08;cvc=123`,
      'sender': {
        'first_name': transaction.from.name,
        'last_name': 'Jones',
        'address': address,
        'phone': transaction.from.mobileNumber,
      },
      'recipient_account_uri': `pan:${toPan};exp=2099-08;cvc=123`,
      'recipient': {
        'first_name': transaction.to.name,
        'last_name': 'Jones',
        'address': address,
        'phone': transaction.to.mobileNumber,
      },
      'channel': 'WEB'
    }
  }, (error, data) => {
    if (error) {
      return reject(error);
    }
    resolve(data);
  });
}));

module.exports = {
  paymentsTransfer
};
