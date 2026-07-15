import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

function trackNovus(eventName, payload) {
  try {
    if (typeof window !== 'undefined') {
      if (window.novus && typeof window.novus.track === 'function') window.novus.track(eventName, payload);
      if (window.Novus && typeof window.Novus.track === 'function') window.Novus.track(eventName, payload);
      if (window.dataLayer) window.dataLayer.push({event: eventName, ...payload});
    }
  } catch (err) {
    console.warn('Novus track failed', err);
  }
}

async function trackEvent(experimentId, eventType, metadata = {}) {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ experiment_id: experimentId, event_type: eventType, metadata })
    });
  } catch (err) {
    console.warn('Event tracking failed', err);
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Experiment({ experiment }) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!experiment) {
    return (
      <div className="container">
        <div className="card">
          <h2>Experiment not found</h2>
          <p className="small">This experiment may have been removed or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    trackEvent(experiment.id, 'view', { public_slug: experiment.public_slug });
    trackNovus('experiment_view', { experimentId: String(experiment.id), public_slug: experiment.public_slug });
    if (typeof pendo !== 'undefined') {
      pendo.track("experiment_view", {
        experimentId: String(experiment.id),
        public_slug: experiment.public_slug,
        title: experiment.title,
        cta_type: experiment.cta_type
      });
    }
  }, [experiment]);

  async function handleCTAClick() {
    if (experiment.cta_type === 'link' && experiment.cta_destination) {
      trackEvent(experiment.id, 'cta_click', { cta_label: experiment.cta_text, destination: experiment.cta_destination });
      trackNovus('experiment_cta_clicked', { experimentId: String(experiment.id), ctaLabel: experiment.cta_text });
      if (typeof pendo !== 'undefined') {
        pendo.track("experiment_cta_clicked", {
          experimentId: String(experiment.id),
          ctaLabel: experiment.cta_text,
          cta_type: experiment.cta_type,
          cta_destination: experiment.cta_destination,
          public_slug: experiment.public_slug
        });
      }
      window.location.href = experiment.cta_destination;
      return;
    }

    if (experiment.cta_type === 'email') {
      if (!email.trim()) {
        setError('Please enter your email');
        return;
      }
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      setLoading(true);
      setError('');

      trackEvent(experiment.id, 'cta_click', { cta_label: experiment.cta_text });
      trackNovus('experiment_cta_clicked', { experimentId: String(experiment.id), ctaLabel: experiment.cta_text });
      if (typeof pendo !== 'undefined') {
        pendo.track("experiment_cta_clicked", {
          experimentId: String(experiment.id),
          ctaLabel: experiment.cta_text,
          cta_type: experiment.cta_type,
          public_slug: experiment.public_slug
        });
      }

      const subRes = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ experiment_id: experiment.id, email: email.trim() })
      });

      if (subRes.ok) {
        trackEvent(experiment.id, 'signup', { email_domain: email.split('@')[1] });
        trackNovus('experiment_signed_up', { experimentId: String(experiment.id) });
        if (typeof pendo !== 'undefined') {
          pendo.track("experiment_signed_up", {
            experimentId: String(experiment.id),
            public_slug: experiment.public_slug,
            cta_text: experiment.cta_text
          });
        }
        setSubmitted(true);
      } else {
        const data = await subRes.json();
        setError(data.error || 'Submission failed. Please try again.');
      }

      setLoading(false);
    }
  }

  return (
    <div className="container">
      <Head>
        <title>{experiment.title}</title>
        <meta property="og:title" content={experiment.title} />
        <meta property="og:description" content={experiment.hypothesis || 'Validate your idea with LaunchPad'} />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{ __html: `
            (function(){var k="${process.env.NOVUS_PROJECT_KEY || process.env.NEXT_PUBLIC_NOVUS_PROJECT_KEY || ''}"; if(!k){return;}
              var s=document.createElement('script');s.src='https://cdn.novus.ai/sdk.js';s.async=true;
              s.setAttribute('data-project',k);document.head.appendChild(s);
            })();
          `}} />
      </Head>

      <div className="experiment-page">
        <div className="card experiment-card">
          <h1>{experiment.title}</h1>
          {experiment.hypothesis && <p className="hypothesis">{experiment.hypothesis}</p>}

          {experiment.cta_type === 'email' ? (
            <div className="cta-section">
              {!submitted ? (
                <div className="email-form">
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="Your email"
                    disabled={loading}
                  />
                  {error && <div className="error-text">{error}</div>}
                  <button className="button" onClick={handleCTAClick} disabled={loading}>
                    {loading ? 'Submitting...' : experiment.cta_text}
                  </button>
                </div>
              ) : (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <p>Thanks! Check your email soon.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="cta-section">
              <button className="button button-large" onClick={handleCTAClick}>
                {experiment.cta_text}
              </button>
            </div>
          )}

          <div className="experiment-footer">Built with LaunchPad</div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const { slug } = ctx.params;
  const { data, error } = await supabase.from('experiments').select('*').eq('public_slug', slug).single();
  if (error || !data) {
    return { props: { experiment: null } };
  }
  return { props: { experiment: data } };
}
