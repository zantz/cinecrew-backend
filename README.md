# CinéCrew Backend (Node.js/Express/MongoDB)

Backend 100% fonctionnel pour l'application CinéCrew : Auth, Profils, Missions, Messagerie temps réel (Socket.io), Abonnements (Stripe-ready).

## 🚀 Lancer en local

```bash
cp .env.example .env
# Édite .env si besoin
npm install
npm run dev
```

Par défaut, le serveur écoute sur `http://localhost:5000`.

MongoDB : configure `MONGO_URI` dans `.env`. Si tu utilises Docker (voir plus bas), laisse `mongodb://mongo:27017/cinecrew`.

## 🧱 Endpoints principaux

- `POST /api/auth/register` — inscription (nom, email, motdepasse, role)
- `POST /api/auth/login` — connexion (email, motdepasse)
- `GET /api/users/me` — profil courant
- `PUT /api/users/me` — mise à jour profil
- `GET /api/users/search?metier=&localisation=&disponibilite=&q=` — recherche profils

- `POST /api/missions` — créer mission (recruteur)
- `GET /api/missions` — lister missions (filtres : q, lieu, statut, from, to)
- `GET /api/missions/:id` — détail mission
- `PUT /api/missions/:id` — modifier (owner)
- `DELETE /api/missions/:id` — supprimer (owner)

- `POST /api/messages` — envoyer message (destinataire, contenu)
- `GET /api/messages/thread/:userId` — conversation
- `GET /api/messages/inbox` — derniers messages

- `POST /api/subscriptions/checkout-session` — créer session Stripe (si configuré)
- `GET /api/subscriptions/me` — statut d’abonnement
- `POST /api/subscriptions/dev/set-status` — setter statut (fallback dev)

## 🔌 Socket.io

- Namespace global, événement `message` émis à chaque envoi via API.
- Frontend : se connecter et écouter `message` pour rafraîchir en temps réel.

## 🐳 Docker (optionnel)

Lance MongoDB + backend via Docker Compose :
```bash
docker compose up -d
```

## 🔐 Sécurité

- JWT via header `Authorization: Bearer <token>`
- Mots de passe hashés (bcrypt)
- Validation via `express-validator`

## 🧪 Tests rapides (curl)

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"nom":"Alice","email":"alice@test.com","motdepasse":"Passw0rd!","role":"intermittent"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"alice@test.com","motdepasse":"Passw0rd!"}' | jq -r .token)

# Get profile
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users/me
```

## 📦 Roadmap

- Webhooks Stripe (événements checkout.session.completed, invoice.payment_succeeded)
- Upload de médias (Multer + S3/Cloud)
- Modération / reporting
- Recherche avancée (Algolia/Atlas Search)
```
