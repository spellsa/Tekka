/*
    ProfileEditPage.jsx
    自分のプロフィールを編集する画面
    作成者：北 聖也
    作成日：2026年7月22日
*/

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import ErrorMessage from '../components/ErrorMessage';

// プロフィール編集画面
// PUT /api/user  { username, profile }
// 成功 → fetchUser() でAuthContext更新 → /users/{id} へ遷移
export default function ProfileEditPage() {
  const { user, fetchUser } = useAuth();
  // 認証済みユーザーの現在値を、フォームの初期値として使う
  const [username, setUsername] = useState(user.username || '');
  const [profile, setProfile] = useState(user.profile || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <section className="profile-edit-page" aria-labelledby="profile-edit-title">
      <header className="profile-edit-page__heading">
        <h1 id="profile-edit-title">プロフィール編集</h1>
      </header>

      <ErrorMessage className="profile-edit-page__error" message={error} />

      <form className="profile-edit-form" onSubmit={handleSubmit}>
        <div className="profile-edit-form__field">
          <label htmlFor="username">
            ユーザー名
            <span className="profile-edit-form__hint">3〜30文字</span>
          </label>
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

        <div className="profile-edit-form__field">
          <label htmlFor="profile">
            プロフィール文
            <span className="profile-edit-form__hint">{profile.length} / 500</span>
          </label>
          <textarea
            id="profile"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="profile-edit-form__actions">
          <button className="profile-edit-form__submit" type="submit" disabled={loading}>
            {loading ? '保存中…' : '保存'}
          </button>
          <Link to={`/users/${user.id}`} className="profile-edit-form__cancel">キャンセル</Link>
        </div>
      </form>
    </section>
  );
}
