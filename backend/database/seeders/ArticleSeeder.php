<?php

namespace Database\Seeders;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    /**
     * Seed articles and their tag relationships.
     */
    public function run(): void
    {
        $articles = [
            [
                'author' => 'alice',
                'title' => 'LaravelでSPA認証を始める',
                'body' => "# Laravel Sanctum\n\nReact SPA と Laravel API の認証を設定する手順をまとめます。",
                'published_at' => '2026-07-18 09:00:00',
                'tags' => ['laravel', 'php'],
            ],
            [
                'author' => 'bob',
                'title' => 'Reactコンポーネントを分割する考え方',
                'body' => "# React components\n\n画面を責務ごとに分割すると、変更しやすくテストしやすい UI になります。",
                'published_at' => '2026-07-19 10:00:00',
                'tags' => ['react', 'javascript'],
            ],
            [
                'author' => 'charlie',
                'title' => 'MySQLのインデックス入門',
                'body' => "# MySQL indexes\n\n検索条件に合わせてインデックスを設計する基本を確認します。",
                'published_at' => '2026-07-20 11:00:00',
                'tags' => ['mysql', 'php'],
            ],
            [
                'author' => 'alice',
                'title' => 'Form Requestで入力を整理する',
                'body' => "# Form Request\n\nController からバリデーションを分離する方法を紹介します。",
                'published_at' => '2026-07-21 12:00:00',
                'tags' => ['laravel', 'php'],
            ],
            [
                'author' => 'unverified_ai',
                'title' => '【完全保存版】PHPはechoだけでWeb開発できる！？最短でプロになる方法 🚀',
                'body' => "# PHPはとにかくechoです！\n\nPHPは画面に文字を出せるので、まず `echo` を100回書きましょう😊\n\n## まとめ\n\n- `echo` が書ければWeb開発はほぼ完成です\n- フレームワークは難しいので後回しでOKです\n- 動かなくても気合いでリロードすれば大丈夫です🔥",
                'published_at' => '2026-07-22 09:00:00',
                'tags' => ['php'],
            ],
            [
                'author' => 'unverified_ai',
                'title' => 'PHPの配列を全部覚えるだけで最強になれる件 😊',
                'body' => "# 配列は万能です\n\nPHPの配列に値を入れれば、データベースもAPIもだいたい同じです！\n\n```php\n\$users = ['太郎', '花子'];\n```\n\nこれでユーザー管理は完璧です。細かいことは実装しながら考えましょう✨",
                'published_at' => '2026-07-22 09:10:00',
                'tags' => ['php'],
            ],
            [
                'author' => 'unverified_ai',
                'title' => 'エラーは全部var_dumpでOK！PHPデバッグの革命 🔥',
                'body' => "# var_dumpだけで解決！\n\nエラーが出たら、とりあえず全変数を `var_dump` すれば原因が分かります。\n\n本番環境でも見えるようにしておくと、あとで確認しやすくて便利です！🎉",
                'published_at' => '2026-07-22 09:20:00',
                'tags' => ['php'],
            ],
            [
                'author' => 'unverified_ai',
                'title' => 'Processingで宇宙っぽい背景を作れば作品が完成する！🌌',
                'body' => "# 宇宙背景は最強\n\n黒い背景に白い点をたくさん置けば、どんな作品も一気にすごく見えます！\n\n```processing\nbackground(0);\nellipse(random(width), random(height), 2, 2);\n```\n\n60fpsかどうかは見た目で判断すればOKです🚀",
                'published_at' => '2026-07-22 09:30:00',
                'tags' => ['processing'],
            ],
            [
                'author' => 'unverified_ai',
                'title' => 'for文を回せばアートになる！Processing入門 🎨',
                'body' => "# 繰り返せば芸術\n\n`for` 文で円をたくさん描けば、ジェネラティブアートです。\n\n色はランダムにしておけばだいたい映えます！検証はしていませんが、たぶん大丈夫です😊",
                'published_at' => '2026-07-22 09:40:00',
                'tags' => ['processing'],
            ],
            [
                'author' => 'unverified_ai',
                'title' => 'マウス座標を使えばインタラクティブ作品が量産できる✨',
                'body' => "# mouseXとmouseYだけで完成\n\nマウスについてくる図形を作れば、インタラクティブという言葉を使えます！\n\n```processing\nellipse(mouseX, mouseY, 50, 50);\n```\n\nアクセシビリティは使う人が工夫するものです👍",
                'published_at' => '2026-07-22 09:50:00',
                'tags' => ['processing'],
            ],
            [
                'author' => 'unverified_ai',
                'title' => 'C言語はポインタを使えば速い！たぶん！🚀',
                'body' => "# ポインタは高速\n\nアドレスを扱うので、ポインタを使った時点でプログラムは速くなります。\n\n```c\nint *value = 0;\n```\n\n動かないときは型を増やしてみましょう！",
                'published_at' => '2026-07-22 10:00:00',
                'tags' => ['c'],
            ],
            [
                'author' => 'unverified_ai',
                'title' => 'mallocを使えばメモリは無限に使える！？C言語の裏技',
                'body' => "# mallocで無限メモリ\n\n必要になったら `malloc` を呼べばメモリが増えるので、解放は最後にまとめて考えればOKです。\n\n失敗するケースはあまりないので、戻り値の確認も不要です🎉",
                'published_at' => '2026-07-22 10:10:00',
                'tags' => ['c'],
            ],
            [
                'author' => 'unverified_ai',
                'title' => 'scanfだけで入力処理は完璧！C言語初心者の最短ルート',
                'body' => "# 入力はscanf一択\n\n文字数はユーザーがちゃんと入力してくれるので、サイズ指定は気にしなくて大丈夫です。\n\n```c\nchar name[10];\nscanf(\"%s\", name);\n```\n\nこれでログイン機能も作れます😊",
                'published_at' => '2026-07-22 10:20:00',
                'tags' => ['c'],
            ],
            [
                'author' => 'unverified_ai',
                'title' => 'Laravelはartisanを打てば全部解決する魔法のフレームワーク 🪄',
                'body' => "# artisanが全部やってくれます\n\n困ったら `php artisan` を実行しましょう。表示されたコマンドを順番に試せば、大抵の問題は解決します！\n\nテストやマイグレーションの意味は、動いたあとで覚えれば十分です✨",
                'published_at' => '2026-07-22 10:30:00',
                'tags' => ['laravel', 'php'],
            ],
        ];

        foreach ($articles as $articleData) {
            $author = User::query()
                ->where('username', $articleData['author'])
                ->firstOrFail();

            $article = $author->articles()->create([
                'title' => $articleData['title'],
                'body' => $articleData['body'],
                'published_at' => $articleData['published_at'],
            ]);

            $tagIds = Tag::query()
                ->whereIn('normalized_name', $articleData['tags'])
                ->pluck('id');

            $article->tags()->attach($tagIds);
        }
    }
}
