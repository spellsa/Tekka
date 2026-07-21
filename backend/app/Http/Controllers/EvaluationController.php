<?php
/*
    EvaluationController.php
    記事評価とスコア更新に関するAPIの処理を担当するコントローラー
    作成者：北 聖也
    作成日：2026年7月22日
*/

namespace App\Http\Controllers;

use App\Http\Requests\EvaluationRequest;
use App\Models\Article;
use App\Models\ArticleEvaluation;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EvaluationController extends Controller
{
    // 記事への評価を切り替える
    public function store(EvaluationRequest $request, int $id)
    {
        $article = Article::query()->with('user')->find($id);

        if (! $article) {
            return response()->json([
                'message' => '指定された記事が見つかりません。',
            ], 404);
        }

        $user = $request->user();

        if ($article->user_id === $user->id) {
            return response()->json([
                'message' => '自分の記事を評価することはできません。',
            ], 403);
        }

        $validated = $request->validated();

        $data = DB::transaction(function () use ($article, $user, $validated) {
            $currentUserEvaluation = $this->toggleEvaluation(
                $article,
                $user,
                $validated['value'],
            );
            $articleScore = $this->recalculateArticleScore($article);
            $this->recalculateUserScore($article->user);

            return [
                'article_id' => $article->id,
                'current_user_evaluation' => $currentUserEvaluation,
                'article_score' => $articleScore,
            ];
        });

        return response()->json([
            'data' => $data,
        ]);
    }

    // 現在の評価に応じて評価状態を変更する
    private function toggleEvaluation(Article $article, User $user, string $value): ?string
    {
        $evaluation = $article->evaluations()
            ->where('user_id', $user->id)
            ->first();

        if (! $evaluation) {
            $article->evaluations()->create([
                'user_id' => $user->id,
                'value' => $value,
            ]);

            return $value;
        }

        if ($evaluation->value === $value) {
            $evaluation->delete();

            return null;
        }

        $evaluation->update([
            'value' => $value,
        ]);

        return $value;
    }

    // 評価レコードから記事スコアを再計算する
    private function recalculateArticleScore(Article $article): int
    {
        $highCount = $article->evaluations()
            ->where('value', 'high')
            ->count();
        $lowCount = $article->evaluations()
            ->where('value', 'low')
            ->count();
        $score = $highCount - $lowCount;

        $article->score = $score;
        $article->save();

        return $score;
    }

    // 投稿者のスコアを再計算する
    private function recalculateUserScore(User $user): void
    {
        $userArticleScoreTotal = $user->articles()
            ->get()
            ->sum(function (Article $article) {
                return max(-3, min(3, $article->score));
            });

        $user->score = 100 + $userArticleScoreTotal;
        $user->save();
    }
}
