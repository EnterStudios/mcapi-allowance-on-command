const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collation = {
  locale: 'en_US',
  strength: 2
};

const accountSchema = new Schema({
  name: String,
  pan: String,
  mobileNumber: String,
  spendControlsCardUuid: String
}, { ...collation });

accountSchema.statics.findByName = async function(name) {
  return await this.findOne({ name }, null, { collation })
  .then((obj) => {
    if (obj) {
      return obj;
    }
  });
};

accountSchema.statics.saveOrUpdate = async function(account) {
  return await this.findOneAndUpdate({ name: account.name }, account, {
    upsert: true,
    new: true,
    collation
  });
}

module.exports = mongoose.model('Account', accountSchema);
