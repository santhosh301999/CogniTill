import { Router, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const getClient = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

// POST /api/ai/stock-alert
router.post('/stock-alert', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);

    const velocity = (await pool.query(
      `SELECT
         i.name, i.sku, i.category,
         i.quantity as current_stock,
         i.low_stock_threshold,
         COALESCE(SUM(si.quantity), 0) as sold_14d,
         ROUND(COALESCE(CAST(SUM(si.quantity) AS NUMERIC) / 14, 0), 2) as daily_velocity
       FROM inventory i
       LEFT JOIN sale_items si ON i.id = si.inventory_id
       LEFT JOIN sales s ON si.sale_id = s.id AND s.created_at >= $1
       GROUP BY i.id, i.name, i.sku, i.category, i.quantity, i.low_stock_threshold
       ORDER BY daily_velocity DESC`,
      [cutoff.toISOString()]
    )).rows;

    const enriched = velocity.map((item: any) => {
      const daysRemaining = item.daily_velocity > 0
        ? Math.floor(item.current_stock / item.daily_velocity)
        : (item.current_stock > 0 ? 999 : 0);
      const alertLevel = daysRemaining < 3 ? 'RED' : daysRemaining < 7 ? 'AMBER' : 'OK';
      return { ...item, days_remaining: daysRemaining, alert_level: alertLevel };
    });

    const redItems   = enriched.filter((i: any) => i.alert_level === 'RED');
    const amberItems = enriched.filter((i: any) => i.alert_level === 'AMBER');
    const okItems    = enriched.filter((i: any) => i.alert_level === 'OK');

    const inventorySummary = enriched
      .filter((i: any) => i.alert_level !== 'OK')
      .map((i: any) => `- ${i.name} (SKU: ${i.sku}): ${i.current_stock} units, ${i.daily_velocity} sold/day, ${i.days_remaining === 999 ? 'N/A' : i.days_remaining + ' days'} remaining [${i.alert_level}]`)
      .join('\n');

    const prompt = `You are a retail inventory analyst for CogniTill, a mobile phone accessories and repair shop.

Here is the current inventory status based on 14-day rolling sales data:

RED ALERT items (< 3 days stock remaining): ${redItems.length}
AMBER ALERT items (< 7 days stock remaining): ${amberItems.length}
OK items: ${okItems.length}

Items requiring attention:
${inventorySummary || 'All items have sufficient stock levels.'}

Please provide a concise, actionable daily stock alert report (3-5 sentences). Include:
1. Overall stock health summary
2. Urgent reorder recommendations for RED items
3. Watch items (AMBER)
4. One specific business recommendation

Keep it professional but conversational, suitable for a shop owner.`;

    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const aiSummary = message.content[0].type === 'text' ? message.content[0].text : '';

    return res.json({
      summary: aiSummary,
      red_items: redItems, amber_items: amberItems, ok_count: okItems.length,
      total_items: enriched.length, generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('AI stock alert error:', error);
    return res.status(500).json({ error: 'Failed to generate AI report', details: error.message });
  }
});

// POST /api/ai/fb-listing
router.post('/fb-listing', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { inventory_id, condition, extra_notes } = req.body;

    if (!inventory_id) {
      return res.status(400).json({ error: 'Inventory ID is required' });
    }

    const item = (await pool.query('SELECT * FROM inventory WHERE id = $1', [inventory_id])).rows[0];
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const prompt = `You are a Facebook Marketplace listing expert for a mobile phone accessories shop. Create an engaging, SEO-friendly Facebook Marketplace listing for the following item:

Product: ${item.name}
Category: ${item.category}
SKU: ${item.sku}
Price: $${item.sell_price}
Condition: ${condition || 'New'}
${extra_notes ? `Additional notes: ${extra_notes}` : ''}

Write a compelling Facebook Marketplace listing with:
1. An attention-grabbing title (max 80 chars)
2. A detailed description (3-4 paragraphs) highlighting features and benefits
3. Why they should buy from us (local shop, fast service, quality products)
4. Pickup/shipping info placeholder

Format the response as:
TITLE: [title here]

DESCRIPTION:
[description here]

Keep it friendly, enthusiastic, and use relevant emojis sparingly. Optimize for local buyers.`;

    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const listing = message.content[0].type === 'text' ? message.content[0].text : '';

    return res.json({ item, listing, generated_at: new Date().toISOString() });
  } catch (error: any) {
    console.error('AI FB listing error:', error);
    return res.status(500).json({ error: 'Failed to generate listing', details: error.message });
  }
});

export default router;
