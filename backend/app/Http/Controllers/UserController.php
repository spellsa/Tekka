<?php
/*
    UserController.php
    ユーザーに関するAPIの処理を担当するコントローラー
    作成者：北 聖也
    作成日：2026年7月22日
*/

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UserArticlesRequest;
use App\Http\Resources\ArticleListResource;
use App\Models\Article;
use App\Models\User;

class UserController extends Controller
{
    // 公開プロフィールを取得する
    public function show(int $id)
    {
        $user = User::query()->find($id);

        if (! $user) {
            return response()->json([
                'message' => '指定されたユーザーが見つかりません。',
            ], 404);
        }

        return response()->json([
            'data' => $this->userData($user),
        ]);
    }

    // ログインユーザーのプロフィールを更新する
    public function update(UpdateUserRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->update([
            'username' => $validated['username'],
            'profile' => $validated['profile'],
        ]);

        return response()->json([
            'data' => $this->userData($user),
        ]);
    }

    // 指定ユーザーの記事一覧を取得する
    public function articles(UserArticlesRequest $request, int $id)
    {
        $user = User::query()->find($id);

        if (! $user) {
            return response()->json([
                'message' => '指定されたユーザーが見つかりません。',
            ], 404);
        }

        $articles = $user->articles()
            ->with([
                'user:id,username',
                'tags:id,display_name,normalized_name',
            ])
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

    // APIで公開するユーザー情報を整える
    private function userData(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'profile' => $user->profile,
            'score' => $user->score,
        ];
    }
}
