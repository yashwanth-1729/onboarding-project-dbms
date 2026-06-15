const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { PORT } = require('./config');

const remindersRouter = require('./routes/reminders');
const activityRouter = require('./routes/activity');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ status: 'node service running' }));

// MongoDB-backed resources owned by this service
app.use('/reminders', remindersRouter);
app.use('/activity', activityRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[node] service listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('[node] failed to start:', err.message);
    process.exit(1);
  });
