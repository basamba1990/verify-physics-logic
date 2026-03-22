# Guide d'Implémentation - SpotBulle Science-Verify v2

## Vue d'Ensemble

Ce guide couvre l'implémentation complète de SpotBulle Science-Verify, incluant tous les composants manquants et les améliorations scientifiques.

## 1. Composants Nouvellement Implémentés

### 1.1 Supabase Edge Function: `verify-physics-logic`

**Localisation**: `supabase/functions/verify-physics-logic/index.ts`

**Fonctionnalité**: Orchestration du flux de vérification physique complet
- Extraction de paramètres via GPT-4o
- Validation avec le modèle PINN (H2-Inference API)
- Calcul du score de crédibilité
- Stockage des résultats en base de données

**Déploiement**:
```bash
supabase functions deploy verify-physics-logic
```

**Utilisation**:
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/verify-physics-logic`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      projectId: 'project-uuid',
      analysisId: 'analysis-uuid',
      transcription: 'Texte transcrit du pitch...',
      context: 'hydrogen_storage',
    }),
  }
)
```

### 1.2 Composant React: `VerificationBadge`

**Localisation**: `components/verification-badge.tsx`

**Fonctionnalité**: Affichage du statut de vérification physique en temps réel
- États: idle, loading, coherent, anomaly, impossible
- Barre de progression du score
- Affichage des anomalies détectées
- Boutons d'action (Explications, Rapport)

**Utilisation**:
```tsx
<VerificationBadge
  status="coherent"
  score={85}
  anomalies={[]}
  onExplain={() => console.log('Explain')}
/>
```

### 1.3 Composant React: `ScientificAuditCard`

**Localisation**: `components/scientific-audit-card.tsx`

**Fonctionnalité**: Affichage complet des résultats d'audit scientifique
- Statut de validation
- Score de crédibilité
- Paramètres physiques extraits
- Tableau des prédictions PINN
- Boutons de téléchargement de rapport

**Utilisation**:
```tsx
<ScientificAuditCard
  auditData={auditData}
  projectName="Mon Projet"
  onDownloadReport={handleDownload}
/>
```

### 1.4 Composant React: `SovereigntyIndicator`

**Localisation**: `components/sovereignty-indicator.tsx`

**Fonctionnalité**: Affichage de l'indice de souveraineté africaine
- Score de sécurité des données
- Score de propriété intellectuelle
- Score d'indépendance technologique
- Recommandations personnalisées
- Conformité légale

**Utilisation**:
```tsx
<SovereigntyIndicator
  score={{
    dataSecurityScore: 85,
    intellectualPropertyScore: 80,
    independenceScore: 75,
    overallSovereigntyIndex: 80,
  }}
  projectName="Mon Projet"
/>
```

### 1.5 Service: `whisper-transcription.ts`

**Localisation**: `server/services/whisper-transcription.ts`

**Fonctionnalité**: Transcription audio via Whisper API
- Transcription de fichiers vidéo
- Support multilingue
- Extraction audio depuis vidéo (avec ffmpeg)
- Transcription batch
- Stockage en base de données

**Utilisation**:
```typescript
import { transcribeVideo, storeTranscription } from '@/server/services/whisper-transcription'

const result = await transcribeVideo('/path/to/video.mp4', 'fr')
await storeTranscription(projectId, result.transcription, result.language, result.duration)
```

### 1.6 Page: `app/dashboard/projects/[id]/analysis/page.tsx`

**Localisation**: `app/dashboard/projects/[id]/analysis/page.tsx`

**Fonctionnalité**: Page complète d'analyse avec Physics-Check
- Affichage de la vidéo
- Bouton "Physics-Check" pour lancer l'analyse
- Affichage du badge de vérification
- Résultats d'audit scientifique
- Indice de souveraineté

**Flux Utilisateur**:
1. Utilisateur navigue vers la page d'analyse
2. Clique sur "Lancer Physics-Check"
3. Edge Function extrait les paramètres
4. Validation avec PINN
5. Affichage des résultats

