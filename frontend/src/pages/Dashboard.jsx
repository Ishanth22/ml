import { useState, useEffect } from 'react';
import { getStats } from '../api/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getStats();
      setStats(res.data);
    } catch (err) {
      // If no transactions yet, set defaults
      setStats({
        totalTransactions: 0,
        fraudCount: 0,
        legitCount: 0,
        fraudRate: 0,
        recentFrauds: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page"><div className="loading"><div className="spinner"></div>Loading dashboard...</div></div>;
  }

  const pieData = [
    { name: 'Legitimate', value: stats.legitCount || 1 },
    { name: 'Fraud', value: stats.fraudCount || 0 },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  const barData = [
    { name: 'Total', value: stats.totalTransactions, fill: '#3b82f6' },
    { name: 'Legit', value: stats.legitCount, fill: '#10b981' },
    { name: 'Fraud', value: stats.fraudCount, fill: '#ef4444' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time fraud detection overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Analyzed</span>
            <div className="stat-card-icon blue"><FiActivity /></div>
          </div>
          <div className="stat-card-value">{stats.totalTransactions}</div>
          <div className="stat-card-detail">Transactions processed</div>
        </div>

        <div className="stat-card red">
          <div className="stat-card-header">
            <span className="stat-card-label">Fraud Detected</span>
            <div className="stat-card-icon red"><FiAlertTriangle /></div>
          </div>
          <div className="stat-card-value">{stats.fraudCount}</div>
          <div className="stat-card-detail">Suspicious transactions</div>
        </div>

        <div className="stat-card green">
          <div className="stat-card-header">
            <span className="stat-card-label">Legitimate</span>
            <div className="stat-card-icon green"><FiCheckCircle /></div>
          </div>
          <div className="stat-card-value">{stats.legitCount}</div>
          <div className="stat-card-detail">Safe transactions</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Fraud Rate</span>
            <div className="stat-card-icon purple"><FiTrendingUp /></div>
          </div>
          <div className="stat-card-value">{stats.fraudRate}%</div>
          <div className="stat-card-detail">Detection percentage</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="glass-card">
          <h3 className="glass-card-title">📊 Transaction Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card">
          <h3 className="glass-card-title">📈 Transaction Summary</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="glass-card-title">🚨 Recent Fraud Alerts</h3>
        {stats.recentFrauds && stats.recentFrauds.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Confidence</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentFrauds.map((fraud, idx) => (
                  <tr key={idx}>
                    <td>{new Date(fraud.createdAt).toLocaleString()}</td>
                    <td>${fraud.amount?.toFixed(2) || '0.00'}</td>
                    <td>{fraud.confidence}%</td>
                    <td><span className={`badge ${fraud.riskLevel?.toLowerCase()}`}>{fraud.riskLevel}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No fraud alerts yet. Analyze some transactions to see alerts here.</p>
        )}
      </div>
    </div>
  );
}
