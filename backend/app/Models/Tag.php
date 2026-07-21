<?php
/*
    Tag.php
    記事に付与するタグデータと関連を扱うモデル
    作成者：北 聖也
    作成日：2026年7月22日
*/

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['display_name', 'normalized_name'])]
class Tag extends Model
{
    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class);
    }
}
