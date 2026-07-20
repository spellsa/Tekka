import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

// ユーザー登録画面
// POST /api/register → 成功時に自動ログイン → /articles へ遷移
export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();

  // 既にログイン済みなら記事一覧へリダイレクト
  if (!authLoading && user) {
    return <Navigate to="/articles" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    // パスワード確認用フィールドとの一致をAPI呼び出し前にチェック
    if (password !== passwordConfirmation) {
      setError('パスワードが一致しません。');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(username, email, password, passwordConfirmation);
      navigate('/articles');
    } catch (err) {
      if (err.response?.status === 422) {
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
      <h1>ユーザー登録</h1>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">ユーザー名</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={30}
            required
          />
        </div>

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
            minLength={8}
            required
          />
        </div>

        <div>
          <label htmlFor="password_confirmation">パスワード（確認）</label>
          <input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '登録中…' : '登録'}
        </button>
      </form>

      <p>
        <Link to="/login">ログインはこちら</Link>
      </p>
    </div>
  );
}
