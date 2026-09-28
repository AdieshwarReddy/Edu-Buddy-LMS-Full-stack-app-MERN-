const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edubuddy');
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[MongoDB Warning] Could not connect to local MongoDB. Ensure MongoDB service is running or provide a valid MONGODB_URI.');
    }
    throw error;
  }
};

module.exports = connectDB;
