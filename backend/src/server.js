import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 3001;

const server = app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

// Shut down cleanly (e.g. Ctrl+C or a deploy restart) so in-flight
// requests finish and the DB connection can close.
function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });

  // timeout to allow hangup.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
// process.on('SIGINFO', () => shutdown('SIGINFO'))