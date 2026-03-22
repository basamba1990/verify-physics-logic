# SpotBulle Science v2 - Physics-Informed Verification Platform

## Vue d'Ensemble

**SpotBulle Science** est une plateforme complète de vérification scientifique utilisant des réseaux de neurones informés par la physique (PINN) pour analyser et valider les projets d'hydrogène à haute pression.

### Caractéristiques Principales

- **Authentification Sécurisée** : OAuth via Supabase
- **Gestion de Projets** : Création, édition, suppression avec métadonnées
- **Extraction de Données par IA** : Utilise GPT-4o pour extraire les paramètres physiques
- **Validation Physique PINN** : Modèle de réseau de neurones informé par la physique
- **Génération de Rapports** : Rapports LaTeX/PDF scientifiques automatisés
- **API tRPC** : Communication type-safe entre frontend et backend
- **Base de Données** : Supabase avec RLS et politiques de sécurité

## Architecture Technique

### Stack Technologique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 15 + React 19 + TypeScript |
| Backend | Next.js API Routes + tRPC |
| Base de Données | Supabase (PostgreSQL) |
| Authentification | Supabase OAuth |
| UI Components | Radix UI + Tailwind CSS |
| Validation | Zod |
| Requêtes HTTP | Fetch API + tRPC |
| Python Backend | FastAPI + PyTorch |
| IA Extraction | OpenAI GPT-4o |

### Structure du Projet

```
spotbulle-science-v2/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── trpc/[trpc]/route.ts # tRPC endpoint
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main application
│   │   └── projects/
│   │       ├── [id]/            # Project detail
│   │       ├── new/             # Create project
│   │       └── [id]/analyses/   # Analysis results
│   └── layout.tsx               # Root layout
├── server/                       # Backend logic
│   ├── trpc.ts                  # tRPC setup
│   ├── routers/
│   │   ├── index.ts             # App router
│   │   └── projects.ts          # Projects procedures
│   └── services/
│       ├── extraction.ts        # AI data extraction
│       ├── h2-inference.ts      # PINN integration
│       └── report-generator.ts  # LaTeX reports
├── lib/
│   ├── trpc.ts                  # tRPC client
│   └── supabase/                # Supabase clients
├── components/                   # React components
│   └── ui/                       # Radix UI components
├── types/                        # TypeScript types
├── supabase/
│   └── migrations/              # Database migrations
└── python/                       # Python backend
    ├── hydrogen_pinn_model.py   # PINN model
    ├── hydrogen_api.py          # FastAPI server
    └── requirements.txt         # Python dependencies
```

## Installation et Configuration

### Prérequis

- Node.js 18+
- pnpm 10+
- Python 3.8+
- PostgreSQL 13+ (via Supabase)

### Installation Frontend

```bash
# Cloner le projet
git clone <repo-url>
cd spotbulle-science-v2

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Remplir .env.local avec:
NEXT_PUBLIC_SUPABASE_URL=<votre-url-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre-clé-anon>
SUPABASE_SERVICE_ROLE_KEY=<votre-clé-service>
OPENAI_API_KEY=<votre-clé-openai>
H2_INFERENCE_API_URL=http://localhost:8000
```

### Installation Backend Python

```bash
# Naviguer vers le répertoire Python
cd python

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
```

### Configuration Supabase

```bash
# Initialiser Supabase
supabase init

# Appliquer les migrations
supabase migration up

# Ou via SQL directement:
# 1. Exécuter supabase/migrations/init.sql
# 2. Exécuter supabase/migrations/002_physics_validation.sql
```

## Démarrage

### Développement Frontend

```bash
pnpm dev
# Accès: http://localhost:3000
```

### Développement Backend Python

```bash
cd python
python hydrogen_api.py
# Accès: http://localhost:8000
# Documentation: http://localhost:8000/docs
```

### Production

```bash
# Build
pnpm build

# Start
pnpm start
```

## API tRPC

### Procédures Disponibles

#### Projects

```typescript
// Récupérer tous les projets
trpc.projects.getAll.useQuery()

// Récupérer un projet par ID
trpc.projects.getById.useQuery({ projectId: "..." })

// Créer un projet
trpc.projects.create.useMutation({
  name: "Mon Projet",
  description: "Description",
  category: "Hydrogène",
  videoUrl: "https://..."
})

// Mettre à jour un projet
trpc.projects.update.useMutation({
  projectId: "...",
  name: "Nouveau Nom"
})

// Supprimer un projet
trpc.projects.delete.useMutation({ projectId: "..." })

// Lancer une analyse
trpc.projects.launchAnalysis.useMutation({
  projectId: "...",
  transcription: "Texte transcrit..."
})

// Récupérer les analyses
trpc.projects.getAnalyses.useQuery({ projectId: "..." })

// Récupérer les rapports
trpc.projects.getReports.useQuery({ projectId: "..." })

// Récupérer la validation physique
trpc.projects.getValidation.useQuery({ projectId: "..." })

// Récupérer le score de souveraineté
trpc.projects.getSovereigntyScore.useQuery({ projectId: "..." })
```

## API H2-Inference (Python)

### Endpoints

#### Initialiser le Modèle

```bash
POST /model/initialize
{
  "layers": [2, 64, 64, 64, 3]
}
```

#### Entraîner le Modèle

