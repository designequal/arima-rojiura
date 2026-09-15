# seo.md

## 基本設定

店舗情報と主要なSEO設定は反映済みです。

| 項目 | 設定値 | 状態 |
|---|---|---|
| `<title>` | 路地裏チャイニーズ 有馬 | 設定済み |
| meta description | 大阪・福島の路地裏で楽しむ中華料理、餃子、居酒屋。 | 設定済み |
| canonical URL | https://siu01.github.io/arima-rojiura-site/ | GitHub Pages公開時に確認 |
| OGP title | 路地裏チャイニーズ 有馬 | 設定済み |
| OGP description | 大阪・福島の路地裏で楽しむ中華料理、餃子、居酒屋。 | 設定済み |
| OGP image | `assets/images/placeholder.svg` | 実素材に差し替え可能 |
| Twitter card | `summary_large_image` | 設定済み |
| favicon | 仮のテキストロゴSVG | 設定済み |

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
- 店舗情報の未設定トークンが残っていないことを確認
