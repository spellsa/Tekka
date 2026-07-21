<?php
/*
    ApiFormRequest.php
    APIのバリデーションエラー形式を統一する親クラス
    作成者：北 聖也
    作成日：2026年7月21日
*/

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class ApiFormRequest extends FormRequest
{
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'message' => '入力内容に問題があります。',
        ], 422));
    }
}
