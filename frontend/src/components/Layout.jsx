import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 共通レイアウトコンポーネント
// ヘッダーとメインコンテンツ領域を提供する
export default function Layout() {
  const [keyword, setKeyword] = useState('');
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    // 検索フォーム: キーワードをURLエンコードして /search?q=... へ遷移
    const params = new URLSearchParams({ q: keyword });
    navigate(`/search?${params}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  let authNav;
  if (loading) {
    authNav = null;
  } else if (user) {
    authNav = (
      <>
        <Link to={`/users/${user.id}`}>{user.username}</Link>
        <button onClick={handleLogout}>ログアウト</button>
      </>
    );
  } else {
    authNav = <Link to="/login">ログイン</Link>;
  }

  return (
    <>
      <header>
        {/* サイトタイトル */}
        <Link to="/articles">Tekka</Link>

        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="キーワード検索"
          />
          <button type="submit">検索</button>
        </form>

        {authNav}
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}
