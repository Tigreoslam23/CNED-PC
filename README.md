# Déclic — Les couples acide-base

Une application en français pour comprendre les couples acide-base en terminale spécialité physique-chimie.

## Utiliser l’application dans Chrome

Télécharger **Declic-acide-base.html**, puis ouvrir ce fichier avec Google Chrome. Cette version autonome contient toute l’application et fonctionne sans connexion, sans installation et sans clé d’API.

Depuis GitHub, ouvrir le fichier puis choisir **Download raw file** (Télécharger le fichier brut), en haut à droite. Un double-clic sur le fichier téléchargé l’ouvre dans le navigateur par défaut ; utiliser « Ouvrir avec > Google Chrome » si nécessaire.

## Le parcours

- **Apprendre** : quatre étapes (céder/capter H⁺, espèces conjuguées, ordre du couple, conservation des charges), exemples et questions guidées.
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

Les fichiers `content.js` (leçons, questions et explications), `core.js` (notation et sauvegarde), `app.js` (interface) et `styles.css` constituent les sources. Les tests couvrent la notation des formules et des charges, la répartition des tests, les résultats avec aide et la reprise des données sauvegardées.

Les contenus sont des explications et exercices originaux, préparés pour le périmètre du premier module de la séquence 1. Aucune reproduction des PDF CNED n’est publiée. L’application n’est pas un produit officiel du CNED.
