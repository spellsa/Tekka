# Tekkaを使う上で学んだこと

1つにつき1～3文で書く

- Seederでは、`DB::table()`で直接データを入れる代わりに、`User::create()`のようにModelを使ってデータを作成できる。リレーションを定義すれば、`$user->articles()->create()`のように関連する仮データも分かりやすく作れる。
- Laravel の命名規則（Model は単数形の `Article`、テーブルは複数形の `articles`、外部キーは `user_id`）に従うと、どのテーブルや外部キーを使うかを Laravel が推測できるため、設定を書く量が減る。
- リレーションは「自分は相手に属する」なら `belongsTo`
  「自分は相手を複数持つ」なら `hasMany` を使う。
  記事とタグのように両方が複数ずつ関係する場合は、`belongsToMany` を使う。
- `casts()`には「カラム名 => 型」を書く。書いたカラムは、LaravelがDBから取得したときや保存するときに、その型として自動で変換してくれる。
- phpで静的メソッドならインスタンスを作らずに::でメソッドを叩ける（とはいえ、Tag::createの構文では、laravelが内部がいい感じにしてくるから叩けるだけ）
- Seeder書くときには連想配列 + foreachの仕組みを使うと良い
- seederでinsert使うと、高速ではあるがcreated_atが設定されない。
- phpにもnamespaceの概念があり、同じnamespace内ではuseがいらない。
- $this->callすると、ClassName::classでClassNameの完全なクラス名（ほぼパスと同じ）を返す。
  その次にcallメソッドが内部でそのクラス名を用いてインスタンスを作成してから->runを呼ぶ。
- seederは自分で決めたものをDBに入れる
  factoryはランダムなデータを大量に投入するのに使う
- laravelではrequestsの中で定義される、formrequestを使ってバリデーションを行う
- `confirmed` は「対象フィールド名 + `_confirmation` という名前の確認用フィールドと一致するか」を確認する一般ルール。
- user::createはuser型のオブジェクトを返す
- sanctumのAuthを使ってloginを行ったときには、セッションIDがバックエンド側に保存される
- auth::attemptを使うと自動でパスワードのハッシュチェックとログインが行われる
- 「今取得しているもの」とは別の、**関連しているデータ**を条件に使いたいとき、`whereHas` を使う。
- `getCollection()`はページネーションと組み合わせて使う
- `withValidator()`はバリデーションに失敗した場合も呼ばれる
