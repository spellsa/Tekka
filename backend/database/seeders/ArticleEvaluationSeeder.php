<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Seeder;

class ArticleEvaluationSeeder extends Seeder
{
    /**
     * Seed evaluations, then calculate the denormalized article and user scores.
     */
    public function run(): void
    {
        $evaluations = [
            ['username' => 'bob', 'title' => 'LaravelでSPA認証を始める', 'value' => 'high'],
            ['username' => 'charlie', 'title' => 'LaravelでSPA認証を始める', 'value' => 'high'],
            ['username' => 'alice', 'title' => 'Reactコンポーネントを分割する考え方', 'value' => 'low'],
            ['username' => 'charlie', 'title' => 'Reactコンポーネントを分割する考え方', 'value' => 'low'],
            ['username' => 'alice', 'title' => 'MySQLのインデックス入門', 'value' => 'high'],
            ['username' => 'bob', 'title' => 'MySQLのインデックス入門', 'value' => 'low'],
            ['username' => 'bob', 'title' => 'Form Requestで入力を整理する', 'value' => 'high'],
            ['username' => 'charlie', 'title' => 'Form Requestで入力を整理する', 'value' => 'low'],
        ];

        foreach ($evaluations as $evaluationData) {
            $user = User::query()
                ->where('username', $evaluationData['username'])
                ->firstOrFail();
            $article = Article::query()
                ->where('title', $evaluationData['title'])
                ->firstOrFail();

            $article->evaluations()->create([
                'user_id' => $user->id,
                'value' => $evaluationData['value'],
            ]);
        }

        $this->recalculateScores();
    }

    private function recalculateScores(): void
    {
        Article::query()->with('evaluations')->each(function (Article $article): void {
            $score = $article->evaluations->sum(
                fn ($evaluation): int => $evaluation->value === 'high' ? 1 : -1,
            );

            $article->forceFill(['score' => $score])->save();
        });

        User::query()->with('articles')->each(function (User $user): void {
            $score = 100 + $user->articles->sum(
                fn (Article $article): int => max(-3, min(3, $article->score)),
            );

            $user->forceFill(['score' => $score])->save();
        });
    }
}
