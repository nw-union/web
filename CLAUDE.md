# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際の Claude Code (claude.ai/code) へのガイダンスを提供します。

## Communication Rules

- すべての応答は日本語で行うこと
- コードやコマンドは英語のままで構わないが、説明は日本語で行うこと

## Git Commit Rules

- すべてのコミットメッセージは日本語で記述すること
- コミットメッセージは Conventional Commits に従うこと
- コミットの前に、`bun run check` を実行すること

## Pull Request Rules

- [組織のテンプレート](https://raw.githubusercontent.com/nw-union/.github/refs/heads/main/.github/pull_request_template.md) に従うこと
- すべてのセクションを適切に記入すること

## Core Architecture

- **フレームワーク**: Astro（静的サイト生成）
- **スタイリング**: Tailwind CSS
- **パッケージマネージャー**: Bun
- **コード品質**: Biome（フォーマッターのみ、リンターは無効）
- **デプロイメント**: Cloudflare Workers

## Commands

- `bun install` - 依存パッケージをインストール（初回セットアップ時のみ必要）
- `bun run dev` - 開発サーバーをHMR付きで起動 (http://localhost:4321)
- `bun run build` - プロダクション用ビルド
- `bun run preview` - 本番ビルドのプレビュー（開発サーバーと同じ）
- `bun run check` - コードフォーマット・インポート整理
- `bun run deploy` - Cloudflare Workersへプロダクションデプロイ
- `bun run typegen` - Wrangler型定義生成

## Project Structure

- `src/layouts/` - Astroレイアウトコンポーネント（Layout.astro、Markdown.astro）
- `src/pages/` - ファイルベースルーティング、`docs/`サブディレクトリにドキュメントページ
- `src/styles/markdown.css` - カスタムMarkdownスタイリング
- `public/` - Cloudflare Workers設定と静的アセットを含む
- `build/` - ビルド出力ディレクトリ

