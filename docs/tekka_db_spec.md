# Tekka DB・テーブル仕様書

## 1. 概要

本仕様書では、TekkaのPhase 1で使用するデータベースおよびテーブル構成を定義する。

Tekkaは、React SPAとLaravel APIによるWebアプリケーションであり、データベースにはMySQLを使用する。

本仕様書では、次の内容を扱う。

* 使用するテーブル
* 各テーブルの役割
* 各カラムの用途
* 主キー・外部キー
* 一意制約
* NULL可否
* デフォルト値
* 外部キー削除時の動作
* 必要なインデックス
* スコア更新や論理削除に関する方針

APIのURL、リクエスト形式、レスポンス形式などは、後続のAPI仕様書で定義する。

---
## 2. テーブル一覧

```text
users
(
  id [PK],
  username [UNIQUE],
  email [UNIQUE],
  password,
  profile [NULL],
  score [DEFAULT 100],
  created_at,
  updated_at
)

articles
(
  id [PK],
  user_id [FK -> users.id, ON DELETE RESTRICT],
  title,
  body [MEDIUMTEXT],
  score [DEFAULT 0],
  published_at [NULL],
  created_at,
  updated_at,
  deleted_at [NULL]
)

tags
(
  id [PK],
  display_name,
  normalized_name [UNIQUE],
  created_at,
  updated_at
)

article_tag
(
  article_id [PK, FK -> articles.id, ON DELETE CASCADE],
  tag_id [PK, FK -> tags.id, ON DELETE RESTRICT],

  INDEX (tag_id)
)

article_evaluations
(
  id [PK],
  user_id [FK -> users.id, ON DELETE RESTRICT],
  article_id [FK -> articles.id, ON DELETE CASCADE],
  value [ENUM('high', 'low')],
  created_at,
  updated_at,

  UNIQUE (user_id, article_id),
  INDEX (article_id)
)
```

## 3. テーブル一覧

Phase 1で使用するアプリ固有テーブルは、次の5つとする。

| テーブル名              | 役割                                                 |
| ----------------------- | ---------------------------------------------------- |
| `users`               | ユーザー情報とユーザースコアを管理する               |
| `articles`            | 記事本文、投稿者、記事スコア、公開日時などを管理する |
| `tags`                | タグの表示名と正規化済み名称を管理する               |
| `article_tag`         | 記事とタグの多対多関係を管理する                     |
| `article_evaluations` | ユーザーによる記事への高評価・低評価を管理する       |

Phase 1では、次のテーブルは作成しない。

* コメント
* ブックマーク
* ユーザー設定
* 記事画像
* 記事編集履歴
* 管理者権限
* セッション
* APIトークン

Laravel SanctumのSPA認証で使用するセッションは、ファイルに保存する。

```env
SESSION_DRIVER=file
```

---

## 4. テーブル間の関係

```text
users
  ├── 1 : N ── articles
  └── 1 : N ── article_evaluations

articles
  ├── 1 : N ── article_evaluations
  └── N : N ── tags
                  │
                  └── article_tagで関連付け
```

関係は次のとおりである。

* 1人のユーザーは複数の記事を投稿できる
* 1つの記事には1人の投稿者がいる
* 1人のユーザーは複数の記事を評価できる
* 1つの記事は複数のユーザーから評価される
* 1つの記事には複数のタグを付けられる
* 1つのタグは複数の記事で使用できる

---

# 5. `users`テーブル

## 5.1 役割

ユーザーの認証情報、公開プロフィール、ユーザースコアを管理する。

## 5.2 テーブル構成

```text
users
(
  id [PK],
  username,
  email,
  password,
  profile,
  score,
  created_at,
  updated_at
)
```

## 5.3 カラム仕様

| カラム名       | 型の方針        | NULL | デフォルト  | 説明                             |
| -------------- | --------------- | ---: | ----------- | -------------------------------- |
| `id`         | BIGINT UNSIGNED | 不可 | 自動採番    | ユーザーを一意に識別する主キー   |
| `username`   | VARCHAR(30)     | 不可 | なし        | 画面上に表示するユーザー名       |
| `email`      | VARCHAR(255)    | 不可 | なし        | ログインに使用するメールアドレス |
| `password`   | VARCHAR(255)    | 不可 | なし        | ハッシュ化されたパスワード       |
| `profile`    | VARCHAR(500)    | 許可 | NULL        | 任意のプロフィール文             |
| `score`      | INT             | 不可 | 100         | ユーザースコア                   |
| `created_at` | TIMESTAMP       | 許可 | Laravel標準 | ユーザー登録日時                 |
| `updated_at` | TIMESTAMP       | 許可 | Laravel標準 | 最終更新日時                     |

