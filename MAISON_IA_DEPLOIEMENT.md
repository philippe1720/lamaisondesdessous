# Mettre Maison IA sur Render

Le code est dans `maison-ia/`, branche **maison-ia-v1** du dépôt
**philippe1720/lamaisondesdessous**. La boutique continue sur `feat/boutique-bas`.
L'ancien service `sandrine-ia-essai` reste disponible pendant la transition.

## 1. Créer le service de remplacement

Render → New → Blueprint → dépôt `lamaisondesdessous` → branche `maison-ia-v1`
→ fichier `render.yaml` à la racine. Le service s'appelle `maison-ia` et utilise Docker.
Le Blueprint ne crée aucune base, aucun cron payant et aucun worker payant.

Renseigner les trois valeurs demandées :

| Variable | Valeur attendue |
|---|---|
| DATABASE_URL | URL PostgreSQL de la base qui conservera les conversations. Si Sandrine possède déjà une base, son URL peut être réutilisée avec les droits de création de tables maison_ai_*. Ne pas mettre l'URL du site. |
| OPENAI_API_KEY | Clé API OpenAI personnelle, saisie uniquement dans Render. |
| LLM_MODEL | Identifiant exact d'un modèle de chat autorisé sur ce compte API. |

Render génère ADMIN_TOKEN et WEBHOOK_SECRET. Après déploiement, ouvrir Environment et
copier ADMIN_TOKEN dans le champ de connexion du bureau. Ne pas partager cette valeur dans un chat.
Pour Anthropic, remplacer LLM_PROVIDER par anthropic, renseigner ANTHROPIC_API_KEY et un modèle
Claude accessible. Le code fourni initialement par Claude contenait un nom de modèle non vérifié :
il n'est plus imposé dans le projet.

L'abonnement ChatGPT/Claude ne constitue pas une clé API de cette application.
Configurer le budget API chez le fournisseur. La limite interne est 10 missions/jour.

## 2. Ajouter progressivement les connexions

- Boutique : le catalogue public fonctionne sans secret supplémentaire.
- Stripe : STRIPE_RESTRICTED_KEY, lecture seule Checkout Sessions et Balance Transactions.
- Google : GOOGLE_SERVICE_ACCOUNT_JSON_B64, GA4_PROPERTY_ID=543728215,
  SEARCH_CONSOLE_SITE_URL=https://lamaisondesdessous.fr/. Partager ces propriétés avec
  l'adresse du compte de service en lecture et activer les API Analytics Data / Search Console.
- GitHub : GITHUB_TOKEN limité à ce dépôt, permissions Contents et Pull requests lecture/écriture ;
  GITHUB_SEO_ENABLED=true pour pouvoir créer les PR approuvées. Aucun merge automatique.
- Rapports email : RESEND_API_KEY + MAIL_FROM (expéditeur validé) + OWNER_EMAIL,
  puis NOTIFY_OWNER=true. Le mode SMTP_SSL reste disponible si l'hébergement l'autorise.
- Lecture achats : IMAP_HOST, SMTP_USER et SMTP_PASSWORD (mot de passe d'application si requis),
  boîte professionnelle uniquement. Lecture des en-têtes des non-lus, pas des pièces jointes.
- Instagram : INSTAGRAM_BUSINESS_ID + INSTAGRAM_ACCESS_TOKEN avec permissions de lecture/publication
  Meta appropriées. Vérifier GRAPH_API_VERSION et INSTAGRAM_PUBLISH_ENABLED avant d'activer l'écriture.
- TikTok : scripts préparés dans les propositions, publication manuelle dans cette version.

Ces accès sont distincts des connexions installées dans ChatGPT.

## 3. Relier les alertes boutique

L'exemple `maison-ia/docs/send-webhook.js` s'intègre au backend après validation d'un paiement.
Variables côté boutique : AI_WEBHOOK_URL (URL du nouveau service), AI_WEBHOOK_SECRET
(même valeur que WEBHOOK_SECRET côté Maison IA). Utiliser l'ID Stripe stable pour éviter les doublons.
Cette livraison n'a pas modifié le webhook de paiement de la boutique.

## 4. Vérifier puis remplacer Sandrine

Tester le bureau, une réponse IA réelle et la persistance après redéploiement. Tester chaque
connecteur avant de considérer l'agent autonome. Les données Sandrine ne sont pas effacées,
mais ne sont pas importées automatiquement dans ce nouveau schéma.
Après validation, utiliser l'URL Maison IA sur téléphone et arrêter l'ancien service pour éviter
les doublons. Aucun service payant n'a été commandé par cette livraison.

Sur le plan gratuit, Render peut mettre le service en veille : le briefing et les alertes ne sont
pas garantis en temps réel. DAILY_BRIEFING_ENABLED reste false par défaut. Si activé, le briefing
est mis en file une fois par jour après 8h Europe/Paris lorsque le service est éveillé.

## Commandes de vérification

```sh
cd maison-ia
pip install -r requirements.lock
pytest -q
```

Blueprint : valider `render.yaml` depuis la racine avec `render blueprints validate render.yaml`
si le CLI est installé. Le Dockerfile utilise les dépendances verrouillées, et lie le port fourni
par Render. La route de santé est `/health`.
