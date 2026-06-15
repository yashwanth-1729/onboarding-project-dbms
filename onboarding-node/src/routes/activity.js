const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { authRequired, internalOnly } = require('../middleware/auth');

const router = express.Router();

// POST /activity — internal endpoint. Spring Boot calls this (server-to-server)
// to record events it handles: LOGIN, STEP_COMPLETED, WORKFLOW_ASSIGNED, deletions.
router.post('/', internalOnly, async (req, res) => {
  try {
    const { action, actorEmail, detail } = req.body;
    await ActivityLog.create({ action, actorEmail, detail });
    res.json({ message: 'logged' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to log activity.' });
  }
});

// GET /activity — full audit trail, newest first (ADMIN only).
router.get('/', authRequired('ADMIN'), async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch activity log.' });
  }
});

module.exports = router;
