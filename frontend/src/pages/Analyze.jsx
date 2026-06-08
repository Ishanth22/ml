import { useState, useRef } from 'react';
import { predictSingle, batchPredict } from '../api/api';
import { FiUploadCloud, FiSearch, FiFile } from 'react-icons/fi';

const TRANSACTION_TEMPLATES = [
  {
    name: '🟢 Normal Coffee Shop Purchase',
    data: { V1: -1.36, V2: -0.07, V3: 2.54, V4: 1.38, V5: -0.34, V6: -0.43, V7: -0.29, V8: -0.10, V9: -0.91, V10: -0.44, V11: 1.26, V12: 0.09, V13: 0.64, V14: -0.23, V15: 0.11, V16: -0.53, V17: 0.40, V18: 0.07, V19: 0.08, V20: 0.08, V21: -0.06, V22: -0.08, V23: -0.04, V24: 0.01, V25: -0.06, V26: -0.19, V27: 0.13, V28: -0.02, Amount: 4.99 }
  },
  {
    name: '🟢 Regular Grocery Shopping',
    data: { V1: 1.19, V2: 0.27, V3: 0.17, V4: 0.45, V5: 0.06, V6: -0.08, V7: 0.09, V8: 0.09, V9: -0.26, V10: -0.17, V11: 1.61, V12: 1.07, V13: 0.49, V14: -0.14, V15: 0.64, V16: 0.46, V17: -0.11, V18: -0.18, V19: -0.15, V20: -0.07, V21: -0.23, V22: -0.64, V23: -0.06, V24: -0.07, V25: 0.28, V26: 0.13, V27: -0.01, V28: 0.01, Amount: 67.88 }
  },
  {
    name: '🔴 Suspicious Midnight Transaction',
    data: { V1: -2.31, V2: 1.95, V3: -1.61, V4: 3.99, V5: -0.52, V6: -1.43, V7: -2.54, V8: 1.39, V9: -2.77, V10: -2.77, V11: 3.20, V12: -2.90, V13: -0.60, V14: -4.29, V15: 0.39, V16: -1.14, V17: -2.83, V18: -0.02, V19: 0.42, V20: 0.14, V21: 0.66, V22: 0.71, V23: 0.10, V24: -0.93, V25: -0.69, V26: 1.49, V27: -0.14, V28: 0.10, Amount: 1.00 }
  },
  {
    name: '🔴 High-Value Suspicious Purchase',
    data: { V1: -1.36, V2: 2.00, V3: -2.63, V4: 2.45, V5: -1.14, V6: -0.76, V7: -3.49, V8: 1.52, V9: -1.95, V10: -5.64, V11: 4.51, V12: -5.47, V13: 1.13, V14: -8.54, V15: -0.19, V16: -3.21, V17: -5.04, V18: -2.69, V19: 0.94, V20: 0.39, V21: 0.71, V22: 0.82, V23: -0.08, V24: -0.74, V25: -0.54, V26: 0.89, V27: -0.09, V28: 0.06, Amount: 4.97 }
  }
];

export default function Analyze() {
  const [mode, setMode] = useState('single');
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [amount, setAmount] = useState(TRANSACTION_TEMPLATES[0].data.Amount);
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  const handleTemplateChange = (idx) => {
    setSelectedTemplate(idx);
    setAmount(TRANSACTION_TEMPLATES[idx].data.Amount);
    setResult(null);
  };

  const handlePredict = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = { ...TRANSACTION_TEMPLATES[selectedTemplate].data, Amount: parseFloat(amount) };
      const res = await predictSingle(data);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed. Make sure all servers are running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError('');
    setBatchResults(null);
    try {
      const res = await batchPredict(file);
      setBatchResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Batch prediction failed. Make sure all servers are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Analyze Transaction</h1>
        <p className="page-subtitle">Test individual transactions or upload a CSV for batch analysis</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setMode('single'); setBatchResults(null); }}>
          <FiSearch size={16} /> Single Transaction
        </button>
        <button className={`btn ${mode === 'batch' ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setMode('batch'); setResult(null); }}>
          <FiUploadCloud size={16} /> CSV Upload
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {mode === 'single' && (
        <div className="glass-card">
          <h3 className="glass-card-title">🔍 Transaction Profile</h3>
          <div className="form-group">
            <label className="form-label">Select Transaction Template</label>
            <select className="form-input" value={selectedTemplate} onChange={(e) => handleTemplateChange(Number(e.target.value))}>
              {TRANSACTION_TEMPLATES.map((t, idx) => (
                <option key={idx} value={idx}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Transaction Amount ($)</label>
            <input className="form-input" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
          </div>
          <button className="btn btn-primary btn-lg" onClick={handlePredict} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, marginRight: 6 }}></div>Analyzing...</> : <><FiSearch /> Analyze Transaction</>}
          </button>

          {result && (
            <div className={`result-card ${result.prediction === 'Fraud' ? 'fraud' : 'legit'}`}>
              <div className="result-icon">{result.prediction === 'Fraud' ? '🚨' : '✅'}</div>
              <div className="result-status">{result.prediction}</div>
              <div className="result-confidence" style={{ color: result.prediction === 'Fraud' ? '#ef4444' : '#10b981' }}>
                {result.confidence}%
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Confidence Score</p>
              <div className="result-risk">
                Risk Level: <span className={`badge ${result.risk_level?.toLowerCase()}`}>{result.risk_level}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'batch' && (
        <div className="glass-card">
          <h3 className="glass-card-title">📁 Upload CSV File</h3>
          <div className="file-upload" onClick={() => fileRef.current?.click()}>
            <div className="file-upload-icon"><FiUploadCloud /></div>
            <p className="file-upload-text">
              {fileName ? <><FiFile /> {fileName}</> : <><strong>Click to upload</strong> or drag a CSV file here</>}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px' }}>CSV must contain columns: V1-V28, Amount</p>
          </div>
          <input type="file" ref={fileRef} accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />

          {loading && <div className="loading" style={{ marginTop: '20px' }}><div className="spinner"></div>Processing CSV...</div>}

          {batchResults && (
            <>
              <div className="stats-grid" style={{ marginTop: '24px' }}>
                <div className="stat-card blue">
                  <div className="stat-card-label">Total</div>
                  <div className="stat-card-value">{batchResults.total_transactions}</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-card-label">Legitimate</div>
                  <div className="stat-card-value">{batchResults.legitimate}</div>
                </div>
                <div className="stat-card red">
                  <div className="stat-card-label">Fraud</div>
                  <div className="stat-card-value">{batchResults.fraud_detected}</div>
                </div>
              </div>
              <div className="table-container" style={{ marginTop: '16px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Prediction</th>
                      <th>Confidence</th>
                      <th>Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.results?.slice(0, 50).map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.transaction_id}</td>
                        <td><span className={`badge ${r.prediction === 'Fraud' ? 'fraud' : 'legit'}`}>{r.prediction}</span></td>
                        <td>{r.confidence}%</td>
                        <td><span className={`badge ${r.risk_level?.toLowerCase()}`}>{r.risk_level}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {batchResults.results?.length > 50 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px', fontSize: '0.8rem' }}>
                    Showing first 50 of {batchResults.results.length} results
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
