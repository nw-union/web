# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Router v7 application deployed on Cloudflare Workers, with Drizzle ORM managing a Cloudflare D1 (SQLite) database. The application is a comprehensive platform for nw-union.net featuring:

- **Document Management**: Create, edit, and publish documentation with TipTap rich text editor
- **Video Gallery**: Browse and showcase YouTube videos
- **User Management**: User profiles and authentication via Cloudflare Access
- **File Storage**: Image and file uploads using Cloudflare R2 Object Storage
- **External Links**: Quick access to Discord, YouTube, GitHub, and shop

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

**Domain Layer** (`domain/`): Most domains (Doc, User, Video) follow a consistent structure:
- **type.ts**: Core business types and value objects
- **port.ts**: Port interfaces defining contracts for external adapters
- **logic.ts**: Pure business logic functions
- **workflow.ts**: Orchestrates business operations using ports and logic

Note: The System domain only contains workflow.ts as it primarily orchestrates storage operations without complex business logic.

**Adapter Layer** (`adapter/`): External integrations implementing port interfaces:
- **drizzle/**: Database adapters (doc.ts, user.ts, video.ts) implementing repository ports
- **r2/**: Cloudflare R2 Object Storage adapter for file operations
- **time/**: Time provider adapter for consistent timestamp handling

**Dependency Injection** (`load-context.ts`): Wires up adapters based on environment configuration and injects workflows into routes

### Dependency Injection Pattern

Dependencies are injected through React Router's `AppLoadContext` (configured in `load-context.ts`):

- **Logger**: Adapts to `console` (local) or `json` (production) based on `LOG_ADAPTER` env var
- **Auth**: Uses `mock` (local) or `cloudflare` (production) based on `AUTH_ADAPTER` env var
- **Workflows**: Domain workflows (doc, video, user, sys) initialized with appropriate adapters

Access injected dependencies in route loaders/actions via `context` parameter:
```typescript
export async function loader({ context }: Route.LoaderArgs) {
  const { log, auth, wf } = context;

  // Access domain workflows
  const result = await wf.doc.getDoc(slug);
  const videos = await wf.video.listVideos();
  const user = await wf.user.getUser(userId);

  // Use storage workflow for file operations
  const uploadUrl = await wf.sys.generateUploadUrl(filename);
}
```

### Database Layer

Database access follows this pattern:

1. **Schema Definition** (`adapter/drizzle/schema.ts`): Drizzle table definitions with SQLite-specific types for all domains (docs, users, videos)
2. **DTO Converters** (e.g., `adapter/drizzle/doc.ts`):
   - `convTo*InsertModel`: Domain → DTO (for writes)
   - `validate*`: DTO → Domain (for reads)
3. **Adapter Functions**: Pure functions that perform database operations, returning `ResultAsync<T, AppError>`
4. **Port Implementation**: Factory functions (e.g., `newDocRepository`, `newUserRepository`) return objects implementing repository ports

**Important**: Drizzle requires the schema file to be named `schema.ts` for code generation to work correctly.

### Storage Layer

File storage uses Cloudflare R2 Object Storage:

1. **R2 Adapter** (`adapter/r2/putBucket.ts`): Implements file upload operations
2. **Storage Workflow** (`domain/System/workflow.ts`): Orchestrates storage operations through the R2 adapter
3. **Access Pattern**: Use `wf.sys` workflows in routes for file operations

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

- **Main Config** (`wrangler.jsonc`): Defines Workers configuration, D1 bindings, R2 bindings, and environment variables
- **Environments**: Production environment with separate D1 database and R2 bucket (local development uses local bindings)
- **Build Output**: React Router builds to `build/` directory, with server bundle at `build/server/index.js`
- **Bindings**:
  - **D1**: SQLite database for structured data (docs, users, videos)
  - **R2**: Object storage for file uploads (images, documents)

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
- `STORAGE_DOMAIN`: "local" (for both development and production R2 storage)

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
- **Local Development**: http://localhost:5173/ (React Router dev server) or http://localhost:8787/ (Wrangler dev server)
