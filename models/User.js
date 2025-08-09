const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motdepasse: { type: String, required: true },
  role: { type: String, enum: ['intermittent', 'recruteur'], required: true },
  metier: { type: String },
  localisation: { type: String },
  disponibilite: { type: Boolean, default: false },
  bio: { type: String },
  photo: { type: String },
  lien_portfolio: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
