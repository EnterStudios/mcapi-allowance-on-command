
const twilio = require('twilio');
const config = require('../config');

const client = new twilio(config.twilioAccountSid, config.twilioAuthToken);

const sendSms = (sendTo, message) => {
  const twilioRequest = {
    body: message,
    to: sendTo,
    from: config.twilioNumber
  };

  return client.messages.create(twilioRequest);
};

module.exports = {
  sendSms
};
