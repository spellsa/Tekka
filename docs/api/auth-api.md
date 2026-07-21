# Tekka 認証API仕様書

## 1. 概要

本仕様書では、TekkaのPhase 1で使用する認証APIを定義する。

認証にはLaravel SanctumのSPA認証を使用し、Cookieベースのセッション認証とCSRF保護を行う。

API全体の共通ルールについては、`api-common.md`を参照する。

---

## 2. 認証API一覧

| メソッド | URL                      | 認証 | 概要                                     |
| -------- | ------------------------ | ---- | ---------------------------------------- |
| `GET`  | `/sanctum/csrf-cookie` | 不要 | CSRF Cookieを取得する                    |
| `POST` | `/api/register`        | 不要 | ユーザーを登録し、自動ログインする       |
| `POST` | `/api/login`           | 不要 | メールアドレスとパスワードでログインする |
| `POST` | `/api/logout`          | 必要 | 現在のセッションからログアウトする       |
| `GET`  | `/api/user`            | 必要 | ログインユーザーの情報を取得する         |

`GET /sanctum/csrf-cookie`は、Tekka独自のAPIではなく、Laravel Sanctumが提供するエンドポイントである。

---

## 3. 認証フロー

### 3.1 ユーザー登録

```text
1. GET  /sanctum/csrf-cookie
2. POST /api/register
3. 登録成功後、自動的にログイン状態になる
4. レスポンスのユーザー情報をReact側で保持する
```

### 3.2 ログイン

```text
1. GET  /sanctum/csrf-cookie
2. POST /api/login
3. レスポンスのユーザー情報をReact側で保持する
```

### 3.3 ページ再読み込み時

Reactの状態はページ再読み込みによって失われるため、アプリ起動時に次のAPIを使用してログイン状態を確認する。

```text
GET /api/user
```

### 3.4 ログアウト

```text
POST /api/logout
```

ログアウト成功後、React側で保持しているログインユーザー情報を削除する。

---

# 4. CSRF Cookie取得

## 4.1 基本情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| メソッド | `GET`                          |
| URL      | `/sanctum/csrf-cookie`         |
| 認証     | 不要                             |
| 概要     | CSRF保護に必要なCookieを取得する |
| 提供元   | Laravel Sanctum                  |

## 4.2 リクエスト

リクエストボディは使用しない。

<details>
<summary>サンプルリクエスト</summary>

```http
GET /sanctum/csrf-cookie
Accept: application/json
```

</details>

## 4.3 成功レスポンス

レスポンス本文は返さず、Cookieを設定する。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 204 No Content
Set-Cookie: XSRF-TOKEN=...
```

</details>

## 4.4 フロントエンド側の設定

Axiosでは、CookieとXSRFトークンを送信できるように共通設定を行う。

```js
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

---

# 5. ユーザー登録

## 5.1 基本情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| メソッド | `POST`                                         |
| URL      | `/api/register`                                |
| 認証     | 不要                                             |
| 概要     | ユーザーを新規登録し、自動的にログイン状態にする |

## 5.2 リクエスト項目

| 項目                      | 型     | 必須 | バリデーション            |
| ------------------------- | ------ | ---: | ------------------------- |
| `username`              | string | 必須 | 3文字以上30文字以内、一意 |
| `email`                 | string | 必須 | メールアドレス形式、一意  |
| `password`              | string | 必須 | 8文字以上                 |
| `password_confirmation` | string | 必須 | `password`と一致        |

`password_confirmation`は確認用の入力値であり、DBには保存しない。

メールアドレスは、Laravel側で小文字化してから保存する。

パスワードは平文で保存せず、Laravelのパスワードハッシュ機能を使用する。

<details>
<summary>サンプルリクエスト</summary>

```http
POST /api/register
Accept: application/json
Content-Type: application/json
```

```json
{
  "username": "User",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

</details>

## 5.3 成功レスポンス

ユーザー登録に成功した場合は、作成したユーザーをログイン状態にし、ユーザー情報を返す。

HTTPステータスコードは`201 Created`とする。

メールアドレスとパスワードはレスポンスに含めない。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 201 Created
Content-Type: application/json
```

```json
{
  "data": {
    "id": 1,
    "username": "User",
    "profile": null,
    "score": 100
  }
}
```

</details>

## 5.4 バリデーションエラー

入力値が不正な場合は、`422 Unprocessable Content`を返す。

ユーザー名またはメールアドレスの重複も、Phase 1では`422`として扱う。

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

## 5.5 処理内容

```text
1. 入力値を検証する
2. メールアドレスを小文字化する
3. パスワードをハッシュ化する
4. usersテーブルへユーザーを登録する
5. 作成したユーザーをログイン状態にする
6. セッションを再生成する
7. ユーザー情報を返す
```

---

# 6. ログイン

