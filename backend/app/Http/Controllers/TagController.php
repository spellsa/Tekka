<?php

/*
    TagController.php
    タグに関するAPIの処理を担当するコントローラー
    作成者：北 聖也
    作成日：2026年7月21日
*/

namespace App\Http\Controllers;

use App\Http\Requests\TagArticlesRequest;
use App\Http\Resources\ArticleListResource;
use App\Models\Article;
use App\Models\Tag;
use App\Support\TagNormalizer;

class TagController extends Controller
{
    // 指定タグの記事一覧を取得する
    public function articles(TagArticlesRequest $request)
    {
        $validated = $request->validated();

        $normalizedName = TagNormalizer::normalizedName($validated['tag']);

        $tag = Tag::query()
            ->where('normalized_name', $normalizedName)
            ->first();

        if (! $tag) {
            return response()->json([
                'message' => '指定されたタグが見つかりません。',
            ], 404);
        }

        $articles = $tag->articles()
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
                'tag' => [
                    'id' => $tag->id,
                    'display_name' => $tag->display_name,
                    'normalized_name' => $tag->normalized_name,
                ]
            ]
        ]);
    }
}
