<?php

/*
    LoginRequest.php
    ログインリクエストのバリデーションを担当するクラス
    作成者：北 聖也
    作成日：2026年7月21日
*/

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;

class LoginRequest extends ApiFormRequest
{
    /**
     * ユーザーがこのリクエストを行う権限があるかどうかを判断する
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * リクエストに適用されるバリデーションルールを取得する
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string'],
        ];
    }
}
