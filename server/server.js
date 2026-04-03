const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cron = require('node-cron');
const metalRateService = require('./services/metalRateService');
const { recalculateAutoTrending } = require('./services/trendingService');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

app.set('io', io);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/rates', require('./routes/rateRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/trending-products', require('./routes/trendingRoutes'));
app.use('/api/offers', require('./routes/allRoutes').offerRouter);
app.use('/api/questions', require('./routes/generalQuestionRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const startServer = async () => {
  try {
    await connectDB();

    // Cron: Fetch metal rates every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
      // console.log('Fetching live metal rates...');
      await metalRateService.fetchAndSaveRates();
    });

    // Cron: Recalculate auto-trending daily
    cron.schedule('0 3 * * *', async () => {
      console.log('Recalculating auto-trending products...');
      await recalculateAutoTrending();
    });

    // Initial fetch on startup
    await metalRateService.fetchAndSaveRates();
    await recalculateAutoTrending();

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

// Trigger nodemon restart
// restart backend
