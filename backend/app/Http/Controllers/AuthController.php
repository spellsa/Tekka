<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'username' => $validated['username'],
            'email' => strtolower($validated['email']), // 大文字混じりのメールアドレスで登録されることを避ける
            'password' => $validated['password'],
        ]);

        Auth::login($user);

        $request->session()->regenerate();

        $user->refresh(); // ユーザー情報を最新の状態に更新

        return response()->json([
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'profile' => $user->profile,
                'score' => $user->score,
            ]
        ], 201);
    }
}
