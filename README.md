# Déclic — Le laboratoire des idées

Une application en français pour comprendre les réactions acide-base et les mesures de concentration en terminale spécialité physique-chimie. Le sélecteur « Ton module » permet de passer d’un module à l’autre.

## Les six modules

- **Module 1 — Couples acide-base** : notions des missions 1 et 2, avec une introduction au transfert entre partenaires et aux espèces amphotères. Son animation utilise H₃O⁺ + NH₃ → H₂O + NH₄⁺.
- **Module 2 — Réactions et espèces amphotères** : missions 3 « D’où viennent les bulles ? » et 4 « Une espèce, deux rôles possibles ». Quatre étapes : identifier les partenaires, assembler le bilan, expliquer les bulles et reconnaître les espèces amphotères. L’animation suit CH₃COOH + HCO₃⁻, la formation de H₂CO₃ puis sa transformation en H₂O et CO₂. Deux outils permettent de simplifier H⁺ dans les demi-équations et de changer le partenaire de HCO₃⁻.

**Module 3 — Lewis et capture de H⁺** : missions 5 et 6. Quatre étapes : lire les doublets, vérifier duet et octet, suivre la paire de NH₃ lors de la capture ou de la cession de H⁺, puis reconnaître les amines et les acides carboxyliques. Le laboratoire permet de choisir H₂O, NH₃ ou CH₄, de changer la notation des paires et d’observer les transformations des groupes R–NH₂ et R–COOH.

**Module 4 — pH et concentration** : missions 7 et 8. Quatre étapes : classer une solution à 25 °C, comparer les concentrations par facteurs 10, calculer [H₃O⁺] à partir du pH et retrouver le pH avec le logarithme décimal. Trois outils interactifs : échelle de pH de 2 à 12, comparaison de deux volumes et dilution d’un acide fort, calculateur guidé dans les deux sens. Les schémas ne montrent que H₃O⁺ et ne reproduisent pas la couleur réelle des solutions. Le domaine d’utilisation des relations est précisé.

**Module 5 — Lumière et étalonnage** : missions 9 et 10. Quatre leçons : transmittance et absorbance, loi de Beer-Lambert, lecture d’une droite et correction de dilution. Le laboratoire montre un faisceau monochromatique animé, une cuve dont la longueur et la concentration varient, une lecture horizontale puis verticale de la droite, et un atelier pipette/fiole. Le modèle fictif utilise ε = 200 L·mol⁻¹·cm⁻¹ ; pour ℓ = 1 cm, A = 0,20 C avec C en mmol·L⁻¹. La gamme va de A = 0 à 0,60 ; les mesures hors gamme sont refusées dans l’atelier. La quantité de colorant du prélèvement est conservée lors de la dilution.

**Module 6 — Ions et conductivité** : missions 11 et 12. Quatre leçons sur les porteurs du courant, la loi de Kohlrausch, les conversions et le dosage par étalonnage. Une animation sous tension alternative distingue les ions dans la solution des électrons dans les fils. Changer la constante de cellule fait varier G sans modifier σ. Un atelier additionne les contributions de Na⁺ et Cl⁻ et propose un convertisseur d’unités. La droite σ = 12,6 C (mS·m⁻¹ et mmol·L⁻¹) donne Cmesurée = 1,5 pour σ = 18,9 ; une dilution par 5 donne Cinitiale = 7,5 mmol·L⁻¹. Le modèle néglige le fond de conductivité de l’eau et reste limité à la gamme de NaCl dilué, à température fixée.

Chaque module possède sa propre banque de 24 questions, un entraînement et un test de huit questions. Les étapes validées, les réponses et les tests en cours sont enregistrés séparément. Le module 1 conserve sa clé de sauvegarde d’origine ; ajouter les modules suivants n’efface pas les acquis précédents. Le bouton d’effacement concerne uniquement le module sélectionné. Le dernier module utilisé est mémorisé.

## Utiliser l’application dans Chrome

Télécharger **Declic-acide-base.html**, puis ouvrir ce fichier avec Google Chrome. Cette version autonome contient toute l’application et fonctionne sans connexion, sans installation et sans clé d’API.

Depuis GitHub, ouvrir le fichier puis choisir **Download raw file** (Télécharger le fichier brut), en haut à droite. Un double-clic sur le fichier téléchargé l’ouvre dans le navigateur par défaut ; utiliser « Ouvrir avec > Google Chrome » si nécessaire.

