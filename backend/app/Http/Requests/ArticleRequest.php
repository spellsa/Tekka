<?php
/*
    ArticleRequest.php
    記事投稿・更新の入力内容を検証するリクエストクラス
    作成者：北 聖也
    作成日：2026年7月21日
*/

namespace App\Http\Requests;

use App\Support\TagNormalizer;
use Illuminate\Contracts\Validation\Validator;

class ArticleRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // 投稿・更新の入力を整える
    protected function prepareForValidation(): void
    {
        $tags = $this->input('tags');

        if (! is_array($tags)) {
            return;
        }

        $this->merge([
            'tags' => array_map(function ($tag) {
                if (is_string($tag)) {
                    return TagNormalizer::displayName($tag);
                }

                return $tag;
            }, $tags),
        ]);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:1', 'max:100'],
            'body' => ['required', 'string', 'min:1', 'max:50000'],
            'tags' => ['required', 'array', 'max:5'],
            'tags.*' => ['string', 'min:1', 'max:30'],
        ];
    }

    // 通常のバリデーションに加えてタグ名の整合性を確認する
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $tags = $this->input('tags');

            if (! is_array($tags)) {
                return;
            }

            $normalizedNames = [];

            foreach ($tags as $tag) {
                if (! is_string($tag)) {
                    continue;
                }

                $normalizedName = TagNormalizer::normalizedName($tag);

                if (in_array($normalizedName, $normalizedNames, true)) {
                    $validator->errors()->add('tags', '正規化後に重複するタグは指定できません。');

                    return;
                }

                $normalizedNames[] = $normalizedName;
            }
        });
    }
}