## 5.4 制約

```text
PRIMARY KEY (id)

UNIQUE (username)
UNIQUE (email)
```

ユーザー名とメールアドレスは重複を許可しない。

## 5.5 ユーザー名の扱い

ユーザー名は、大文字と小文字を区別する。

```text
User
user
```

上記は別のユーザー名として登録できる。

DBの一意判定でも大文字・小文字を区別できるように、必要に応じてカラムの照合順序を指定する。

## 5.6 メールアドレスの扱い

メールアドレスは、登録前にLaravel側で小文字へ変換する。

```text
Example@Example.COM
↓
example@example.com
```

小文字化した値をDBに保存し、大文字・小文字を区別せず一意とする。

## 5.7 パスワード

パスワードは平文で保存しない。

Laravelのパスワードハッシュ機能を使用してハッシュ化し、`password`カラムへ保存する。

`password`は主キーや一意制約には使用しない。

## 5.8 ユーザースコア

ユーザースコアの初期値は100とする。

```text
ユーザースコア
= 100 + 削除されていない各記事の影響値の合計
```

各記事の影響値は次の範囲とする。

```text
最大 +3
最小 -3
```

算出したユーザースコアは、`users.score`に保存する。

## 5.9 採用しないカラム

次のカラムはPhase 1では持たせない。

```text
role
remember_token
```

---

# 6. `articles`テーブル

## 6.1 役割

記事タイトル、Markdown本文、投稿者、記事スコア、公開日時、論理削除状態などを管理する。

## 6.2 テーブル構成

```text
articles
(
  id [PK],
  user_id [FK -> users.id],
  title,
  body,
  score,
  published_at,
  created_at,
  updated_at,
  deleted_at
)
```

## 6.3 カラム仕様

| カラム名         | 型の方針        | NULL | デフォルト  | 説明                       |
| ---------------- | --------------- | ---: | ----------- | -------------------------- |
| `id`           | BIGINT UNSIGNED | 不可 | 自動採番    | 記事を一意に識別する主キー |
| `user_id`      | BIGINT UNSIGNED | 不可 | なし        | 投稿者を表す外部キー       |
| `title`        | VARCHAR(100)    | 不可 | なし        | 記事タイトル               |
| `body`         | MEDIUMTEXT      | 不可 | なし        | Markdown形式の記事本文     |
| `score`        | INT             | 不可 | 0           | 記事スコア                 |
| `published_at` | TIMESTAMP       | 許可 | NULL        | 記事が公開された日時       |
| `created_at`   | TIMESTAMP       | 許可 | Laravel標準 | 記事データの作成日時       |
| `updated_at`   | TIMESTAMP       | 許可 | Laravel標準 | 記事データの最終更新日時   |
| `deleted_at`   | TIMESTAMP       | 許可 | NULL        | 論理削除日時               |

記事の日時カラムはすべて`TIMESTAMP`を使用する。`published_at`、`created_at`、`updated_at`、`deleted_at`はいずれも、記事に関する出来事が発生した瞬間を表すためである。

`TIMESTAMP`は、DB接続のタイムゾーンとUTCの間で変換して保存・取得する。LaravelアプリケーションおよびDB接続のタイムゾーンをUTCに設定することで、すべての日時をUTC基準で扱う。APIはUTCを表す`Z`付きのISO 8601形式で返し、画面表示時の日本時間への変換はReact側で行う。

`TIMESTAMP`は2038年までの日時を扱う型である。Phase 1ではこの範囲で問題ないものとする。

## 6.4 主キー・外部キー

```text
PRIMARY KEY (id)

FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE RESTRICT
```

記事を持つユーザーを誤って物理削除できないように、`users`への外部キーは`RESTRICT`とする。

## 6.5 記事本文

記事本文は最大50,000文字である。

日本語や絵文字などのマルチバイト文字を含む場合でも十分に保存できるように、`body`には`MEDIUMTEXT`を使用する。

```text
body
→ MEDIUMTEXT NOT NULL
```

## 6.6 記事スコア

