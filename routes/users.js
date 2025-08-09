const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/users/me
router.get('/me', auth, async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id).select('-motdepasse');
    return res.json(me);
  } catch (e) { next(e); }
});

// PUT /api/users/me
router.put('/me', auth, [
  body('nom').optional().isString(),
  body('metier').optional().isString(),
  body('localisation').optional().isString(),
  body('disponibilite').optional().isBoolean(),
  body('bio').optional().isString(),
  body('photo').optional().isString(),
  body('lien_portfolio').optional().isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const updates = req.body;
    const me = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-motdepasse');
    return res.json(me);
  } catch (e) { next(e); }
});

// GET /api/users/search?metier=&localisation=&disponibilite=true
router.get('/search', auth, async (req, res, next) => {
  try {
    const { metier, localisation, disponibilite, q } = req.query;
    const filter = {};
    if (metier) filter.metier = new RegExp(metier, 'i');
    if (localisation) filter.localisation = new RegExp(localisation, 'i');
    if (typeof disponibilite !== 'undefined')
      filter.disponibilite = disponibilite === 'true';

    if (q) {
      filter.$or = [
        { nom: new RegExp(q, 'i') },
        { metier: new RegExp(q, 'i') },
        { localisation: new RegExp(q, 'i') },
        { bio: new RegExp(q, 'i') }
      ];
    }

    const users = await User.find(filter).select('-motdepasse').limit(100);
    return res.json(users);
  } catch (e) { next(e); }
});

module.exports = router;
