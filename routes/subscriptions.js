const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

// POST /api/subscriptions/checkout-session
// body: { plan: 'premium' | 'recruteur', success_url?, cancel_url? }
router.post('/checkout-session', auth, async (req, res, next) => {
  try {
    const { plan, success_url, cancel_url } = req.body;
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      // Dev fallback without Stripe configured
      return res.json({ checkout_url: 'stripe_not_configured' });
    }
    const priceMap = {
      premium: 'price_premium_monthly_id',
      recruteur: 'price_recruteur_monthly_id'
    };
    const price = priceMap[plan];
    if (!price) return res.status(400).json({ msg: 'Plan invalide' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: success_url || process.env.CLIENT_BASE_URL + '/pay/success',
      cancel_url: cancel_url || process.env.CLIENT_BASE_URL + '/pay/cancel',
      metadata: { userId: req.user.id, plan }
    });
    res.json({ id: session.id, url: session.url });
  } catch (e) { next(e); }
});

// GET /api/subscriptions/me
router.get('/me', auth, async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ utilisateur: req.user.id }).sort({ createdAt: -1 });
    res.json(sub || null);
  } catch (e) { next(e); }
});

// Admin-lite: update status (fallback if no Stripe webhook)
router.post('/dev/set-status', auth, async (req, res, next) => {
  try {
    const { type_abonnement, statut } = req.body;
    let sub = await Subscription.findOne({ utilisateur: req.user.id });
    if (!sub) {
      sub = await Subscription.create({
        utilisateur: req.user.id,
        type_abonnement: type_abonnement || 'premium',
        statut: statut || 'actif',
        date_debut: new Date()
      });
    } else {
      sub.type_abonnement = type_abonnement || sub.type_abonnement;
      sub.statut = statut || sub.statut;
      if (statut === 'actif' && !sub.date_debut) sub.date_debut = new Date();
      await sub.save();
    }
    res.json(sub);
  } catch (e) { next(e); }
});

module.exports = router;
