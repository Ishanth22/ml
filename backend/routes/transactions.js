const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const FLASK_API = process.env.FLASK_API_URL || 'http://localhost:5000';

// Configure multer for CSV file uploads (store in memory)
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/transactions/predict — Predict single transaction
router.post('/predict', auth, async (req, res) => {
  try {
    // Forward the request to Flask ML API
    const flaskResponse = await axios.post(`${FLASK_API}/predict`, req.body);
    const result = flaskResponse.data;

    // Save the transaction to MongoDB
    const transaction = new Transaction({
      userId: req.user.id,
      features: req.body,
      amount: req.body.Amount || 0,
      prediction: result.prediction,
      confidence: result.confidence,
      riskLevel: result.risk_level,
      fraudProbability: result.fraud_probability
    });

    await transaction.save();

    res.json({
      ...result,
      transactionId: transaction._id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions/batch-predict — Predict from CSV file
router.post('/batch-predict', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    // Forward the file to Flask ML API
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const flaskResponse = await axios.post(`${FLASK_API}/batch-predict`, formData, {
      headers: formData.getHeaders()
    });

    const batchResult = flaskResponse.data;

    // Save each transaction to MongoDB
    if (batchResult.results) {
      const transactions = batchResult.results.map(r => ({
        userId: req.user.id,
        features: {},
        amount: 0,
        prediction: r.prediction,
        confidence: r.confidence,
        riskLevel: r.risk_level,
        fraudProbability: r.fraud_probability
      }));

      await Transaction.insertMany(transactions);
    }

    res.json(batchResult);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/history — Get transaction history for logged-in user
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      total: transactions.length,
      transactions
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/metrics — Get model performance metrics
router.get('/metrics', async (req, res) => {
  try {
    const flaskResponse = await axios.get(`${FLASK_API}/metrics`);
    res.json(flaskResponse.data);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch metrics from ML API' });
  }
});

// GET /api/transactions/stats — Dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments({ userId: req.user.id });
    const fraudCount = await Transaction.countDocuments({ userId: req.user.id, prediction: 'Fraud' });
    const legitCount = totalTransactions - fraudCount;
    const recentFrauds = await Transaction.find({ userId: req.user.id, prediction: 'Fraud' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalTransactions,
      fraudCount,
      legitCount,
      fraudRate: totalTransactions > 0 ? ((fraudCount / totalTransactions) * 100).toFixed(2) : 0,
      recentFrauds
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
