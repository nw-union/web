---
layout: "../../layouts/Markdown.astro"
title: "GitHub レポジトリから Discord への通知設定方法"
pubDate: 2025-08-03
---

# GitHub レポジトリから Discord への通知設定方法

## TL;DR

Discord の github チャンネルの [Webhook URL](https://discord.com/channels/805068364476973076/1396169702866419906/1401551158459498537) を通知したいレポジトリの webhooks に登録する

## やり方

1. Discord チャンネルに書かれている [Webhook URL](https://discord.com/channels/805068364476973076/1396169702866419906/1401551158459498537) をコピーする
2. 通知したいレポジトリの Settings > Webhooks にアクセスする
3. Add Webhook ボタンを押す
4. 下記で登録
   - Payload URL: 1でコピーしたURL
   - Content type: `application/json`
   - Secret: 空のまま
   - SSL verification: `Enable SSL verification`
   - Which events would you like to trigger this webhook?: `Let me select individual events.`
     - `Issue comments`
     - `Issues`
     - `Pull request reviews`
     - `Pull requests`
   - Active

## スクリーンショット

![GitHub Webhook 設定のスクリーンショット](/img/docs/notify-gh-to-discord.png)