記事スコアは次の式で算出する。

```text
記事スコア
= 高評価数 - 低評価数
```

算出した結果は`articles.score`に保存する。

評価が作成・変更・取り消しされた場合は、記事スコアと投稿者のユーザースコアを更新する。

## 6.7 公開日時

Phase 1では、記事は投稿時点で公開状態とする。

記事投稿時に、`published_at`へ現在日時を設定する。

```text
published_at = 投稿時刻
```

将来、下書きや未公開記事を追加できるように、`published_at`はNULLを許可する。

```text
published_at = NULL
→ 未公開状態として将来利用可能
```

Phase 1では`status`カラムは使用しない。

## 6.8 論理削除

記事削除にはLaravelのSoftDeletesを使用する。

```text
deleted_at = NULL
→ 未削除

deleted_at = 削除日時
→ 削除済み
```

削除済み記事は、通常の画面には表示しない。

* 記事一覧
* 検索結果
* タグ別記事一覧
* ユーザーページ
* 記事詳細

削除済み記事には、新規評価・評価変更・評価取り消しを行えない。

## 6.9 論理削除時のスコア更新

記事を論理削除した場合、その記事は投稿者のユーザースコア計算対象から外れる。

そのため、記事の論理削除と投稿者スコアの再計算・更新は、同じトランザクション内で行う。

記事自体の評価数は変化しないため、論理削除時に記事スコアを再計算する必要はない。

---

# 7. `tags`テーブル

## 7.1 役割

タグの画面表示用名称と、重複判定・検索用の正規化済み名称を管理する。

## 7.2 テーブル構成

```text
tags
(
  id [PK],
  display_name,
  normalized_name,
  created_at,
  updated_at
)
```

## 7.3 カラム仕様

| カラム名            | 型の方針        | NULL | デフォルト  | 説明                             |
| ------------------- | --------------- | ---: | ----------- | -------------------------------- |
| `id`              | BIGINT UNSIGNED | 不可 | 自動採番    | タグを一意に識別する主キー       |
| `display_name`    | VARCHAR(30)     | 不可 | なし        | 画面上に表示するタグ名           |
| `normalized_name` | VARCHAR(30)     | 不可 | なし        | 重複判定・検索用の正規化済み名称 |
| `created_at`      | TIMESTAMP       | 許可 | Laravel標準 | タグ作成日時                     |
| `updated_at`      | TIMESTAMP       | 許可 | Laravel標準 | タグの最終更新日時               |

## 7.4 制約

```text
PRIMARY KEY (id)

UNIQUE (normalized_name)
```

`normalized_name`が同じタグを複数登録することはできない。

## 7.5 表示名

`display_name`は画面表示に使用する。

```text
display_name = Laravel
```

最初にタグを作成したときの表記を保存し、そのタグを利用するすべての記事で共通して使用する。

## 7.6 タグ正規化

タグ登録時には、入力値から`normalized_name`を生成する。

正規化手順は次のとおりとする。

```text
1. 前後の空白を除去する
2. Unicode NFKC正規化を行う
3. 英字を小文字化する
```

例:

```text
"  Laravel  "
↓
"laravel"
```

```text
"Ｌａｒａｖｅｌ"
↓
"laravel"
```

次のタグ名は同一タグとして扱う。

```text
Laravel
laravel
LARAVEL
Ｌａｒａｖｅｌ
```

すでに同じ`normalized_name`を持つタグが存在する場合は、新しいタグを作成せず、既存タグを使用する。

## 7.7 未使用タグ

記事編集などにより、どの記事からも使われなくなったタグは、自動削除しない。

```text
未使用タグ
→ DBに残す
```

タグの整理・削除機能は、将来必要になった場合に追加する。

---

# 8. `article_tag`テーブル

## 8.1 役割

記事とタグの多対多関係を管理する中間テーブルである。

## 8.2 テーブル構成

```text
article_tag
(
  article_id [PK, FK -> articles.id],
  tag_id [PK, FK -> tags.id]
)
```

## 8.3 カラム仕様

| カラム名       | 型の方針        | NULL | 説明               |
| -------------- | --------------- | ---: | ------------------ |
| `article_id` | BIGINT UNSIGNED | 不可 | 記事を表す外部キー |
| `tag_id`     | BIGINT UNSIGNED | 不可 | タグを表す外部キー |

`created_at`と`updated_at`は持たせない。

