<?php
/*
    SearchRequest.php
    記事検索の入力内容を検証するリクエストクラス
    作成者：北 聖也
    作成日：2026年7月21日
*/

namespace App\Http\Requests;

use Normalizer;

class SearchRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // 検索キーワードを整える
    protected function prepareForValidation(): void
    {
        $keyword = $this->input('q');

        if (! is_string($keyword)) {
            return;
        }

        $this->merge([
            'q' => $this->normalizeKeyword($keyword),
        ]);
    }

    public function rules(): array
    {
        return [
            'q' => ['required', 'string', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    // 検索に使用する文字列を正規化する
    private function normalizeKeyword(string $keyword): string
    {
        return trim(Normalizer::normalize(trim($keyword), Normalizer::FORM_KC));
    }
}
