const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');

// GET /health  — used by Render for health checks
router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states  = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.status(dbState === 1 ? 200 : 503).json({
    status:   dbState === 1 ? 'ok' : 'degraded',
    db:       states[dbState] || 'unknown',
    uptime:   Math.floor(process.uptime()),
    env:      process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
