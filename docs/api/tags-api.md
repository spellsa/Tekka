# Tekka タグAPI仕様書

## 1. 概要

本仕様書では、TekkaのPhase 1で使用するタグAPIを定義する。

タグAPIでは、指定されたタグが付いた記事一覧を取得する。

タグの作成および再利用は、記事投稿・更新APIの内部処理として行う。タグ単体の作成、更新、削除を行うAPIは作成しない。

API全体の共通ルールについては、`api-common.md`を参照する。

---

## 2. タグAPI一覧

| メソッド | URL | 認証 | 概要 |
|---|---|---|---|
| `GET` | `/api/tag-articles` | 不要 | 指定されたタグが付いた記事一覧を取得する |

取得対象のタグ名は、`tag`クエリパラメータで指定する。

```text
GET /api/tag-articles?tag=laravel&page=1
```

---

# 3. タグ別記事一覧取得

## 3.1 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | `GET` |
| URL | `/api/tag-articles` |
| 認証 | 不要 |
| 概要 | 指定されたタグが付いた記事を一覧で取得する |

## 3.2 クエリパラメータ

| 項目 | 型 | 必須 | 内容 |
|---|---|---:|---|
| `tag` | string | 必須 | 取得対象となるタグ名 |
| `page` | integer | 不要 | ページ番号。省略時は1ページ目 |

ページネーションにはLaravel標準のページ番号方式を使用する。

1ページあたりの取得件数は20件固定とし、`per_page`による変更には対応しない。

## 3.3 `tag`の指定方法

`tag`には、基本的にタグの`normalized_name`を指定する。

```text
GET /api/tag-articles?tag=laravel
```

ただし、API側でも受け取った値を正規化してから検索するため、表示名に近い表記を指定しても同じタグを取得できる。

```text
tag=laravel
tag=Laravel
tag=Ｌａｒａｖｅｌ
```

上記はすべて、正規化後の`laravel`として検索する。

## 3.4 タグ名の正規化

`tag`クエリパラメータに対して、次の処理を行う。

```text
1. URLデコード済みのクエリパラメータを取得する
2. 前後の空白を除去する
3. Unicode NFKC正規化を行う
4. 英字を小文字化する
5. tags.normalized_nameと照合する
```

正規化処理は、記事投稿・更新時にタグへ適用する処理と同じものを使用する。

## 3.5 特殊文字を含むタグ

タグ名はクエリパラメータとして送信するため、`/`を含むタグも使用できる。

例として、表示名が`CI/CD`、正規化済み名称が`ci/cd`のタグを取得する場合は、次のようになる。

```text
GET /api/tag-articles?tag=ci%2Fcd
```

`%2F`は、URL内でエンコードされた`/`を表す。

同様に、`#`、`+`、`&`などURL上で特別な意味を持つ文字も、クライアント側で適切にURLエンコードして送信する。

Axiosの`params`を使用する場合は、通常はAxiosがクエリパラメータをエンコードする。

```js
axios.get("/api/tag-articles", {
  params: {
    tag: tag.normalized_name,
    page: 1,
  },
});
```

---

# 4. 取得対象

## 4.1 記事の取得条件

次のすべてを満たす記事を取得する。

```text
指定タグが付いている
論理削除されていない
記事スコアが-2以上
投稿者のユーザースコアが91以上
```

次の記事はタグ別記事一覧から除外する。

- 論理削除済みの記事
- 記事スコアが`-3`以下の記事
- 投稿者のユーザースコアが`90`以下の記事

この非表示条件は、通常の記事一覧およびキーワード検索結果と同じとする。

ユーザー別記事一覧とは異なり、記事スコアおよびユーザースコアによる非表示を適用する。

## 4.2 並び順

記事は、作成日時が新しい順で取得する。

```text
created_at DESC
```

Phase 1では、記事スコア順や更新日時順への並び替えには対応しない。

---

# 5. レスポンス形式

## 5.1 記事データ

各記事には、`articles-api.md`で定義した記事一覧用の共通形式を使用する。

| 項目 | 型 | 内容 |
|---|---|---|
| `id` | integer | 記事ID |
| `title` | string | 記事タイトル |
| `excerpt` | string | 記事本文から生成した概要 |
| `score` | integer | 記事スコア |
| `published_at` | string | 投稿日時 |
| `author` | object | 投稿者の概要情報 |
| `tags` | array | 記事に付けられたタグ |

記事本文全体を表す`body`は含めない。

`current_user_evaluation`も一覧APIには含めない。

## 5.2 対象タグ情報

対象タグの情報は、ページネーション情報とともに`meta.tag`へ含める。

