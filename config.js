const port = process.env.PORT || 3000;
const serverUrl = process.env.SERVER_URI || 'http://localhost:3000';
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/alexa_solution';
const twilioAccountSid = process.env.TWILIO_ACCT_SID || 'your-twilio-account-sid';
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || 'your-twilio-auth-token';
const twilioNumber = 'your-twilio-mobile-number';

// Setup Mastercard API authentication
(() => {
  const p2p = require('mastercard-p2p');

  const MasterCardAPI = p2p.MasterCardAPI;
  const consumerKey = process.env.MCAPI_CONSUMER_KEY || "your-mastercard-api-consumer-key";
  const keyStorePath = process.env.MCAPI_KEYSTORE_PATH || "path-to-your-mastercard-api-p12-file";
  const keyAlias = process.env.MCAPI_KEY_ALIAS || "keyalias";
  const keyPassword = process.env.MCAPI_KEY_PASSWORD || "keystorepassword";
  const authentication = new MasterCardAPI.OAuth(consumerKey, keyStorePath, keyAlias, keyPassword);

  MasterCardAPI.init({
    sandbox: true,
    debug: true,
    authentication
  });
})();

module.exports = {
  port,
  serverUrl,
  dbUrl,
  twilioAccountSid,
  twilioAuthToken,
  twilioNumber,
}
