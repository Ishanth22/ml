import { useState, useEffect } from 'react';
import { getMetrics } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function Performance() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await getMetrics();
      setMetrics(res.data);
    } catch {
      // Fallback to hardcoded metrics if Flask is not running
      setMetrics({
        model_name: 'Random Forest',
        n_estimators: 100,
        precision: 0.87,
        recall: 0.83,
        f1_score: 0.85,
        roc_auc: 0.9737,
        accuracy: 1.00,
        true_positives: 81,
        false_positives: 12,
        true_negatives: 56852,
        false_negatives: 17,
        total_test_samples: 56962,
        training_data: { total_transactions: 284807, fraud_cases: 492, fraud_percentage: 0.17 }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page"><div className="loading"><div className="spinner"></div>Loading metrics...</div></div>;
  }

  const metricsData = [
    { name: 'Precision', value: metrics.precision, color: '#3b82f6' },
    { name: 'Recall', value: metrics.recall, color: '#8b5cf6' },
    { name: 'F1 Score', value: metrics.f1_score, color: '#10b981' },
    { name: 'ROC-AUC', value: metrics.roc_auc, color: '#f59e0b' },
  ];

  const comparisonData = [
    { name: 'Logistic Reg.', precision: 0.06, recall: 0.92, f1: 0.11, auc: 0.97 },
    { name: 'Random Forest', precision: 0.87, recall: 0.83, f1: 0.85, auc: 0.97 },
    { name: 'XGBoost', precision: 0.68, recall: 0.86, f1: 0.76, auc: 0.98 },
  ];

  const featureData = [
    { name: 'V10', importance: 0.146 },
    { name: 'V14', importance: 0.143 },
    { name: 'V4', importance: 0.129 },
    { name: 'V12', importance: 0.103 },
    { name: 'V11', importance: 0.096 },
    { name: 'V17', importance: 0.072 },
    { name: 'V3', importance: 0.058 },
    { name: 'V7', importance: 0.041 },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Model Performance</h1>
        <p className="page-subtitle">Evaluation metrics for the {metrics.model_name} classifier</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        {metricsData.map((m) => (
          <div className="metric-item" key={m.name}>
            <div className="metric-value">{(m.value * 100).toFixed(1)}%</div>
            <div className="metric-label">{m.name}</div>
          </div>
        ))}
        <div className="metric-item">
          <div className="metric-value">{metrics.n_estimators}</div>
          <div className="metric-label">Trees</div>
        </div>
        <div className="metric-item">
          <div className="metric-value">{metrics.total_test_samples?.toLocaleString()}</div>
          <div className="metric-label">Test Samples</div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Confusion Matrix */}
        <div className="glass-card">
          <h3 className="glass-card-title">🔢 Confusion Matrix</h3>
          <div className="confusion-matrix">
            <div className="cm-header"></div>
            <div className="cm-header">Pred: Legit</div>
            <div className="cm-header">Pred: Fraud</div>
            <div className="cm-header">Actual: Legit</div>
            <div className="cm-cell cm-tn">{metrics.true_negatives?.toLocaleString()}<br/><small>TN</small></div>
            <div className="cm-cell cm-fp">{metrics.false_positives}<br/><small>FP</small></div>
            <div className="cm-header">Actual: Fraud</div>
            <div className="cm-cell cm-fn">{metrics.false_negatives}<br/><small>FN</small></div>
            <div className="cm-cell cm-tp">{metrics.true_positives}<br/><small>TP</small></div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <p>✅ {metrics.true_positives} frauds correctly caught | ❌ {metrics.false_negatives} frauds missed</p>
            <p>⚠️ {metrics.false_positives} false alarms | ✅ {metrics.true_negatives?.toLocaleString()} correct clears</p>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="glass-card">
          <h3 className="glass-card-title">📊 Feature Importance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={40} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} formatter={(v) => `${(v * 100).toFixed(1)}%`} />
              <Bar dataKey="importance" radius={[0, 6, 6, 0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Comparison */}
      <div className="glass-card">
        <h3 className="glass-card-title">⚡ Model Comparison</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
                <th>ROC-AUC</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((m) => (
                <tr key={m.name}>
                  <td style={{ fontWeight: m.name === 'Random Forest' ? 700 : 400 }}>{m.name}</td>
                  <td>{(m.precision * 100).toFixed(0)}%</td>
                  <td>{(m.recall * 100).toFixed(0)}%</td>
                  <td>{m.f1.toFixed(2)}</td>
                  <td>{m.auc.toFixed(2)}</td>
                  <td>
                    {m.name === 'Random Forest' ? (
                      <span className="badge legit">🏆 Selected</span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8' }}>Baseline</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Training Data Info */}
      <div className="glass-card" style={{ marginTop: '24px' }}>
        <h3 className="glass-card-title">📦 Training Data</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-value">{metrics.training_data?.total_transactions?.toLocaleString()}</div>
            <div className="metric-label">Total Transactions</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{metrics.training_data?.fraud_cases}</div>
            <div className="metric-label">Fraud Cases</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">{metrics.training_data?.fraud_percentage}%</div>
            <div className="metric-label">Fraud Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