```json
{
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 20,
    "total": 1,
    "tag": {
      "id": 1,
      "display_name": "Laravel",
      "normalized_name": "laravel"
    }
  }
}
```

`meta.tag`には次の項目を含める。

| 項目 | 型 | 内容 |
|---|---|---|
| `id` | integer | タグID |
| `display_name` | string | 画面表示用のタグ名 |
| `normalized_name` | string | URL生成やタグ検索に使用する正規化済み名称 |

対象タグを`meta`へ含めることで、`data`は他の一覧APIと同様に記事配列として維持できる。

記事が0件の場合でも、`meta.tag`からタグページの見出しに使用する正式な表示名を取得できる。

---

# 6. 成功レスポンス

HTTPステータスコードは`200 OK`とする。

<details>
<summary>サンプルリクエスト</summary>

```http
GET /api/tag-articles?tag=laravel&page=1
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
    "total": 1,
    "tag": {
      "id": 1,
      "display_name": "Laravel",
      "normalized_name": "laravel"
    }
  }
}
```

</details>

---

# 7. 特殊文字を含むタグのリクエスト例

<details>
<summary>`CI/CD`タグのサンプルリクエスト</summary>

```http
GET /api/tag-articles?tag=ci%2Fcd&page=1
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
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 20,
    "total": 0,
    "tag": {
      "id": 3,
      "display_name": "CI/CD",
      "normalized_name": "ci/cd"
    }
  }
}
```

</details>

---

# 8. タグは存在するが記事が0件の場合

タグが存在していても、次の理由で取得対象の記事が0件になる場合がある。

- どの記事からも使用されていない
- 関連記事がすべて論理削除されている
- 関連記事がすべて記事スコアによって非表示になっている
- 関連記事の投稿者がすべてユーザースコアによって非表示になっている

この場合は、`404`ではなく`200 OK`と空配列を返す。

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
    "total": 0,
    "tag": {
      "id": 1,
      "display_name": "Laravel",
      "normalized_name": "laravel"
    }
  }
}
```

</details>

---

# 9. タグが存在しない場合

正規化後のタグ名に一致するタグが存在しない場合は、`404 Not Found`を返す。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 404 Not Found
Content-Type: application/json
```

```json
{
  "message": "指定されたタグが見つかりません。"
}
```

</details>

次の2つは区別する。

```text
タグが存在しない
→ 404

タグは存在するが、取得対象の記事が0件
→ 200 + 空配列
```

---

# 10. バリデーションエラー

## 10.1 エラーとなる条件

次の場合は、`422 Unprocessable Content`を返す。

- `tag`が指定されていない
- `tag`が文字列ではない
- `tag`が正規化後に空文字となる
- `tag`が正規化後に30文字を超える
- `page`が正の整数ではない

`tag`の形式が有効だが、該当するタグがDBに存在しない場合は`422`ではなく`404`とする。

## 10.2 サンプル

<details>
<summary>`tag`が指定されていない場合のサンプルリクエスト</summary>

```http
GET /api/tag-articles?page=1
Accept: application/json
```

</details>

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

# 11. 最終ページを超える場合

タグは存在するが、最終ページを超えるページ番号を指定した場合は、`200 OK`と空配列を返す。

`meta`には実際のページネーション情報と対象タグ情報を返す。

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
    "total": 1,
    "tag": {
      "id": 1,
      "display_name": "Laravel",
      "normalized_name": "laravel"
    }
  }
}
```

</details>

---

# 12. 処理内容

```text
1. tagとpageを検証する
2. tagを正規化する
3. normalized_nameが一致するタグを取得する
4. タグが存在しない場合は404を返す
5. 指定タグに関連する記事を取得する
6. 論理削除済みの記事を除外する
7. 記事スコアおよびユーザースコアによる非表示条件を適用する
8. created_atの降順で並べる
9. 20件単位でページネーションする
10. 記事一覧とmeta.tagを返す
```

このAPIはデータを更新しないため、DBトランザクションは使用しない。

---

# 13. ステータスコード一覧

| 状況 | ステータス |
|---|---:|
| タグ別記事一覧の取得成功 | `200` |
| タグは存在するが記事が0件 | `200` |
| 最終ページを超えている | `200` |
| タグが存在しない | `404` |
| `tag`または`page`が不正 | `422` |

認証不要の取得APIであるため、通常は`401`および`403`を使用しない。

---

# 14. Phase 1で実装しないタグ機能

Phase 1では、次のタグ関連機能は実装しない。

- タグ一覧取得
- タグ検索
- タグ入力のオートコンプリート
- 人気タグ一覧
- タグ単体の作成
- タグ名の更新
- タグの削除
- 未使用タグの自動削除
- タグの統合
- タグの並び替え
