# Boutique de bas — configuration et recette

Branche de travail, à vérifier avant fusion dans la branche déployée par Render.

## Ce qui est livré

- Dix références de bas, trois pour porte-jarretelles et sept autofixantes, avec variantes EAN/taille, composition et photos du fournisseur.
- Accueil spécialisé, catalogue, filtres de couleur, fiches, guide, navigation mobile et panier local persistant.
- Prix public en centimes : `ceil((achat_HT_centimes * 120 + 57000) / 70)`. Hypothèse de TVA d'achat 20 % non récupérée. Marge de 30 % sur le prix de vente avant Stripe, cotisations, retours et remises ; ce n'est pas une majoration de 30 %.
- 5,70 € de coût Pickup inclus dans chaque paire. Livraison standard offerte à domicile comme en Pickup. Le coût domicile supplémentaire de 2,58 € est absorbé : les prix des produits restent inchangés, donc la marge réelle est inférieure à 30 % en livraison domicile. Chronopost sur demande uniquement.
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
- Tests : calcul TTC/marge, CSV multi-lignes, rejet de paniers invalides ; intégration checkout avec fournisseur et Stripe simulés (rupture, changement de prix, relais inconnu, métadonnées EAN, gratuité domicile/Pickup, désactivation).
- Aucun paiement Stripe réel ou de test distant effectué par nos tests locaux.
- Vérification navigateur réalisée avec Chromium sur ordinateur et mobile ; transports et paiements simulés pour les parcours de recette.

## Parcours client — mise à jour du 11 octobre 2026

- Guide `/guide-des-tailles` et aide sur chaque fiche. Tableau général Cottelli en cm sourcé : https://www.orion.de/product/stockings-25407895021. Il ne s'agit pas d'un tableau cuisse/longueur spécifique aux bas : les tailles 1–5 et S/M ne sont pas converties arbitrairement. Les correspondances spécifiques des bas Daring Intimates et Ohyeah restent à obtenir auprès de BusyX. Le guide Ohyeah public https://ohyeahqueen.com/pages/size-chart n'indique pas les mensurations cuisse/longueur de notre référence : il n'est pas transposé aux bas.
- Caractéristiques extraites du CSV BusyX du 8 octobre : deniers seulement lorsqu'indiqués, aspect, maintien, pointes, jarretière, contenu. Les 39 photos existent en résolution 800 ; elles sont agrandissables.
- Livraison/retours : page `/livraison-retours`, liens sur fiches, checkout et pied de page. Conservation du délai commercial de 30 jours déjà présent dans le site ; distinction avec le droit légal de 14 jours. Délai standard indicatif 3–5 jours ouvrés, Chronopost payant sur demande. Confirmer les délais de préparation et l'adresse de retour opérationnelle avec le fournisseur avant ouverture.
- Bougie : choix ajouter/continuer sans ajouter de même visibilité ; sélection mémorisée pendant la commande ; retrait possible avant paiement. Elle n'est visible que si le flux la fournit avec stock, image et prix valides.

### Colissimo : activation nécessaire

Ajouter `COLISSIMO_API_KEY` (clé du service points de retrait fournie par Colissimo, ou accès agréé proposé par BusyX). Ne pas employer la clé Stripe ou le token CSV. Documentation : https://www.applications.colissimo.entreprise.laposte.fr/doc-colissimo/redoc-pdr/fr.

Le formulaire recherche par code postal + ville, affiche adresse et horaires, puis revérifie le relais côté serveur avant paiement. Les points fermés sont exclus. Sans clé, `PICKUP_POINTS_JSON` reste utilisable pour une sélection manuellement vérifiée, filtrée par code postal ; sans l'un ou l'autre, la sélection reste indisponible, sans relais fictif. La compatibilité des identifiants sélectionnés avec le traitement dropshipping BusyX doit être vérifiée sur une commande de test.

### Stripe : confirmation, notifications et suivi

La page privée `/commande/confirmation?session_id=…#access=…` vérifie le paiement auprès de Stripe. Elle affiche les articles avec tailles, quantités, montants, adresse ou point Pickup, remboursement et suivi. Un code aléatoire de 256 bits enregistré sur la session Stripe protège les coordonnées. Les pages privées désactivent Google Analytics, le cache et le referrer. Le panier est diminué des quantités payées une seule fois sur cet appareil ; les autres achats restent présents.

