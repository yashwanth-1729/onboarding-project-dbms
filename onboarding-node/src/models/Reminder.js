const mongoose = require('mongoose');

// A manager's nudge to an employee. Self-contained document — no joins — so it
// fits MongoDB. managerEmail comes from the JWT; userId targets the employee.
const reminderSchema = new mongoose.Schema(
  {
    managerEmail: { type: String, required: true },
    userId: { type: Number, required: true },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { collection: 'reminders' }
);

module.exports = mongoose.model('Reminder', reminderSchema);
