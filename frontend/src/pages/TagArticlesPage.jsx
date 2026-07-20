import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../api';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

// タグ別記事一覧画面
// GET /api/tag-articles?tag=...&page=N
// meta.tag からタグ表示名を取得して見出しに使用（空配列でも meta.tag は返る）
export default function TagArticlesPage() {
  const [articles, setArticles] = useState(null);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');

  useEffect(() => {
    setPage(1);
  }, [tag]);

  useEffect(() => {
    // アンマウント後のsetStateを防ぐキャンセルフラグ（後述のクリーンアップで true に設定）
    let cancelled = false;

    // tag が null の場合は API を呼ばず、エラーメッセージを表示する
    if (!tag) {
      setLoading(false);
      setError(null);
      setArticles([]);
      setMeta(null);
      return;
    }

    const fetchArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.tags.articles(tag, page);
        if (!cancelled) {
          setArticles(response.data.data);
          setMeta(response.data.meta);
        }
      } catch (err) {
        if (!cancelled) {
          setArticles([]);
          setMeta(null);

          // タグが存在しても記事0件は200。タグ自体が存在しない場合のみ404
          if (err.response?.status === 404) {
            setError('指定されたタグが見つかりません。');
          } else if (err.response?.status === 422) {
            setError('入力内容に問題があります。');
          } else {
            setError(err.response?.data?.message || 'エラーが発生しました');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchArticles();

    // クリーンアップ: コンポーネントのアンマウント時にキャンセルフラグを立てる
    return () => { cancelled = true; };
  }, [tag, page]);

  // tag が null の場合（URLに?tag=...がない）
  if (!tag) {
    return (
      <div>
        <ErrorMessage message={'タグが指定されていません'} />
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  let articleListContent;
  if (articles !== null && articles.length === 0) {
    articleListContent = <p>このタグの記事はありません</p>;
  } else {
    articleListContent = (
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
      {/* meta.tag から正式な表示名を取得。記事0件でも meta.tag は必ず返る */}
      <h1>タグ: {meta?.tag?.display_name}</h1>

      {articleListContent}
    </div>
  );
}
