import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <h1>LaunchPad</h1>
        <div className="small">Validate ideas in minutes</div>
      </div>

      <div className="card">
        <h2>Build a micro-experiment</h2>
        <p className="small">Create a single-page experiment, share it, and see visits & conversions with Novus.</p>
        <div style={{marginTop:16}}>
          <Link href="/create"><button className="button">Create Experiment</button></Link>
        </div>
      </div>

      <div style={{height:12}}/>

      <div className="card" style={{marginTop:12}}>
        <h3>How it works</h3>
        <ul>
          <li>Create a short hypothesis and CTA.</li>
          <li>Publish a public URL.</li>
          <li>Novus collects experiment_view, experiment_cta_clicked, experiment_signed_up events.</li>
        </ul>
      </div>
    </div>
  );
}
