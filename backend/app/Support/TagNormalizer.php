<?php
/*
    TagNormalizer.php
    タグ名を保存・検索用の形式へ統一する処理
    作成者：北 聖也
    作成日：2026年7月21日
*/

namespace App\Support;

use Normalizer;

class TagNormalizer
{
    // 表示用のタグ名を整える
    public static function displayName(string $tag): string
    {
        return trim(Normalizer::normalize(trim($tag), Normalizer::FORM_KC));
    }

    // 比較用のタグ名を生成する
    public static function normalizedName(string $tag): string
    {
        return mb_strtolower(self::displayName($tag));
    }
}
