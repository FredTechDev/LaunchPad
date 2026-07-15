import { supabase } from '../../../lib/supabase';

const VALID_EVENT_TYPES = ['view', 'cta_click', 'signup'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { experiment_id, event_type, metadata } = req.body;

  if (!experiment_id || !event_type) {
    return res.status(400).json({ error: 'experiment_id and event_type are required' });
  }

  if (!VALID_EVENT_TYPES.includes(event_type)) {
    return res.status(400).json({ error: `event_type must be one of: ${VALID_EVENT_TYPES.join(', ')}` });
  }

  const { data, error } = await supabase
    .from('events')
    .insert({ experiment_id, event_type, metadata })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}
