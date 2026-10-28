import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/db.js';

async function startServer() {
  console.log('--- Initializing Stockwise Enterprise Backend ---');

  // Verify database connection on startup
  const dbOk = await testConnection();
  if (!dbOk) {
    console.warn('[WARNING] Starting server with database connection warning. Verify MySQL is active.');
  }

  const server = app.listen(env.PORT, () => {
    console.log(`✓ Stockwise REST API running on port ${env.PORT}`);
    console.log(`✓ Health endpoint: http://localhost:${env.PORT}/api/health`);
    console.log(`✓ CORS allowed frontend origin: ${env.FRONTEND_URL}`);
  });

  // Graceful shutdown handling
  const handleShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down Stockwise API server...`);
    server.close(() => {
      console.log('✓ HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
