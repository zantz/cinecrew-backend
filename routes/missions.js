const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const Mission = require('../models/Mission');

// POST /api/missions (recruteur)
router.post('/', auth, [
  body('titre').notEmpty(),
  body('date_debut').notEmpty(),
  body('lieu').notEmpty(),
  body('description').optional(),
  body('budget').optional().isNumeric()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const payload = { ...req.body, recruteur: req.user.id };
    const mission = await Mission.create(payload);
    res.status(201).json(mission);
  } catch (e) { next(e); }
});

// GET /api/missions
router.get('/', auth, async (req, res, next) => {
  try {
    const { q, lieu, statut, from, to } = req.query;
    const filter = {};
    if (lieu) filter.lieu = new RegExp(lieu, 'i');
    if (statut) filter.statut = statut;
    if (from || to) {
      filter.date_debut = {};
      if (from) filter.date_debut.$gte = new Date(from);
      if (to) filter.date_debut.$lte = new Date(to);
    }
    if (q) filter.$text = { $search: q };

    const missions = await Mission.find(filter).sort({ createdAt: -1 }).limit(100).populate('recruteur', 'nom email');
    res.json(missions);
  } catch (e) { next(e); }
});

// GET /api/missions/:id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id).populate('recruteur', 'nom email');
    if (!mission) return res.status(404).json({ msg: 'Mission introuvable' });
    res.json(mission);
  } catch (e) { next(e); }
});

// PUT /api/missions/:id (owner only)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ msg: 'Mission introuvable' });
    if (String(mission.recruteur) !== req.user.id) return res.status(403).json({ msg: 'Non autorisé' });
    const updates = req.body;
    Object.assign(mission, updates);
    await mission.save();
    res.json(mission);
  } catch (e) { next(e); }
});

// DELETE /api/missions/:id (owner only)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ msg: 'Mission introuvable' });
    if (String(mission.recruteur) !== req.user.id) return res.status(403).json({ msg: 'Non autorisé' });
    await mission.deleteOne();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
