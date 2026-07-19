# Tekka ユーザーAPI仕様書

## 1. 概要

本仕様書では、TekkaのPhase 1で使用するユーザーAPIを定義する。

ユーザーAPIでは、公開プロフィールの取得、ログインユーザー自身のプロフィール更新、およびユーザー別の記事一覧取得を行う。

API全体の共通ルールについては、`api-common.md`を参照する。

---

## 2. ユーザーAPI一覧

| メソッド | URL | 認証 | 概要 |
|---|---|---|---|
| `GET` | `/api/users/{id}` | 不要 | 指定ユーザーの公開プロフィールを取得する |
| `PUT` | `/api/user` | 必要 | ログインユーザー自身のプロフィールを更新する |
| `GET` | `/api/users/{id}/articles` | 不要 | 指定ユーザーが投稿した記事一覧を取得する |

認証APIの`GET /api/user`は、ログイン中のユーザー情報を取得するAPIである。

本仕様書の`GET /api/users/{id}`は、指定されたユーザーの公開プロフィールを取得するAPIであり、用途が異なる。

---

# 3. ユーザー公開プロフィール取得

## 3.1 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | `GET` |
| URL | `/api/users/{id}` |
| 認証 | 不要 |
| 概要 | 指定ユーザーの公開プロフィールを取得する |

## 3.2 パスパラメータ

| 項目 | 型 | 必須 | 内容 |
|---|---|---:|---|
| `id` | integer | 必須 | 取得対象のユーザーID |

## 3.3 成功レスポンス

HTTPステータスコードは`200 OK`とする。

公開プロフィールには、次の情報を含める。

- ユーザーID
- ユーザー名
- プロフィール文
- ユーザースコア

次の情報はレスポンスに含めない。

- メールアドレス
- パスワード
- 登録日時
- 更新日時

`created_at`と`updated_at`はDBには保存するが、Phase 1の画面表示では使用しないため、公開プロフィールAPIでは返さない。

<details>
<summary>サンプルリクエスト</summary>

```http
GET /api/users/1
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
  "data": {
    "id": 1,
    "username": "User",
    "profile": "LaravelとReactを学習しています。",
    "score": 102
  }
}
```

</details>

プロフィール文が設定されていない場合、`profile`には`null`を返す。

<details>
<summary>プロフィール未設定時のサンプルレスポンス</summary>

```json
{
  "data": {
    "id": 1,
    "username": "User",
    "profile": null,
    "score": 102
  }
}
```

</details>

## 3.4 ユーザーが存在しない場合

指定されたユーザーが存在しない場合は、`404 Not Found`を返す。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 404 Not Found
Content-Type: application/json
```

```json
{
  "message": "指定されたユーザーが見つかりません。"
}
```

</details>

## 3.5 記事一覧の扱い

ユーザーの記事一覧は、公開プロフィールのレスポンスに含めない。

ユーザー情報と記事一覧は、それぞれ次のAPIで取得する。

```text
ユーザー情報
GET /api/users/{id}

投稿記事一覧
GET /api/users/{id}/articles
```

記事一覧を分離することで、記事のページネーションを独立して扱う。

---

# 4. ログインユーザーのプロフィール更新

## 4.1 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | `PUT` |
| URL | `/api/user` |
| 認証 | 必要 |
| 概要 | ログインユーザー自身のプロフィールを更新する |

URLにはユーザーIDを含めない。

更新対象は、セッションから取得したログインユーザー本人に固定する。

## 4.2 リクエスト項目

| 項目 | 型 | 必須 | バリデーション |
|---|---|---:|---|
| `username` | string | 必須 | 3文字以上30文字以内、一意 |
| `profile` | string / null | 必須 | 500文字以内、空欄可 |

`PUT`による更新では、`username`と`profile`の両方を送信する。

ユーザー名の一意性検証では、更新対象となるログインユーザー自身の現在のユーザー名を重複として扱わない。

ユーザー名は大文字と小文字を区別する。

```text
User
user
```

上記は異なるユーザー名として扱う。

## 4.3 プロフィール文の空欄

プロフィール文は任意である。

Reactから空文字が送信された場合は、Laravel側で`null`へ変換して保存する。

```text
""
↓
null
```

リクエストで明示的に`null`を送信することも許可する。

## 4.4 リクエスト例

<details>
<summary>サンプルリクエスト</summary>

```http
PUT /api/user
Accept: application/json
Content-Type: application/json
```

```json
{
  "username": "UpdatedUser",
  "profile": "LaravelとReactを学習しています。"
}
```

</details>

<details>
<summary>プロフィール文を空にする場合のサンプルリクエスト</summary>

```http
PUT /api/user
Accept: application/json
Content-Type: application/json
```

```json
{
  "username": "UpdatedUser",
  "profile": ""
}
```

</details>

## 4.5 成功レスポンス

更新に成功した場合は、更新後のユーザー情報を返す。

HTTPステータスコードは`200 OK`とする。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "data": {
    "id": 1,
    "username": "UpdatedUser",
    "profile": "LaravelとReactを学習しています。",
    "score": 102
  }
}
```

</details>

プロフィール文を空にした場合は、`profile`に`null`を返す。

<details>
<summary>プロフィール文を空にした場合のサンプルレスポンス</summary>

```http
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "data": {
    "id": 1,
    "username": "UpdatedUser",
    "profile": null,
    "score": 102
  }
}
```

</details>

## 4.6 未認証

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

## 4.7 バリデーションエラー

次のような場合は、`422 Unprocessable Content`を返す。

