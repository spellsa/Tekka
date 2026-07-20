# Tekka 記事API仕様書

## 1. 概要

本仕様書では、TekkaのPhase 1で使用する記事APIを定義する。

記事APIでは、記事一覧の取得、記事詳細の取得、記事投稿、記事更新、および記事の論理削除を行う。

API全体の共通ルールについては、`api-common.md`を参照する。

---

## 2. 記事API一覧

| メソッド | URL | 認証 | 概要 |
|---|---|---|---|
| `GET` | `/api/articles` | 不要 | 公開記事の一覧を取得する |
| `GET` | `/api/articles/{id}` | 不要 | 指定記事の詳細を取得する |
| `POST` | `/api/articles` | 必要 | 新しい記事を投稿する |
| `PUT` | `/api/articles/{id}` | 必要 | ログインユーザー自身の記事を更新する |
| `DELETE` | `/api/articles/{id}` | 必要 | ログインユーザー自身の記事を論理削除する |

記事編集画面専用の取得APIは作成しない。

記事編集画面で既存の記事データを取得する場合も、次の記事詳細取得APIを使用する。

```text
GET /api/articles/{id}
```

---

# 3. 記事一覧用データの共通形式

## 3.1 対象API

次の一覧系APIでは、記事データの形式を共通化する。

```text
GET /api/articles
GET /api/users/{id}/articles
GET /api/tags/{tag_name}/articles
GET /api/search
```

一覧の取得条件はAPIごとに異なるが、各記事のレスポンス項目は同じ形式とする。

## 3.2 レスポンス項目

| 項目 | 型 | `null` | 内容 |
|---|---|---:|---|
| `id` | integer | 不可 | 記事ID |
| `title` | string | 不可 | 記事タイトル |
| `excerpt` | string | 不可 | 記事本文から生成した概要 |
| `score` | integer | 不可 | 記事スコア |
| `published_at` | string | 不可 | 投稿日時 |
| `author` | object | 不可 | 投稿者の概要情報 |
| `tags` | array | 不可 | 記事に付けられたタグ |

記事一覧用データには、記事本文全体を表す`body`を含めない。

## 3.3 投稿者情報

`author`には次の項目だけを含める。

| 項目 | 型 | 内容 |
|---|---|---|
| `id` | integer | 投稿者のユーザーID |
| `username` | string | 投稿者の現在のユーザー名 |

投稿者のメールアドレス、プロフィール文、ユーザースコアなどは含めない。

## 3.4 タグ情報

各タグには次の項目を含める。

| 項目 | 型 | 内容 |
|---|---|---|
| `id` | integer | タグID |
| `display_name` | string | 画面表示用のタグ名 |
| `normalized_name` | string | URL生成やタグ検索に使用する正規化済み名称 |

```json
{
  "id": 1,
  "display_name": "Laravel",
  "normalized_name": "laravel"
}
```

React側では、`normalized_name`をタグページのURL生成に使用できる。

```text
/tags/laravel
```

タグの表示順はPhase 1では保証しない。React側はタグ配列の順序に依存しないものとする。

## 3.5 `excerpt`の生成

`excerpt`は記事本文からAPI側で生成する。

DBには保存しない。

生成手順は次のとおりとする。

```text
1. body内の改行と連続する空白を、1つの半角空白へ置き換える
2. 前後の空白を除去する
3. 先頭から200文字を取得する
4. 元の本文が200文字を超える場合は、末尾に「…」を付ける
```

文字数の切り出しでは、日本語や絵文字を途中で壊さないように、マルチバイト文字に対応した処理を使用する。

`excerpt`は本文の先頭部分であり、文章の意味を解析して作成する自動要約ではない。

MarkdownからHTMLへの変換は行わない。

---

# 4. 記事一覧取得

## 4.1 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | `GET` |
| URL | `/api/articles` |
| 認証 | 不要 |
| 概要 | 一覧表示対象となる記事を取得する |

## 4.2 クエリパラメータ

| 項目 | 型 | 必須 | 内容 |
|---|---|---:|---|
| `page` | integer | 不要 | ページ番号。省略時は1ページ目 |

ページネーションにはLaravel標準のページ番号方式を使用する。

