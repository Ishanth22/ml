# FraudGuard AI — Credit Card Fraud Detection Platform

A modern, full-stack, real-time Credit Card Fraud Detection platform utilizing machine learning. Built with a Flask ML API, an Express Gateway server with MongoDB, and a beautiful React dashboard (Vite + Recharts).

---

## 🚀 Key Features

- **Real-Time Analysis**: Input details manually using transaction templates (coffee shop, electronics purchase, international travel) to see instant predictions.
- **Batch CSV Predictions**: Upload transaction batches via CSV to evaluate thousands of transactions at once.
- **Premium Dashboard**: Visual analytics showing fraud distribution, transaction volume, and recent fraud alerts.
- **Model Performance Dashboard**: Complete transparency showing confusion matrix, key metrics (precision, recall, F1, AUC), feature importance, and comparison against baselines.
- **Secure Authentication**: User signup and login with JWT stored in local storage.

---

## 🛠️ Tech Stack

- **ML Pipeline & API**: Python, Scikit-Learn, Pandas, SMOTE, Flask
- **Backend Server**: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT)
- **Frontend Dashboard**: React (Vite), React Router, Recharts, React Icons, Custom Dark-Mode CSS

---

## ⚙️ How to Run Locally

### Prerequisites
1. **Python 3.8+**
2. **Node.js 18+**
3. **MongoDB** running locally on default port `27017` (e.g. `mongodb://localhost:27017/fraud-detection`)

### Step 1: Start the Flask ML API (Port 5000)
Navigate to the root directory, activate your virtual environment (if any), and run:
```bash
python app.py
```

### Step 2: Start the Express Gateway Server (Port 4000)
Navigate to the backend directory, install packages, and start the node server:
```bash
cd backend
npm install
node server.js
```

### Step 3: Start the Vite React Frontend (Port 5173)
Navigate to the frontend directory, install packages, and start the dev server:
```bash
cd ../frontend
npm install
npm run dev
```

Finally, open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**.

---

## 📊 Evaluation Metrics
- **Model**: Random Forest Classifier
- **Test Samples**: 56,962
- **Precision**: 87.0%
- **Recall**: 83.0%
- **F1 Score**: 85.0%
- **ROC-AUC**: 97.4%
