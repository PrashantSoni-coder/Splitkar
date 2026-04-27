require('dotenv').config();
const mongoose = require('mongoose');
const app      = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[SplitKar] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// ── Graceful shutdown ──
const shutdown = async (signal) => {
  console.log(`[SplitKar] ${signal} received — shutting down gracefully`);
  server.close(async () => {
    await mongoose.connection.close();
    console.log('[SplitKar] MongoDB connection closed');
    process.exit(0);
  });
  // Force exit after 10s if connections hang
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Unhandled rejections ──
process.on('unhandledRejection', (err) => {
  console.error('[SplitKar] Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
