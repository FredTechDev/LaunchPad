import { supabase } from '../../../lib/supabase';
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { experiment_id, email } = req.body;
    // NOTE: For privacy, you might prefer hashing or masking emails. This example stores plain — adapt for production.
    const { data, error } = await supabase.from('submissions').insert({ experiment_id, email }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
