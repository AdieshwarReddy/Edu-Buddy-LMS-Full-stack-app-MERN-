require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP Server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`========================================`);
      console.log(`  Adhi EduBuddy Server running on port ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  API Health: http://localhost:${PORT}/api/health`);
      console.log(`========================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[UnhandledRejection] ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`[Startup Error] Failed to connect to DB: ${error.message}`);
    // Start server even if DB connection retries
    app.listen(PORT, () => {
      console.log(`EduBuddy Server running in fallback mode on port ${PORT}`);
    });
  }
};

startServer();