## 8.4 複合主キー

```text
PRIMARY KEY (article_id, tag_id)
```

これにより、同じ記事に同じタグを重複して登録できないようにする。

## 8.5 外部キー

```text
FOREIGN KEY (article_id)
  REFERENCES articles(id)
  ON DELETE CASCADE

FOREIGN KEY (tag_id)
  REFERENCES tags(id)
  ON DELETE RESTRICT
```

記事が物理削除された場合、記事とタグの関連データも自動削除する。

使用中のタグは、誤って物理削除できないように`RESTRICT`とする。

なお、記事の論理削除では`ON DELETE CASCADE`は動作せず、`article_tag`のデータは残る。

## 8.6 インデックス

複合主キーにより、`article_id`を起点とする検索にはインデックスが使用できる。

```text
PRIMARY KEY (article_id, tag_id)
```

タグ別記事一覧では`tag_id`から記事を検索するため、次のインデックスを追加する。

```text
INDEX (tag_id)
```

最終的な索引構成は次のとおりである。

```text
PRIMARY KEY (article_id, tag_id)
INDEX (tag_id)
```

## 8.7 タグ数の上限

1つの記事に付けられるタグは最大5個とする。

この制限はLaravel側のバリデーションで保証する。

---

# 9. `article_evaluations`テーブル

## 9.1 役割

ユーザーが記事に付けた高評価・低評価を管理する。

## 9.2 テーブル構成

```text
article_evaluations
(
  id [PK],
  user_id [FK -> users.id],
  article_id [FK -> articles.id],
  value,
  created_at,
  updated_at
)
```

## 9.3 カラム仕様

| カラム名       | 型の方針            | NULL | デフォルト  | 説明                       |
| -------------- | ------------------- | ---: | ----------- | -------------------------- |
| `id`         | BIGINT UNSIGNED     | 不可 | 自動採番    | 評価を一意に識別する主キー |
| `user_id`    | BIGINT UNSIGNED     | 不可 | なし        | 評価したユーザー           |
| `article_id` | BIGINT UNSIGNED     | 不可 | なし        | 評価された記事             |
| `value`      | ENUM('high', 'low') | 不可 | なし        | 評価の種類                 |
| `created_at` | TIMESTAMP           | 許可 | Laravel標準 | 評価を作成した日時         |
| `updated_at` | TIMESTAMP           | 許可 | Laravel標準 | 評価を最後に変更した日時   |

## 9.4 主キー・外部キー

```text
PRIMARY KEY (id)

FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE RESTRICT

FOREIGN KEY (article_id)
  REFERENCES articles(id)
  ON DELETE CASCADE
```

評価を持つユーザーは、誤って物理削除できないように`RESTRICT`とする。

記事が物理削除された場合、その記事への評価は自動削除する。

記事の論理削除では評価レコードは削除しない。

## 9.5 複合ユニーク制約

1人のユーザーが、同じ記事に複数の評価レコードを持つことを禁止する。

```text
UNIQUE (user_id, article_id)
```

## 9.6 評価値

評価値は次の2種類のみとする。

```text
high
low
```

DB側でもそれ以外の値を拒否するため、`ENUM`を使用する。

```text
value ENUM('high', 'low') NOT NULL
```

未評価状態は、評価レコードが存在しない状態として表す。

```text
value = high
→ 高評価

value = low
→ 低評価

レコードなし
→ 未評価
```

スコア計算時には、Laravel側で次のように扱う。

```text
high → +1
low  → -1
```

## 9.7 評価操作

評価操作は次の挙動とする。

```text
未評価 → high
→ highの評価レコードを作成

未評価 → low
→ lowの評価レコードを作成

high → high
→ 評価レコードを削除

low → low
→ 評価レコードを削除

high → low
→ valueをlowへ更新

low → high
→ valueをhighへ更新
```

投稿者本人は、自分の記事を評価できない。

削除済み記事には、評価を作成・変更・取り消しできない。

## 9.8 評価処理とトランザクション

評価の作成・変更・削除時には、次の処理を同じトランザクション内で行う。

```text
1. 評価レコードを作成・更新・削除する
2. 記事スコアを再計算する
3. articles.scoreを更新する
4. 投稿者のユーザースコアを再計算する
5. users.scoreを更新する
```

途中で処理に失敗した場合は、評価とスコア更新の両方を取り消す。

