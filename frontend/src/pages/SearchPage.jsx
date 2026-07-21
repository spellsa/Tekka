/*
    SearchPage.jsx
    キーワード検索結果を表示する画面
    作成者：北 聖也
    作成日：2026年7月22日
*/

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../api';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

// キーワード検索結果画面
// GET /api/search?q=...&page=N
// 空の検索キーワードは422エラー。クライアント側で事前にチェックしてAPIを呼ばない
export default function SearchPage() {
  const [articles, setArticles] = useState(null);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    // アンマウント後のsetStateを防ぐキャンセルフラグ（後述のクリーンアップで true に設定）
    let cancelled = false;

    // クエリがnull、空文字、または空白のみの場合は API を呼ばない
    if (!query || !query.trim()) {
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
        const response = await api.search.articles(query, page);
        if (!cancelled) {
          setArticles(response.data.data);
          setMeta(response.data.meta);
        }
      } catch (err) {
        if (!cancelled) {
          setArticles([]);
          setMeta(null);

          if (err.response?.status === 422) {
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
  }, [query, page]);

  // 検索キーワードが入力されていない場合
  if (!query || !query.trim()) {
    return (
      <div>
        <p>検索キーワードを入力してください</p>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  let searchResultContent;
  if (articles !== null && articles.length === 0) {
    searchResultContent = <p>検索結果はありません</p>;
  } else {
    searchResultContent = (
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
      <h1>検索結果: {query}</h1>

      {searchResultContent}
    </div>
  );
}
