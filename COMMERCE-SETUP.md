# Boutique de bas — configuration et recette

Branche de travail, à vérifier avant fusion dans la branche déployée par Render.

## Ce qui est livré

- Dix références de bas, trois pour porte-jarretelles et sept autofixantes, avec variantes EAN/taille, composition et photos du fournisseur.
- Accueil spécialisé, catalogue, filtres de couleur, fiches, guide, navigation mobile et panier local persistant.
- Prix public en centimes : `ceil((achat_HT_centimes * 120 + 57000) / 70)`. Hypothèse de TVA d'achat 20 % non récupérée. Marge de 30 % sur le prix de vente avant Stripe, cotisations, retours et remises ; ce n'est pas une majoration de 30 %.
- 5,70 € de coût Pickup inclus dans chaque paire. Supplément domicile par commande : 2,58 €. Chronopost sur demande uniquement.
- Pages HTML générées au build pour les catégories et fiches ; sitemap ; parcours de commande non indexable.
- Contrôle serveur du stock et du prix à partir du flux avant de créer un paiement Stripe unique. Les coûts fournisseurs et le token ne sont pas exposés dans le front.
- Offre complémentaire facultative et relais contrôlés depuis une configuration serveur. Aucun article inventé.

## Variables serveur Render (jamais dans VITE_ ni GitHub)

`BUSYX_FEED_URL` : URL privée exacte du flux CSV, comportant le token et l'identifiant du flux. Régénérer le token partagé dans la conversation, puis utiliser la nouvelle URL.

`SITE_URL` : origine HTTPS de la boutique, sans slash final.

`STRIPE_SECRET_KEY` : clé de test pour la recette, puis clé réelle lors de l'ouverture.

`CHECKOUT_ENABLED=true` : uniquement après configuration et recette.

`STRIPE_WELCOME_CODE=BIENVENUE5` (facultatif) : créer préalablement dans Stripe un code actif associé à une remise de 5 %, durée unique, réservé aux premières transactions. Vérifier les restrictions Stripe avec une cliente ayant déjà commandé. La remise est appliquée et vérifiée par Stripe, pas par le navigateur. Le taux est un choix de départ modifiable, à confirmer avant activation.

`PICKUP_POINTS_JSON` : tableau de points vérifiés auprès du transporteur, avec `id`, `name`, `address`, `postcode`, `city`. Sans liste, Pickup est désactivé et expliqué. Ce mécanisme est une première liste sélectionnable, pas un moteur géographique national. Brancher ensuite la recherche du transporteur.

`UPSELL_EAN` : référence de l'offre complémentaire payante. Par défaut : `3479228260621`, mini bougie de massage vanille 35 ml choisie par Philippe. Une valeur vide désactive l'offre. Le flux actuel Lingerie ne contient pas cette référence : l'étendre ou configurer un flux complet avant activation. Aucun prix ni stock n'est inventé. `UPSELL_DESCRIPTION` permet de modifier le texte. Le prix applique 30 % de marge au coût TTC, sans doubler le transport. L'offre disparaît en cas d'indisponibilité.

## Exploitation initiale

Les commandes sont dans Stripe (EAN, quantités et livraison dans les métadonnées). Traitement BusyX manuel ; aucune commande fournisseur ni dépense automatique. Confirmer la réception du paiement depuis Stripe, jamais depuis la page de retour. Activer les reçus Stripe. Prévoir les confirmations d'expédition et le suivi manuels.

La vérification de stock ne réserve pas les unités chez BusyX. Une rupture entre le paiement et la commande fournisseur reste possible : contrôler immédiatement et contacter/rembourser la cliente si nécessaire. Aucun débit ne doit être lancé à partir du seul catalogue de secours.

## Fidélité — proposition non activée

Prévoir un compte cliente et un registre serveur : points crédités après paiement confirmé, annulés après remboursement, consommation atomique lors d'une récompense. Proposition à valider : 1 point par euro d'articles payé, 100 points pour une remise de 5 €, non cumulable avec bienvenue. Cadeau anniversaire : jour/mois facultatif, une attribution par an, référence et condition d'achat à décider. Rien n'est promis ni simulé dans le navigateur en attendant cette décision et la base de comptes.

## Recette obligatoire avant production

1. Build front et serveur, contrôle TypeScript, tests du calcul et du panier.
2. Tester mobile, navigation directe d'une fiche, variantes indisponibles, panier persistant, retrait et quantités.
3. Avec le flux privé serveur, vérifier les prix/stock live, une rupture et une hausse de prix pendant le checkout.
4. Avec Stripe test, paiement accepté/refusé/abandonné ; vérifier EAN, taille, total, adresse et point Pickup dans Stripe ; vérifier bienvenue première commande et commande suivante.
5. Confirmer points Pickup et produit complémentaire ; tester refus de point inconnu et retrait de l'upsell.
6. Actualiser le catalogue statique depuis les données fournisseur avant chaque build (le snapshot actuel date du 8 octobre 2026). Tester les descriptions et photos. Le checkout contrôle toujours le flux live.

Les conditions commerciales et informations existantes du site restent à relire avant ouverture. Les anciens articles de blog sont conservés.

## Vérifications réalisées

- Compilation Vite et serveur Express réussies ; 15 pages HTML et sitemap générés.
- Contrôles TypeScript front et serveur réussis.
- Tests : calcul TTC/marge, CSV multi-lignes, rejet de paniers invalides ; intégration checkout avec fournisseur et Stripe simulés (rupture, changement de prix, relais inconnu, métadonnées EAN, frais domicile/Pickup, désactivation).
- Aucun paiement Stripe réel ou de test distant effectué : les clés ne sont pas configurées.
- Vérification visuelle navigateur non réalisée : le téléchargement du navigateur de test a échoué dans cet environnement. À effectuer avant fusion.