### 1.7 Modèle PINN Avancé: `hydrogen_pinn_advanced.py`

**Localisation**: `python/hydrogen_pinn_advanced.py`

**Fonctionnalité**: Modèle PINN amélioré avec support avancé
- Support 1D/2D/3D (extensible)
- Multiples équations d'état (Redlich-Kwong, Peng-Robinson)
- Modélisation de turbulence (k-epsilon, k-omega)
- Quantification d'incertitude (Monte Carlo dropout)
- Interface OpenFOAM (préparée)

**Classes Principales**:
- `AdvancedHydrogenPINN`: Réseau de neurones avancé
- `EquationOfState`: Enum des équations d'état disponibles
- `TurbulenceModel`: Enum des modèles de turbulence

**Utilisation**:
```python
from hydrogen_pinn_advanced import AdvancedHydrogenPINN, train_advanced_pinn

model = AdvancedHydrogenPINN(
    spatial_dims=2,
    eos=EquationOfState.PENG_ROBINSON,
    turbulence=TurbulenceModel.K_EPSILON
)

history = train_advanced_pinn(model, epochs=5000)
```

## 2. Flux de Travail Complet

### 2.1 Création d'un Projet

```typescript
// 1. Utilisateur crée un projet
const project = await trpc.projects.create.mutate({
  name: 'Mon Projet Hydrogène',
  description: 'Description du projet',
  category: 'Hydrogène',
  videoUrl: 'https://...',
})
```

### 2.2 Transcription Vidéo

```typescript
// 2. Transcription via Whisper
const transcription = await transcribeVideo(videoPath, 'fr')
await storeTranscription(project.id, transcription.transcription, 'fr', transcription.duration)
```

### 2.3 Vérification Physique

```typescript
// 3. Lancer Physics-Check (Edge Function)
const response = await fetch('/functions/v1/verify-physics-logic', {
  method: 'POST',
  body: JSON.stringify({
    projectId: project.id,
    analysisId: analysisId,
    transcription: project.transcription,
    context: 'hydrogen_storage',
  }),
})

const { data: auditData } = await response.json()
```

### 2.4 Affichage des Résultats

```typescript
// 4. Affichage des résultats
<VerificationBadge
  status={auditData.isPhysicallyCoherent ? 'coherent' : 'anomaly'}
  score={auditData.credibilityScore}
  anomalies={auditData.anomalies}
/>

<ScientificAuditCard auditData={auditData} />
<SovereigntyIndicator score={sovereigntyScore} />
```

### 2.5 Génération de Rapport

```typescript
// 5. Téléchargement du rapport PDF
const response = await fetch('/api/generate-report', {
  method: 'POST',
  body: JSON.stringify({
    projectId: project.id,
    projectName: project.name,
    auditData,
  }),
})

const blob = await response.blob()
// Télécharger le fichier PDF
```

## 3. Configuration Requise

### 3.1 Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-key

# H2-Inference API
H2_INFERENCE_API_URL=http://localhost:8000

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3.2 Dépendances Supplémentaires

```bash
# Frontend
pnpm add form-data

# Python
pip install peng-robinson-eos  # Optional, for advanced EOS
```

### 3.3 Prérequis Système

- FFmpeg (pour extraction audio depuis vidéo)
- Python 3.8+ (pour API H2-Inference)
- Node.js 18+ (pour frontend)

## 4. Déploiement

### 4.1 Déploiement Supabase Edge Function

```bash
# Authentification
supabase login

# Déployer la fonction
supabase functions deploy verify-physics-logic

# Vérifier le déploiement
supabase functions list
```

### 4.2 Déploiement Frontend

```bash
# Build
pnpm build

# Déployer sur Vercel
vercel deploy --prod
```

### 4.3 Déploiement API Python

```bash
# Docker
docker build -t h2-inference python/
docker run -p 8000:8000 h2-inference

# Ou directement
cd python
python hydrogen_api.py
```

