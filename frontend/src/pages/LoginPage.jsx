import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

// ログイン画面
// POST /api/login → 成功時にAuthContext更新 → /articles へ遷移
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();

  // 既にログイン済みなら記事一覧へリダイレクト
  if (!authLoading && user) {
    return <Navigate to="/articles" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/articles');
    } catch (err) {
      if (err.response?.status === 401) {
        setError(err.response?.data?.message);
      } else if (err.response?.status === 422) {
        setError('入力内容に問題があります。');
      } else {
        setError('予期しないエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>ログイン</h1>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'ログイン中…' : 'ログイン'}
        </button>
      </form>

      <p>
        <Link to="/register">新規登録はこちら</Link>
      </p>
    </div>
  );
}