## 6.1 基本情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| メソッド | `POST`                                         |
| URL      | `/api/login`                                   |
| 認証     | 不要                                             |
| 概要     | メールアドレスとパスワードを使用してログインする |

## 6.2 リクエスト項目

| 項目         | 型     | 必須 | バリデーション     |
| ------------ | ------ | ---: | ------------------ |
| `email`    | string | 必須 | メールアドレス形式 |
| `password` | string | 必須 | 文字列             |

メールアドレスは、認証処理前にLaravel側で小文字化する。

<details>
<summary>サンプルリクエスト</summary>

```http
POST /api/login
Accept: application/json
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

</details>

## 6.3 成功レスポンス

ログインに成功した場合は、セッションを再生成し、ログインユーザー情報を返す。

HTTPステータスコードは`200 OK`とする。

返されたユーザー情報は、React側で現在のログインユーザーとして保持する。

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
    "profile": null,
    "score": 100
  }
}
```

</details>

## 6.4 認証失敗

メールアドレスまたはパスワードが正しくない場合は、`401 Unauthorized`を返す。

メールアドレスが存在しない場合と、パスワードが正しくない場合でメッセージを分けない。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json
```

```json
{
  "message": "メールアドレスまたはパスワードが正しくありません。"
}
```

</details>

## 6.5 バリデーションエラー

メールアドレスまたはパスワードが未入力など、入力値が不正な場合は`422 Unprocessable Content`を返す。

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

## 6.6 処理内容

```text
1. 入力値を検証する
2. メールアドレスを小文字化する
3. メールアドレスとパスワードを照合する
4. 認証成功時にセッションを再生成する
5. ログインユーザー情報を返す
```

---

# 7. ログアウト

## 7.1 基本情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| メソッド | `POST`                           |
| URL      | `/api/logout`                    |
| 認証     | 必要                               |
| 概要     | 現在のセッションからログアウトする |

## 7.2 リクエスト

リクエストボディは使用しない。

<details>
<summary>サンプルリクエスト</summary>

```http
POST /api/logout
Accept: application/json
```

</details>

## 7.3 成功レスポンス

ログアウトに成功した場合は、`204 No Content`を返す。

レスポンス本文は返さない。

<details>
<summary>サンプルレスポンス</summary>

```http
HTTP/1.1 204 No Content
```

</details>

## 7.4 未認証

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

## 7.5 処理内容

```text
1. ログアウト処理を行う
2. 現在のセッションを無効化する
3. CSRFトークンを再生成する
4. 204を返す
```

ログアウト対象は、現在のブラウザで使用しているセッションのみとする。

Phase 1では、他端末のセッションをまとめてログアウトさせる機能は実装しない。

---

# 8. ログインユーザー取得

## 8.1 基本情報

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| メソッド | `GET`                                      |
| URL      | `/api/user`                                |
| 認証     | 必要                                         |
| 概要     | 現在ログインしているユーザーの情報を取得する |

## 8.2 リクエスト

リクエストボディは使用しない。

<details>
<summary>サンプルリクエスト</summary>

```http
GET /api/user
Accept: application/json
```

</details>

## 8.3 成功レスポンス

HTTPステータスコードは`200 OK`とする。

メールアドレスとパスワードはレスポンスに含めない。

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
    "profile": null,
    "score": 100
  }
}
```

</details>

## 8.4 未認証

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

## 8.5 利用目的

このAPIは、主に次の場面で使用する。

- ページ再読み込み後のログイン状態の復元
- Reactアプリ起動時の認証確認
- 現在のログインユーザー情報の再取得

---

# 9. React側で保持するログインユーザー情報

登録またはログイン成功時に返されたユーザー情報は、React側で現在のログインユーザーとして保持する。

主な用途は次のとおりとする。

- ヘッダーへのユーザー名表示
- ログイン状態に応じた画面表示の切り替え
- 記事投稿画面やプロフィール編集画面へのアクセス制御
- 自分の記事かどうかの画面上の判定
- 編集・削除・評価ボタンの表示制御
- 自分のユーザーページへのリンク生成

React側の表示制御だけで権限を保証せず、最終的な認証・認可はLaravel側で行う。

---

# 10. ステータスコード一覧

| API                  |    成功 | 主な失敗             |
| -------------------- | ------: | -------------------- |
| CSRF Cookie取得      | `204` | 原則として定義しない |
| ユーザー登録         | `201` | `422`              |
| ログイン             | `200` | `401`、`422`     |
| ログアウト           | `204` | `401`              |
| ログインユーザー取得 | `200` | `401`              |

---

# 11. Phase 1で実装しない認証機能

Phase 1では、次の認証関連機能は実装しない。

- メールアドレス確認
- パスワード再設定
- パスワード変更
- メールアドレス変更
- アカウント削除
- ログイン状態の保持期間を選択する機能
- 他端末のセッション一覧
- 他端末のセッションをログアウトさせる機能
- JWTまたはAPIトークンの発行
