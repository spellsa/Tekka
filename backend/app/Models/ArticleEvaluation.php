<?php
/*
    ArticleEvaluation.php
    記事への評価データと関連を扱うモデル
    作成者：北 聖也
    作成日：2026年7月22日
*/

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'article_id', 'value'])]
class ArticleEvaluation extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