1ページあたりの件数は20件固定とし、`per_page`による変更には対応しない。

## 4.3 取得条件

次のすべてを満たす記事を取得する。

```text
論理削除されていない
記事スコアが-2以上
投稿者のユーザースコアが91以上
```

次の記事は一覧から除外する。

- 論理削除済みの記事
- 記事スコアが`-3`以下の記事
- 投稿者のユーザースコアが`90`以下の記事

## 4.4 並び順

記事は作成日時が新しい順で取得する。

```text
created_at DESC
```

Phase 1では、更新日時順や記事スコア順への並び替えには対応しない。

## 4.5 成功レスポンス

HTTPステータスコードは`200 OK`とする。

<details>
<summary>サンプルリクエスト</summary>

```http
GET /api/articles?page=1
Accept: application/json
```

</details>

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "data": [
    {
      "id": 10,
      "title": "Laravel Sanctumの基本",
      "excerpt": "Laravel Sanctumを利用してReact SPAの認証を実装する方法について説明します。",
      "score": 5,
      "published_at": "2026-07-19T05:30:00Z",
      "author": {
        "id": 1,
        "username": "User"
      },
      "tags": [
        {
          "id": 1,
          "display_name": "Laravel",
          "normalized_name": "laravel"
        },
        {
          "id": 2,
          "display_name": "React",
          "normalized_name": "react"
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

</details>

## 4.6 記事が0件の場合

取得対象の記事が1件もない場合は、`404`ではなく`200 OK`と空配列を返す。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 20,
    "total": 0
  }
}
```

</details>

## 4.7 最終ページを超える場合

最終ページを超えるページ番号を指定した場合は、`200 OK`と空配列を返す。

`meta`には実際のページネーション情報を返す。

---

# 5. 記事詳細取得

## 5.1 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | `GET` |
| URL | `/api/articles/{id}` |
| 認証 | 不要 |
| 概要 | 指定記事の詳細を取得する |

ログイン中の利用者からアクセスされた場合は、セッションからログインユーザーを確認し、そのユーザーが対象記事に付けている評価も返す。

ログインは必須ではない。

## 5.2 パスパラメータ

| 項目 | 型 | 必須 | 内容 |
|---|---|---:|---|
| `id` | integer | 必須 | 取得対象の記事ID |

## 5.3 取得条件

記事スコアや投稿者のユーザースコアによって一覧から除外されている記事でも、記事詳細は取得できる。

| 記事の状態 | 詳細取得 |
|---|---:|
| 通常の記事 | 可能 |
| 記事スコアが`-3`以下 | 可能 |
| 投稿者のユーザースコアが`90`以下 | 可能 |
| 論理削除済み | 不可 |

## 5.4 レスポンス項目

| 項目 | 型 | `null` | 内容 |
|---|---|---:|---|
| `id` | integer | 不可 | 記事ID |
| `title` | string | 不可 | 記事タイトル |
| `body` | string | 不可 | Markdown形式の本文原文 |
| `score` | integer | 不可 | 記事スコア |
| `published_at` | string | 不可 | 投稿日時 |
| `updated_at` | string | 可 | 最終更新日時 |
| `author` | object | 不可 | 投稿者の概要情報 |
| `tags` | array | 不可 | 記事に付けられたタグ |
| `current_user_evaluation` | string / null | 可 | ログインユーザーがこの記事に付けている評価 |

記事詳細には`excerpt`を含めない。

記事本文はMarkdown原文として返し、表示用HTMLへの変換はReact側で行う。

## 5.5 `current_user_evaluation`

`current_user_evaluation`は、APIを呼び出しているログインユーザーが、取得対象の記事に付けている評価を表す。

ユーザースコアを表す項目ではない。

値は次のいずれかとする。

| 値 | 意味 |
|---|---|
| `"high"` | ログインユーザーが対象記事を高評価している |
| `"low"` | ログインユーザーが対象記事を低評価している |
| `null` | 未評価、未ログイン、または投稿者本人 |

未ログインと未評価は、どちらも`null`となる。

React側は別途保持しているログイン状態と組み合わせて判断する。

```text
未ログイン + null
→ 評価操作を表示しない、または無効化する

ログイン中 + null
→ 対象記事を未評価

ログイン中 + high
→ 対象記事を高評価済み

ログイン中 + low
→ 対象記事を低評価済み
```

投稿者本人は自分の記事を評価できないため、通常は`null`となる。

画面上の表示制御では`author.id`とログインユーザーIDを比較する。

最終的な認可は評価API側でも行う。

## 5.6 成功レスポンス

HTTPステータスコードは`200 OK`とする。

<details>
<summary>サンプルリクエスト</summary>

```http
GET /api/articles/10
Accept: application/json
```

</details>

<details>
<summary>ログインユーザーが高評価している場合のサンプルレスポンス</summary>

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "data": {
    "id": 10,
    "title": "Laravel Sanctumの基本",
    "body": "# Laravel Sanctum\n\nLaravel Sanctumを利用してSPA認証を実装します。",
    "score": 5,
    "published_at": "2026-07-19T05:30:00Z",
    "updated_at": "2026-07-19T06:10:00Z",
    "author": {
      "id": 1,
      "username": "User"
    },
    "tags": [
      {
        "id": 1,
        "display_name": "Laravel",
        "normalized_name": "laravel"
      },
      {
        "id": 2,
        "display_name": "React",
        "normalized_name": "react"
      }
    ],
    "current_user_evaluation": "high"
  }
}
```

</details>

<details>
<summary>未ログインまたは未評価の場合のサンプルレスポンス</summary>

```json
{
  "data": {
    "id": 10,
    "title": "Laravel Sanctumの基本",
    "body": "# Laravel Sanctum\n\nLaravel Sanctumを利用してSPA認証を実装します。",
    "score": 5,
    "published_at": "2026-07-19T05:30:00Z",
    "updated_at": "2026-07-19T06:10:00Z",
    "author": {
      "id": 1,
      "username": "User"
    },
    "tags": [],
    "current_user_evaluation": null
  }
}
```

</details>

## 5.7 記事が存在しない場合

次の場合は`404 Not Found`を返す。

- 指定IDの記事が存在しない
- 指定記事が論理削除されている

論理削除済みであることを示す専用のレスポンスは返さない。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 404 Not Found
Content-Type: application/json
```

```json
{
  "message": "指定された記事が見つかりません。"
}
```

</details>

---

# 6. 記事投稿

## 6.1 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | `POST` |
| URL | `/api/articles` |
| 認証 | 必要 |
| 概要 | 新しい記事を投稿する |

記事は投稿時点で公開状態とする。

下書きおよび非公開状態には対応しない。

## 6.2 リクエスト項目

| 項目 | 型 | 必須 | バリデーション |
|---|---|---:|---|
| `title` | string | 必須 | 1文字以上100文字以内 |
| `body` | string | 必須 | 1文字以上50,000文字以内 |
| `tags` | array | 必須 | 0件以上5件以内 |
| `tags.*` | string | 条件付き | 正規化後1文字以上30文字以内 |

タグを付けない場合も、`tags`には空配列を送信する。

```json
{
  "tags": []
}
```

次の項目はリクエストで指定できない。

- 記事ID
- 投稿者ID
- 記事スコア
- 公開日時
- 作成日時
- 更新日時
- 論理削除日時

投稿者はセッションから取得したログインユーザーとする。

記事スコアの初期値は`0`とする。

`published_at`には投稿時の現在日時を設定する。

## 6.3 タグの入力形式

タグは、タグ名の文字列配列として送信する。

タグIDやタグオブジェクトは送信しない。

```json
{
  "tags": [
    "Laravel",
    "React"
  ]
}
```

各タグには、次の正規化を行う。

```text
1. 前後の空白を除去する
2. Unicode NFKC正規化を行う
3. 英字を小文字化してnormalized_nameを生成する
```

すでに同じ`normalized_name`を持つタグが存在する場合は、既存タグを再利用する。

存在しない場合は、新しいタグを作成する。

新しく作成するタグの`display_name`には、前後の空白を除去し、NFKC正規化した入力表記を保存する。

## 6.4 タグの重複

同じリクエスト内で、正規化後のタグ名が重複することは許可しない。

次の入力は重複として扱う。

```text
Laravel
Ｌａｒａｖｅｌ

正規化後
laravel
laravel
```

重複したタグが含まれる場合は、`422 Unprocessable Content`を返す。

API側で自動的に1件へまとめる処理は行わない。

## 6.5 サンプルリクエスト

<details>
<summary>タグありのサンプルリクエスト</summary>

```http
POST /api/articles
Accept: application/json
Content-Type: application/json
```

```json
{
  "title": "Laravel Sanctumの基本",
  "body": "# Laravel Sanctum\n\nLaravel Sanctumを利用してSPA認証を実装します。",
  "tags": [
    "Laravel",
    "React"
  ]
}
```

</details>

<details>
<summary>タグなしのサンプルリクエスト</summary>

```http
POST /api/articles
Accept: application/json
Content-Type: application/json
```

```json
{
  "title": "Laravel Sanctumの基本",
  "body": "# Laravel Sanctum\n\nLaravel Sanctumを利用してSPA認証を実装します。",
  "tags": []
}
```

</details>

## 6.6 処理内容

記事投稿とタグ処理は、1つのDBトランザクション内で実行する。

```text
1. 入力値を検証する
2. タグを正規化し、重複を確認する
3. articlesテーブルへ記事を登録する
4. user_idにログインユーザーIDを設定する
5. scoreに0を設定する
6. published_atに現在日時を設定する
7. 必要なタグを作成または再利用する
8. article_tagへ記事とタグの関連を登録する
9. すべて成功した場合のみ確定する
```

新規記事の記事スコアは`0`であり、ユーザースコアへ与える影響も`0`である。

そのため、Phase 1では記事投稿時にユーザースコアを再計算しない。

## 6.7 成功レスポンス

記事投稿に成功した場合は、作成した記事IDだけを返す。

HTTPステータスコードは`201 Created`とする。

投稿画面と記事詳細画面は別画面であるため、レスポンスには記事本文全体を含めない。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "data": {
    "id": 10
  }
}
```

</details>

## 6.8 投稿後のフロントエンド処理

React側では、返された記事IDを使用して記事詳細画面へ遷移する。

```text
POST /api/articles
↓
data.idを取得
↓
/articles/{id}へ遷移
↓
記事詳細画面でGET /api/articles/{id}を実行
```

例:

```js
const response = await axios.post("/api/articles", {
  title,
  body,
  tags,
});

const articleId = response.data.data.id;

navigate(`/articles/${articleId}`);
```

記事詳細画面では、記事詳細取得APIを使用して本文を取得する。

## 6.9 未認証

未ログイン状態でアクセスした場合は、`401 Unauthorized`を返す。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
```

```json
{
  "message": "認証が必要です。"
}
```

</details>

## 6.10 バリデーションエラー

次のような場合は、`422 Unprocessable Content`を返す。

- `title`が送信されていない
- タイトルが空である
- タイトルが100文字を超える
- `body`が送信されていない
- 本文が空である
- 本文が50,000文字を超える
- `tags`が送信されていない
- `tags`が配列ではない
- タグが5件を超える
- タグが文字列ではない
- タグ名が正規化後に空になる
- タグ名が正規化後に30文字を超える
- 正規化後に同じタグが重複する

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 422 Unprocessable Content
Content-Type: application/json
```

```json
{
  "message": "入力内容に問題があります。"
}
```

</details>

---

# 7. 記事更新

## 7.1 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | `PUT` |
| URL | `/api/articles/{id}` |
| 認証 | 必要 |
| 概要 | ログインユーザー自身の記事を更新する |

## 7.2 パスパラメータ

| 項目 | 型 | 必須 | 内容 |
|---|---|---:|---|
| `id` | integer | 必須 | 更新対象の記事ID |

## 7.3 リクエスト項目

`PUT`を使用するため、編集可能な項目をすべて送信する。

| 項目 | 型 | 必須 | バリデーション |
|---|---|---:|---|
| `title` | string | 必須 | 1文字以上100文字以内 |
| `body` | string | 必須 | 1文字以上50,000文字以内 |
| `tags` | array | 必須 | 0件以上5件以内 |
| `tags.*` | string | 条件付き | 正規化後1文字以上30文字以内 |

タグの入力形式、正規化、既存タグの再利用、および重複判定は記事投稿APIと同じとする。

次の項目は変更できない。

- 記事ID
- 投稿者
- 記事スコア
- 投稿日時
- 作成日時
- 論理削除日時

`updated_at`は更新処理によって自動的に更新する。

`published_at`は記事を更新しても変更しない。

## 7.4 サンプルリクエスト

<details>
<summary>サンプルリクエスト</summary>

```http
PUT /api/articles/10
Accept: application/json
Content-Type: application/json
```

```json
{
  "title": "Laravel SanctumによるSPA認証",
  "body": "# Laravel Sanctum\n\nLaravel Sanctumを利用した認証方法を詳しく説明します。",
  "tags": [
    "Laravel",
    "Sanctum"
  ]
}
```

</details>

## 7.5 処理内容

記事更新とタグ関連の同期は、1つのDBトランザクション内で実行する。

```text
1. 論理削除されていない記事を取得する
2. ログインユーザーが投稿者本人か確認する
3. 入力値を検証する
4. タグを正規化し、重複を確認する
5. titleとbodyを更新する
6. 必要なタグを作成または再利用する
7. article_tagの関連を送信されたタグに同期する
8. すべて成功した場合のみ確定する
```

記事から外されたタグについては、記事との関連だけを削除する。

タグ自体は`tags`テーブルに残す。

```text
article_tagの関連
→ 削除する

tagsのレコード
→ 削除しない
```

記事の内容やタグを変更しても記事スコアは変化しないため、記事更新時には記事スコアおよびユーザースコアを再計算しない。

## 7.6 成功レスポンス

記事更新に成功した場合は、更新した記事IDだけを返す。

HTTPステータスコードは`200 OK`とする。

編集画面と記事詳細画面は別画面であるため、レスポンスには記事本文全体を含めない。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "data": {
    "id": 10
  }
}
```

</details>

## 7.7 更新後のフロントエンド処理

React側では、更新成功後に記事詳細画面へ遷移する。

```text
PUT /api/articles/{id}
↓
data.idを取得
↓
/articles/{id}へ遷移
↓
記事詳細画面でGET /api/articles/{id}を実行
```

更新対象の記事IDはURLからすでに取得できるが、投稿APIと成功レスポンスの形を揃えるため、レスポンスにも記事IDを返す。

## 7.8 未認証

未ログイン状態でアクセスした場合は、`401 Unauthorized`を返す。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
```

```json
{
  "message": "認証が必要です。"
}
```

</details>

## 7.9 権限不足

記事は存在するが、ログインユーザーが投稿者本人ではない場合は、`403 Forbidden`を返す。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json
```

```json
{
  "message": "この操作を行う権限がありません。"
}
```

</details>

## 7.10 記事が存在しない場合

次の場合は`404 Not Found`を返す。

- 指定IDの記事が存在しない
- 指定記事が論理削除されている

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 404 Not Found
Content-Type: application/json
```

```json
{
  "message": "指定された記事が見つかりません。"
}
```

</details>

## 7.11 バリデーションエラー

記事投稿APIと同じ入力条件を使用する。

入力値が不正な場合は、`422 Unprocessable Content`を返す。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 422 Unprocessable Content
Content-Type: application/json
```

```json
{
  "message": "入力内容に問題があります。"
}
```

</details>

---

# 8. 記事削除

## 8.1 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | `DELETE` |
| URL | `/api/articles/{id}` |
| 認証 | 必要 |
| 概要 | ログインユーザー自身の記事を論理削除する |

物理削除は行わない。

## 8.2 パスパラメータ

| 項目 | 型 | 必須 | 内容 |
|---|---|---:|---|
| `id` | integer | 必須 | 削除対象の記事ID |

## 8.3 リクエスト

リクエストボディは使用しない。

<details>
<summary>サンプルリクエスト</summary>

```http
DELETE /api/articles/10
Accept: application/json
```

</details>

## 8.4 処理内容

記事の論理削除と投稿者のユーザースコア更新は、1つのDBトランザクション内で実行する。

```text
1. 論理削除されていない記事を取得する
2. ログインユーザーが投稿者本人か確認する
3. deleted_atへ現在日時を設定して記事を論理削除する
4. 投稿者の論理削除されていない記事を対象にユーザースコアを再計算する
5. users.scoreを更新する
6. すべて成功した場合のみ確定する
```

論理削除した記事はユーザースコアの計算対象から外す。

記事への評価数は変化しないため、論理削除時に記事スコアは再計算しない。

## 8.5 論理削除時に残すデータ

論理削除時には、次のデータを削除しない。

- 記事本体のタイトルと本文
- 記事とタグの関連
- タグ
- 記事への評価
- 記事スコア

LaravelのSoftDeletesにより、記事レコードへ`deleted_at`を設定するだけとする。

## 8.6 成功レスポンス

削除に成功した場合は、`204 No Content`を返す。

レスポンス本文は返さない。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 204 No Content
```

</details>

## 8.7 削除後の扱い

論理削除済みの記事は、投稿者本人からのアクセスであっても、通常のAPIでは存在しないものとして扱う。

| API・機能 | 削除後の扱い |
|---|---|
| 記事一覧 | 表示しない |
| ユーザー別記事一覧 | 表示しない |
| タグ別記事一覧 | 表示しない |
| 検索結果 | 表示しない |
| 記事詳細 | `404` |
| 記事更新 | `404` |
| 記事削除の再実行 | `404` |
| 記事評価 | `404` |

Phase 1では、削除済み記事の復元APIを作成しない。

## 8.8 未認証

未ログイン状態でアクセスした場合は、`401 Unauthorized`を返す。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
```

```json
{
  "message": "認証が必要です。"
}
```

</details>

## 8.9 権限不足

記事は存在するが、ログインユーザーが投稿者本人ではない場合は、`403 Forbidden`を返す。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json
```

```json
{
  "message": "この操作を行う権限がありません。"
}
```

</details>

## 8.10 記事が存在しない場合

次の場合は`404 Not Found`を返す。

- 指定IDの記事が存在しない
- 指定記事がすでに論理削除されている

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 404 Not Found
Content-Type: application/json
```

```json
{
  "message": "指定された記事が見つかりません。"
}
```

</details>

---

# 9. レスポンス項目まとめ

## 9.1 記事一覧用データ

| 項目 | 型 | `null` | 内容 |
|---|---|---:|---|
| `id` | integer | 不可 | 記事ID |
| `title` | string | 不可 | 記事タイトル |
| `excerpt` | string | 不可 | 本文から生成した概要 |
| `score` | integer | 不可 | 記事スコア |
| `published_at` | string | 不可 | 投稿日時 |
| `author` | object | 不可 | 投稿者の概要 |
| `tags` | array | 不可 | タグ一覧 |

## 9.2 記事詳細データ

| 項目 | 型 | `null` | 内容 |
|---|---|---:|---|
| `id` | integer | 不可 | 記事ID |
| `title` | string | 不可 | 記事タイトル |
| `body` | string | 不可 | Markdown形式の本文原文 |
| `score` | integer | 不可 | 記事スコア |
| `published_at` | string | 不可 | 投稿日時 |
| `updated_at` | string | 可 | 最終更新日時 |
| `author` | object | 不可 | 投稿者の概要 |
| `tags` | array | 不可 | タグ一覧 |
| `current_user_evaluation` | string / null | 可 | ログインユーザーが対象記事に付けている評価 |

## 9.3 記事投稿・更新成功データ

| 項目 | 型 | `null` | 内容 |
|---|---|---:|---|
| `id` | integer | 不可 | 作成または更新した記事ID |

---

# 10. ステータスコード一覧

| API | 成功 | 主な失敗 |
|---|---:|---|
| 記事一覧取得 | `200` | なし |
| 記事詳細取得 | `200` | `404` |
| 記事投稿 | `201` | `401`、`422` |
| 記事更新 | `200` | `401`、`403`、`404`、`422` |
| 記事削除 | `204` | `401`、`403`、`404` |

---

# 11. Phase 1で実装しない記事機能

Phase 1では、次の記事関連機能は実装しない。

- 下書き
- 非公開記事
- 公開予約
- slug
- 記事編集履歴
- 削除済み記事の復元
- 記事一覧の並び替え
- 記事一覧の表示件数変更
- リアルタイムMarkdownプレビュー
- 記事画像のアップロード
- コメント
- ブックマーク
- 管理者による記事編集・削除
