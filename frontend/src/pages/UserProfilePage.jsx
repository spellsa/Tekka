/*
    UserProfilePage.jsx
    ユーザー情報と投稿記事を表示する画面
    作成者：北 聖也
    作成日：2026年7月22日
*/

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import UserArticleListItem from '../components/UserArticleListItem';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

// ユーザーページ
// プロフィール + 投稿記事一覧
// ユーザーページではスコア非表示判定なし（全記事表示、論理削除のみ除外）
export default function UserProfilePage() {
  // プロフィール状態
  const [profileData, setProfileData] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // 記事一覧状態
  const [articles, setArticles] = useState(null);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isScoreVisible, setIsScoreVisible] = useState(false);

  const { user } = useAuth();
  const { id } = useParams();

  // ユーザーID変更時にプロフィール取得とページ番号リセットを同時に行う
  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const response = await api.users.profile(id);
        if (!cancelled) {
          setProfileData(response.data.data);
          setProfileError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setProfileError(
            err.response?.data?.message || '予期しないエラーが発生しました。',
          );
          setProfileData(null);
        }
      }
    };

    setPage(1);
    setProfileData(null);
    setProfileError(null);
    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [id, refreshKey]);

  // 記事一覧を取得する。ページ番号が変わったときも再取得する
  useEffect(() => {
    let cancelled = false;

    const fetchArticles = async () => {
      setArticlesLoading(true);
      setArticlesError(null);

      try {
        const response = await api.users.articles(id, page);
        if (!cancelled) {
          setArticles(response.data.data);
          setMeta(response.data.meta);
        }
      } catch (err) {
        if (!cancelled) {
          setArticlesError(
            err.response?.data?.message || '記事の取得に失敗しました。',
          );
          setArticles([]);
          setMeta(null);
        }
      } finally {
        if (!cancelled) {
          setArticlesLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      cancelled = true;
    };
  }, [id, page, refreshKey]);

  // エラー（404） — プロフィールが取得できなかった場合
  if (profileError) {
    return <ErrorMessage className="user-profile-page" message={profileError} />;
  }

  // プロフィール未取得
  if (!profileData) {
    return <Loading />;
  }

  // 自分のユーザーページかどうか
  const isOwnProfile = user?.id === profileData.id;
  let scoreMarker = '▸';
  let scoreContent = null;

  if (isScoreVisible) {
    scoreMarker = '▾';
    scoreContent = (
      <div className="profile-score__content">
        <strong>{profileData.score}</strong>
        <p>投稿記事の評価をもとにした目安です。</p>
      </div>
    );
  }

  // 記事削除後に一覧とスコアを更新する
  const handleArticleDeleted = () => {
    if (articles?.length === 1 && page > 1) {
      setPage(page - 1);
    }

    setRefreshKey((currentRefreshKey) => currentRefreshKey + 1);
  };

  let articlesContent;
  if (articlesLoading) {
    articlesContent = <Loading />;
  } else if (articlesError) {
    articlesContent = <div>{articlesError}</div>;
  } else if (articles !== null && articles.length === 0) {
    articlesContent = <p>投稿記事はありません</p>;
  } else {
    articlesContent = (
      <>
        {articles.map((article) => (
          <UserArticleListItem
            key={article.id}
            article={article}
            canManage={isOwnProfile}
            onDeleted={handleArticleDeleted}
          />
        ))}
        <Pagination meta={meta} onPageChange={setPage} />
      </>
    );
  }

  return (
    <section className="user-profile-page" aria-labelledby="profile-page-title">
      <header className="user-profile-page__heading">
        <h1 id="profile-page-title">{profileData.username}</h1>
      </header>

      <div className="user-profile-page__content">
        <aside className="user-profile-page__summary" aria-label={`${profileData.username}のプロフィール`}>
          <div className="profile-score">
            <button
              type="button"
              className="profile-score__toggle"
              aria-expanded={isScoreVisible}
              onClick={() => setIsScoreVisible(!isScoreVisible)}
            >
              <span aria-hidden="true">{scoreMarker}</span>
              ユーザースコア
            </button>
            {scoreContent}
          </div>

          <section className="profile-description" aria-labelledby="profile-description-title">
            <h3 id="profile-description-title">プロフィール文</h3>
            <p>{profileData.profile || 'プロフィール文はありません。'}</p>
          </section>

          {isOwnProfile && (
            <Link to="/settings/profile" className="profile-edit-link">プロフィールを編集</Link>
          )}
        </aside>

        <section className="user-profile-page__articles" aria-labelledby="profile-articles-title">
          <h2 id="profile-articles-title">投稿記事</h2>
          <div className="user-profile-page__article-list">
            {articlesContent}
          </div>
        </section>
      </div>
    </section>
  );
}
