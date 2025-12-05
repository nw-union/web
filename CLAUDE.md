# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Router v7 application deployed on Cloudflare Workers, with Drizzle ORM managing a Cloudflare D1 (SQLite) database. The application is a documentation platform for nw-union.net.

## Development Commands

### Setup & Development
```bash
# Install dependencies
bun install --frozen-lockfile

# Start development server (React Router dev server with HMR)
bun run dev
# Opens at http://localhost:5173

# Start Wrangler dev server (Cloudflare Workers local environment)
bun run start
# Opens at http://localhost:8787
```

### Code Quality
```bash
# Format code with Biome
bun run fmt

# Lint code with Biome
bun run lint

# Type check with TypeScript
bun run typecheck

# Run all checks (format, lint, typecheck)
bun run check
```

### Build & Deploy
```bash
# Build for production
bun run build

# Deploy to development environment
bun run deploy:development

# Deploy to production environment
bun run deploy:production
```

### Database Operations
```bash
# Generate migration files from schema changes
bun run db:generate

# Apply migrations to local D1 database
bun run db:migrate:local

# Apply migrations to development environment
bun run db:migrate:development

# Apply migrations to production environment
bun run db:migrate:production

# Load sample data to local database
bun run db:sampledata:local

# Generate TypeScript types for Wrangler bindings
bun run typegen
```

## Architecture

### Hexagonal Architecture (Ports & Adapters)

The codebase follows hexagonal architecture principles with clear separation between domain, ports, and adapters:

- **Domain Types** (`type.ts`): Core business types (Doc, DocInfo, DocStatus) and port interfaces (DocRepositoryPort)
- **Adapters** (`adapter/drizzle/`): External integrations, specifically Drizzle ORM adapter implementing DocRepositoryPort
- **Load Context** (`load-context.ts`): Dependency injection container that wires up adapters based on environment configuration

### Dependency Injection Pattern

Dependencies are injected through React Router's `AppLoadContext` (configured in `load-context.ts`):

- **Logger**: Adapts to `console` (local) or `json` (production) based on `LOG_ADAPTER` env var
- **Auth**: Uses `mock` (local) or `cloudflare` (production) based on `AUTH_ADAPTER` env var
- **Repository**: Initialized with D1 database binding and logger

Access injected dependencies in route loaders/actions via `context` parameter:
```typescript
export async function loader({ context }: Route.LoaderArgs) {
  const { log, auth, repo } = context;
  // Use injected dependencies
}
```

### Database Layer

Database access follows this pattern:

1. **Schema Definition** (`adapter/drizzle/schema.ts`): Drizzle table definitions with SQLite-specific types
2. **DTO Converters** (`adapter/drizzle/doc.ts`):
   - `convToDocInsertModel`: Domain → DTO (for writes)
   - `validateDoc`: DTO → Domain (for reads)
3. **Adapter Functions**: Pure functions that perform database operations, returning `ResultAsync<T, AppError>`
4. **Port Implementation**: `newDocRepository` function returns object implementing `DocRepositoryPort`

**Important**: Drizzle requires the schema file to be named `schema.ts` for code generation to work correctly.

### Error Handling

The codebase uses `neverthrow` for functional error handling:

- All repository methods return `ResultAsync<T, AppError>` from neverthrow
- Use `.andThen()` for chaining operations that can fail
- Use `.map()` for transformations that cannot fail
- Errors are typed as `AppError` (from `@nw-union/nw-utils`)

### React Router Structure

- **Routes Configuration** (`app/routes.ts`): Centralized route definitions using React Router v7's file-based routing
- **Entry Points**:
  - `app/entry.server.tsx`: Server-side rendering entry
  - `workers/app.ts`: Cloudflare Workers entry point that creates request handler with load context
- **Root Layout** (`app/root.tsx`): Shared layout with meta tags, links, and error boundary

### Cloudflare Workers Configuration

- **Main Config** (`wrangler.jsonc`): Defines Workers configuration, D1 bindings, and environment variables
- **Environments**: Development and production environments with separate D1 databases
- **Build Output**: React Router builds to `build/` directory, with server bundle at `build/server/index.js`

## Key Technologies

- **Runtime**: Bun (package manager and development runtime)
- **Framework**: React Router v7 with SSR enabled
- **Deployment**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Styling**: Tailwind CSS v4 (via Vite plugin)
- **Code Quality**: Biome (formatting & linting)
- **TypeScript**: Strict mode enabled with verbatim module syntax
- **Rich Text**: TipTap editor for document editing
- **Utilities**:
  - `neverthrow` for Result types and error handling
  - `ts-pattern` for exhaustive pattern matching
  - `zod` for runtime validation
  - `@nw-union/nw-utils` for shared utilities (logging, auth, UUID)

## Environment Variables

Configured in `wrangler.jsonc` and accessed via `context.cloudflare.env`:

- `LOG_ADAPTER`: "console" (local) or "json" (production)
- `LOG_LEVEL`: "debug" (local) or "info" (production)
- `AUTH_ADAPTER`: "mock" (local) or "cloudflare" (production)
- `AUTH_TEAM_DOMAIN`: Cloudflare Access team domain for authentication

## Testing

- Test files use `.test.ts` extension
- Drizzle adapter has tests at `adapter/drizzle/doc.test.ts` (currently empty)

## Type Safety

- **Strict TypeScript**: All compiler strict flags enabled
- **Type Generation**: Run `bun run typegen` to generate Wrangler types after modifying `wrangler.jsonc`
- **Exhaustive Matching**: Use `ts-pattern` with `.exhaustive()` to ensure all cases are handled
- **Route Types**: React Router generates types in `.react-router/types/` directory

## Production URLs

- **Production**: https://nw-union.net/
- **Local Development**: http://localhost:4321/ (documented) or http://localhost:5173/ (actual dev server) or http://localhost:8787/ (Wrangler)
