import { supabase } from '../../../lib/supabase';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { experiment_id, email } = req.body;

  if (!experiment_id) {
    return res.status(400).json({ error: 'experiment_id is required' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  const { data: existing } = await supabase
    .from('submissions')
    .select('id')
    .eq('experiment_id', experiment_id)
    .eq('email', trimmedEmail)
    .single();

  if (existing) {
    return res.status(200).json({ message: 'Email already submitted' });
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert({ experiment_id, email: trimmedEmail })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}
