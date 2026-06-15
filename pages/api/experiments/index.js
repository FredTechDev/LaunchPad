// POST to create an experiment
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, hypothesis, cta_text, cta_type, cta_destination, public_slug } = req.body;
    if (!title || !cta_text) return res.status(400).json({ error: 'Missing title or cta_text' });
    const slug = public_slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,60) : `exp-${Date.now()}`);
    const payload = { title, hypothesis, cta_text, cta_type: cta_type || 'link', cta_destination: cta_destination || null, public_slug: slug };
    const { data, error } = await supabase.from('experiments').insert(payload).select().single();
    if (error) {
      console.error('Supabase insert error', error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
