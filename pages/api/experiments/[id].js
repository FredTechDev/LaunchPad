import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Experiment ID is required' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const { title, hypothesis, cta_text, cta_type, cta_destination, status } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (hypothesis !== undefined) updates.hypothesis = hypothesis?.trim() || null;
    if (cta_text !== undefined) updates.cta_text = cta_text.trim();
    if (cta_type !== undefined) updates.cta_type = cta_type;
    if (cta_destination !== undefined) updates.cta_destination = cta_destination?.trim() || null;
    if (status !== undefined) updates.status = status;
    updates.updated_at = new Date().toISOString();

    if (updates.cta_type === 'link' && !updates.cta_destination) {
      const { data: current } = await supabase.from('experiments').select('cta_destination').eq('id', id).single();
      if (!current?.cta_destination) {
        return res.status(400).json({ error: 'CTA destination is required for link type' });
      }
    }

    const { data, error } = await supabase
      .from('experiments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('experiments')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Experiment deleted' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