- `username`が送信されていない
- `profile`が送信されていない
- ユーザー名が3文字未満
- ユーザー名が30文字を超える
- ユーザー名が他のユーザーと重複する
- プロフィール文が500文字を超える

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

## 4.8 認可

このAPIでは、URLに更新対象のユーザーIDを指定しない。

```text
PUT /api/user
```

セッションから取得したログインユーザー本人だけを更新するため、他人のプロフィールを指定して更新することはできない。

そのため、このAPIで通常想定するエラーは`401`と`422`であり、`403 Forbidden`は使用しない。

## 4.9 処理内容

```text
1. ログインユーザーを取得する
2. 入力値を検証する
3. 空文字のプロフィール文をnullへ変換する
4. usernameとprofileを更新する
5. 更新後のユーザー情報を返す
```

ユーザースコアは、このAPIでは変更しない。

---

# 5. ユーザー別記事一覧取得

## 5.1 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | `GET` |
| URL | `/api/users/{id}/articles` |
| 認証 | 不要 |
| 概要 | 指定ユーザーが投稿した記事一覧を取得する |

## 5.2 パスパラメータ

| 項目 | 型 | 必須 | 内容 |
|---|---|---:|---|
| `id` | integer | 必須 | 投稿者のユーザーID |

## 5.3 クエリパラメータ

| 項目 | 型 | 必須 | 内容 |
|---|---|---:|---|
| `page` | integer | 不要 | ページ番号。省略時は1ページ目 |

ページネーションはLaravel標準のページ番号方式を使用する。

1ページあたりの取得件数は20件固定とし、`per_page`による変更には対応しない。

## 5.4 取得対象

ユーザーページでは、記事スコアおよびユーザースコアによる一覧非表示判定を行わない。

| 記事の状態 | 取得対象 |
|---|---:|
| 通常の記事 | 対象 |
| 記事スコアが`-3`以下の記事 | 対象 |
| ユーザースコアが`90`以下のユーザーの記事 | 対象 |
| 論理削除済みの記事 | 対象外 |

「そのユーザーのすべての記事」は、論理削除されていない記事を意味する。

## 5.5 並び順

記事は、作成日時が新しい順で取得する。

```text
created_at DESC
```

Phase 1では、更新日時順や記事スコア順への並び替えには対応しない。

## 5.6 記事データの形式

ユーザー別記事一覧でも、他の記事一覧APIと同じ記事一覧用のレスポンス形式を使用する。

対象となる主なAPIは次のとおりである。

```text
GET /api/articles
GET /api/users/{id}/articles
GET /api/tags/{tag_name}/articles
GET /api/search
```

ユーザー別記事一覧では投稿者が明らかであるが、レスポンス形式を統一するため、各記事に`author`を含める。

`author`に含める情報は次の2項目だけとする。

- `id`
- `username`

投稿者のメールアドレス、プロフィール文、ユーザースコアなどは含めない。

## 5.7 成功レスポンス

HTTPステータスコードは`200 OK`とする。

<details>
<summary>サンプルリクエスト</summary>

```http
GET /api/users/1/articles?page=1
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
      "score": 5,
      "published_at": "2026-07-19T05:30:00Z",
      "author": {
        "id": 1,
        "username": "User"
      },
      "tags": [
        {
          "id": 1,
          "display_name": "Laravel"
        },
        {
          "id": 2,
          "display_name": "React"
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

記事一覧で返す記事項目の最終的な共通定義は、`articles-api.md`にも記載する。

## 5.8 記事が0件の場合

ユーザーは存在するが、論理削除されていない記事が1件もない場合は、`200 OK`と空配列を返す。

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

## 5.9 ユーザーが存在しない場合

指定されたユーザーが存在しない場合は、`404 Not Found`を返す。

存在しないユーザーを「記事が0件のユーザー」として扱わない。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 404 Not Found
Content-Type: application/json
```

```json
{
  "message": "指定されたユーザーが見つかりません。"
}
```

</details>

## 5.10 存在しないページを指定した場合

ユーザーは存在するが、記事一覧で最終ページを超えるページ番号を指定した場合は、`200 OK`と空配列を返す。

`meta`には、実際のページネーション情報を返す。

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
    "current_page": 3,
    "last_page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

</details>

---

# 6. レスポンス項目まとめ

## 6.1 ユーザー情報

| 項目 | 型 | `null` | 内容 |
|---|---|---:|---|
| `id` | integer | 不可 | ユーザーID |
| `username` | string | 不可 | ユーザー名 |
| `profile` | string | 可 | プロフィール文 |
| `score` | integer | 不可 | ユーザースコア |

## 6.2 記事一覧内の投稿者情報

| 項目 | 型 | `null` | 内容 |
|---|---|---:|---|
| `id` | integer | 不可 | 投稿者のユーザーID |
| `username` | string | 不可 | 投稿者のユーザー名 |

---

# 7. ステータスコード一覧

| API | 成功 | 主な失敗 |
|---|---:|---|
| ユーザー公開プロフィール取得 | `200` | `404` |
| ログインユーザーのプロフィール更新 | `200` | `401`、`422` |
| ユーザー別記事一覧取得 | `200` | `404` |

---

# 8. Phase 1で実装しないユーザー機能

Phase 1では、次のユーザー関連機能は実装しない。

- ユーザー一覧
- ユーザー検索
- 他人のプロフィール更新
- メールアドレスの公開
- メールアドレスの変更
- パスワードの変更
- アカウント削除
- アイコン画像の設定
- フォロー機能
- ユーザーごとの一覧非表示閾値設定
