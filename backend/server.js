const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Credit Card Fraud Detection Backend',
    endpoints: {
      '/api/auth/register': 'POST - Register new user',
      '/api/auth/login': 'POST - Login user',
      '/api/transactions/predict': 'POST - Predict single transaction',
      '/api/transactions/batch-predict': 'POST - Predict from CSV',
      '/api/transactions/history': 'GET - Get transaction history',
      '/api/transactions/metrics': 'GET - Get model metrics'
    }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Flask ML API expected at: ${process.env.FLASK_API_URL}`);
});
