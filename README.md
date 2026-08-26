# DesignEqual Restaurant Site Template

飲食店向け静的Webサイトの共通テンプレートです。店舗ごとの事実情報・ブランド資産を設定して利用します。

> **重要**: 推測した店舗情報、営業時間、住所、価格、メニュー、料理画像は掲載しません。`research.md` で確認できた情報だけを実装してください。

## 構成

- `index.html` — 全ページ構成、Restaurant構造化データ
- `styles.css` — モバイルファーストのレスポンシブデザイン
- `script.js` — モバイルメニュー、ヘッダー、記事表示、プライバシーダイアログ
- `posts.html` / `post.html` — 保存済みInstagram投稿の一覧・詳細
- `assets/data/instagram-posts.json` — サイトに掲載する投稿本文・日時・リンク
- `config/instagram-journal.json` — Instagram同期対象の公開設定（秘密情報は置かない）
- `tools/sync-instagram-graph.mjs` — Meta Instagram Graph APIから投稿と画像を同期
- `.github/workflows/sync-instagram.yml` — 毎日09:17（日本時間）の同期と差分push
- `assets/` — ブランドマーク、OGP、店舗画像、アイコン、同期済みInstagram画像
- `research.md` — 店舗情報と出典
- `design.md` — ブランド・UI方針
- `seo.md` — SEO設定
- `assets.md` — 画像利用記録
- `deployment.md` — 公開手順
- `changelog.md` — 変更履歴

## テンプレート利用手順

1. `research.md` を埋め、公式情報と第三者媒体をクロスチェックする。
2. `design.md` に店舗固有のブランド・配色・フォント・見出し改行を確定する。
3. `index.html` の `STORE_*` トークンとJSON-LDを確認済みの実情報へ置換する。
4. `styles.css` のCSS変数をブランドに合わせる。
5. 実写画像を `assets/images/` に保存し、`assets.md` に出典・利用箇所を記録する。
6. 必要に応じてInstagram同期を設定する。
7. 320 / 375 / 390 / 430 / 768 / 1024 / 1440pxで表示を確認する。

## ローカル確認

任意の静的サーバーで公開してください。

```bash
python3 -m http.server 4173
```

ブラウザで `http://localhost:4173` を開きます。

Node.js環境がある場合は、次でも確認できます。

```bash
npx serve .
```

## Instagram記事の初回設定

1. `config/instagram-journal.json` の対象アカウント設定を確認する。
2. GitHubの **Settings → Secrets and variables → Actions** で、`INSTAGRAM_GRAPH_ACCESS_TOKEN` を登録する。
3. **Actions → Sync Instagram posts → Run workflow** を一度実行する。
4. `assets/data/instagram-posts.json`、`assets/images/instagram-feed/`、投稿一覧・詳細ページを確認する。

トークンはGitやサイトのファイルに保存しません。同期に失敗しても、すでに保存された記事と画像は残す設計です。

## 品質方針

- モバイルファースト
- セマンティックHTMLとキーボード操作
- 見出し・キャッチコピーは意味の切れ目で手動改行
- WebP、遅延読み込み、適切な `width` / `height`
- Restaurant構造化データ
- Instagram本文は要約・生成・改変しない
- 推測した店舗情報・メニューは掲載しない
- 実在する料理・店舗・人物のAI生成画像は使用しない
- 電話番号は `tel:` リンク、外部リンクは安全な `rel` を設定
- `prefers-reduced-motion` を尊重する

## Instagram同期の前提

公開プロアカウント（ビジネス / クリエイター）を対象に、Meta Instagram Graph API / Business Discoveryを利用します。対象店のログイン情報やブラウザCookieは使用しません。

`config/instagram-journal.json` には秘密情報を保存せず、アクセストークンはGitHub Actions Secretだけで管理してください。

## ライセンス・表記

Copyright © DesignEqual
