const express = require("express");
const alexa = require("alexa-app");
const Speech = require('ssml-builder');
const bodyParser = require('body-parser');

const config = require('./config');
const sendP2p = require('./mcapi/send-p2p');
const spendControls = require('./mcapi/spend-controls');
const alexaUtils = require('./util/alexa');

const db = require('./db');
const Account = db.Account;
const Transaction = db.Transaction;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', require('./routes'));
app.use('/debug', require('./debug'));

// Setup the alexa app and attach it to express.
const alexaApp = new alexa.app("p2p");
alexaApp.express({
  expressApp: app,

  // verifies requests come from amazon alexa. Must be enabled for production.
  // You can disable this if you're running a dev environment and want to POST
  // things to test behavior. enabled by default.
  checkCert: false,

  // sets up a GET route when set to true. This is handy for testing in
  // development, but not recommended for production. disabled by default
  debug: true
});
// now POST calls to /p2p in express will be handled by the app.request() function

// When there is an error from the server
alexaApp.error = (e, request, response) => {
  console.error(e);

  const speech = new Speech()
  .say('Sorry, something bad happened.')
  .pause('1s')
  .say('What would you like to do next?');

  response.say(speech.ssml(true)).shouldEndSession(false);
};

// When the skill is launched
alexaApp.launch((request, response) => {
  response.say('What would you like to do?').shouldEndSession(false);
});

// Create an account
alexaApp.intent('createAccount', async (request, response) => {
  const validators = {
    'mobileFirstThree': (value) => (!/^\d{3}$/g.test(value) && 'Could you repeat that?'),
    'mobileSecondThree': (value) => (!/^\d{3}$/g.test(value) && 'Could you repeat that?'),
    'mobileLastFour': (value) => (!/^\d{4}$/g.test(value) && 'Could you repeat that?'),
    'panFirstFour': (value) => (!/^\d{4}$/g.test(value) && 'Could you repeat that?'),
    'panSecondFour': (value) => (!/^\d{4}$/g.test(value) && 'Could you repeat that?'),
    'panThirdFour': (value) => (!/^\d{4}$/g.test(value) && 'Could you repeat that?'),
    'panLastFour': (value) => (!/^\d{4}$/g.test(value) && 'Could you repeat that?'),
  };

  const valid = await alexaUtils.validateSlotValues(request, response, validators);
  if (!valid) {
    return;
  }

  if (!request.getDialog().isCompleted()) {
    response.directive({
      type: 'Dialog.Delegate',
    })
    .shouldEndSession(false)

    return true;
  }

  const name = request.slot("name");

  const mobileFirst3 = request.slot("mobileFirstThree");
  const mobileSecond3 = request.slot("mobileSecondThree");
  const mobileLast4 = request.slot("mobileLastFour");

  const panFirst4 = request.slot("panFirstFour");
  const panSecond4 = request.slot("panSecondFour");
  const panThird4 = request.slot("panThirdFour");
  const panLast4 = request.slot("panLastFour");

  console.log('name = ', name);
  console.log('mobileFirst3 = ', mobileFirst3);
  console.log('mobileSecond3 = ', mobileSecond3);
  console.log('mobileLast4 = ', mobileLast4);
  console.log('panFirst4 = ', panFirst4);
  console.log('panSecond4 = ', panSecond4);
  console.log('panThird4 = ', panThird4);
  console.log('panLast4 = ', panLast4);

  try {
    // We are using a test card numbers for this because
    // our Spend Controls sandbox only supports a specific set of card numbers.
    // You should use the actual PAN that you receive from the user.
    const mockCardNumber = spendControls.getMockCardNumber();
    const spendControlsResponse = await spendControls.createCard(mockCardNumber);
    console.log('created spend control card uuid ' + spendControlsResponse.uuid + ' with mock card number ' + mockCardNumber);

    const obj = await Account.saveOrUpdate({
      name,
      mobileNumber: mobileFirst3 + mobileSecond3 + mobileLast4,
      pan: panFirst4 + panSecond4 + panThird4 + panLast4,
      spendControlsCardUuid: spendControlsResponse.uuid
    });

    const speech = new Speech()
    .say(`Account created for ${obj.name} with mobile number`)
    .sayAs({
      word: obj.mobileNumber,
      interpret: 'telephone'
    })
    .say('and pan ending')
    .sayAs({
      word: obj.pan.slice(-4),
      interpret: 'digits'
    })
    .pause('1s')
    .say('What would you like to do next?');

    response.say(speech.ssml(true)).shouldEndSession(false);
  } catch (err) {
    console.error('Error creating account.', err);
    response.say('An error occured when creating an account.');
  }
});

// Transfer money and setup Spend Controls
alexaApp.intent('transferMoney', async (request, response) => {
  let fromAccount = null;
  let toAccount = null;

  const validators = {
    'fromName': async (value) => {
      fromAccount = await Account.findByName(value);
      if (fromAccount == null) {
        return `${value} does not have an account. Which account to transfer from?`;
      }
    },
    'toName': async (value) => {
      toAccount = await Account.findByName(value);
      if (toAccount == null) {
        return `${value} does not have an account. Which account to transfer to?`;
      }
    }
  };

  const valid = await alexaUtils.validateSlotValues(request, response, validators);
  if (!valid) {
    return;
  }

  if (!request.getDialog().isCompleted()) {
    response.directive({
      type: 'Dialog.Delegate',
    })
    .shouldEndSession(false);

    return true;
  }

  const fromName = request.slot("fromName");
  const toName = request.slot("toName");
  const amount = request.slot("amount");
  const activity = request.slot("activity");

  const transaction = await new Transaction({
    from: { ...fromAccount.toObject() },
    to: { ...toAccount.toObject() },
    amount,
  }).save();

  const promises = [];

  console.log('Transferring funds');
  const paymentsTransferPromise = sendP2p.paymentsTransfer(transaction)
    .catch((error) => (console.error('Error sending funds', JSON.stringify(error, null, 2))));
  promises.push(paymentsTransferPromise);

  if (activity === 'lunch') {
    console.log('Creating decline spend control');
    const declineControlPromise = spendControls.createMerchantCategoryCodeDecline(toAccount.spendControlsCardUuid)
      .catch((error) => (console.error('Error creating decline spend controls.', error)));
    promises.push(declineControlPromise);

    console.log('Creating alert spend control');
    const alertControlPromise = spendControls.createMerchantCategoryCodeAlert(toAccount.spendControlsCardUuid)
      .catch((error) => (console.error('Error creating alert spend control.', error)));
    promises.push(alertControlPromise);
  }

  await Promise.all(promises);

  const speech = new Speech()
  .say(`Transferred ${amount} dollars from ${fromAccount.name} to ${toAccount.name} with pan ending`)
  .sayAs({
    word: toAccount.pan.slice(-4),
    interpret: 'digits'
  })
  .pause('1s')
  .say('What would you like to do next?');

  response.say(speech.ssml(true)).shouldEndSession(false);

  // Simulate receiving notification from Spend Controls API when transaction is done on card.
  setTimeout(() => {
    console.log('Simulate notification from Spend Controls');
    spendControls.createNotification(transaction.to.spendControlsCardUuid, amount, transaction.to.pan.slice(-4));
  }, 2000);
});

app.listen(config.port, () => console.log(`Listening on port: ${config.port}.`));