## Installer sur PC ou tablette, puis utiliser hors connexion

Ouvrir la **version en ligne HTTPS** de Déclic, puis utiliser **Installer l’application**, bien visible en haut à droite. Ce bouton ouvre directement la confirmation du navigateur lorsqu’elle est disponible (la proposition est mémorisée dès le chargement de la page) et fournit un guide pour Chrome/Edge sur PC, Chrome sur Android et Safari sur iPad. Il ne lance pas l’installation sans confirmation du navigateur. Sans proposition automatique, le guide détaille Chrome : ⋮ > Caster, enregistrer et partager > Installer la page en tant qu’appli. Pour une icône sur le bureau après installation : ouvrir chrome://apps, clic droit sur Déclic > Créer un raccourci > Bureau. La disponibilité hors connexion et l’installation sont affichées séparément ; seul un événement d’installation confirmée ou le lancement autonome confirme que l’app est installée.

La première ouverture en ligne enregistre les six modules, leurs animations et leurs exercices. Dans la fenêtre d’installation, attendre **« Les 6 modules sont prêts hors connexion »** avant de couper Internet. Une icône permet ensuite d’ouvrir l’application. Le téléchargement n’est déclaré prêt qu’après l’activation du cache complet. Une mise à jour prête est proposée dans cette même fenêtre ; elle conserve les clés de progression.

Le fichier HTML autonome reste utilisable hors connexion. Son bouton explique comment accéder à la version en ligne pour l’installation ; un fichier ouvert avec `file:` ne peut pas être installé comme application web.

La progression reste locale : **pas de synchronisation automatique entre appareils**. Utiliser la même adresse du site dans le même navigateur permet de retrouver ses résultats, y compris dans l’application installée si le navigateur partage son stockage. Passer du fichier local au site HTTPS ne transfère pas les anciens résultats. Effacer les données du site supprime aussi le cache et la progression ; le navigateur peut également évincer le stockage.

## Le parcours

- **Apprendre** : quatre étapes adaptées au module sélectionné, avec règles, exemples et questions guidées.
- **Observer une réaction** (dans Apprendre) : modèles animés en boules et liaisons, propres à chaque module. Lecture, pause, retour au début et progression manuelle en quatre étapes ; le transfert, les produits et la conservation des atomes et de la charge sont expliqués. Les modèles fonctionnent aussi sans connexion dans le fichier autonome. Ils sont schématiques et ne représentent pas une trajectoire moléculaire réelle. Avec la préférence système « réduire les animations », les étapes restent disponibles sans mouvement.
- **S’entraîner** : huit questions tirées d’une banque de 24 questions, deux indices progressifs et une correction expliquée. Les formules et les valeurs numériques peuvent être saisies au clavier. Pour le module 4, la calculatrice est autorisée ; saisir la valeur sans unité (déjà indiquée), avec virgule, point, notation e ou ×10^. Les arrondis usuels sont acceptés, sans accepter un mauvais signe d’exposant ou un facteur 10 erroné.
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

Ouvrir `http://127.0.0.1:4173`. La commande de compilation régénère le fichier HTML autonome et le service de cache hors connexion `sw.js`. Après toute modification du code ou des contenus, régénérer ce fichier avant de l’enregistrer dans GitHub.

Les fichiers `content.js` et `reaction.js` contiennent le module 1 ; `module-two-content.js` et `module-two-reaction.js` contiennent le module 2 ; `module-three-content.js` et `module-three-models.js` contiennent le module 3 ; `module-four-content.js` et `module-four-lab.js` contiennent le module 4 ; `module-five-content.js` et `module-five-lab.js` contiennent le module 5. `module-six-content.js` et `module-six-lab.js` contiennent le module 6. `install.js` et `manifest.webmanifest` gèrent l’installation. `core.js` gère la notation et la sauvegarde, `app.js` l’interface et `styles.css` les styles. Les tests vérifient notamment les formules et charges, l’équilibre des tests, les six sauvegardes séparées, la conservation des atomes et charges, les deux rôles de l’ion hydrogénocarbonate, les paires de Lewis, les charges la notation numérique, les rapports de concentrations, Beer-Lambert, les coordonnées de la droite, la conservation du soluté lors de la dilution, la conservation des sauvegardes et la préparation hors connexion.

Les contenus sont des explications et exercices originaux, préparés pour le périmètre du premier module de la séquence 1. Aucune reproduction des PDF CNED n’est publiée. L’application n’est pas un produit officiel du CNED.
