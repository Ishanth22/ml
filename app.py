from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib

model = joblib.load('model.pkl')
scaler = joblib.load('scaler.pkl')

app = Flask(__name__)
CORS(app)  


@app.route('/')
def home():
    return jsonify({
        "status": "running",
        "message": "Credit Card Fraud Detection API",
        "endpoints": {
            "/predict": "POST - Predict fraud for a single transaction",
            "/batch-predict": "POST - Predict fraud for multiple transactions (CSV)",
            "/metrics": "GET - Get model performance metrics"
        }
    })
 

@app.route('/predict', methods=['POST'])
def predict():
    try:
      
        data = request.get_json()

        features = []
        for i in range(1, 29):
            features.append(data.get(f'V{i}', 0))

        raw_amount = data.get('Amount', 0)
        scaled_amount = scaler.transform([[raw_amount]])[0][0]
        features.append(scaled_amount)

        features_array = np.array(features).reshape(1, -1)

        # Get prediction (0 = Legitimate, 1 = Fraud)
        prediction = model.predict(features_array)[0]

        # Get probability of fraud (0.0 to 1.0)
        fraud_probability = model.predict_proba(features_array)[0][1]
        confidence = round(fraud_probability * 100, 2)

        if fraud_probability < 0.3:
            risk_level = "Low"
        elif fraud_probability < 0.6:
            risk_level = "Medium"
        elif fraud_probability < 0.85:
            risk_level = "High"
        else:
            risk_level = "Critical"

        return jsonify({
            "prediction": "Fraud" if prediction == 1 else "Legitimate",
            "confidence": confidence,
            "risk_level": risk_level,
            "fraud_probability": round(fraud_probability, 4)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/metrics', methods=['GET'])
def metrics():
    return jsonify({
        "model_name": "Random Forest",
        "n_estimators": 100,
        "precision": 0.87,
        "recall": 0.83,
        "f1_score": 0.85,
        "roc_auc": 0.9737,
        "accuracy": 1.00,
        "true_positives": 81,
        "false_positives": 12,
        "true_negatives": 56852,
        "false_negatives": 17,
        "total_test_samples": 56962,
        "training_data": {
            "total_transactions": 284807,
            "fraud_cases": 492,
            "fraud_percentage": 0.17
        }
    })


@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    try:
        # Check if a file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded. Send a CSV file with key 'file'"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Read CSV into DataFrame
        df = pd.read_csv(file)

        # Drop columns that aren't features
        if 'Time' in df.columns:
            df = df.drop('Time', axis=1)

        # Save actual labels if they exist (for comparison)
        actual_labels = None
        if 'Class' in df.columns:
            actual_labels = df['Class'].tolist()
            df = df.drop('Class', axis=1)

        # Scale the Amount column
        if 'Amount' in df.columns:
            df['Amount'] = scaler.transform(df[['Amount']])

        # Make predictions for all rows
        predictions = model.predict(df)
        probabilities = model.predict_proba(df)[:, 1]

        # Build results list
        results = []
        for i in range(len(predictions)):
            prob = round(float(probabilities[i]), 4)
            result = {
                "transaction_id": i + 1,
                "prediction": "Fraud" if predictions[i] == 1 else "Legitimate",
                "fraud_probability": prob,
                "confidence": round(prob * 100, 2),
                "risk_level": "Critical" if prob >= 0.85 else "High" if prob >= 0.6 else "Medium" if prob >= 0.3 else "Low"
            }
            if actual_labels is not None:
                result["actual_label"] = "Fraud" if actual_labels[i] == 1 else "Legitimate"
            results.append(result)

        # Summary stats
        fraud_count = int(sum(predictions))
        total = len(predictions)

        return jsonify({
            "total_transactions": total,
            "fraud_detected": fraud_count,
            "legitimate": total - fraud_count,
            "fraud_percentage": round((fraud_count / total) * 100, 2),
            "results": results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    print("Loading Credit Card Fraud Detection API...")
    print(f"Model loaded: Random Forest with {model.n_estimators} trees")
    app.run(debug=True, port=5000)
