# Déclic — Couples, réactions acide-base et espèces amphotères

Une application en français pour comprendre les couples et réactions acide-base en terminale spécialité physique-chimie. Le sélecteur « Ton module » permet de passer d’un module à l’autre.

## Les deux modules

- **Module 1 — Couples acide-base** : notions des missions 1 et 2, avec une introduction au transfert entre partenaires et aux espèces amphotères. Son animation utilise H₃O⁺ + NH₃ → H₂O + NH₄⁺.
- **Module 2 — Réactions et espèces amphotères** : missions 3 « D’où viennent les bulles ? » et 4 « Une espèce, deux rôles possibles ». Quatre étapes : identifier les partenaires, assembler le bilan, expliquer les bulles et reconnaître les espèces amphotères. L’animation suit CH₃COOH + HCO₃⁻, la formation de H₂CO₃ puis sa transformation en H₂O et CO₂. Deux outils permettent de simplifier H⁺ dans les demi-équations et de changer le partenaire de HCO₃⁻.

Chaque module possède sa propre banque de 24 questions, un entraînement et un test de huit questions. Les étapes validées, les réponses et les tests en cours sont enregistrés séparément. Le module 1 conserve sa clé de sauvegarde d’origine ; ajouter le module 2 n’efface pas les acquis précédents. Le bouton d’effacement concerne uniquement le module sélectionné. Le dernier module utilisé est mémorisé.

## Utiliser l’application dans Chrome

Télécharger **Declic-acide-base.html**, puis ouvrir ce fichier avec Google Chrome. Cette version autonome contient toute l’application et fonctionne sans connexion, sans installation et sans clé d’API.

Depuis GitHub, ouvrir le fichier puis choisir **Download raw file** (Télécharger le fichier brut), en haut à droite. Un double-clic sur le fichier téléchargé l’ouvre dans le navigateur par défaut ; utiliser « Ouvrir avec > Google Chrome » si nécessaire.

## Le parcours

- **Apprendre** : quatre étapes adaptées au module sélectionné, avec règles, exemples et questions guidées.
- **Observer une réaction** (dans Apprendre) : modèles animés en boules et liaisons, propres à chaque module. Lecture, pause, retour au début et progression manuelle en quatre étapes ; le transfert, les produits et la conservation des atomes et de la charge sont expliqués. Les modèles fonctionnent aussi sans connexion dans le fichier autonome. Ils sont schématiques et ne représentent pas une trajectoire moléculaire réelle. Avec la préférence système « réduire les animations », les étapes restent disponibles sans mouvement.
- **S’entraîner** : huit questions tirées d’une banque de 24 questions, deux indices progressifs et une correction expliquée. Les formules peuvent être saisies au clavier.
- **Se tester** : huit questions équilibrées entre les quatre compétences, sans indices ni correction avant la fin. Le test en cours reprend après un rechargement ou un retour à l’application.
- **Mon bilan** : étapes validées, réussite au premier essai sans aide, résultats par compétence et proposition de révision.

Les résultats sont conservés uniquement dans le navigateur utilisé, sur l’appareil utilisé. Ils ne sont pas synchronisés entre Chrome, un autre navigateur ou deux adresses du site. En navigation privée, ils peuvent disparaître à la fermeture. Un bouton permet de les effacer. Aucun compte élève, serveur de données, publicité ou suivi externe. L’entraînement libre reprend au début après un rechargement ; le cours validé, l’historique et le test en cours sont conservés.

L’aide est préparée à l’avance : il n’y a pas de dialogue avec une IA dans cette première version. Le bilan est un repère de révision, pas une certification de maîtrise.

## Mettre le site en ligne avec GitHub Pages

Dans ce dépôt : **Settings > Pages > Build and deployment**. Choisir **Deploy from a branch**, puis **main**, **/ (root)** et **Save**. GitHub indiquera l’adresse du site une fois le déploiement terminé. L’application est déjà à la racine du dépôt, sans compilation nécessaire. Le dépôt est public ; les documents de cours CNED originaux n’y sont pas inclus.

## Développement

Node.js 20 ou plus récent, aucune dépendance à installer :

```sh
npm start
npm test
npm run build
```

Ouvrir `http://127.0.0.1:4173`. La commande de compilation régénère uniquement le fichier HTML autonome. Après toute modification du code ou des contenus, régénérer ce fichier avant de l’enregistrer dans GitHub.

Les fichiers `content.js` et `reaction.js` contiennent le module 1 ; `module-two-content.js` et `module-two-reaction.js` contiennent le module 2. `core.js` gère la notation et la sauvegarde, `app.js` l’interface et `styles.css` les styles. Les tests vérifient notamment les formules et charges, l’équilibre des tests, les deux sauvegardes séparées, la conservation des atomes et charges, et les deux rôles de l’ion hydrogénocarbonate.

Les contenus sont des explications et exercices originaux, préparés pour le périmètre du premier module de la séquence 1. Aucune reproduction des PDF CNED n’est publiée. L’application n’est pas un produit officiel du CNED.
