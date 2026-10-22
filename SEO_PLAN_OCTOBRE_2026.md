# La Maison des Dessous — optimisation SEO d'octobre 2026

## Objectif
Gagner des impressions et des visites qualifiées sans publicité, en travaillant d'abord les recherches spécifiques aux bas vendus : bas résille femme, bas autofixants noirs en dentelle, bas résille autofixants noirs, bas pour porte-jarretelles, bas 20 deniers.

**Aucune position 1 ou première page n'est garantie.** Ne pas multiplier les pages artificielles visant les mêmes mots-clés, ni inventer les tailles, caractéristiques, avis ou niveaux de stock.

## Point de départ — Google Search Console
Source : compte Search Console lié à `https://lamaisondesdessous.fr/`, relevé sur le 20 septembre — 19 octobre 2026 ; requêtes du rapport Search Analytics. Les faibles volumes rendent les moyennes instables.

| Requête | Impressions | Clics | Position moyenne |
|---|---:|---:|---:|
| bas femme | 4 | 0 | 4,75 |
| bas résilles | 1 | 0 | 18 |
| femme bas resille | 12 | 0 | 33,58 |
| bas resille femme | 4 | 1 | 39 |
| bas autofixants | 2 | 0 | 47,5 |
| bas resille noir | 2 | 0 | 46,5 |
| bas pour porte jarretelles | 2 | 0 | 35,5 |
| bas jarretelles | 2 | 0 | 44,5 |

Les recherches exactes « bas », « bas résille » et « bas de lingeries femme » n'avaient pas de position mesurée dans ce rapport. Le mot « bas » isolé est ambigu ; la boutique mise sur les intentions de recherche précises. Les positions ci-dessus ne décrivent pas un résultat Google fixe et universel.

## Travail technique et éditorial

- `/` et `/boutique` : titres et textes naturels autour des bas pour femme, nouveaux liens de contexte.
- `/bas-resille` : cible « bas résille femme » + ses variantes noires, beiges et autofixantes ; renforcement des réponses et du maillage.
- `/bas-autofixants` : cible « bas autofixants femme », « bas autofixants noirs dentelle », « 20 deniers » ; liens vers modèles compatibles.
- `/bas-porte-jarretelles` : explication du maintien à attaches, liens vers les modèles et alternatives.
- `/conseils/comment-porter-bas-resille` : nouveau guide pour l'intention informationnelle, lié aux collections et aux produits.
- 8 descriptions de fiches retravaillées sur les faits connus : matière, couleur, bordure, taille et type de maintien.
- Dans le HTML indexable : données structurées `Product` et `Offer` incluant `price`, `priceCurrency: EUR` et l'URL de la fiche. La disponibilité en temps réel n'est pas annoncée dans les données statiques, car le stock fournisseur varie. Les prix structurés proviennent du catalogue de référence au moment de la compilation ; vérifier qu'ils restent cohérents avec les prix réels après chaque modification de politique tarifaire.
- Le sitemap est régénéré par la compilation, avec des URL uniques, et le fichier `robots.txt` référence `/sitemap.xml`.
- Contrôles automatisés dans `scripts/verify-seo.mjs`.

## Vérifications après mise en ligne

1. Ouvrir `https://lamaisondesdessous.fr/sitemap.xml` : contrôler que le nouveau guide et toutes les URL de catégories figurent dans le fichier.
2. Dans Google Search Console > **Sitemaps**, soumettre à nouveau `https://lamaisondesdessous.fr/sitemap.xml` si nécessaire. L'API d'analyse connectée ne permet pas d'effectuer cette action.
3. Dans **Inspection de l'URL**, contrôler `/bas-resille`, `/bas-autofixants`, `/bas-porte-jarretelles`, le nouveau guide et 2 fiches produits ; demander l'indexation quand Google ne les a pas encore explorés.
4. Dans Google Search Console > Améliorations / résultats produits, vérifier les éventuels avertissements sur les données structurées. Vérifier séparément avec le test des résultats enrichis : `https://search.google.com/test/rich-results`.
5. Analyser les mêmes expressions sur des périodes équivalentes de 28 jours, et vérifier pages + requêtes, clics, impressions et position moyenne. Ne pas conclure à une hausse ou une baisse sur une seule impression.

## Développement SEO futur (après observation)

- Enrichir les tailles avec les véritables mesures fabricant en centimètres, lorsque confirmées.
- Ajouter des photos originales et plusieurs vues par paire lorsque les droits et les images sont disponibles.
- Ajuster les pages qui montrent des impressions mais peu de clics avant de créer de nouvelles pages.
- Vérifier régulièrement les liens cassés, pages en 404, variantes et canonicals.
- Examiner Google Merchant Center seulement quand le flux prix/stock peut être synchronisé de façon fiable.

## Ne pas faire
Ne pas modifier le paiement Stripe, les commandes, les frais de livraison ou les règles de retour au nom du SEO. Ne pas bourrer les titres de mots-clés, dupliquer les catégories, créer de faux avis, ni promettre la première page.
