const mongoose = require('mongoose');

const buildMongoOptions = () => {
  const options = {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
    family: process.env.MONGO_FORCE_IPV4 === 'true' ? 4 : undefined,
    tls: process.env.MONGO_TLS === 'true' ? true : undefined,
    tlsAllowInvalidCertificates:
      process.env.MONGO_TLS_ALLOW_INVALID_CERTS === 'true' ? true : undefined,
  };

  Object.keys(options).forEach((key) => {
    if (options[key] === undefined) delete options[key];
  });

  return options;
};

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || '';
    if (!uri) {
      console.warn('??  MONGO_URI is not set. Database connection will fail.');
    } else if (!/\/jewelry_db(\?|$)/i.test(uri)) {
      console.warn('??  MONGO_URI does not include /jewelry_db. You may be connecting to an empty or wrong database.');
    }

    mongoose.connection.on('error', (err) => {
      console.error(`??  MongoDB connection error: ${err.message}`);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('??  MongoDB disconnected');
    });

    const conn = await mongoose.connect(uri, buildMongoOptions());
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ DB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
