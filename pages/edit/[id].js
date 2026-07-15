import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Edit() {
  const router = useRouter();
  const { id } = router.query;
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [ctaText, setCtaText] = useState('Try it');
  const [ctaType, setCtaType] = useState('link');
  const [ctaDest, setCtaDest] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) fetchExperiment();
  }, [id]);

  async function fetchExperiment() {
    try {
      const res = await fetch(`/api/experiments/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setTitle(data.title);
      setHypothesis(data.hypothesis || '');
      setCtaText(data.cta_text);
      setCtaType(data.cta_type);
      setCtaDest(data.cta_destination || '');
      setStatus(data.status);
    } catch (err) {
      setError('Failed to load experiment');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/experiments/${id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          hypothesis: hypothesis.trim(),
          cta_text: ctaText.trim(),
          cta_type: ctaType,
          cta_destination: ctaDest.trim() || null,
          status
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card"><div className="loading">Loading experiment...</div></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <Link href="/" className="back-link">← Dashboard</Link>
          <h1>Edit Experiment</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <form onSubmit={handleSave}>
            <label>Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />

            <label>Hypothesis</label>
            <textarea className="input" value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} placeholder="People will sign up if we offer X" />

            <label>CTA Text</label>
            <input className="input" value={ctaText} onChange={(e) => setCtaText(e.target.value)} required />

            <label>CTA Type</label>
            <select className="input" value={ctaType} onChange={(e) => setCtaType(e.target.value)}>
              <option value="link">External link</option>
              <option value="email">Email capture</option>
            </select>

            {ctaType === 'link' && (
              <>
                <label>Destination URL</label>
                <input className="input" value={ctaDest} onChange={(e) => setCtaDest(e.target.value)} placeholder="https://example.com" />
              </>
            )}

            <label>Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>

            {error && <div className="error-text">{error}</div>}
            {success && <div className="success-text">Saved!</div>}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link href={`/dashboard/${id}`}>
                <button className="button button-secondary" type="button">Cancel</button>
              </Link>
            </div>
          </form>
        </div>

        <div className="card">
          <h3>Preview</h3>
          <div className="small">How your experiment looks to visitors.</div>
          <iframe className="preview-iframe" srcDoc={`
            <html>
              <head><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
              <body style="font-family:Inter,system-ui;padding:20px;">
                <h1>${title || 'Experiment Title'}</h1>
                <p>${hypothesis || 'Hypothesis goes here'}</p>
                <button style="background:#0b69ff;color:white;padding:10px 14px;border-radius:6px;border:0">${ctaText}</button>
                <p style="margin-top:18px;font-size:12px;color:#666">Built with LaunchPad</p>
              </body>
            </html>
          `} />
        </div>
      </div>
    </div>
  );
}
