# SpotBulle Science NextJS - TODO List

## Phase 1: Configuration & Infrastructure
- [ ] Configurer les variables d'environnement (Supabase, Stripe, OpenAI)
- [ ] Créer la structure Next.js App Router
- [ ] Implémenter le middleware d'authentification
- [ ] Configurer Tailwind CSS et shadcn/ui

## Phase 2: Authentification & Base de Données
- [ ] Implémenter les clients Supabase (navigateur et serveur)
- [ ] Créer les migrations SQL (tables projects, analyses, reports)
- [ ] Configurer Row Level Security (RLS) pour chaque table
- [ ] Implémenter la page de login avec Supabase Auth
- [ ] Implémenter la page de callback OAuth

## Phase 3: Interface de Gestion des Projets
- [ ] Créer le layout du dashboard
- [ ] Implémenter la page de liste des projets
- [ ] Implémenter la page de création de projet
- [ ] Implémenter la page de détail du projet
- [ ] Ajouter la navigation entre projets/analyses/rapports

## Phase 4: Stockage & Gestion des Rapports
- [ ] Configurer Supabase Storage (bucket 'reports')
- [ ] Implémenter l'upload de fichiers PDF
- [ ] Implémenter le composant d'aperçu PDF (react-pdf)
- [ ] Créer la page de gestion des rapports
- [ ] Implémenter la suppression de rapports

## Phase 5: Analyses & Temps Réel
- [ ] Créer la page de liste des analyses
- [ ] Implémenter le hook useRealtime pour Supabase Realtime
- [ ] Ajouter la synchronisation en temps réel des analyses
- [ ] Implémenter la création d'analyses
- [ ] Afficher le statut des analyses en temps réel

## Phase 6: Export & Visualisation
- [ ] Implémenter le composant ExportButton (CSV/Excel)
- [ ] Ajouter l'export pour les analyses
- [ ] Ajouter l'export pour les projets
- [ ] Implémenter les tableaux de données
- [ ] Ajouter les filtres et la pagination

## Phase 7: Services Backend
- [ ] Intégrer h2InferenceService (validation physique)
- [ ] Intégrer documentExtractorService (extraction de texte)
- [ ] Intégrer scoringService (calcul des scores)
- [ ] Intégrer reportGeneratorService (génération PDF)
- [ ] Intégrer emailService (notifications)

## Phase 8: Tests & Validation
- [ ] Écrire des tests vitest pour les secrets
- [ ] Tester l'authentification Supabase
- [ ] Tester le CRUD des projets
- [ ] Tester l'upload de fichiers
- [ ] Tester les mises à jour en temps réel
- [ ] Tester l'export de données

## Phase 9: Déploiement
- [ ] Vérifier la build production
- [ ] Valider les variables d'environnement
- [ ] Créer le checkpoint final
- [ ] Générer le ZIP du code source
