<?php
/*
    UserArticlesRequest.php
    ユーザー別記事一覧の検索条件を検証するリクエストクラス
    作成者：北 聖也
    作成日：2026年7月22日
*/

namespace App\Http\Requests;

class UserArticlesRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
