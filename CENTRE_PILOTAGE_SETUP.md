# Centre de pilotage — La Maison des Dessous

## Livré dans cette version

Accès privé à `https://lamaisondesdessous.fr/gestion`, depuis la boutique existante (même hébergement Render).

- Liste des commandes **payées** de la boutique extraites de Stripe (jusqu'aux 100 sessions les plus récentes, toutes boutiques confondues).
- Détail de la commande, coordonnées utiles, EAN + quantités, montant et mode de livraison.
- **BusyX reste manuel** : bouton "J'ai passé la commande chez BusyX", sans appel à BusyX ni mouvement d'argent.
- Ajout manuel du vrai numéro Colissimo/Chronopost ; enregistré dans les métadonnées Stripe. La page client existante `/commande/confirmation` affiche ensuite le suivi grâce à `/api/order`.
- Note d'expédition interne conservée dans les métadonnées Stripe.
- Après webhook signé Stripe attestant un paiement : e-mail au propriétaire et au client **si** Resend est configuré. Si le numéro de suivi est saisi après expédition, e-mail client **si** la messagerie est configurée. Relance et test possibles dans l'interface.
- Vues Direction, SAV, Finances, Commercial, Communication, Secrétariat/RH et Technique, listes de tâches, réponses-types SAV, CSV comptable.
- Les tâches cochées sont stockées uniquement dans le navigateur (localStorage) et non synchronisées entre appareils ; elles ne lancent aucune action automatique.

## 1. Activer le mot de passe privé dans Render

Dans les variables d'environnement **du service Render existant**, ajouter :

```text
ADMIN_PASSWORD=<mot-de-passe-unique-et-long-de-plus-de-16-caracteres>
ADMIN_SESSION_SECRET=<secret-aleatoire-d'au-moins-32-caracteres>
```

Ne jamais inscrire ces secrets dans GitHub, ChatGPT ou dans le code source. Privilégier un gestionnaire de mots de passe ; générer le secret dans un gestionnaire, puis le coller directement dans les variables privées Render. Redéployer le service. La connexion est bloquée tant que ces deux valeurs sont absentes. Cookies HTTP-only / SameSite=Strict / Secure en HTTPS, signature HMAC expirant après 8 heures, limites de tentatives.

Ne pas créer de compte employé avec ces identifiants : il s'agit d'un **accès unique propriétaire**.

## 2. Notifications automatiques par e-mail

La boîte `contact@lamaisondesdessous.fr` n'existe pas encore. Pour que les notifications partent réellement, choisir un prestataire d'e-mails transactionnels (cette version utilise **Resend**) et vérifier un domaine expéditeur conformément à ses instructions SPF/DKIM. Créer ensuite sur Render les trois variables :

```text
RESEND_API_KEY=<cle-API-secrete-Resend>
MAIL_FROM=notifications@lamaisondesdessous.fr
MERCHANT_NOTIFY_EMAIL=<adresse-qui-recoit-reellement-les-mails>
```

La valeur `MAIL_FROM` doit être une adresse acceptée par Resend sur un domaine vérifié ; **il n'est pas nécessaire qu'elle possède une boîte de réception pour émettre**, mais une vraie adresse répondable `contact@` reste nécessaire pour le SAV. `MERCHANT_NOTIFY_EMAIL` peut être le Gmail existant tant qu'il reçoit les messages.

Dans l'onglet **Technique**, cliquer sur "Tester une notification e-mail" une fois ces paramètres installés. Sans Resend, le site et l'espace commandes restent utilisables, **mais aucun e-mail ne part automatiquement**.

Stripe peut aussi proposer ses propres reçus de paiement selon les réglages de son tableau de bord : vérifier les paramètres et ne pas promettre de réception avant essai.

## 3. Processus de commande

1. La cliente choisit un article et règle sur Stripe.
2. Stripe appelle le webhook existant signé `/api/stripe/webhook` (la variable `STRIPE_WEBHOOK_SECRET` doit déjà être correctement configurée).
3. La vente payée apparaît dans `/gestion`.
4. Si le service de messagerie est prêt, une notification part au propriétaire et une confirmation au client ; sinon, elles restent marquées "non envoyées".
5. Le propriétaire commande manuellement les articles chez BusyX et coche le bouton correspondant.
6. Après **expédition effective**, il saisit le transporteur et le numéro de suivi dans l'espace de pilotage.
7. Le suivi apparaît dans la page client existante ; si le mail est prêt, un message d'expédition est envoyé.

Ne jamais marquer une commande "expédiée" avant sa prise en charge réelle par le transporteur. Le système n'émet **aucune commande automatique** auprès du fournisseur, ne génère pas d'étiquette Colissimo et ne détecte pas tout seul une nouvelle expédition.

## 4. Limites de la première version

- Stripe : les 100 sessions les plus récentes seulement, sans pagination historique. Les totaux financiers sur le tableau de bord **ne remplacent pas la comptabilité** et ne déduisent ni commissions, ni achats fournisseur, ni taxes, ni remboursements.
- Pas de stockage central des tâches : uniquement ce navigateur ; les états de commande sont conservés dans Stripe.
- Notifications : envoi conditionné à Resend, domaine vérifié et e-mail de réception existant. Les indicateurs de notification sont enregistrés dans Stripe après envoi ; de rares doublons peuvent se produire si le prestataire accepte un mail mais que l'écriture de son statut échoue.
- Le webhook effectue au plus deux notifications ; les incidents de livraison de mail sont à surveiller sur Stripe/Resend. À mesure que le volume augmente, prévoir une vraie file de travaux persistante, un stockage durable des logs et la pagination Stripe.
- Les modules "commercial", "community manager", "RH", "comptabilité" sont des **tableaux et procédures d'assistance**, pas des agents IA qui travaillent seuls ou des professionnels diplômés.
- Les finances et les opérations externes restent sous contrôle du propriétaire.
- La conformité légale des CGV, l'immatriculation, le SAV et la protection des données restent à contrôler ; cet outil ne modifie pas ces pages.

## 5. Tests indispensables après déploiement

- `GET /gestion` doit afficher un écran de connexion sans données de commande ;
- l'API `GET /api/gestion/orders` doit renvoyer 401 sans mot de passe ;
- une connexion avec le mot de passe valide doit permettre l'accès aux seules commandes réelles de la boutique ;
- tester une transaction Stripe en mode test sans déclencher de commande BusyX réelle ;
- ne valider un numéro de suivi qu'avec une commande réellement expédiée ;
- vérifier par un e-mail de test la réception à `MERCHANT_NOTIFY_EMAIL`, puis les messages Stripe lors d'une véritable vente ;
- s'assurer que le parcours client, le panier, le paiement Stripe, les options de livraison et la bougie fonctionnent comme avant.

## Déploiement

Le service Render `lamaisondesdessous` suit la branche `feat/boutique-bas`. Les changements sont d'abord travaillés sur une branche et proposés en PR. Aucune nouvelle infrastructure payante n'est requise pour afficher le tableau de bord ; le prestataire e-mail peut avoir une offre gratuite avec limites.


## Laboratoire Stripe TEST (2026-10-21)

**La boutique réelle n'est pas basculée en mode test.** Les deux circuits sont séparés, grâce à une deuxième clé secrète Stripe valide seulement pour les paiements fictifs.

1. Ouvrir le tableau de bord Stripe, accéder à **Mode test / Sandbox**, choisir les clés API de test du même compte.
2. Copier la **clé secrète de test** (qui commence par `sk_test_`), sans la publier ni la communiquer dans le chat.
3. Dans l'environnement du **même service Render**, ajouter la variable `STRIPE_TEST_SECRET_KEY` contenant cette clé. **Ne pas modifier `STRIPE_SECRET_KEY` ni `STRIPE_WEBHOOK_SECRET`.** Enregistrer et attendre la fin du déploiement.
4. Dans le Centre de pilotage `/gestion`, ouvrir l'onglet **Laboratoire Stripe TEST**. Le statut doit indiquer « Stripe Test configuré ».
5. Cliquer **Lancer une commande fictive** ; le navigateur ouvre la boutique dans le **même onglet**, avec une barre orange TEST toujours visible.
6. Choisir un article, parcourir le panier, décider de l'offre de bougie, choisir domicile ou Pickup (si disponible), puis payer sur Stripe TEST avec `4242 4242 4242 4242`, une date future et n'importe quel CVC à 3 chiffres.
7. Lire la page de confirmation (référence Stripe `cs_test_…`), puis revenir au tableau de bord avec **Quitter le test**. La transaction apparaît avec la mention TEST et est exclue du total des ventes réelles.

### Limites / sécurité

- L'API de test est protégée par le **même accès dirigeant** et accepte **uniquement** une clé au format `sk_test_`. Une erreur de clé bloque le mode test ; il n'y a **aucun basculement automatique** vers le paiement réel.
- Le parcours utilise le **vrai front-end de la boutique**, mais dans un contexte de session réservée à l'administrateur. Les commandes et paiements sont uniquement dans Stripe Test ; le webhook de production reste sur la clé réelle.
- Les données de catalogue/prix et l'offre de bougie sont vérifiées via le feed fournisseur (lecture seule), mais **aucune commande BusyX n'est passée**.
- Le suivi colis et la notification réelle sont exclus des commandes tests. Les boutons de livraison/fournisseur sont désactivés pour ces lignes.
- En cas d'expiration de l'authentification administrateur, le paiement de test échoue de façon sûre au lieu de revenir à Stripe réel.
- Stripe Test doit exister dans le même compte lié à la boutique. Il peut être nécessaire d'activer les paiements dans le compte/sandbox Stripe. Le mode test n'est **pas activé** tant que la nouvelle variable Render n'est pas fournie.