```bash
POST /model/train
{
  "N_pde": 5000,
  "N_ic": 500,
  "N_bc": 500,
  "epochs": 5000,
  "learning_rate": 0.001,
  "model_name": "hydrogen_pinn_v1"
}
```

#### Faire une Prédiction

```bash
POST /predict
{
  "time": 5.0,
  "position": 0.5
}
```

#### Prédictions en Batch

```bash
POST /predict/batch
{
  "batch": [
    {"time": 0.0, "position": 0.0},
    {"time": 5.0, "position": 0.5}
  ]
}
```

#### Statut du Modèle

```bash
GET /model/status
```

## Modèle PINN

### Équations Physiques

Le modèle résout les équations de conservation couplées:

**Conservation de la Masse:**
```
∂ρ/∂t + ∂(ρu)/∂x = 0
```

**Conservation de la Quantité de Mouvement:**
```
∂(ρu)/∂t + ∂(ρu²)/∂x + ∂p/∂x = μ ∂²u/∂x²
```

**Équation d'État (Redlich-Kwong):**
```
p = z(p,T) * ρ * R * T / M
```

### Architecture du Réseau

```
Entrées (2) → [64] → [64] → [64] → Sorties (3)
    (t, x)                          (p, u, T)
```

- **Activation**: Tanh (optimale pour les PINNs)
- **Initialisation**: Xavier/Glorot
- **Optimiseur**: Adam avec scheduler

## Services Backend

### Extraction de Données (extraction.ts)

```typescript
// Extraire les paramètres physiques
const result = await extractPhysicalParameters(transcription)

// Valider les données
const validation = validatePhysicalData(extractedData)

// Stocker les résultats
await storeExtractionResults(projectId, analysisId, data, confidence)
```

### Intégration H2-Inference (h2-inference.ts)

```typescript
// Initialiser le modèle
await initializePINNModel()

// Entraîner le modèle
await trainPINNModel({ epochs: 5000 })

// Faire des prédictions
const predictions = await predictWithPINN(testPoints)

// Valider avec PINN
const validation = await validatePhysicsWithPINN(extractedData)
```

### Génération de Rapports (report-generator.ts)

```typescript
// Générer un rapport PDF
const pdfPath = await generatePDFReport(reportData, outputPath)

// Stocker le rapport
await storeReport(projectId, reportName, fileUrl)
```

## Schéma de Base de Données

### Tables Principales

#### projects
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- name (TEXT)
- description (TEXT)
- category (TEXT)
- video_url (TEXT)
- transcription (TEXT)
- status (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### analyses
```sql
- id (UUID, PK)
- project_id (UUID, FK)
- name (TEXT)
- status (TEXT)
- analysis_type (TEXT)
- transcription (TEXT)
- results (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### reports
```sql
- id (UUID, PK)
- project_id (UUID, FK)
- name (TEXT)
- file_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### physics_validations
```sql
- id (UUID, PK)
- project_id (UUID, FK)
- analysis_id (UUID, FK)
- extracted_data (JSONB)
- pinn_results (JSONB)
- credibility_score (DECIMAL)
- is_physically_coherent (BOOLEAN)
- anomalies (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### sovereignty_scores
```sql
- id (UUID, PK)
- project_id (UUID, FK)
- data_security_score (DECIMAL)
- intellectual_property_score (DECIMAL)
- independence_score (DECIMAL)
- overall_sovereignty_index (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Sécurité

### Row Level Security (RLS)

Toutes les tables implémentent RLS pour garantir que les utilisateurs ne peuvent accéder que à leurs propres données:

- Les utilisateurs ne voient que leurs projets
- Les utilisateurs ne peuvent modifier que leurs propres données
- Les administrateurs peuvent avoir des politiques spéciales

### Authentification

- OAuth via Supabase
- JWT tokens automatiquement gérés
- Middleware de vérification d'authentification

## Tests

### Tests Unitaires

```bash
pnpm test
```

### Tests en Mode Watch

```bash
pnpm test:watch
```

## Déploiement

### Préparation

1. Configurer les variables d'environnement de production
2. Vérifier les migrations de base de données
3. Tester les endpoints tRPC
4. Valider l'intégration H2-Inference

### Déploiement Frontend

```bash
# Vercel
vercel deploy

# Ou autre plateforme
pnpm build
pnpm start
```

### Déploiement Backend Python

```bash
# Docker
docker build -t h2-inference .
docker run -p 8000:8000 h2-inference

# Ou directement
gunicorn -w 4 -k uvicorn.workers.UvicornWorker hydrogen_api:app
```

## Limitations et Améliorations Futures

### Limitations Actuelles

1. **Modèle 1D**: Simplifié pour la démonstration
2. **Loi des Gaz Réels Simplifiée**: Redlich-Kwong
3. **Pas de Turbulence**: Modèle laminaire

### Améliorations Prévues

1. Extension à 2D/3D
2. Intégration OpenFOAM pour validation
3. Dashboard temps réel avec WebSockets
4. Support de multiples équations d'état
5. Modélisation de turbulence

## Références Scientifiques

- **PINNs**: Raissi et al., 2019
- **Redlich-Kwong**: Redlich & Kwong, 1949
- **Hydrogen Storage**: Hydrogen Council, 2021

## Support et Contribution

Pour des questions ou contributions, consultez la documentation ou contactez l'équipe.

## Licence

MIT License - Voir LICENSE.md

---

**Version**: 2.0.0  
**Dernière mise à jour**: Mars 2026  
**Auteur**: SpotBulle Pro
