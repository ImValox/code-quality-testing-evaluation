# Code Quality & Testing Evaluation Project

## Context

You are working for a company that has recently acquired a small e-commerce project. The codebase is functional but lacks proper code quality standards, testing, and modern development practices. Your task is to improve the codebase by implementing various tools and best practices.

## Qualité de code (Outils & Configuration)

Le projet intègre un ensemble d'outils garantissant une qualité de code irréprochable, une lisibilité uniforme et l'absence de conflits entre formateur et linter.

### 1. Prettier (Formatage de code)

Prettier est configuré à la racine via le fichier `.prettierrc` avec les règles suivantes :

- **Guillemets simples** : `'singleQuote': true`
- **Pas de virgules finales** : `'trailingComma': 'none'`
- **Indentation** : 2 espaces (`'tabWidth': 2`, `'useTabs': false`)
- **Longueur maximale des lignes** : 120 caractères (`'printWidth': 120`)

Le fichier `.prettierignore` exclut automatiquement les dossiers générés et volumineux (`node_modules`, `build`, `coverage`, `.git`).

### 2. ESLint (Analyse statique)

Le projet utilise le nouveau format **ESLint Flat Config** (`eslint.config.js`) adapté aux spécificités de chaque workspace :

#### Frontend (`packages/frontend/eslint.config.js`)

- **`@eslint/js`** : Règles de base recommandées JavaScript.
- **`eslint-plugin-react`** : Détection des erreurs spécifiques aux composants et JSX React.
- **`eslint-plugin-react-hooks`** : Respect strict du cycle de vie des Hooks React (`rules-of-hooks`, `exhaustive-deps`).
- **`eslint-plugin-jsx-a11y`** : Vérification des standards d'accessibilité web (ARIA, attributs `alt`, contrastes).
- **`eslint-plugin-perfectionist`** : Tri naturel et cohérent des imports, objets et props JSX pour éviter les diffs inutiles en revue de code.
- **`eslint-plugin-tailwindcss`** : Tri et validation des classes utilitaires Tailwind CSS (`tailwindcss/classnames-order`).

#### Backend (`packages/backend/eslint.config.js`)

- **`@eslint/js`** : Règles JavaScript recommandées.
- **`eslint-plugin-n`** : Règles idiomatiques pour environnements Node.js (gestion des modules, imports et conventions Node).
- **`eslint-plugin-unicorn`** : Bonnes pratiques modernes en JavaScript (règles adaptées pour CommonJS / Express).
- **`eslint-plugin-perfectionist`** : Tri et organisation propre des objets et dépendances.

### 3. Cohabitation ESLint + Prettier

Pour éliminer tout conflit entre ESLint et Prettier :

- Le package **`eslint-config-prettier`** est inclus en **dernière position** dans les configurations ESLint frontend et backend.
- Il désactive automatiquement toutes les règles ESLint purement cosmétiques qui pourraient entrer en conflit avec Prettier.
- La séparation des responsabilités est totale : **Prettier formate**, **ESLint vérifie la logique et la qualité**.

### 4. Commandes npm

| Commande               | Description                                                |
| :--------------------- | :--------------------------------------------------------- |
| `npm run lint`         | Lance ESLint sur tous les workspaces                       |
| `npm run lint:fix`     | Corrige automatiquement les erreurs ESLint réparables      |
| `npm run format`       | Applique le formatage Prettier sur l'ensemble du dépôt     |
| `npm run format:check` | Vérifie que tous les fichiers respectent le style Prettier |

### 5. Configuration VS Code

Pour une expérience de développement fluide, le dossier `.vscode/` contient :

- **`.vscode/extensions.json`** : Suggestions d'extensions (ESLint, Prettier, Tailwind CSS IntelliSense).
- **`.vscode/settings.json`** : Formatage automatique à la sauvegarde (`editor.formatOnSave: true`), définition de Prettier en formateur par défaut, et correction automatique ESLint (`source.fixAll.eslint: explicit`).

## Stratégie de tests

Le projet met en œuvre une politique de tests rigoureuse, combinant tests unitaires, tests de composants et tests d'intégration d'API.

### 1. Exécution des tests

| Commande                                  | Description                                                               |
| :---------------------------------------- | :------------------------------------------------------------------------ |
| `npm test`                                | Exécute l'ensemble des suites de tests sur le frontend et le backend      |
| `npm run test:coverage`                   | Génère les rapports de couverture et vérifie le respect strict des seuils |
| `npm run test:watch --workspace=frontend` | Lance Jest en mode interactif sur le workspace frontend                   |

