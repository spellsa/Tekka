<?php
/*
    TagArticlesRequest.php
    タグ別記事一覧の検索条件を検証するリクエストクラス
    作成者：北 聖也
    作成日：2026年7月21日
*/

namespace App\Http\Requests;

use App\Support\TagNormalizer;

class TagArticlesRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // 検索用のタグ名を整える
    protected function prepareForValidation(): void
    {
        $tag = $this->input('tag');
        if (! is_string($tag)) {
            return;
        }

        $this->merge([
            'tag' => TagNormalizer::displayName($tag),
        ]);
    }

    public function rules(): array
    {
        return [
            'tag' => ['required', 'string', 'min:1', 'max:30'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