## 5. Améliorations Futures

### 5.1 Extension 2D/3D

**Implémentation**: `hydrogen_pinn_advanced.py`

```python
# Créer un modèle 2D
model_2d = AdvancedHydrogenPINN(
    layers=[4, 128, 128, 128, 3],  # 4 entrées: t, x, y, z
    spatial_dims=2
)

# Prédictions 2D
p, u, T = model_2d(t, x, y)
```

### 5.2 Intégration OpenFOAM

**Fichier de configuration OpenFOAM** (à créer):
```
system/controlDict
system/fvSchemes
system/fvSolution
constant/transportProperties
```

**Interface Python**:
```python
def validate_with_openfoam(pinn_results, openfoam_path):
    """Comparer les résultats PINN avec OpenFOAM"""
    pass
```

### 5.3 Dashboard Temps Réel

**WebSocket Integration**:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

supabase
  .channel('physics_validations')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'physics_validations' }, (payload) => {
    console.log('Nouvelle validation:', payload)
  })
  .subscribe()
```

### 5.4 Support Multiples Équations d'État

```python
# Utiliser Peng-Robinson au lieu de Redlich-Kwong
model = AdvancedHydrogenPINN(
    eos=EquationOfState.PENG_ROBINSON
)
```

### 5.5 Modélisation de Turbulence

```python
# Utiliser k-epsilon
model = AdvancedHydrogenPINN(
    turbulence=TurbulenceModel.K_EPSILON
)

# Entraînement avec turbulence
history = train_advanced_pinn(model, epochs=10000)
```

## 6. Tests et Validation

### 6.1 Tests Unitaires

```bash
# Frontend
pnpm test

# Python
pytest python/tests/
```

### 6.2 Tests d'Intégration

```bash
# Tester le flux complet
npm run test:integration
```

### 6.3 Validation Scientifique

```python
# Comparer avec des données de référence
from hydrogen_pinn_model import predict_hydrogen_state

# Prédictions
result = predict_hydrogen_state(model, t=5.0, x=0.5)

# Vérifier contre des valeurs attendues
assert 1e5 < result['pressure'] < 700e5
assert 0 < result['velocity'] < 100
assert 250 < result['temperature'] < 350
```

## 7. Dépannage

### Problème: Edge Function ne se déploie pas

**Solution**:
```bash
# Vérifier les logs
supabase functions list
supabase functions logs verify-physics-logic

# Redéployer
supabase functions deploy verify-physics-logic --no-verify-jwt
```

### Problème: H2-Inference API timeout

**Solution**:
```bash
# Vérifier que le serveur Python est en cours d'exécution
curl http://localhost:8000/health

# Augmenter le timeout
H2_INFERENCE_TIMEOUT=60000
```

### Problème: Transcription Whisper échoue

**Solution**:
```bash
# Vérifier la clé OpenAI
echo $OPENAI_API_KEY

# Vérifier la taille du fichier (max 25MB)
ls -lh video.mp4
```

## 8. Performance et Optimisation

### 8.1 Caching des Résultats

```typescript
// Mettre en cache les résultats d'audit
const cacheKey = `audit_${projectId}_${transcriptionHash}`
const cached = await redis.get(cacheKey)

if (cached) return cached

const result = await verifyPhysics(...)
await redis.set(cacheKey, result, { ex: 3600 }) // 1 heure
```

### 8.2 Batch Processing

```python
# Traiter plusieurs projets en parallèle
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=4) as executor:
    results = executor.map(predict_hydrogen_state, projects)
```

### 8.3 Quantification d'Incertitude

```python
# Estimer l'incertitude des prédictions
uncertainty = uncertainty_quantification(model, t, x, n_samples=100)

print(f"Prédiction: {uncertainty['mean']}")
print(f"Intervalle 95%: ±{uncertainty['ci_95']}")
```

---

**Version**: 2.0.0  
**Dernière mise à jour**: Mars 2026  
**Auteur**: SpotBulle Pro - Science-Verify Team
