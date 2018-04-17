# Mastercard Allowance On Command
This is a NodeJS server implementation to demonstrate the capabilities of Mastercard Send Person to Person and Mastercard Spend Controls APIs. This project is a companion to [Allowance On Command](https://developer.mastercard.com/solution/allowance-on-command) that demonstrates how parents using Alexa can send money to and apply spend controls to their child's card.

## References
- [Alexa Skills Kit](https://developer.amazon.com/alexa-skills-kit)

## Requirements
- NodeJS >= 8.9

## Installation
1. Install and setup [mongodb](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x).
2. Create an account at [Twilio](https://www.twilio.com).
3. Create an account at [Mastercard Developers](https://developer.mastercard.com) and create a project with the following APIs:
    - Mastercard Send Person to Person
    - Spend Controls
4. Install [ngrok](https://ngrok.com/download). Run `ngrok http 3000` to expose your local server to the internet.
5. Update the configuration variables at `config.js` for MongoDB, Twilio and Mastercard Developers.
5. Run `npm install`, then `npm run start`.
6. Copy the https URL from ngrok console and paste in the HTTPS Endpoint at Alexa Skill configuration.
7. Import `intents.json` to Alexa Skill Builder.
8. Go to `https://echosim.io` to test the skill.

## Usage

### Dialogue with Alexa

1. Say `Alexa open (invocation name)`, where invocation name is the name you configured in Alexa Skill.

2. Say `Create an account for (name)`.

    a. Alexa will prompt for mobile number in three parts. First three, second three and last four numbers.

    b. Next Alexa will prompt for card number in four parts. Four numbers for each part.

    c. Alexa will acknowledge that the account is created.

3. Repeat step 2 to create an account for another person.

4. Say `give (name) (amount) for lunch`

    a. Alexa will prompt for sender's account. Say the name created in previous step.

    b. Alexa will acknowledge that the transfer is completed. Spend controls will be set up for the recipient's card for use only at Food merchants only.
