const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', [
  body('nom').notEmpty(),
  body('email').isEmail(),
  body('motdepasse').isLength({ min: 6 }),
  body('role').isIn(['intermittent', 'recruteur'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nom, email, motdepasse, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Utilisateur déjà existant' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motdepasse, salt);

    user = await User.create({ nom, email, motdepasse: hashedPassword, role });
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail(),
  body('motdepasse').isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, motdepasse } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Identifiants invalides' });

    const isMatch = await bcrypt.compare(motdepasse, user.motdepasse);
    if (!isMatch) return res.status(400).json({ msg: 'Identifiants invalides' });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
