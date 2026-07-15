import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Experiment ID is required' });
  }

  const { data: experiment, error: expError } = await supabase
    .from('experiments')
    .select('*')
    .eq('id', id)
    .single();

  if (expError || !experiment) {
    return res.status(404).json({ error: 'Experiment not found' });
  }

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('event_type, created_at')
    .eq('experiment_id', id)
    .order('created_at', { ascending: false });

  if (eventsError) {
    return res.status(500).json({ error: eventsError.message });
  }

  const { data: submissions, error: subsError } = await supabase
    .from('submissions')
    .select('id, email, created_at')
    .eq('experiment_id', id)
    .order('created_at', { ascending: false });

  if (subsError) {
    return res.status(500).json({ error: subsError.message });
  }

  const views = events.filter(e => e.event_type === 'view').length;
  const ctaClicks = events.filter(e => e.event_type === 'cta_click').length;
  const signups = events.filter(e => e.event_type === 'signup').length;
  const conversionRate = views > 0 ? ((signups / views) * 100).toFixed(1) : '0.0';
  const clickRate = views > 0 ? ((ctaClicks / views) * 100).toFixed(1) : '0.0';

  const viewsByDay = {};
  events
    .filter(e => e.event_type === 'view')
    .forEach(e => {
      const day = new Date(e.created_at).toISOString().split('T')[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

  const clicksByDay = {};
  events
    .filter(e => e.event_type === 'cta_click')
    .forEach(e => {
      const day = new Date(e.created_at).toISOString().split('T')[0];
      clicksByDay[day] = (clicksByDay[day] || 0) + 1;
    });

  return res.status(200).json({
    experiment,
    metrics: {
      views,
      ctaClicks,
      signups,
      conversionRate: parseFloat(conversionRate),
      clickRate: parseFloat(clickRate),
      totalSubmissions: submissions.length
    },
    timeline: {
      viewsByDay,
      clicksByDay
    },
    recentSubmissions: submissions.slice(0, 20)
  });
}
