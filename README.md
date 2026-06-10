# setlog募集ボード

setlogを一緒に楽しむログ仲間を探すための、localStorageベースの募集掲示板MVPです。

## 起動方法

Node環境がある場合:

```bash
npm install
npm run dev
```

Nodeを使わずに確認する場合:

```bash
python -m http.server 4173 --bind 127.0.0.1
```

その後、ブラウザで `http://127.0.0.1:4173/` を開いてください。

## 公開URL

現在のNetlify Drop公開URL:

```text
https://setlog-board.pages.dev
```

Netlify Dropの一時サイトとして公開している場合、Netlify上で無料アカウント登録またはログインしてサイトを引き取ると、継続運用しやすくなります。

## ページ

- `/`
- `/board`
- `/post`
- `/how-to-use`
- `/safe`
- `/rules`
- `/admin`

管理画面のMVP用パスワードは `setlog-admin` です。

## 編集する場所

- 文言、固定タグ、NGワード、簡易管理パスワード: `src/content.js`
- 投稿保存、取得、通報、削除、人気タグ計算: `src/services/postsService.js`
- 画面ロジック、自由タグ、バリデーション、検索、管理画面: `src/app.js`
- 見た目、スマホ最適化、カードUI、下部ナビ: `src/styles.css`
- SEO title、meta description、OGP、canonical、JSON-LD: 各ページの `index.html`
- sitemap: `sitemap.xml`
- robots: `robots.txt`

## デプロイ

静的サイトなので、Cloudflare PagesやNetlifyではこのフォルダをそのまま公開ディレクトリに指定できます。

独自ドメインや別のNetlify URLに変更した場合は、各HTML、`sitemap.xml`、`robots.txt` 内の `https://setlog-board.pages.dev` を実際のURLに置き換えてください。

## データ構造

投稿はlocalStorageに次の形式で保存されます。

```json
{
  "id": "string",
  "nickname": "string",
  "setlogId": "string",
  "ageGroup": "string",
  "faceOption": "string",
  "tags": ["string"],
  "message": "string",
  "createdAt": "string",
  "expiresAt": "string",
  "reported": false
}
```

SupabaseやCloudflare D1に移行する場合は、まず `src/services/postsService.js` の中身をAPI呼び出しに差し替える構成です。
