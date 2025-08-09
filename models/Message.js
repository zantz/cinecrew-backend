const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  expediteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contenu: { type: String, required: true },
  lu: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ expediteur: 1, destinataire: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
