const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');

// Connect to the SAME MongoDB the project already uses. The reminders and
// activity_log collections now live here, owned by this Node service.
function connectDB() {
  return mongoose
    .connect(MONGO_URI)
    .then(() => console.log('[node] MongoDB connected:', MONGO_URI));
}

module.exports = connectDB;
