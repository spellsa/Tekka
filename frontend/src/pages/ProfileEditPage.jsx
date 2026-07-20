import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import ErrorMessage from '../components/ErrorMessage';

// プロフィール編集画面
// PUT /api/user  { username, profile }
// 成功 → fetchUser() でAuthContext更新 → /users/{id} へ遷移
export default function ProfileEditPage() {
  // フォームの初期値はAuthContextから取得する（useState後にuseAuthを呼ぶため、初期値は空文字）
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      // プロフィールを更新する
      await api.users.updateProfile({ username, profile });
      // AuthContextのユーザー情報を最新に更新する
      await fetchUser();
      // 更新完了後、自分のユーザーページへ遷移する
      navigate(`/users/${user.id}`);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('認証が必要です。');
      } else if (err.response?.status === 422) {
        setError('入力内容に問題があります。');
      } else {
        setError(err.response?.data?.message || '予期しないエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  // AuthContextのユーザー情報でフォームを初期化する
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setProfile(user.profile || '');
    }
  }, [user]);

  return (
    <div>
      <h1>プロフィール編集</h1>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">ユーザー名</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={30}
          />
        </div>

        <div>
          <label htmlFor="profile">プロフィール</label>
          <textarea
            id="profile"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            maxLength={500}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '保存中…' : '保存'}
        </button>
      </form>
    </div>
  );
}
