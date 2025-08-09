const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// POST /api/messages -> envoyer message
router.post('/', auth, [
  body('destinataire').notEmpty(),
  body('contenu').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { destinataire, contenu } = req.body;
    const message = await Message.create({
      expediteur: req.user.id,
      destinataire,
      contenu
    });

    // Emit socket event
    const io = req.app.locals.io;
    io.emit('message', {
      _id: message._id,
      expediteur: req.user.id,
      destinataire,
      contenu,
      createdAt: message.createdAt
    });

    res.status(201).json(message);
  } catch (e) { next(e); }
});

// GET /api/messages/thread/:userId -> conversation avec un utilisateur
router.get('/thread/:userId', auth, async (req, res, next) => {
  try {
    const other = req.params.userId;
    const me = req.user.id;
    const messages = await Message.find({
      $or: [
        { expediteur: me, destinataire: other },
        { expediteur: other, destinataire: me }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (e) { next(e); }
});

// GET /api/messages/inbox -> derniers messages par correspondants
router.get('/inbox', auth, async (req, res, next) => {
  try {
    // Simple: return last 50 messages where I am sender or receiver
    const me = req.user.id;
    const messages = await Message.find({
      $or: [
        { expediteur: me },
        { destinataire: me }
      ]
    }).sort({ createdAt: -1 }).limit(50);
    res.json(messages);
  } catch (e) { next(e); }
});

module.exports = router;