Créer dans Stripe **en environnement test** une destination webhook **snapshot** :
- URL : `https://lamaisondesdessous.fr/api/stripe/webhook`
- Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`.
- Mettre le secret de cette destination dans Render : `STRIPE_WEBHOOK_SECRET=whsec_…`, puis redéployer.

La signature est vérifiée sur le corps brut avec tolérance de 5 minutes. Le serveur consulte l'état actuel Stripe ; il note durablement `payment_verified=true` sur les sessions payées de cette boutique. Les événements répétés réécrivent la même information, sans commande fournisseur ni expédition automatique. Les erreurs Stripe renvoient 503 pour provoquer une nouvelle livraison du webhook. Stripe reste le registre durable : aucune base locale éphémère n'est utilisée.

Le reçu e-mail reste celui de Stripe, à activer dans son tableau de bord ; aucun e-mail personnalisé d'expédition n'est encore envoyé automatiquement. La cliente peut conserver/imprimer son lien de confirmation et retrouver ses dernières commandes sur le même appareil via `/suivi-commande`. Un changement d'appareil nécessite le lien privé conservé ; aucun accès par simple numéro de commande.

**Après expédition par BusyX**, ouvrir le paiement dans Stripe et ajouter aux métadonnées du paiement (PaymentIntent) :
- `tracking_number` : numéro exact du colis.
- `tracking_carrier` : `colissimo` ou `chronopost`.

La page de suivi lit ces données en direct et propose le lien officiel du transporteur. Elle ne simule ni expédition ni livraison. Envoyer le numéro de suivi à la cliente reste manuel tant qu'aucune intégration de notification fournisseur n'est configurée. Ne pas modifier `order_access` sur la session Checkout.

### Recette de cette mise à jour

Tests simulés : vérification signature, rejet d'altération/rejeu expiré, événement répété, accès refusé avec un mauvais code, détails/adresse, suivi et remboursement, recherche transporteur et exclusion des relais fermés, checkout zéro frais standard. Recette Stripe et Colissimo avec les vrais comptes encore requise ; aucun encaissement ni commande BusyX n'a été déclenché.


## Passage au paiement réel — 13 octobre 2026

Le code utilise la clé serveur STRIPE_SECRET_KEY pour créer Checkout. Il n’y a pas de bouton logiciel à convertir ni de clé publique à ajouter au front pour ce parcours hébergé.

1. Dans le compte Stripe de production, vérifier que les paiements et virements sont autorisés ; terminer les demandes du tableau de bord si nécessaire.
2. Dans Render, remplacer STRIPE_SECRET_KEY par la clé de production du compte correspondant (sk_live_… ; une clé restreinte rk_live_… doit disposer des droits nécessaires).
3. Créer une destination webhook de production pour /api/stripe/webhook et les deux événements indiqués plus haut, puis enregistrer son secret propre dans STRIPE_WEBHOOK_SECRET. Le secret test ne convient pas.
4. Garder CHECKOUT_ENABLED=true, SITE_URL=https://lamaisondesdessous.fr et BUSYX_FEED_URL valide. Enregistrer et redéployer.
5. Le champ public paymentMode de /api/commerce/config indique uniquement le mode déduit du préfixe de la clé, jamais sa valeur. live n’est pas une preuve de validité de la clé ni d’encaissement effectif. Le checkout indique explicitement le mode test avant paiement.
6. Vérifier l’ouverture de Checkout, le montant, la taille et la livraison. Les simulations locales ne constituent pas une transaction réelle validée. Les commandes de test restent dans l’espace Stripe de test et ne seront pas consultables avec la clé réelle.
7. Recréer tout code promotionnel voulu dans le compte réel ; le code de test n’y existe pas automatiquement. Activer les reçus du compte réel.

Corrections éditoriales : page À propos recentrée sur les bas, FAQ sans promesses de papier de soie ni conseils de taille arbitraires, liens sociaux factices remplacés par les liens panier/suivi. Les anciennes pages de blog et le dossier légal restent à reprendre. L’adresse e-mail utilisable et les coordonnées actuelles du vendeur restent à fournir par Philippe pour finaliser ces pages.

## Contenus SEO — 13 octobre 2026

Source éditoriale partagée : `src/data/editorial.json` côté boutique, utilisée par React et `build-seo.mjs`. Trois catégories (dont `/bas-resille`), dix compléments de fiches et quatre guides sous `/conseils/`. Les informations commerciales restent dans `catalog.json` et sont complétées par le flux de stock/prix ; les textes ne sont donc pas écrasés lors d’une actualisation du stock.

Les liens des guides ciblent les catégories et les produits existants. Le guide de prise de mesures complète le tableau par marque `/guide-des-tailles`, sans créer de correspondances absentes du fournisseur. Les dénominations/mesures des dix références proviennent du catalogue BusyX déjà importé, sans changement de prix, EAN ou tailles. Sources générales de vérification : FALKE Lunelle 8 DEN (consigne sur la crème et la bande silicone), https://www.falke.com/dk_en/p/lunelle-8-den-women-stay-ups/41535_0999/ ; définition du denier, https://viennemilano.com/blogs/tights/whats-a-denier. Aucune méthode d’entretien propre à une autre marque n’est transposée aux produits vendus.

Le build génère 24 pages HTML et met à jour le sitemap. Les descriptions longues et les liens sont présents avant exécution JavaScript. Les données Product descriptives des fiches sont également incluses dans le HTML initial ; prix et stock structurés restent à traiter avec une stratégie de fraîcheur adaptée au flux fournisseur.