授業課題の範囲では、高度な排他制御や複雑なロック設計までは扱わない。

## 9.9 インデックス

複合ユニーク制約により、次の検索にはインデックスが使用できる。

```text
UNIQUE (user_id, article_id)
```

これは、特定ユーザーが特定記事を評価しているか確認する処理に使用する。

記事スコアの集計では`article_id`から評価を検索するため、次のインデックスを追加する。

```text
INDEX (article_id)
```

最終的な索引構成は次のとおりである。

```text
PRIMARY KEY (id)
UNIQUE (user_id, article_id)
INDEX (article_id)
```

---

# 10. 外部キー削除時の方針

外部キーの削除動作は、関係ごとに`RESTRICT`と`CASCADE`を使い分ける。

| 外部キー                                          | 削除動作     | 理由                                 |
| ------------------------------------------------- | ------------ | ------------------------------------ |
| `articles.user_id → users.id`                  | `RESTRICT` | 記事があるユーザーの誤削除を防ぐ     |
| `article_evaluations.user_id → users.id`       | `RESTRICT` | 評価があるユーザーの誤削除を防ぐ     |
| `article_tag.tag_id → tags.id`                 | `RESTRICT` | 使用中のタグの誤削除を防ぐ           |
| `article_tag.article_id → articles.id`         | `CASCADE`  | 記事が物理削除された場合、関連は不要 |
| `article_evaluations.article_id → articles.id` | `CASCADE`  | 記事が物理削除された場合、評価は不要 |

`RESTRICT`は、関連する子データがある場合に親データの削除を拒否する。

`CASCADE`は、親データを削除した場合に、関連する子データも自動削除する。

これらは物理削除時にのみ動作する。`deleted_at`を更新する論理削除では動作しない。

---

# 11. インデックス方針

Phase 1では、主キー、一意制約、外部キー、および主要な検索に必要なインデックスを設定する。

## 11.1 `users`

```text
PRIMARY KEY (id)
UNIQUE (username)
UNIQUE (email)
```

## 11.2 `articles`

```text
PRIMARY KEY (id)
INDEX (user_id)
```

`user_id`は外部キーとして使用し、ユーザーページの記事取得にも利用する。

## 11.3 `tags`

```text
PRIMARY KEY (id)
UNIQUE (normalized_name)
```

## 11.4 `article_tag`

```text
PRIMARY KEY (article_id, tag_id)
INDEX (tag_id)
```

## 11.5 `article_evaluations`

```text
PRIMARY KEY (id)
UNIQUE (user_id, article_id)
INDEX (article_id)
```

MySQLが外部キー用インデックスを自動作成する場合があるため、Laravel Migration作成時には重複したインデックスを作らないように確認する。

---

# 12. キーワード検索

Phase 1では、記事タイトルと本文に対する部分一致検索を行う。

```text
検索対象:
- articles.title
- articles.body
```

検索例:

```sql
WHERE title LIKE '%keyword%'
   OR body LIKE '%keyword%'
```

先頭にワイルドカードを使用する部分一致検索では、通常のインデックスは利用されにくい。

授業課題の規模では専用の全文検索インデックスは作成せず、通常の部分一致検索を使用する。

---

# 13. スコア保存方針

記事スコアとユーザースコアはDBに保存する。

```text
articles.score
users.score
```

## 13.1 評価変更時

評価が作成・変更・削除された場合は、次を更新する。

```text
記事スコア
投稿者のユーザースコア
```

## 13.2 記事削除時

記事が論理削除された場合は、その記事をユーザースコア計算対象から除外する。

そのため、投稿者のユーザースコアを再計算して保存する。

## 13.3 記事編集時

記事タイトル、本文、タグの編集では、記事スコアおよびユーザースコアは変更しない。

---

# 14. Phase 1で作成しないテーブル

次の機能に対応するテーブルはPhase 1では作成しない。

```text
comments
bookmarks
user_settings
article_images
article_revisions
tag_aliases
sessions
personal_access_tokens
```

## 14.1 コメント機能

コメント機能を将来追加する場合は、既存テーブルを大きく変更せず、次のようなテーブルを追加できる。

```text
comments
(
  id [PK],
  user_id [FK -> users.id],
  article_id [FK -> articles.id],
  body,
  created_at,
  updated_at,
  deleted_at
)
```

現在のテーブル構成は、コメント機能を追加できる構造になっている。

---
