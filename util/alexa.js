const elicitSlot = (slotToElicit, response, speechOutput = 'Could you repeat that?') => {
  response.say(speechOutput)
  .directive({
    type: 'Dialog.ElicitSlot',
    slotToElicit,
  })
  .shouldEndSession(false);
}

const validateSlotValues = async (request, response, validators = {}) => {
  const slots = Object.values(request.slots);

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const validator = validators[slot.name];

    if (!isSlotValueValid(slot.value)) {
      console.log(`${slot.name} with value "${slot.value}" is not valid`);
      elicitSlot(slot.name, response);
      return false;
    } else if (slot.value != null && validator) {
      const speechOutput = await validator(slot.value);

      if (speechOutput) {
        console.log(`${slot.name} with value "${slot.value}" is not valid`);
        elicitSlot(slot.name, response, speechOutput);
        return false;
      }
    }
  }

  return true;
}

const isSlotValueValid = (slotValue) => (slotValue == null || slotValue !== '?');

module.exports = {
  validateSlotValues,
};
