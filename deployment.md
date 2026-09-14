# deployment.md

## 前提

このサイトはビルド不要の静的サイトです。`index.html` をルートとして配信してください。

## ローカル確認

```bash
python3 -m http.server 4173
```

`http://localhost:4173` を開きます。

または:

```bash
npx serve .
```

## 公開前チェック

1. `research.md` の未確認事項を確認する。
2. `index.html` / `posts.html` / `post.html` の `STORE_*` トークンを検索し、公開値へ置換する。
3. `assets.md` に記録した実画像を配置する。
4. Restaurant JSON-LDを実情報へ更新する。
5. 電話・予約・Instagram・地図リンクを実機で確認する。
6. 320 / 375 / 390 / 430 / 768 / 1024 / 1440pxで表示確認する。
7. キーボード操作、Esc、フォーカス表示、モバイルメニューを確認する。
8. Lighthouseと構造化データを検証する。
9. OGPを実URLで確認する。
10. `assets/images/favicon.svg` が存在し、全HTMLから200で読み込めることを確認する。
11. Instagram同期を使う場合は手動workflowを1回成功させる。

## GitHub Actions Secret

Instagram同期を有効にする場合のみ、GitHubの **Settings → Secrets and variables → Actions** に以下を登録します。

- `INSTAGRAM_GRAPH_ACCESS_TOKEN`

Secret名が一覧に存在しても値が空の場合はActionsへ空文字が渡されます。同期ジョブの最初にSecretの空チェックを行い、空ならGraph APIを呼ばずに失敗させます。トークン値はログへ出力しません。

アクセストークンをソースコード、JSON、Markdown、コミット履歴へ保存しないでください。

## GitHub Pages / Cloudflare Pages等

静的ファイルをリポジトリルートから公開できるサービスに対応します。フレームワーク用ビルドコマンドは不要です。

Cloudflare Pages等でビルドコマンドが必須入力でない場合は空欄とし、出力ディレクトリはリポジトリルート相当を指定します。サービスごとの最新設定仕様は公開時に公式ドキュメントで再確認してください。

## 更新運用

- 店舗情報が変わったら `research.md` と公開HTMLを同時に更新する。
- 画像変更時は `assets.md` を更新する。
- SEO変更時は `seo.md` を更新する。
- デザイン変更時は `design.md` を更新する。
- 重要な変更は `changelog.md` に記録する。
