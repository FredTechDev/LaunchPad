import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const experimentsWithMetrics = await Promise.all(
      data.map(async (exp) => {
        const { count: views } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('experiment_id', exp.id)
          .eq('event_type', 'view');

        const { count: ctaClicks } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('experiment_id', exp.id)
          .eq('event_type', 'cta_click');

        const { count: signups } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('experiment_id', exp.id)
          .eq('event_type', 'signup');

        return {
          ...exp,
          metrics: {
            views: views || 0,
            ctaClicks: ctaClicks || 0,
            signups: signups || 0,
            conversionRate: views > 0 ? ((signups || 0) / views * 100).toFixed(1) : '0.0'
          }
        };
      })
    );

    return res.status(200).json(experimentsWithMetrics);
  }

  if (req.method === 'POST') {
    const { title, hypothesis, cta_text, cta_type, cta_destination, public_slug } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!cta_text || !cta_text.trim()) {
      return res.status(400).json({ error: 'CTA text is required' });
    }

    if (cta_type === 'link' && !cta_destination) {
      return res.status(400).json({ error: 'CTA destination is required for link type' });
    }

    const slug = public_slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || `exp-${Date.now()}`;

    const { data: existingSlug } = await supabase
      .from('experiments')
      .select('id')
      .eq('public_slug', slug)
      .single();

    if (existingSlug) {
      return res.status(400).json({ error: 'This slug is already taken. Please choose another.' });
    }

    const payload = {
      title: title.trim(),
      hypothesis: hypothesis?.trim() || null,
      cta_text: cta_text.trim(),
      cta_type: cta_type || 'link',
      cta_destination: cta_destination?.trim() || null,
      public_slug: slug
    };

    const { data, error } = await supabase.from('experiments').insert(payload).select().single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
