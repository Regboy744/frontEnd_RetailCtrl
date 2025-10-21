# AGENTS.md

## Build, Lint, Test, and Format Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build`
- **Type check:** `pnpm type-check`
- **Lint (auto-fix):** `pnpm lint`
- **Format:** `pnpm format`
- **Unit tests:** `pnpm test:unit`
  - **Single test:** `pnpm test:unit path/to/testfile` (e.g. `pnpm test:unit src/__tests__/App.spec.ts`)

## Code Style Guidelines

- **Formatting:** Use Prettier (`pnpm format`)
  - No semicolons (`semi: false`)
  - Single quotes (`singleQuote: true`)
  - Max line length: 80 (`printWidth: 80`)
- **Imports:** Use ES module syntax. Group by external, then internal.
- **Types:** Use TypeScript everywhere. Prefer explicit types for function params/returns.
- **Naming:** Use multi-word component names (except where disabled). Use camelCase for variables/functions, PascalCase for components.
- **Error Handling:** Use try/catch for async code. Handle errors gracefully, log or display user-friendly messages.
- **Linting:** ESLint with Vue, TypeScript, and Vitest plugins. Lint all `.ts`, `.tsx`, `.vue` files except in `dist`, `coverage`.
- **Vue:** Use Composition API. Organize code by feature (e.g. `src/pages`, `src/stores`).
- **Testing:** Use Vitest for unit tests. Place tests in `src/__tests__`.
- **General:** Keep code readable, maintainable, and consistent. Follow best practices for Vue, TypeScript, Pinia, and Tailwind.

## Supabase postegress Database on the cloud.

- This project has a MCP connected to the supabase.
- We create the migrations local and send to the supbase
- Follow the db best practices.

## Retail Ctrl

This is a Saas brand new, not in productions yet. It is a MVP - Minimum Value Products.

With this app, I aim get retailers, small to medium shops. Usually, the shops belongs to a company, so each company can have many stores.

Start features:

- Price check: Each store can use my app to check for the best price available among the registered suppliers.

- Ocr: This is for the invoices, where the users base on the role can get the structured data from 100s of invoices.

- The system will have a auth feature, also role managment.
