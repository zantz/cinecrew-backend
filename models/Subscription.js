const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type_abonnement: { type: String, enum: ['gratuit', 'premium', 'recruteur'], required: true },
  stripe_customer_id: { type: String },
  stripe_subscription_id: { type: String },
  statut: { type: String, enum: ['actif', 'inactif', 'annule'], default: 'inactif' },
  date_debut: { type: Date },
  date_fin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
