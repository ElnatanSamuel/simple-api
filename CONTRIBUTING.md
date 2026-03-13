# Contributing to simple-api

Thank you for your interest in improving simple-api. All contributions are welcome — whether that is a bug report, a documentation fix, a new feature proposal, or a code change.

Please read this guide fully before submitting anything. It will save both you and the maintainers time.

- **GitHub**: [github.com/elnatansamuel/simple-api](https://github.com/elnatansamuel/simple-api)
- **Email**: [elnatansamuel25@gmail.com](mailto:elnatansamuel25@gmail.com)

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [Development Workflow](#development-workflow)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Reporting Bugs](#reporting-bugs)
8. [Proposing Features](#proposing-features)

---

## Code of Conduct

This project follows a simple principle: treat everyone with respect. Be constructive in your feedback. If you encounter behavior that violates this expectation, contact [elnatansamuel25@gmail.com](mailto:elnatansamuel25@gmail.com).

---

## Project Structure

This is a npm monorepo. All installable packages live in `packages/`. The `apps/` directory contains a reference application demonstrating real-world usage.

```
simple-api/
  packages/
    core/                @simple-api/core — the engine, all types, all middleware
    react/               @simple-api/react — TanStack Query adapter for React
    svelte/              @simple-api/svelte — TanStack Query adapter for Svelte
    zustand/             @simple-api/zustand — Zustand store sync middleware
    react-native/        @simple-api/react-native — mobile adapter
  docs/                  Markdown documentation files
  scripts/
    docs-formatter.ts    Docs formatting and sidebar generation tool
```

The most important package is `@simple-api/core`. Changes to the type system, middleware pipeline, or engine behavior all live there.

---

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher

### Clone and Install

```bash
git clone https://github.com/elnatansamuel/simple-api.git
cd simple-api
npm install
```

This installs all dependencies for every package in the monorepo via npm workspaces.

### Build

```bash
npm run build
```

This runs `tsup` for every package in topological order.

### Run Tests

```bash
npm test
```

All tests are written with Vitest. Unit tests for the core engine are located in `packages/core/src/*.test.ts`.

---

## Development Workflow

1. **Fork the repository** and clone your fork locally.
2. **Create a branch** from `main` with a descriptive name.

```bash
git checkout -b feat/service-level-timeout
git checkout -b fix/deduplication-key-collision
git checkout -b docs/retry-middleware-examples
```

3. **Make your changes.** See the sections below for specific guidance.
4. **Write or update tests.** Every behavioral change in `packages/core` must be covered by a unit test.
5. **Run the full test suite** and ensure everything passes before pushing.
6. **Open a pull request** against the `main` branch.

### Making Changes to the Core Engine

The core engine is located in `packages/core/src/index.ts`. Changes here affect every downstream adapter and middleware.

- Do not change the public API surface (`createApi`, `ApiError`, `Middleware`, `RequestOptions`) without a corresponding discussion in an issue first.
- All new middleware should be created as standalone files (like `retry.ts`, `logger.ts`) and re-exported from `index.ts`.
- Every new middleware must include documentation in `docs/middleware-library/`.

### Making Changes to Adapters

Adapters are thin wrappers. The goal is to keep them as small as possible. An adapter's only job is to translate the engine's promise-based API into the reactive primitives of its target framework.

### Updating Documentation

Documentation lives in `docs/`. After adding or editing any `.md` file, run the formatter to ensure consistent formatting and regenerate the sidebar:

```bash
npx tsx scripts/docs-formatter.ts
```

The formatter strips emojis, enforces spacing rules, and writes `docs/sidebar.json`. Commit the updated `sidebar.json` alongside your doc changes.

---

## Commit Guidelines

This project uses a simplified form of Conventional Commits.

```
<type>: <short description in lowercase>
```

Types:

- `feat` — A new feature or capability.
- `fix` — A bug fix.
- `docs` — Documentation changes only.
- `test` — Adding or updating tests, no production code change.
- `refactor` — A code change that neither adds a feature nor fixes a bug.
- `chore` — Maintenance tasks (dependency updates, build config, etc.).

Examples:

```
feat: add service-level middleware support
fix: correct deduplication key for requests with no body
docs: add retry middleware configuration examples
test: add ApiError coverage for 5xx responses
```

Keep the description under 72 characters. Do not end it with a period.

---

## Pull Request Process

1. The pull request description must explain what the change does and why.
2. Link to any related issues using `Closes #123` or `Related to #456`.
3. All CI checks must pass before a review will be given.
4. Do not merge your own pull requests. Wait for maintainer review.
5. If your PR sits without review for more than a week, feel free to ping via email.

### What will not be merged

- Changes that remove test coverage.
- New features without documentation.
- Breaking changes to the public API without prior discussion.
- Code without proper TypeScript types (use of `any` must be justified).

---

## Reporting Bugs

Open an issue on GitHub. Include the following:

1. The exact version of `@simple-api/core` (and any other relevant packages).
2. A minimal, reproducible code example.
3. What you expected to happen.
4. What actually happened (include the full error message and stack trace if applicable).
5. Your environment: Node.js version, browser, or React Native version.

---

## Proposing Features

Open an issue labeled `[Feature Request]` before writing any code. Describe:

1. The problem you are trying to solve.
2. Your proposed solution.
3. Any alternatives you have considered.

This prevents wasted effort on features that do not align with the project's direction.

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License that covers this project. See [LICENSE](./LICENSE) for details.
