import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[FinTrack Server] Listening securely on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// Graceful shutdown handling
const shutdown = (signal) => {
  console.log(`[FinTrack Server] Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.log('[FinTrack Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
