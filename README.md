<samp>
<p align="center">
  <img src="public/img/icon_256_round.png" alt="Logo" width="196">
</p>

<h1 align="center">web</h1>

<!-- Badge -->
<p align="center">
<a href="https://github.com/nw-union/web/actions/workflows/push_main.yml"><img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/nw-union/web/push_main.yml?style=flat-square&logo=github&label=deploy"></a>
<a href="https://discord.com/channels/805068364476973076/1396169702866419906"><img alt="Discord" src="https://img.shields.io/discord/805068364476973076?style=flat-square"></a>
</p>

<!-- About this Project -->
<p align="center">
ウェブサイト。ドキュメント置き場
</p>
<br />

## 🌏 URL

| Name       | URL                    |
| :--------- | :--------------------- |
| Production | https://nw-union.net/  |
| Local      | http://localhost:4321/ |

<br/>

## 🔰 Getting Started

### Codespaces

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=nw-union/web)

### ローカルサーバー起動方法

0. 最新バージョンの [Bun](https://bun.com/) が動く環境であること
1. 依存パッケージ取得
```bash
bun install --frozen-lockfile
```
2. 開発サーバー起動
```
bun run dev
```
🏃 http://localhost:4321

<br/>

### ドキュメント追加方法

ドキュメントは、[src/pages/docs](./src/pages/docs/) にマークダウンで置かれています。ここにファイルを配置すると、ファイル名がパスとなり公開されます。

#### サンプルデモページ
- ファイル: [src/pages/docs/demo.md](./src/pages/docs/demo.md)
- 公開URL: [https://nw-union.net/docs/demo](https://nw-union.net/docs/demo)

<br/>

### その他

基本的に [astro](https://astro.build/) で作られたシンプルな SSG のサイトです。自由に書き換えてしまって構いません。ディレクトリ構成や開発のルールなどは [CLAUDE.md](./CLAUDE.md) を参照してください。

<br/>

## 🏗️ Build

```
bun run build
```

<br/>

## 🚀　Infrastructure

アプリケーションは、nw-union の Cloudflare Workers で動いています。

<img src="public/img/docs/cloudflareworkers.png" alt="cloudflareworkers" width="792">

main ブランチにマージされると、GitHub Actions により、デプロイされます。

<br/>
<br/>

--

Happy hacking 💛
</samp>
