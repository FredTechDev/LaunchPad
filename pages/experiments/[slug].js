import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

function trackNovus(eventName, payload) {
  try {
    if (typeof window !== 'undefined') {
      if (window.novus && typeof window.novus.track === 'function') window.novus.track(eventName, payload);
      if (window.Novus && typeof window.Novus.track === 'function') window.Novus.track(eventName, payload);
      // fallback: attach to dataLayer for custom setups
      if (window.dataLayer) window.dataLayer.push({event: eventName, ...payload});
    }
  } catch (err) {
    console.warn('Novus track failed', err);
  }
}

export default function Experiment({ experiment }) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  if (!experiment) {
    return <div className="container"><div className="card">Experiment not found</div></div>;
  }

  useEffect(() => {
    // Track page view
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

    if (experiment.cta_type === 'link' && experiment.cta_destination) {
      window.location.href = experiment.cta_destination;
      return;
    }
    // email flow
    if (experiment.cta_type === 'email') {
      // show simple inline capture
      setSubmitted(true);
      trackNovus('experiment_signed_up', { experimentId: String(experiment.id) });
      if (typeof pendo !== 'undefined') {
        pendo.track("experiment_signed_up", {
          experimentId: String(experiment.id),
          public_slug: experiment.public_slug,
          cta_text: experiment.cta_text
        });
      }
      // optional: send email to server to persist (not storing PII in this example)
      const subRes = await fetch('/api/submissions', { method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ experiment_id: experiment.id, email }) });
      if (typeof pendo !== 'undefined') {
        pendo.track("email_submission_completed", {
          experimentId: String(experiment.id),
          public_slug: experiment.public_slug,
          submission_success: subRes.ok
        });
      }
    }
  }

  return (
    <div className="container">
      <Head>
        <title>{experiment.title}</title>
        {/* Novus snippet: replace "NOVUS_PROJECT_KEY" with your key or follow the official Novus install */}
        <script
          dangerouslySetInnerHTML={{ __html: `
            (function(){var k="${process.env.NOVUS_PROJECT_KEY || process.env.NEXT_PUBLIC_NOVUS_PROJECT_KEY || ''}"; if(!k){return;}
              var s=document.createElement('script');s.src='https://cdn.novus.ai/sdk.js';s.async=true;
              s.setAttribute('data-project',k);document.head.appendChild(s);
            })();
          `}} />
      </Head>

      <div className="card">
        <h1>{experiment.title}</h1>
        <p className="small">{experiment.hypothesis}</p>

        {experiment.cta_type === 'email' ? (
          <div>
            {!submitted ? (
              <div>
                <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Your email" />
                <button className="button" onClick={handleCTAClick}>{experiment.cta_text}</button>
              </div>
            ) : (
              <div className="small">Thanks — check your email soon.</div>
            )}
          </div>
        ) : (
          <div>
            <button className="button" onClick={handleCTAClick}>{experiment.cta_text}</button>
          </div>
        )}

        <div style={{marginTop:12}} className="small">Built with LaunchPad</div>
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
