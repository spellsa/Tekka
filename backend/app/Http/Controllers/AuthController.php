<?php

/*
    AuthController.php
    ユーザー認証関連の処理を担当するコントローラー
    作成者：北 聖也
    作成日：2026年7月21日
*/

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // ユーザー登録
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
            ],
        ], 201);
    }

    // ログイン
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        $credentials = [
            'email' => strtolower($validated['email']),
            'password' => $validated['password'],
        ];

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'メールアドレスまたはパスワードが正しくありません。',
            ], 401);
        }

        $request->session()->regenerate();

        $user = $request->user();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'profile' => $user->profile,
                'score' => $user->score,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    // ログインユーザー情報取得
    public function user(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'profile' => $user->profile,
                'score' => $user->score,
            ],
        ]);
    }
}
