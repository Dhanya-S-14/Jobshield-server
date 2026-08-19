import React, { useState } from 'react';
import { FiDollarSign, FiSearch } from 'react-icons/fi';

const SalaryAnalyzer = () => {
  const [salary, setSalary] = useState('');
  const [frequency, setFrequency] = useState('yearly');
  const [result, setResult] = useState(null);

  const analyze = () => {
    const num = parseFloat(salary.replace(/[^0-9.]/g, ''));
    if (!num) return;
    let yearly = num;
    if (frequency === 'monthly') yearly = num * 12;
    else if (frequency === 'weekly') yearly = num * 52;
    else if (frequency === 'hourly') yearly = num * 2080;

    let score = 0;
    const reasons = [];
    if (yearly > 500000) { score += 30; reasons.push('Salary is unrealistically high (>$500k/year)'); }
    if (yearly < 10000) { score += 25; reasons.push('Salary is below minimum wage'); }
    if (frequency === 'hourly' && num > 500) { score += 20; reasons.push('Hourly rate is suspiciously high'); }
    if (!reasons.length) { score = 5; reasons.push('Salary range appears normal'); }

    const level = score <= 10 ? 'safe' : score <= 30 ? 'suspicious' : 'scam';
    setResult({ score: Math.min(score, 100), level, reasons, yearly, input: num, frequency });
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}><FiDollarSign /> Salary Analyzer</h3>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. 75000"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          style={{ flex: 1 }}
        />
        <select className="form-select" value={frequency} onChange={(e) => setFrequency(e.target.value)} style={{ width: 130 }}>
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="hourly">Hourly</option>
        </select>
        <button className="btn btn-primary" onClick={analyze}><FiSearch /> Analyze</button>
      </div>
      {result && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Risk Score: {result.score}/100</span>
            <span className={`badge ${result.level === 'safe' ? 'badge-safe' : result.level === 'suspicious' ? 'badge-suspicious' : 'badge-scam'}`}>
              {result.level}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            Equivalent yearly: ${result.yearly.toLocaleString()}
          </p>
          <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
            {result.reasons.map((r, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SalaryAnalyzer;
