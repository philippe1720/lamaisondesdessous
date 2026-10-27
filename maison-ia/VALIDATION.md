# Validation de livraison — 27 octobre 2026

- 20 tests automatisés passent sous Python 3.12 (stockage SQLite temporaire, API externes simulées).
- Tests : authentification, signature HMAC et expiration, anti-doublon après reconnexion,
  plafond atomique, claim concurrent, conservation des rapports, erreurs expurgées,
  historique isolé, validation humaine, absence de retry après publication incertaine,
  restrictions d'URL, refus du stockage éphémère en production, contrôle du contenu SEO
  avant création d'une PR et orchestration LangGraph.
- Lecture réelle de l'API catalogue : 10 produits reçus.
- Lecture réelle des contenus GitHub de la branche boutique : 3 catégories, 10 produits.
- render.yaml validé contre le JSON Schema officiel Render. CLI Render non disponible.
- Syntaxe du JavaScript de l'interface vérifiée avec node --check.
- Démarrage local FastAPI vérifié ; aucune clé fournisseur IA utilisée.

## À vérifier sur le déploiement

Pas de test réel OpenAI/Anthropic, Stripe, Google, IMAP, envoi email, publication Instagram ou
création de PR par l'application : les secrets de cette nouvelle application ne sont pas configurés.
Le test PostgreSQL et la construction Docker n'ont pas pu être exécutés localement (serveurs absents).
La recette navigateur ordinateur/mobile n'a pas abouti : le téléchargement du navigateur local
a échoué. Ne pas considérer l'interface comme validée visuellement avant recette sur Render.
Aucun paiement, publication sociale ni modification du contenu marchand réalisé par les tests.
