<?php
/*
    EvaluationRequest.php
    記事評価の入力内容を検証するリクエストクラス
    作成者：北 聖也
    作成日：2026年7月22日
*/

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class EvaluationRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'value' => ['required', 'string', Rule::in(['high', 'low'])],
        ];
    }
}
