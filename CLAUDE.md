# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

これは Cloudflare Workers にデプロイされた React Router v7 アプリケーションで、Drizzle ORM が Cloudflare D1 (SQLite) データベースを管理しています。このアプリケーションは nw-union.net の包括的なプラットフォームであり、以下の機能を備えています:

- **ドキュメント管理**: TipTap リッチテキストエディタでドキュメントを作成、編集、公開
- **YouTube 管理**: YouTube 動画の追加、閲覧、管理
- **Note 管理**: note.com の記事を追加、閲覧、管理
- **記憶（Kioku）機能**: ドキュメント、YouTube 動画、Note 記事の閲覧履歴を記録
- **ユーザー管理**: Cloudflare Access によるユーザープロフィールと認証
- **ファイルストレージ**: Cloudflare R2 Object Storage（本番・開発環境）またはローカルストレージ（ローカル開発）を使用した画像とファイルのアップロード
- **外部リンク**: Discord、YouTube、GitHub、ショップへの素早いアクセス

## Development Tools

- **Runtime**: Bun (パッケージマネージャー兼開発ランタイム)
- **Framework**: SSR 対応の React Router v7
- **Deployment**: Cloudflare Workers
- **Database**: Drizzle ORM を使用した Cloudflare D1 (SQLite)
- **Styling**: Tailwind CSS v4 (Vite プラグイン経由)
- **Code Quality**: Biome (フォーマット & リント)
- **TypeScript**: verbatim モジュール構文で strict モードを有効化
- **Rich Text**: ドキュメント編集用の TipTap エディタ
- **Utilities**:
  - `neverthrow`: Result 型とエラーハンドリング
  - `ts-pattern`: 網羅的パターンマッチング
  - `zod`: ランタイムバリデーション
  - `@nw-union/nw-utils`: 共有ユーティリティ (logging, auth, UUID)

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

コードベースはヘキサゴナルアーキテクチャの原則に従い、ドメイン、ポート、アダプター間の明確な分離を実現しています:

**ドメイン層** (`domain/`): ほとんどのドメイン (Doc, User, Youtube, Note) は一貫した構造に従っています:
- **type.ts**: コアビジネス型と値オブジェクト
- **port.ts**: 外部アダプターとの契約を定義するポートインターフェース
- **logic.ts**: 純粋なビジネスロジック関数
- **workflow.ts**: ポートとロジックを使用してビジネス操作を調整

注: System ドメインは workflow.ts のみを含み、複雑なビジネスロジックを持たない主にストレージ操作を調整するためのものです。Kioku ドメインは記憶（閲覧履歴）機能を提供し、複数のリポジトリを組み合わせて使用します。

