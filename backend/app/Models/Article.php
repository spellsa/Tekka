<?php
/*
    Article.php
    記事データと関連を扱うモデル
    作成者：北 聖也
    作成日：2026年7月22日
*/

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['title', 'body', 'published_at'])]
class Article extends Model
{
    use SoftDeletes;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(ArticleEvaluation::class);
    }

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }
}
