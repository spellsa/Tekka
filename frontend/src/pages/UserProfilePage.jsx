import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';

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
  }, [id]);

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
  }, [id, page]);

  // エラー（404） — プロフィールが取得できなかった場合
  if (profileError) {
    return <div>{profileError}</div>;
  }

  // プロフィール未取得
  if (!profileData) {
    return <Loading />;
  }

  // 自分のユーザーページかどうか
  const isOwnProfile = user?.id === profileData.id;

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
          <ArticleCard key={article.id} article={article} />
        ))}
        <Pagination meta={meta} onPageChange={setPage} />
      </>
    );
  }

  return (
    <div>
      {/* プロフィールセクション */}
      <h1>{profileData.username}</h1>
      <p>ユーザースコア: {profileData.score}</p>
      <p>{profileData.profile ?? 'プロフィール文はありません'}</p>
      {isOwnProfile && <Link to="/settings/profile">プロフィールを編集</Link>}

      {/* 記事一覧セクション */}
      <h2>投稿記事</h2>
      {articlesContent}
    </div>
  );
}