**アダプター層** (`adapter/`): ポートインターフェースを実装する外部統合:
- **repository/drizzle/**: リポジトリポートを実装するデータベースアダプター (doc.ts, user.ts, youtube.ts, note.ts)
- **storage/r2/**: Cloudflare R2 Object Storage アダプター（本番・開発環境）
- **storage/local/**: ローカルファイルストレージアダプター（ローカル開発環境）
- **youtube/**: YouTube API 統合（api: 実際の YouTube Data API v3、mock: モック実装）
- **note/**: note.com 統合（api: OGP API を使用して note.com から記事情報を取得）
- **time/**: 一貫したタイムスタンプ処理のための時刻プロバイダーアダプター

**依存性注入** (`load-context.ts`): 環境設定に基づいてアダプターを接続し、ワークフローをルートに注入します

### Dependency Injection Pattern

依存関係は React Router の `AppLoadContext` を通じて注入されます (`load-context.ts` で設定):

- **Logger**: `LOG_ADAPTER` 環境変数に基づいて `console` (ローカル) または `json` (本番・開発) に適応
- **Auth**: `AUTH_ADAPTER` 環境変数に基づいて `mock` (ローカル) または `cloudflare` (本番・開発) を使用
- **Storage**: `STORAGE_ADAPTER` 環境変数に基づいて `localstorage` (ローカル) または `r2` (本番・開発) を使用
- **Youtube**: `YOUTUBE_ADAPTER` 環境変数に基づいて `mock` (ローカル) または `api` (本番・開発) を使用
- **Note**: `NOTE_ADAPTER` で `api` を使用（すべての環境で OGP API 経由で note.com から情報を取得）
- **Workflows**: 適切なアダプターで初期化されたドメインワークフロー (doc, user, sys, kioku, youtube, note)

### Database Layer

データベースアクセスは以下のパターンに従います:

1. **Schema Definition** (`adapter/repository/drizzle/schema.ts`): すべてのドメイン (docs, users, youtube, note) に対する SQLite 固有の型を持つ Drizzle テーブル定義
2. **DTO Converters** (例: `adapter/repository/drizzle/doc.ts`):
   - `convTo*InsertModel`: Domain → DTO (書き込み用)
   - `validate*`: DTO → Domain (読み取り用)
3. **Adapter Functions**: データベース操作を実行する純粋関数で、`ResultAsync<T, AppError>` を返す
4. **Port Implementation**: ファクトリー関数 (例: `newDocRepository`, `newUserRepository`, `newYoutubeRepository`, `newNoteRepository`) はリポジトリポートを実装するオブジェクトを返す

**重要**: Drizzle はコード生成が正しく動作するために、スキーマファイルが `schema.ts` という名前である必要があります。

### Storage Layer

ファイルストレージは環境に応じて以下を使用します:

1. **Storage Adapters**:
   - **R2 Adapter** (`adapter/storage/r2/`): Cloudflare R2 Object Storage を使用（本番・開発環境）
   - **Local Adapter** (`adapter/storage/local/`): ローカルファイルシステムを使用（ローカル開発環境）
2. **Storage Workflow** (`domain/System/workflow.ts`): ストレージアダプターを通じてファイル操作を調整
3. **Access Pattern**: ファイル操作にはルート内で `wf.sys` ワークフローを使用

### Error Handling

コードベースは関数型エラーハンドリングに `neverthrow` を使用します:

- すべてのリポジトリメソッドは neverthrow の `ResultAsync<T, AppError>` を返す
- 失敗する可能性のある操作をチェーンするには `.andThen()` を使用
- 失敗しない変換には `.map()` を使用
- エラーは `AppError` として型付けされる (`@nw-union/nw-utils` から)

### React Router Structure

- **Routes Configuration** (`app/routes.ts`): React Router v7 のファイルベースルーティングを使用した集中型ルート定義
- **Entry Points**:
  - `app/entry.server.tsx`: サーバーサイドレンダリングのエントリーポイント
  - `workers/app.ts`: ロードコンテキストを使用してリクエストハンドラーを作成する Cloudflare Workers のエントリーポイント
- **Root Layout** (`app/root.tsx`): メタタグ、リンク、エラーバウンダリーを含む共有レイアウト

### Cloudflare Workers Configuration

- **Main Config** (`wrangler.jsonc`): Workers 設定、D1 バインディング、R2 バインディング、環境変数を定義
- **Environments**:
  - **local**: ローカル開発環境（ローカル D1、ローカル R2、モックアダプター）
  - **development**: 開発環境（リモート D1、リモート R2、実際の API）
  - **production**: 本番環境（リモート D1、リモート R2、実際の API）
- **Build Output**: React Router は `build/` ディレクトリにビルドし、サーバーバンドルは `build/server/index.js` に配置
- **Bindings**:
  - **D1**: 構造化データ (docs, users, youtube, note) 用の SQLite データベース
  - **R2**: ファイルアップロード (images, documents) 用のオブジェクトストレージ

## Environment Variables

`wrangler.jsonc` で設定され、`context.cloudflare.env` を介してアクセス:

### ログ設定
- `LOG_ADAPTER`: "console" (ローカル) または "json" (本番・開発)
- `LOG_LEVEL`: "debug" (ローカル) または "info" (本番・開発)

### 認証設定
- `AUTH_ADAPTER`: "mock" (ローカル) または "cloudflare" (本番・開発)
- `AUTH_TEAM_DOMAIN`: 認証用の Cloudflare Access チームドメイン

### ストレージ設定
- `STORAGE_ADAPTER`: "localstorage" (ローカル) または "r2" (本番・開発)
- `STORAGE_LOCAL_PATH`: ローカルストレージのパス（ローカル開発のみ）
- `STORAGE_DOMAIN`: ストレージのドメイン
  - ローカル: "/localstorage"
  - 開発: "https://pub-bf093e0a2f9a4a39ae6c52701afa6523.r2.dev"
  - 本番: "https://r2.nw-union.net"

### YouTube 設定
- `YOUTUBE_ADAPTER`: "mock" (ローカル) または "api" (本番・開発)
- `YOUTUBE_API_KEY`: YouTube Data API v3 のキー（Secret で設定、本番・開発のみ）

### Note 設定
- `NOTE_ADAPTER`: "api" (すべての環境)
  - OGP API (https://ogp.nw-union.net) を使用して note.com から記事情報を取得

## Type Safety

- **Strict TypeScript**: すべてのコンパイラ strict フラグを有効化
- **Type Generation**: `wrangler.jsonc` を変更した後、`bun run typegen` を実行して Wrangler の型を生成
- **Exhaustive Matching**: すべてのケースが処理されることを保証するために `ts-pattern` の `.exhaustive()` を使用
- **Route Types**: React Router は `.react-router/types/` ディレクトリに型を生成
