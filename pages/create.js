import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Create() {
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [ctaText, setCtaText] = useState('Try it');
  const [ctaType, setCtaType] = useState('link');
  const [ctaDest, setCtaDest] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  function makeSlug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
  }

  async function handlePublish(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!ctaText.trim()) {
      setError('CTA text is required');
      return;
    }
    if (ctaType === 'link' && !ctaDest.trim()) {
      setError('Destination URL is required for link type');
      return;
    }

    setLoading(true);
    const public_slug = slug.trim() || makeSlug(title || `exp-${Date.now()}`);

    const res = await fetch('/api/experiments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        hypothesis: hypothesis.trim(),
        cta_text: ctaText.trim(),
        cta_type: ctaType,
        cta_destination: ctaDest.trim() || null,
        public_slug
      })
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      if (typeof pendo !== 'undefined') {
        pendo.track("experiment_created", {
          experimentId: String(data.id),
          title: title,
          hypothesis: hypothesis,
          cta_type: ctaType,
          cta_destination: ctaDest,
          public_slug: data.public_slug
        });
      }
      router.push(`/dashboard/${data.id}`);
    } else {
      if (typeof pendo !== 'undefined') {
        pendo.track("experiment_creation_failed", {
          error_message: String(data.error || 'Could not create').substring(0, 100),
          title: title,
          cta_type: ctaType,
          cta_destination: ctaDest
        });
      }
      setError(data.error || 'Could not create experiment');
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <Link href="/" className="back-link">← Dashboard</Link>
          <h1>Create Experiment</h1>
          <div className="small">Publish a shareable mini-landing page</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <form onSubmit={handlePublish}>
            <label>Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My experiment title" required />

            <label>Hypothesis (one sentence)</label>
            <textarea className="input" value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} placeholder="People will sign up if we offer X" />

            <label>CTA Text</label>
            <input className="input" value={ctaText} onChange={(e) => setCtaText(e.target.value)} required />

            <label>CTA Type</label>
            <select className="input" value={ctaType} onChange={(e) => setCtaType(e.target.value)}>
              <option value="link">External link (redirect)</option>
              <option value="email">Email capture</option>
            </select>

            {ctaType === 'link' && (
              <>
                <label>Destination URL</label>
                <input className="input" value={ctaDest} onChange={(e) => setCtaDest(e.target.value)} placeholder="https://example.com" required />
              </>
            )}

            <label>Public slug (optional)</label>
            <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="custom-slug" />

            {error && <div className="error-text">{error}</div>}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish'}
              </button>
              <Link href="/">
                <button className="button button-secondary" type="button">Cancel</button>
              </Link>
            </div>
          </form>
        </div>

        <div className="card">
          <h3>Preview</h3>
          <div className="small">This preview shows how your experiment will look after publishing.</div>
          <iframe className="preview-iframe" srcDoc={`
            <html>
              <head><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
              <body style="font-family:Inter,system-ui;padding:20px;">
                <h1>${title || 'Experiment Title'}</h1>
                <p>${hypothesis || 'Hypothesis goes here — one sentence.'}</p>
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
