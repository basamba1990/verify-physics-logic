# SpotBulle Science Verify - Next.js Application

Application Next.js complète pour la gestion de projets, analyses et rapports scientifiques avec Supabase.

## Fonctionnalités

- **Authentification Supabase** : Gestion des sessions avec OAuth
- **Gestion des Projets** : Création, liste et détail des projets
- **Analyses en Temps Réel** : Synchronisation automatique via Supabase Realtime
- **Stockage PDF** : Upload et aperçu de rapports PDF
- **Export de Données** : Export CSV et Excel des analyses
- **Row Level Security** : Protection des données par utilisateur
- **Middleware d'Authentification** : Protection des routes /dashboard

## Structure du Projet

```
spotbulle-science-nextjs/
├── app/                          # Pages Next.js App Router
│   ├── layout.tsx               # Layout racine
│   ├── page.tsx                 # Page d'accueil
│   ├── globals.css              # Styles globaux
│   ├── auth/
│   │   ├── login/page.tsx       # Page de connexion
│   │   └── callback/route.ts    # Callback OAuth
│   └── dashboard/
│       ├── page.tsx             # Liste des projets
│       └── projects/
│           ├── [id]/page.tsx    # Détail du projet
│           ├── [id]/analyses/page.tsx
│           ├── [id]/reports/page.tsx
│           └── new/page.tsx
├── components/
│   ├── pdf-viewer.tsx           # Lecteur PDF
│   ├── export-button.tsx        # Bouton d'export
│   └── ui/                      # Composants shadcn/ui
├── hooks/
│   └── use-realtime.ts          # Hook Supabase Realtime
├── lib/
│   └── supabase/
│       ├── client.ts            # Client navigateur
│       └── server.ts            # Client serveur
├── types/
│   └── index.ts                 # Types TypeScript
├── supabase/
│   ├── migrations/
│   │   └── init.sql            # Schéma des tables
│   └── storage-policies.sql    # Politiques de stockage
├── middleware.ts                # Middleware d'authentification
├── next.config.js              # Configuration Next.js
├── tailwind.config.ts          # Configuration Tailwind
├── tsconfig.json               # Configuration TypeScript
└── package.json                # Dépendances
```

## Installation

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anonyme
OPENAI_API_KEY=votre-clé-openai
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxx
```

### 3. Configurer Supabase

Exécuter le script SQL dans votre console Supabase :

```bash
# Schéma des tables
cat supabase/migrations/init.sql

# Politiques de stockage
cat supabase/storage-policies.sql
```

### 4. Démarrer le serveur de développement

```bash
pnpm dev
```

L'application sera accessible à `http://localhost:3000`

## Utilisation

### Authentification

- Accéder à `/auth/login`
- Se connecter avec Google
- Redirection automatique vers `/dashboard`

### Gestion des Projets

- **Créer** : `/dashboard/projects/new`
- **Lister** : `/dashboard`
- **Détail** : `/dashboard/projects/[id]`

### Analyses

- Accéder à `/dashboard/projects/[id]/analyses`
- Les analyses se mettent à jour en temps réel
- Exporter en CSV ou Excel

### Rapports

- Accéder à `/dashboard/projects/[id]/reports`
- Uploader des fichiers PDF
- Aperçu PDF intégré

## Architecture Technique

### Frontend

- **Next.js 15** : Framework React avec App Router
- **React 19** : Dernière version de React
- **Tailwind CSS 4** : Styling utilitaire
- **TypeScript** : Typage statique
- **react-pdf** : Visualisation de PDF
- **xlsx** : Export de données

### Backend

- **Supabase** : PostgreSQL + Auth + Storage
- **Realtime** : WebSocket pour synchronisation en temps réel
- **Row Level Security** : Sécurité au niveau des lignes

### Sécurité

- Middleware d'authentification pour `/dashboard`
- RLS sur toutes les tables
- Politiques de stockage pour les rapports
- Isolation des données par utilisateur

## API Supabase

### Tables

**projects**
- `id` : UUID (clé primaire)
- `user_id` : UUID (référence auth.users)
- `name` : TEXT
- `description` : TEXT
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

**analyses**
- `id` : UUID (clé primaire)
- `project_id` : UUID (référence projects)
- `name` : TEXT
- `status` : TEXT ('pending', 'processing', 'completed', 'failed')
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

**reports**
- `id` : UUID (clé primaire)
- `project_id` : UUID (référence projects)
- `name` : TEXT
- `file_url` : TEXT
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### Storage

**Bucket : reports**
- Chemin : `{project_id}/{timestamp}_{filename}`
- Accès : Authentifié
- Public : Oui (URLs publiques)

## Déploiement

### Vercel

```bash
# Build
pnpm build

# Start
pnpm start
```

### Variables d'environnement en production

Ajouter dans Vercel :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `STRIPE_PRICE_ID_PRO`
- `STRIPE_PRICE_ID_ENTERPRISE`

## Développement

### Ajouter une nouvelle page

1. Créer le fichier dans `app/`
2. Importer les composants nécessaires
3. Utiliser `createClient()` pour Supabase

### Ajouter une nouvelle table

1. Créer la migration SQL
2. Exécuter dans Supabase
3. Ajouter les types dans `types/index.ts`
4. Créer les hooks si nécessaire

### Tester

```bash
pnpm test
```

## Troubleshooting

### Erreur d'authentification

- Vérifier les clés Supabase dans `.env.local`
- Vérifier l'URL de callback OAuth dans Supabase

### Erreur de stockage

- Vérifier que le bucket 'reports' existe
- Vérifier les politiques de stockage
- Vérifier les permissions d'authentification

### Erreur Realtime

- Vérifier que Realtime est activé dans Supabase
- Vérifier les politiques RLS
- Vérifier la connexion WebSocket

## Support

Pour toute question ou problème, consulter la documentation :
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [React PDF](https://react-pdf.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Licence

MIT
