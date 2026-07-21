<?php
/*
    ArticleController.php
    記事に関するAPIの処理を担当するコントローラー
    作成者：北 聖也
    作成日：2026年7月21日
*/

namespace App\Http\Controllers;

use App\Http\Requests\ArticleRequest;
use App\Http\Resources\ArticleListResource;
use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use App\Support\TagNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArticleController extends Controller
{
    // 公開記事の一覧を取得する
    public function index(Request $request)
    {
        $articles = Article::query()
            ->with([
                'user:id,username',
                'tags:id,display_name,normalized_name',
            ])
            ->where('score', '>=', -2)
            ->whereHas('user', function ($query) {
                $query->where('score', '>=', 91);
            })
            ->latest()
            ->paginate(20);

        // 記事データを整形する
        $data = $articles->getCollection()->map(function (Article $article) use ($request) {
            $resource = new ArticleListResource($article);
            return $resource->toArray($request);
        })->values();

        // ページネーション情報を含めてレスポンスを返す
        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'per_page' => $articles->perPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    // 記事詳細を取得する
    public function show(Request $request, int $id)
    {
        $article = Article::query()
            ->with([
                'user:id,username',
                'tags:id,display_name,normalized_name',
            ])
            ->find($id);

        if (! $article) {
            return response()->json([
                'message' => '指定された記事が見つかりません。',
            ], 404);
        }

        $currentUser = $request->user();
        $currentUserEvaluation = null;
        $updatedAt = null;

        if ($article->updated_at) {
            $updatedAt = $article->updated_at->toISOString();
        }

        if ($currentUser && $currentUser->id !== $article->user_id) {
            $currentUserEvaluation = $article->evaluations()
                ->where('user_id', $currentUser->id)
                ->value('value');
        }

        return response()->json([
            'data' => [
                'id' => $article->id,
                'title' => $article->title,
                'body' => $article->body,
                'score' => $article->score,
                'published_at' => $article->published_at->toISOString(),
                'updated_at' => $updatedAt,
                'author' => [
                    'id' => $article->user->id,
                    'username' => $article->user->username,
                ],
                'tags' => $article->tags->map(function (Tag $tag) {
                    return [
                        'id' => $tag->id,
                        'display_name' => $tag->display_name,
                        'normalized_name' => $tag->normalized_name,
                    ];
                })->values(),
                'current_user_evaluation' => $currentUserEvaluation,
            ],
        ]);
    }

    // 記事を投稿する
    public function store(ArticleRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $article = DB::transaction(function () use ($validated, $user) {
            $article = $user->articles()->create([
                'title' => $validated['title'],
                'body' => $validated['body'],
                'published_at' => now(),
            ]);

            $article->tags()->sync($this->tagIds($validated['tags']));

            return $article;
        });

        return response()->json([
            'data' => [
                'id' => $article->id,
            ],
        ], 201);
    }

    // 記事を更新する
    public function update(ArticleRequest $request, int $id)
    {
        $article = Article::query()->find($id);

        if (! $article) {
            return response()->json([
                'message' => '指定された記事が見つかりません。',
            ], 404);
        }

        if ($article->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'この操作を行う権限がありません。',
            ], 403);
        }

        $validated = $request->validated();

        DB::transaction(function () use ($article, $validated) {
            $article->update([
                'title' => $validated['title'],
                'body' => $validated['body'],
            ]);

            $article->tags()->sync($this->tagIds($validated['tags']));
        });

        return response()->json([
            'data' => [
                'id' => $article->id,
            ],
        ]);
    }

    // 記事を論理削除する
    public function destroy(Request $request, int $id)
    {
        $article = Article::query()->find($id);

        if (! $article) {
            return response()->json([
                'message' => '指定された記事が見つかりません。',
            ], 404);
        }

        if ($article->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'この操作を行う権限がありません。',
            ], 403);
        }

        DB::transaction(function () use ($article) {
            $article->delete();
            $this->recalculateUserScore($article->user);
        });

        return response()->noContent();
    }

    // タグ名から関連付けるタグIDを取得する
    private function tagIds(array $tags): array
    {
        return array_map(function (string $tag) {
            $displayName = TagNormalizer::displayName($tag);
            $normalizedName = TagNormalizer::normalizedName($tag);

            return Tag::query()->firstOrCreate(
                ['normalized_name' => $normalizedName],
                ['display_name' => $displayName],
            )->id;
        }, $tags);
    }

    // 投稿者のスコアを再計算する
    private function recalculateUserScore(User $user): void
    {
        $articleScore = $user->articles()
            ->get()
            ->sum(function (Article $article) {
                return max(-3, min(3, $article->score));
            });

        $user->update([
            'score' => 100 + $articleScore,
        ]);
    }
}
