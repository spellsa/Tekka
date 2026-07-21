<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TagController;

// 認証ルート
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::get('/user', [AuthController::class, 'user'])
    ->middleware('auth:sanctum');

// 記事ルート
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);

Route::post('/articles', [ArticleController::class, 'store'])
    ->middleware('auth:sanctum');

Route::put('/articles/{id}', [ArticleController::class, 'update'])
    ->middleware('auth:sanctum');

Route::delete('/articles/{id}', [ArticleController::class, 'destroy'])
    ->middleware('auth:sanctum');

// タグルート
Route::get('/tag-articles', [TagController::class, 'articles']);

// 検索ルート
Route::get('/search', [SearchController::class, 'search']);
