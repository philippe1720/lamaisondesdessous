# Maison IA — bureau de direction de La Maison des Dessous

Version 1 : FastAPI + LangGraph + PostgreSQL. Remplacement préparé pour Sandrine,
sans modifier le service de vente ni reprendre automatiquement ses anciennes données.

## Ce qui est implémenté

- Bureau responsive en français : conversation, choix direct des agents, historique,
  missions, erreurs, propositions et état des intégrations.
- Direction → sélection bornée des spécialistes → analyses → synthèse LangGraph.
  Maya (achats), Léo (SEO), Clara (communication), Thomas (commercial), Finance.
- Mémoire des 6 derniers échanges par conversation, persistée dans PostgreSQL.
- File durable avec unicité de l'événement, admission atomique, quota quotidien,
  statut d'échec et reprise manuelle des tâches interrompues (détection après 30 min).
- Webhook HMAC SHA256 horodaté ; aucune exécution d'instructions reçues par webhook.
- Catalogue réel `/api/catalog` ; commandes Stripe payées filtrées sur store=lmd et livemode.
- Outils GA4, Search Console, en-têtes IMAP, Instagram et bilan des transactions Stripe.
- Propositions SEO : après validation, PR GitHub en brouillon, basée sur la branche réelle
  `feat/boutique-bas`. Vérification du texte précédent avant création, uniquement nom/description
  produit et title/description catégorie. Aucun merge automatique.
- Instagram : image + légende après validation explicite, si connexion et autorisation activées.
- TikTok : rédaction de scripts, publication manuelle. Aucun connecteur TikTok prétendument actif.
- Email de rapport au propriétaire via Resend HTTPS ou SMTP SSL, optionnel ; le rapport reste
  accessible si l'email échoue. Envoi incertain signalé, jamais renvoyé automatiquement.

## Limites explicites

Aucune commande fournisseur, aucun paiement, remboursement ou déclaration fiscale automatique.
La marge nette ne peut pas être déduite du net Stripe seul : les coûts réels sont nécessaires.
Le suivi client de la boutique reste dans sa propre application. Le webhook fourni est un adaptateur
à intégrer au backend ; il n'est pas déjà branché en production.
Pas de reprise automatique des secrets, connecteurs ChatGPT, missions ou données Sandrine.
Les tokens Instagram expirent et les permissions Meta doivent être accordées ; le code ne les contourne pas.
Le sourcing propose des pistes sur les données disponibles ; aucun moteur de recherche fournisseurs n'est connecté.
Les pièces jointes/vocaux ne sont pas pris en charge dans cette V1.

## Arborescence

```text
render.yaml                    # à la racine du dépôt, branche maison-ia-v1
maison-ia/
  Dockerfile
  requirements.txt             # plages de compatibilité
  requirements.lock            # versions exactes vérifiées
  .env.example
  app/
    main.py                    # API + tableau de bord + cycle de vie worker
    config.py                  # validation des variables
    db.py                      # tables maison_ai_* isolées
    queue.py                   # persistance, quota, traitement, briefing et emails
    agents.py                  # rôles et outils de lecture
    orchestrator.py            # graphe LangGraph
    proposals.py               # validation humaine et exécution contrôlée
    security.py                # bearer et HMAC anti-rejeu
    llm.py                     # OpenAI/Anthropic, appels bornés
    static/                    # interface française, sans framework frontend
    tools/                     # API métier, Google, Stripe, GitHub, mail, Instagram
    jobs/daily.py              # déclenchement externe facultatif
  tests/                       # auth, file, doublons, limites, propositions, graphe
  docs/send-webhook.js
  migrations/README.md
```

## Développement

Python 3.12 :

```sh
cd maison-ia
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.lock
cp .env.example .env
# Remplir ADMIN_TOKEN et WEBHOOK_SECRET (deux secrets distincts >=32 caractères).
# Génération locale possible : python -c 'import secrets; print(secrets.token_urlsafe(32))'
uvicorn app.main:app --host 127.0.0.1 --port 8000
pytest -q
```

Sans clé/modèle IA, le bureau fonctionne et affiche la configuration manquante ; aucune fausse
réponse de démonstration n'est générée. Les tests simulent les API et ne débitent aucun compte.

## Déploiement Render

Voir [le guide de déploiement](../MAISON_IA_DEPLOIEMENT.md). Le Blueprint utilise un service gratuit
et demande une connexion PostgreSQL existante ; il ne crée ni base ni abonnement payant.
PostgreSQL est obligatoire en production pour éviter la perte de données au redémarrage.
Les tables maison_ai_* sont créées dans la base fournie, sans toucher aux tables existantes.
Utiliser un utilisateur dédié et une base dédiée si possible. Sauvegarder avant migration.

Un processus web Uvicorn, un worker interne. Ne pas ajouter `--workers` ni plusieurs réplicas
sans planifier la capacité fournisseur et vérifier les limites. Le claim des tâches et l'admission
sont atomiques, mais les actions externes ne sont pas des transactions SQL distribuées.
Une publication au résultat incertain reste à vérifier ; aucun retry automatique.

## Sécurité et maîtrise des coûts

ADMIN_TOKEN est conservé uniquement en mémoire de l'onglet. HTTPS obligatoire sur Render.
Aucun secret ne doit être saisi dans le chat. Le HTML n'interprète jamais les réponses IA.
Un webhook n'accepte pas `user.request` ; les autres événements sont des données non fiables.
L'IA ne peut exécuter ni shell, ni SQL, ni URL arbitraire. Outils et champs modifiables sont bornés.
Au maximum 10 missions/jour UTC et 10 missions actives, réglables. Une demande Direction fait
au plus 5 appels IA, un briefing au plus 6. Le plafond de missions n'est pas un budget monétaire :
configurer également un plafond chez le fournisseur API. Aucune recherche en boucle.

## API

Toutes les routes métier sauf webhook exigent `Authorization: Bearer <ADMIN_TOKEN>`.
`GET /health`, `GET /api/status`, `POST /ask` ({message, agent, thread_id}), `GET /jobs`,
`POST /jobs/{id}/retry`, `GET /proposals`, `POST /proposals/{id}/approve|reject`.
`POST /webhooks/shop` : en-têtes X-Timestamp et X-Signature, voir l'exemple JavaScript.
Les décisions approuvées manuellement ne sont jamais présentées comme des actions déjà exécutées.

## Recette avant bascule

1. Ouvrir le bureau, se connecter, vérifier les connexions configurées.
2. Envoyer une demande à Maya, vérifier que la source catalogue et sa fraîcheur sont indiquées.
3. Tester Léo après partage du compte de service Google ; vérifier période et requêtes réelles.
4. Vérifier Stripe avec les commandes réelles en lecture seule (pas de paiement de test en live).
5. Créer une proposition SEO, vérifier la PR, ne fusionner qu'après contrôle du build.
6. Redéployer et vérifier la conservation des rapports.
7. Activer l'email propriétaire seulement après configuration et consentement, puis tester la réception.
8. Désactiver Sandrine et ses éventuels déclencheurs uniquement après cette recette.

Les tests de cette livraison ne prouvent pas les permissions des comptes externes : ils restent
à effectuer avec les accès Render. Il n'y a pas de publication ni de paiement réel dans les tests.
