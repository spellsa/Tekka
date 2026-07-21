<?php
/*
    UpdateUserRequest.php
    プロフィール更新の入力内容を検証するリクエストクラス
    作成者：北 聖也
    作成日：2026年7月22日
*/

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateUserRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // 空のプロフィールを未設定として扱う
    protected function prepareForValidation(): void
    {
        if ($this->input('profile') !== '') {
            return;
        }

        $this->merge([
            'profile' => null,
        ]);
    }

    public function rules(): array
    {
        $user = $this->user();
        $usernameRule = Rule::unique('users', 'username');

        if ($user) {
            $usernameRule->ignore($user->id);
        }

        return [
            'username' => ['required', 'string', 'min:3', 'max:30', $usernameRule],
            'profile' => ['present', 'nullable', 'string', 'max:500'],
        ];
    }
}
