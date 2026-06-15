const mongoose = require('mongoose');

// Append-only audit trail. One document per system event (login, step completion,
// assignment, reminder, deletion). Schema-flexible by design.
const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // LOGIN, STEP_COMPLETED, WORKFLOW_ASSIGNED, REMINDER_SENT, ...
    actorEmail: { type: String },
    detail: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: 'activity_log' }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
