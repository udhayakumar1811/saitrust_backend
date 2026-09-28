const mongoose = require('mongoose');
const dns = require('dns');

// Use Google DNS for MongoDB Atlas SRV resolution
dns.setServers(['8.8.8.8']);

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      'MONGO_URI is not set. Copy .env.example to .env and configure it.'
    );
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri);

    console.log(
      `[db] MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`
    );
  } catch (error) {
    console.error('[db] MongoDB connection failed:', error.message);
    throw error;
  }

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });
}

module.exports = connectDB;