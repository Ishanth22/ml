import { useState, useEffect } from 'react';
import { getHistory } from '../api/api';

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchAmount, setSearchAmount] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getHistory();
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter((t) => {
    if (filter === 'fraud' && t.prediction !== 'Fraud') return false;
    if (filter === 'legit' && t.prediction !== 'Legitimate') return false;
    if (searchAmount && t.amount < parseFloat(searchAmount)) return false;
    return true;
  });

  if (loading) {
    return <div className="page"><div className="loading"><div className="spinner"></div>Loading history...</div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Transaction History</h1>
        <p className="page-subtitle">{transactions.length} transactions analyzed</p>
      </div>

      <div className="filter-bar">
        <select className="form-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Transactions</option>
          <option value="fraud">Fraud Only</option>
          <option value="legit">Legitimate Only</option>
        </select>
        <input className="form-input" type="number" placeholder="Min amount ($)" value={searchAmount} onChange={(e) => setSearchAmount(e.target.value)} />
      </div>

      <div className="glass-card">
        {filtered.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Prediction</th>
                  <th>Confidence</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => (
                  <tr key={t._id || idx}>
                    <td>{idx + 1}</td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                    <td>${t.amount?.toFixed(2) || '0.00'}</td>
                    <td><span className={`badge ${t.prediction === 'Fraud' ? 'fraud' : 'legit'}`}>{t.prediction}</span></td>
                    <td>{t.confidence}%</td>
                    <td><span className={`badge ${t.riskLevel?.toLowerCase()}`}>{t.riskLevel}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
            {transactions.length === 0 ? 'No transactions analyzed yet. Go to the Analyze page to get started!' : 'No transactions match your filters.'}
          </p>
        )}
      </div>
    </div>
  );
}