### 2. Organisation des dossiers

- **Frontend (`packages/frontend`)** :
  - Tests unitaires et de composants colocalisés dans `src/` avec l'extension `.test.jsx` (ex : `src/components/Navigation.test.jsx`, `src/pages/Login.test.jsx`).
  - Mocks d'API centralisés dans `src/test/mocks/` (`handlers.js`, `server.js`, `fixtures.js`).
  - Configuration globale de l'environnement de test dans `src/setupTests.js`.
- **Backend (`packages/backend`)** :
  - Tests API et d'intégration regroupés dans `packages/backend/tests/` (ex : `tests/health.test.js`).
  - Scripts d'initialisation et configuration de base de données de test dans `packages/backend/tests/setup/`.

### 3. Mocks & Isolation

- **Frontend** : Utilisation de **Mock Service Worker (MSW)** (`setupServer`) pour intercepter les requêtes HTTP d'Axios au niveau réseau. Cela permet de simuler fidèlement les réponses de l'API sans lancer le backend. Les fichiers statiques et images sont simulés par `fileMock.js` et les feuilles de style par `identity-obj-proxy`.
- **Backend** : Utilisation de `supertest` pour tester les endpoints Express directement. La base de données de test tourne sur SQLite avec réinitialisation et injection de données de test dédiées (`.env.test`).

### 4. Seuils de couverture globaux

Les seuils minimaux suivants sont obligatoires dans les configurations Jest de chaque workspace :

- **Statements** : 80%
- **Branches** : 60%
- **Functions** : 70%
- **Lines** : 80%

Les rapports de couverture sont exportés en formats `text` (terminal), `lcov` et `html` (accessible dans le dossier `coverage/lcov-report/index.html`).

### 5. Bonnes pratiques de test

- Privilégier le test du comportement utilisateur visible plutôt que les détails d'implémentation internes (`@testing-library/react`).
- Tester systématiquement les cas limites (champs vides, erreurs 400/401/404, gestion des exceptions).
- Garantir l'idempotence des tests en réinitialisant les mocks (`clearMocks: true`) et les handlers MSW après chaque test (`server.resetHandlers()`).

## Hooks Git (Husky, lint-staged & commitlint)

Des hooks Git automatisés sont installés avec **Husky** afin d'assurer l'intégrité du code avant chaque commit et chaque push.

### 1. Hook `pre-commit` (`npx lint-staged`)

Déclenché automatiquement avant la création de tout commit :

- Il analyse uniquement les fichiers indexés (`staged`).
- Pour les fichiers JavaScript/JSX (`*.{js,jsx,ts,tsx}`) :
  1. Lance `eslint --fix` pour corriger les erreurs de style ou de syntaxe.
  2. Lance `prettier --write` pour aligner le formatage.
  3. Exécute les tests Jest liés aux fichiers modifiés (`jest --bail --findRelatedTests --passWithNoTests`).
- Pour les fichiers de configuration, documentation ou styles (`*.{json,md,css}`) : applique `prettier --write`.
- **Blocage** : Si un linter échoue ou si un test lié au fichier est cassé, le commit est immédiatement refusé.

### 2. Hook `commit-msg` (`commitlint`)

Déclenché après la saisie du message de commit :

- Vérifie la conformité avec la spécification **Conventional Commits** via `@commitlint/config-conventional`.
- Format attendu : `<type>[scope optionnel]: <description>`.
- Exemples valides : `feat(auth): add login form`, `chore: update dependencies`.
- Exemple invalide : `update code` (rejeté avec explications détaillées).

### 3. Hook `pre-push` (`npm run test:coverage`)

Déclenché avant l'envoi de branches vers le dépôt distant (`git push`) :

- Exécute l'intégralité de la suite de tests et calcule la couverture globale.
- **Blocage** : Le push est annulé si un test échoue ou si l'un des seuils de couverture (80% statements, 60% branches, 70% functions, 80% lines) n'est pas atteint.

### 4. Contournement d'urgence (`--no-verify`)

En cas d'urgence opérationnelle absolue ou de commit partiel temporaire, il est techniquement possible de contourner les hooks :

