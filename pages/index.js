import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExperiments();
  }, []);

  async function fetchExperiments() {
    try {
      const res = await fetch('/api/experiments');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setExperiments(data);
    } catch (err) {
      setError('Failed to load experiments');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/experiments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setExperiments(experiments.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to delete experiment');
    }
  }

  async function handleStatusToggle(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/experiments/${id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update');
      setExperiments(experiments.map(e => e.id === id ? { ...e, status: newStatus } : e));
    } catch (err) {
      alert('Failed to update status');
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>LaunchPad</h1>
          <div className="small">Validate ideas in minutes</div>
        </div>
        <Link href="/create">
          <button className="button">+ New Experiment</button>
        </Link>
      </div>

      {loading ? (
        <div className="card">
          <div className="loading">Loading experiments...</div>
        </div>
      ) : error ? (
        <div className="card">
          <div className="error-text">{error}</div>
          <button className="button" onClick={fetchExperiments} style={{ marginTop: 12 }}>Retry</button>
        </div>
      ) : experiments.length === 0 ? (
        <div className="card empty-state">
          <h2>No experiments yet</h2>
          <p className="small">Create your first experiment to start validating ideas.</p>
          <Link href="/create">
            <button className="button" style={{ marginTop: 16 }}>Create Experiment</button>
          </Link>
        </div>
      ) : (
        <div className="experiments-grid">
          {experiments.map(exp => (
            <div key={exp.id} className="card experiment-card">
              <div className="experiment-header">
                <div className="experiment-title">
                  <Link href={`/dashboard/${exp.id}`}>{exp.title}</Link>
                </div>
                <span className={`status-badge status-${exp.status}`}>{exp.status}</span>
              </div>

              {exp.hypothesis && (
                <p className="experiment-hypothesis small">{exp.hypothesis}</p>
              )}

              <div className="metrics-row">
                <div className="metric">
                  <div className="metric-value">{exp.metrics.views}</div>
                  <div className="metric-label">Views</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{exp.metrics.ctaClicks}</div>
                  <div className="metric-label">Clicks</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{exp.metrics.signups}</div>
                  <div className="metric-label">Signups</div>
                </div>
                <div className="metric">
                  <div className="metric-value">{exp.metrics.conversionRate}%</div>
                  <div className="metric-label">Conv.</div>
                </div>
              </div>

              <div className="experiment-footer">
                <span className="small">Created {formatDate(exp.created_at)}</span>
                <div className="experiment-actions">
                  <Link href={`/experiments/${exp.public_slug}`} className="action-link" target="_blank">View</Link>
                  <Link href={`/dashboard/${exp.id}`} className="action-link">Analytics</Link>
                  <Link href={`/edit/${exp.id}`} className="action-link">Edit</Link>
                  <button
                    className="action-link"
                    onClick={() => handleStatusToggle(exp.id, exp.status)}
                  >
                    {exp.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    className="action-link action-delete"
                    onClick={() => handleDelete(exp.id, exp.title)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
