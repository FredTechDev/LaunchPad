import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Create() {
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [ctaText, setCtaText] = useState('Try it');
  const [ctaType, setCtaType] = useState('link');
  const [ctaDest, setCtaDest] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function makeSlug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,60);
  }

  async function handlePublish(e) {
    e.preventDefault();
    setLoading(true);
    const public_slug = slug || makeSlug(title || hypothesis || Date.now().toString());
    const body = { title, hypothesis, cta_text: ctaText, cta_type: ctaType, cta_destination: ctaDest, public_slug };
    const res = await fetch('/api/experiments', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push(`/experiments/${data.public_slug}`);
    } else {
      alert(data.error || 'Could not create');
    }
  }

  return (
    <div className="container">
      <div className="header"><h2>Create Experiment</h2><div className="small">Publish a shareable mini-landing page</div></div>

      <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
        <div className="card">
          <label>Title</label>
          <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="My experiment title" />

          <label>Hypothesis (one sentence)</label>
          <textarea className="input" value={hypothesis} onChange={(e)=>setHypothesis(e.target.value)} placeholder="People will sign up if we offer X" />

          <label>CTA text</label>
          <input className="input" value={ctaText} onChange={(e)=>setCtaText(e.target.value)} />

          <label>CTA type</label>
          <select className="input" value={ctaType} onChange={(e)=>setCtaType(e.target.value)}>
            <option value="link">External link (redirect)</option>
            <option value="email">Email capture</option>
          </select>

          <label>CTA destination (external URL or leave empty for email)</label>
          <input className="input" value={ctaDest} onChange={(e)=>setCtaDest(e.target.value)} placeholder="https://example.com/… or leave empty for email capture" />

          <label>Public slug (optional)</label>
          <input className="input" value={slug} onChange={(e)=>setSlug(e.target.value)} placeholder="custom-slug" />

          <div style={{display:'flex', gap:8}}>
            <button className="button" onClick={handlePublish} disabled={loading}>{loading ? 'Publishing…' : 'Publish'}</button>
          </div>
        </div>

        <div className="card">
          <h3>Preview</h3>
          <div className="small">This preview shows how your experiment will look after publishing.</div>
          <iframe className="preview-iframe" srcDoc={`
            <html>
              <head><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
              <body style="font-family:Inter,system-ui;padding:20px;">
                <h1>${(title || 'Experiment Title')}</h1>
                <p>${(hypothesis || 'Hypothesis goes here — one sentence.')}</p>
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
