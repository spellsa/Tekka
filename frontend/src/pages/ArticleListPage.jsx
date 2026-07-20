import { useState, useEffect } from 'react';
import * as api from '../api';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

// 記事一覧画面（トップページ）
// GET /api/articles?page=N
// 表示条件: score >= -2 かつ 投稿者の user_score >= 91（API側でフィルタ済み）
export default function ArticleListPage() {
  const [articles, setArticles] = useState(null);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ページ番号が変わるたびに記事一覧を取得する
  useEffect(() => {
    let cancelled = false;

    const fetchArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.articles.list(page);
        if (!cancelled) {
          setArticles(response.data.data);
          setMeta(response.data.meta);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || '予期しないエラーが発生しました。');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchArticles();

    return () => { cancelled = true; };
  }, [page]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // 記事が0件の場合は空メッセージを表示する（APIは200 + 空配列を返す）
  if (articles !== null && articles.length === 0) {
    return (
      <div>
        <h1>記事一覧</h1>
        <p>記事がありません</p>
      </div>
    );
  }

  return (
    <div>
      <h1>記事一覧</h1>

      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {meta && <Pagination meta={meta} onPageChange={setPage} />}
    </div>
  );
}
