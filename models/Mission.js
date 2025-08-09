const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  date_debut: { type: Date, required: true },
  date_fin: { type: Date },
  lieu: { type: String, required: true },
  budget: { type: Number },
  description: { type: String },
  statut: { type: String, enum: ['ouverte', 'en_cours', 'pourvue'], default: 'ouverte' },
  recruteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

missionSchema.index({ titre: 'text', description: 'text', lieu: 'text' });

module.exports = mongoose.model('Mission', missionSchema);
