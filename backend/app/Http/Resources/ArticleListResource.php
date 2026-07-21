<?php

/*
    ArticleListResource.php
    記事一覧の表示用データを整形するリソース
    作成者：北 聖也
    作成日：2026年7月21日
*/

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleListResource extends JsonResource
{
    // 一覧画面用の記事データを返す
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'excerpt' => $this->makeExcerpt($this->body, 200),
            'score' => $this->score,
            'published_at' => $this->published_at->toISOString(),
            'author' => [
                'id' => $this->user->id,
                'username' => $this->user->username,
            ],
            'tags' => $this->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'display_name' => $tag->display_name,
                    'normalized_name' => $tag->normalized_name,
                ];
            })->values(),
        ];
    }

    // 記事の抜粋を抽出する
    private function makeExcerpt(string $content, int $length): string
    {
        $trimmed = trim(preg_replace('/\s+/u', ' ', $content));

        if (mb_strlen($trimmed) > $length) {
            return mb_substr($trimmed, 0, $length) . '…';
        }

        return $trimmed;
    }
}
