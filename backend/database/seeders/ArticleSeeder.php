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
