import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) fetchAnalytics();
  }, [id]);

  async function fetchAnalytics() {
    try {
      const res = await fetch(`/api/analytics/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  function copyShareLink() {
    const url = `${window.location.origin}/experiments/${data.experiment.public_slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card"><div className="loading">Loading analytics...</div></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container">
        <div className="card">
          <div className="error-text">{error || 'Experiment not found'}</div>
          <Link href="/"><button className="button" style={{ marginTop: 12 }}>Back to Dashboard</button></Link>
        </div>
      </div>
    );
  }

  const { experiment, metrics, timeline, recentSubmissions } = data;
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/experiments/${experiment.public_slug}`;

  return (
    <div className="container">
      <div className="header">
        <div>
          <Link href="/" className="back-link">← Dashboard</Link>
          <h1>{experiment.title}</h1>
          <div className="small">Created {formatDate(experiment.created_at)}</div>
        </div>
        <div className="header-actions">
          <Link href={`/edit/${experiment.id}`}>
            <button className="button button-secondary">Edit</button>
          </Link>
          <Link href={`/experiments/${experiment.public_slug}`} target="_blank">
            <button className="button">View Live</button>
          </Link>
        </div>
      </div>

      {experiment.hypothesis && (
        <div className="card">
          <div className="card-label">Hypothesis</div>
          <p>{experiment.hypothesis}</p>
        </div>
      )}

      <div className="share-card card">
        <div className="card-label">Share Link</div>
        <div className="share-url-row">
          <input className="input" value={shareUrl} readOnly />
          <button className="button" onClick={copyShareLink}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-value-large">{metrics.views}</div>
          <div className="metric-label">Total Views</div>
        </div>
        <div className="card metric-card">
          <div className="metric-value-large">{metrics.ctaClicks}</div>
          <div className="metric-label">CTA Clicks</div>
        </div>
        <div className="card metric-card">
          <div className="metric-value-large">{metrics.signups}</div>
          <div className="metric-label">Signups</div>
        </div>
        <div className="card metric-card">
          <div className="metric-value-large">{metrics.clickRate}%</div>
          <div className="metric-label">Click Rate</div>
        </div>
        <div className="card metric-card metric-card-accent">
          <div className="metric-value-large">{metrics.conversionRate}%</div>
          <div className="metric-label">Conversion Rate</div>
        </div>
      </div>

      {Object.keys(timeline.viewsByDay).length > 0 && (
        <div className="card">
          <div className="card-label">Activity Timeline</div>
          <div className="timeline">
            {Object.entries(timeline.viewsByDay)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([day, views]) => (
                <div key={day} className="timeline-row">
                  <span className="timeline-date">{formatDate(day)}</span>
                  <div className="timeline-bars">
                    <div className="timeline-bar views-bar" style={{ width: `${(views / Math.max(...Object.values(timeline.viewsByDay))) * 100}%` }}>
                      {views} views
                    </div>
                    {timeline.clicksByDay[day] && (
                      <div className="timeline-bar clicks-bar" style={{ width: `${(timeline.clicksByDay[day] / Math.max(...Object.values(timeline.viewsByDay))) * 100}%` }}>
                        {timeline.clicksByDay[day]} clicks
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {experiment.cta_type === 'email' && recentSubmissions.length > 0 && (
        <div className="card">
          <div className="card-label">Recent Submissions ({metrics.totalSubmissions} total)</div>
          <div className="submissions-list">
            {recentSubmissions.map(sub => (
              <div key={sub.id} className="submission-row">
                <span className="submission-email">{sub.email}</span>
                <span className="submission-date small">{formatDateTime(sub.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-label">Experiment Details</div>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">CTA Type</span>
            <span className="detail-value">{experiment.cta_type === 'link' ? 'External Link' : 'Email Capture'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CTA Text</span>
            <span className="detail-value">{experiment.cta_text}</span>
          </div>
          {experiment.cta_destination && (
            <div className="detail-item">
              <span className="detail-label">Destination</span>
              <span className="detail-value">{experiment.cta_destination}</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className={`status-badge status-${experiment.status}`}>{experiment.status}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Slug</span>
            <span className="detail-value">{experiment.public_slug}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
