const app = require('./app');
const db = require('./db/database');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

const port = process.env.PORT || 3001;

// Start server only after the database is connected
const startServer = async () => {
  try {
    await db.connect();

    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });

    process.on('SIGTERM', () => {
      console.info('SIGTERM signal received.');
      server.close(async () => {
        try {
          await db.closeConnection();
          process.exit(0);
        } catch {
          process.exit(1);
        }
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
