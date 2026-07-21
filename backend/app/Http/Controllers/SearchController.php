<?php
/*
    SearchController.php
    記事検索APIの処理を担当するコントローラー
    作成者：北 聖也
    作成日：2026年7月21日
*/

namespace App\Http\Controllers;

use App\Http\Requests\SearchRequest;
use App\Http\Resources\ArticleListResource;
use App\Models\Article;

class SearchController extends Controller
{
    // キーワードで記事を検索する
    public function search(SearchRequest $request)
    {
        $validated = $request->validated();
        $pattern = '%'.$this->escapeLike($validated['q']).'%';

        $articles = Article::query()
            ->with([
                'user:id,username',
                'tags:id,display_name,normalized_name',
            ])
            ->where(function ($query) use ($pattern) {
                $query->where('title', 'like', $pattern)
                    ->orWhere('body', 'like', $pattern);
            })
            ->where('score', '>=', -2)
            ->whereHas('user', function ($query) {
                $query->where('score', '>=', 91);
            })
            ->latest()
            ->paginate(20);

        $data = $articles->getCollection()->map(function (Article $article) use ($request) {
            $resource = new ArticleListResource($article);

            return $resource->toArray($request);
        })->values();

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

    // LIKE検索用の記号を文字として扱う
    private function escapeLike(string $keyword): string
    {
        return str_replace(
            ['\\', '%', '_'],
            ['\\\\', '\\%', '\\_'],
            $keyword,
        );
    }
}