```bash
git commit -m "chore: urgent fix" --no-verify
git push origin ma-branche --no-verify
```

> [!WARNING]
> L'utilisation de `--no-verify` doit rester exceptionnelle. La pipeline CI de GitHub Actions rejettera de toute façon toute Pull Request dont les tests, le lint ou la couverture échouent.

## Git Requirements (Mandatory)

> [!IMPORTANT]
> Pour plus de détails sur le workflow de développement, consultez le guide complet [CONTRIBUTING.md](CONTRIBUTING.md).

### 1. Branch Strategy

- Main branch is protected and cannot be pushed to directly
- Must create the following branches:
  - `feature/eslint-prettier-setup`
  - `feature/testing-setup`
  - `feature/git-hooks`
  - `feature/lighthouse-ci`
- Additional features should follow the pattern: `feature/feature-name`
- Bug fixes should use: `fix/issue-description`
- Each feature/fix must have its own branch

### 2. Commit Message Convention

Must follow the Conventional Commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `chore`: Changes to build process or auxiliary tools
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests
- `ci`: Changes to CI configuration files and scripts

Examples:

```
feat(frontend): add user authentication component
fix(backend): resolve CORS issue with products API
test(frontend): add unit tests for ProductList component
chore: update eslint configuration
```

## Main Requirements

### 1. Code Quality Tools Implementation

- [ ] Install and configure Prettier with the following requirements:
  - Single quotes
  - No trailing commas
  - 2 spaces indentation
  - 120 characters line length
- [ ] Install and configure ESLint:
  - Frontend:
    - Add `eslint-plugin-react` plugin for base React features
    - Add `eslint-plugin-react-hooks` plugin for React hooks best practices
    - Add `eslint-plugin-perfectionist` plugin for code sort
    - Add `eslint-plugin-jsx-a11y` plugin for accessibility
  - Backend:
    - Add `eslint-plugin-n` plugin
    - Add `eslint-plugin-unicorn` plugin
    - Add `eslint-plugin-perfectionist` rules for code sort

Remember to make Prettier and ESLint work together!

### 2. Git Hooks Setup

- [ ] Install and configure Husky
- [ ] Configure lint-staged
- [ ] Implement pre-commit hooks:
  - Run ESLint
  - Run Prettier
  - Run Jest tests related to changed files
- [ ] Implement pre-push hooks:
  - Run full test suite
  - Check test coverage thresholds

### 3. Testing Implementation

- [ ] Configure Jest for both packages
- [ ] Implement test coverage reporting with minimum thresholds:
  - Statements: 80%
  - Branches: 60%
  - Functions: 70%
  - Lines: 80%
- [ ] Frontend Tests:
  - Unit tests for all components
  - Integration tests for forms
  - Mock API calls
  - Test authentication flow
- [ ] Backend Tests:
  - Unit tests for controllers
  - Integration tests for API endpoints
  - Database operation tests
  - Authentication middleware tests

### 4. Performance Analysis

- [ ] Implement Google Lighthouse CI
- [ ] Create npm script for running Lighthouse
- [ ] Set minimum score thresholds:
  - Performance: 80
  - Accessibility: 100
  - Best Practices: 90
  - SEO: 80

## Bonus Points

### 1. Styling Enhancement

- [ ] Implement Tailwind CSS
- [ ] Add ESLint plugin for Tailwind
- [ ] Create a proper color scheme and design system
- [ ] Implement responsive design
- [ ] Add dark mode support

### 2. Code Quality Enhancements

- [ ] Implement TypeScript
- [ ] Add ESLint plugins for TypeScript
- [ ] Add proper error boundaries in React
- [ ] Implement proper state management (Redux Toolkit or Zustand)
- [ ] Add a proper logging system
- [ ] Implement proper environment variable handling

### 3. Additional Features

- [ ] Add product categories
- [ ] Implement product search
- [ ] Add product sorting and filtering
- [ ] Implement pagination
- [ ] Add user roles (admin/user)

## Project Setup

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm run test

# Run lint
npm run lint

# Run prettier
npm run format

# Build project
npm run build
```

## Notes

- Code must follow community standards
- All tools must be properly configured with appropriate documentation
- Extra attention will be paid to:
  - Code organization
  - Commit messages
  - Documentation quality
  - Test quality
  - Error handling
  - Security practices

## Resources

- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [Jest Documentation](https://jestjs.io/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
