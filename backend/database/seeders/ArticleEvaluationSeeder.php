<?php
/*
    ArticleEvaluationSeeder.php
    初期評価と記事・ユーザースコアを登録するSeeder
    作成者：北 聖也
    作成日：2026年7月22日
*/

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
            ['username' => 'alice', 'title' => '【完全保存版】PHPはechoだけでWeb開発できる！？最短でプロになる方法 🚀', 'value' => 'low'],
            ['username' => 'alice', 'title' => 'PHPの配列を全部覚えるだけで最強になれる件 😊', 'value' => 'low'],
            ['username' => 'alice', 'title' => 'エラーは全部var_dumpでOK！PHPデバッグの革命 🔥', 'value' => 'low'],
            ['username' => 'alice', 'title' => 'Processingで宇宙っぽい背景を作れば作品が完成する！🌌', 'value' => 'low'],
            ['username' => 'alice', 'title' => 'for文を回せばアートになる！Processing入門 🎨', 'value' => 'low'],
            ['username' => 'alice', 'title' => 'マウス座標を使えばインタラクティブ作品が量産できる✨', 'value' => 'low'],
            ['username' => 'alice', 'title' => 'C言語はポインタを使えば速い！たぶん！🚀', 'value' => 'low'],
            ['username' => 'alice', 'title' => 'mallocを使えばメモリは無限に使える！？C言語の裏技', 'value' => 'low'],
            ['username' => 'alice', 'title' => 'scanfだけで入力処理は完璧！C言語初心者の最短ルート', 'value' => 'low'],
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
