const express = require('express');
const spendControls = require('./mcapi/spend-controls');
const Transaction = require('./models/Transaction');
const twilio = require('./util/twilio');

const router = express.Router();

// Endpoint to receive Spend Controls notification
router.post('/spend-controls/notification', async (req, res) => {
  console.log('received notification from spend controls: ', req.body);

  res.send('OK');

  setTimeout(async () => {
    const alert = req.body.alert;
    const lastTransaction = await Transaction.findOne({ 'to.spendControlsCardUuid': alert.uuid }).sort({ field: 'asc', _id: -1 }).limit(1);
    const to = lastTransaction.to;
    const from = lastTransaction.from;

    const message = `${to.name} just spent $${alert.transactionAmount} at ${alert.cardAcceptorName}.`;

    console.log('sending sms to ' + from.mobileNumber + ' with message "' + message + '"');
    twilio.sendSms('+1' + from.mobileNumber, message)
      .catch(err => (console.error('Error sending SMS.', err)));
  });
});

module.exports = router;