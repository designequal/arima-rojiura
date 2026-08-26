# seo.md

## 基本設定

公開前に `STORE_*` トークンを実情報へ置換します。

| 項目 | 設定値 | 状態 |
|---|---|---|
| `<title>` | `STORE_NAME` | 未設定 |
| meta description | `STORE_DESCRIPTION` | 未設定 |
| canonical URL | `STORE_CANONICAL_URL` | 未設定 |
| OGP title | `STORE_NAME` | 未設定 |
| OGP description | `STORE_DESCRIPTION` | 未設定 |
| OGP image | `assets/images/ogp.webp` | 未設定 |
| Twitter card | `summary_large_image` | 設定済み |
| favicon | 店舗ブランド資産を使用 | 未設定 |

## 構造化データ

`index.html` に `Restaurant` のJSON-LDを配置しています。公開前に次を実情報で設定します。

- 店名
- 説明
- 正規URL
- 電話番号
- 住所
- OGP/代表画像

確認できない値は推測せず、値そのものを削除してから公開します。

## コンテンツSEO

- `h1` はページの主要テーマを1つだけ表す。
- 各セクションは意味のある `h2` を持つ。
- 画像 `alt` は画像内容と文脈に基づき設定し、装飾画像は空文字にする。
- 店名、住所、電話番号、営業時間はサイト内で一貫させる。
- Instagram記事の本文はAPI取得内容を改変しない。
- 事実確認できないキーワード目的の文章を追加しない。

## 公開前検証

- Google Rich Results TestでRestaurant JSON-LDを確認
- LighthouseでSEO / Accessibility / Best Practices / Performanceを確認
- OGPの絶対URLと画像サイズを確認
- 404となる画像・リンクがないことを確認
- `STORE_` のテンプレートトークンが残っていないことを確認
