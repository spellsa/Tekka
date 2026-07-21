<?php
/*
    api.php
    アプリケーションのAPIエンドポイントを定義するルートファイル
    作成者：北 聖也
    作成日：2026年7月22日
*/

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UserController;

// 認証ルート
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::get('/user', [AuthController::class, 'user'])
    ->middleware('auth:sanctum');

Route::put('/user', [UserController::class, 'update'])
    ->middleware('auth:sanctum');

// ユーザールート
Route::get('/users/{id}/articles', [UserController::class, 'articles']);
Route::get('/users/{id}', [UserController::class, 'show']);

// 記事ルート
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);

Route::post('/articles', [ArticleController::class, 'store'])
    ->middleware('auth:sanctum');

Route::put('/articles/{id}', [ArticleController::class, 'update'])
    ->middleware('auth:sanctum');

Route::delete('/articles/{id}', [ArticleController::class, 'destroy'])
    ->middleware('auth:sanctum');

Route::post('/articles/{id}/evaluation', [EvaluationController::class, 'store'])
    ->middleware('auth:sanctum');

// タグルート
Route::get('/tag-articles', [TagController::class, 'articles']);

// 検索ルート
Route::get('/search', [SearchController::class, 'search']);
