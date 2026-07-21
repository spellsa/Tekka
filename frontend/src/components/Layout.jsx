/*
    Layout.jsx
    共通ヘッダーとページ表示領域を提供するレイアウトコンポーネント
    作成者：北 聖也
    作成日：2026年7月22日
*/

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 共通レイアウトコンポーネント
// ヘッダーとメインコンテンツ領域を提供する
export default function Layout() {
  const [keyword, setKeyword] = useState('');
  const [searchMode, setSearchMode] = useState('keyword');
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleSearch = (event) => {
    event.preventDefault();
    const normalizedKeyword = keyword.trim();

    if (!normalizedKeyword) {
      return;
    }

    if (searchMode === 'tag') {
      const params = new URLSearchParams({ tag: normalizedKeyword });
      navigate(`/tags?${params}`);
      return;
    }

    const params = new URLSearchParams({ q: normalizedKeyword });
    navigate(`/search?${params}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isAuthPage) {
    return (
      <div className="auth-shell">
        <main className="auth-main">
          <Link to="/articles" className="auth-brand" aria-label="Tekkaの記事一覧へ">Tekka</Link>
          <Outlet />
        </main>
      </div>
    );
  }

  let authNav;
  if (loading) {
    authNav = null;
  } else if (user) {
    authNav = (
      <>
        <Link to={`/users/${user.id}`} className="account-link">プロフィール</Link>
        <button type="button" className="text-button" onClick={handleLogout}>ログアウト</button>
      </>
    );
  } else {
    authNav = <Link to="/login" className="account-link">ログイン</Link>;
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/articles" className="site-brand" aria-label="Tekkaの記事一覧へ">Tekka</Link>

          <form className="search-form" onSubmit={handleSearch}>
            <label className="sr-only" htmlFor="site-search">記事を検索</label>
            <div className="search-form__field">
              <span className="search-form__icon" aria-hidden="true">⌕</span>
              <input
                id="site-search"
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={searchMode === 'tag' ? 'タグを入力' : 'キーワードを入力'}
              />
            </div>
            <div className="search-form__modes" role="group" aria-label="検索方法">
              <button
                type="button"
                className={searchMode === 'tag' ? 'is-selected' : ''}
                aria-pressed={searchMode === 'tag'}
                onClick={() => setSearchMode('tag')}
              >
                # タグ検索
              </button>
              <button
                type="button"
                className={searchMode === 'keyword' ? 'is-selected' : ''}
                aria-pressed={searchMode === 'keyword'}
                onClick={() => setSearchMode('keyword')}
              >
                フリーワード
              </button>
            </div>
          </form>

          <div className={`site-header__actions ${user ? 'is-authenticated' : ''}`}>
            <Link to="/articles/new" className="publish-link">投稿する</Link>
            {authNav}
          </div>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

    </div>
  );
}
