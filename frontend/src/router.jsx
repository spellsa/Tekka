/*
    router.jsx
    アプリケーションの画面遷移を定義するルート設定
    作成者：北 聖也
    作成日：2026年7月22日
*/

import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ArticleListPage from './pages/ArticleListPage';
import ArticleCreatePage from './pages/ArticleCreatePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticleEditPage from './pages/ArticleEditPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import SearchPage from './pages/SearchPage';
import TagArticlesPage from './pages/TagArticlesPage';

// アプリケーションのルーティング定義
// レイアウトが必要なルートは Layout コンポーネントで囲む
export default function Router() {
  return (
    <Routes>
      {/* トップページ → 記事一覧へリダイレクト */}
      <Route path="/" element={<Navigate to="/articles" replace />} />

      {/* 共通レイアウトを適用するルート */}
      <Route element={<Layout />}>
        {/* 記事一覧 */}
        <Route path="/articles" element={<ArticleListPage />} />
        {/* 記事投稿（認証必須） */}
        <Route
          path="/articles/new"
          element={
            <ProtectedRoute>
              <ArticleCreatePage />
            </ProtectedRoute>
          }
        />
        {/* 記事詳細 */}
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        {/* 記事編集（認証必須） */}
        <Route
          path="/articles/:id/edit"
          element={
            <ProtectedRoute>
              <ArticleEditPage />
            </ProtectedRoute>
          }
        />
        {/* ログイン */}
        <Route path="/login" element={<LoginPage />} />
        {/* ユーザー登録 */}
        <Route path="/register" element={<RegisterPage />} />
        {/* ユーザーページ */}
        <Route path="/users/:id" element={<UserProfilePage />} />
        {/* プロフィール編集（認証必須） */}
        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          }
        />
        {/* キーワード検索 */}
        <Route path="/search" element={<SearchPage />} />
        {/* タグ別記事一覧 */}
        <Route path="/tags" element={<TagArticlesPage />} />
      </Route>
    </Routes>
  );
}
