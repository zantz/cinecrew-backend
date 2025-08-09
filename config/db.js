const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('MONGO_URI not set');
      process.exit(1);
    }
    await mongoose.connect(uri, { });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ Mongo error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
