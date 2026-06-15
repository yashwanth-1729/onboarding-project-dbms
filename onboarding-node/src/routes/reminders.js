const express = require('express');
const Reminder = require('../models/Reminder');
const ActivityLog = require('../models/ActivityLog');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /reminders — a manager sends a reminder to an employee (MANAGER only).
router.post('/', authRequired('MANAGER'), async (req, res) => {
  try {
    const { user_id, message } = req.body;
    if (!user_id || !message) {
      return res.status(400).json({ message: 'user_id and message are required.' });
    }
    const reminder = await Reminder.create({
      managerEmail: req.userEmail,
      userId: Number(user_id),
      message,
    });
    // Record it in the audit trail too (same Node service owns activity_log).
    await ActivityLog.create({
      action: 'REMINDER_SENT',
      actorEmail: req.userEmail,
      detail: 'Reminder sent to user ' + user_id,
    });
    res.json({ message: 'Reminder sent.', id: reminder._id });
  } catch (e) {
    res.status(500).json({ message: 'Failed to send reminder.' });
  }
});

// GET /reminders/:userId — list reminders sent to one employee (MANAGER only).
router.get('/:userId', authRequired('MANAGER'), async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: Number(req.params.userId) }).sort({ sentAt: -1 });
    res.json(reminders);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch reminders.' });
  }
});

module.exports = router;
