# Guide de Contribution (CONTRIBUTING)

Bienvenue sur le projet **Code Quality & Testing Evaluation**. Ce document définit les standards de développement, la stratégie Git et les conventions de commit obligatoires pour assurer la qualité et la cohérence de la base de code.

---

## 1. Stratégie de Branches

La branche principale `main` est **protégée** : aucun push direct n'est autorisé. Tout changement doit faire l'objet d'une Pull Request (PR) validée.

### Nomenclature des branches

* **Nouvelle fonctionnalité / outil** : `feature/<nom-de-la-fonctionnalite>`
  * *Exemples* :
    * `feature/eslint-prettier-setup`
    * `feature/testing-setup`
    * `feature/git-hooks`
    * `feature/lighthouse-ci`
    * `feature/product-search`
* **Correction de bug** : `fix/<description-courte-du-bug>`
  * *Exemples* :
    * `fix/backend-cors-headers`
    * `fix/frontend-login-redirect`
* **Documentation** : `docs/<sujet>` (ou via `feature/` / `chore/` selon le contexte)

### Règle d'or
Chaque fonctionnalité ou correction doit avoir sa propre branche dédiée, créée à partir de `main` à jour :
```bash
git checkout main
git pull origin main
git checkout -b feature/nom-de-ma-branche
```

---

## 2. Convention de Commits (Conventional Commits)

Les messages de commit doivent impérativement respecter la spécification [Conventional Commits](https://www.conventionalcommits.org/fr/v1.0.0/).

### Format d'un message
```
<type>[scope optionnel]: <description>

[corps optionnel]

[footer(s) optionnel(s)]
```

### Types autorisés

| Type | Rôle | Exemple |
| :--- | :--- | :--- |
| `feat` | Ajout d'une nouvelle fonctionnalité | `feat(frontend): add user login form` |
| `fix` | Correction d'un bug | `fix(backend): fix authentication token expiry check` |
| `chore` | Maintenance des outils, configuration du build, dépendances | `chore: configure root npm scripts` |
| `docs` | Modifications de la documentation uniquement | `docs: add CONTRIBUTING guide and PR template` |
| `style` | Formatage, espaces, points-virgules (sans impact sur la logique) | `style: apply prettier formatting to backend src` |
| `refactor` | Modification du code qui ne corrige ni bug ni n'ajoute de fonction | `refactor(backend): extract product validator middleware` |
| `perf` | Amélioration des performances | `perf(frontend): optimize image loading on catalog` |
| `test` | Ajout ou correction de tests unitaires/intégration | `test(frontend): add unit tests for Navbar component` |
| `ci` | Fichiers et scripts d'intégration continue (GitHub Actions, etc.) | `ci: add test and lint workflow on pull request` |

### Scopes recommandés
* `frontend` : modifications spécifiques au package frontend
* `backend` : modifications spécifiques au package backend
* Aucun scope ou scope global (ex: `root`, `deps`) pour les changements transversaux

### Bonnes pratiques de rédaction
1. Utiliser **l'impératif présent** en anglais (ou en français, de manière cohérente) : `add`, `fix`, `update`, `configure`.
2. Pas de majuscule au début de la description après le type/scope.
3. Pas de point final à la fin de la première ligne.
4. Lier l'issue concernée dans le footer si applicable : `Closes #12` ou `Fixes #8`.

---

## 3. Processus de Pull Request (PR)

1. **Pousser votre branche sur le dépôt distant** :
   ```bash
   git push -u origin feature/nom-de-ma-branche
   ```
2. **Ouvrir une Pull Request vers `main`** sur GitHub.
3. **Remplir le template de PR** :
   * Indiquer la nature du changement.
   * Référencer l'issue associée (ex: `Closes #2`).
   * Cocher la checklist de validation (lint, format, tests).
4. **Revue de code** :
   * Chaque PR requiert au moins **une approbation (approval)** d'un membre de l'équipe avant d'être fusionnée.
   * Les discussions et commentaires doivent être résolus avant le merge.

---

## 4. Scripts et Validation Locale

Avant de soumettre une PR ou de commiter, assurez-vous que les commandes suivantes passent sans erreur :

```bash
# Vérifier le formatage du code
npm run format:check

# Appliquer le formatage automatique
npm run format

# Vérifier la qualité du code (linter)
npm run lint

# Lancer la suite de tests
npm run test

# Vérifier la compilation / build
npm run build
```
