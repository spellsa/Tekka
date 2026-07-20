import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import TagList from '../components/TagList';
import EvaluationButtons from '../components/EvaluationButtons';

// 記事詳細画面
// GET /api/articles/{id}
// ログイン中なら current_user_evaluation を返す（未ログイン/未評価/投稿者本人は null）
export default function ArticleDetailPage() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // current_user_evaluation と article.score は評価APIのレスポンスで直接更新するため、useStateで保持
  const [articleScore, setArticleScore] = useState(null);
  const [currentUserEvaluation, setCurrentUserEvaluation] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // UTC日時を日本時間（JST）の文字列に変換する
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  };

  const handleEvaluationChange = (newEvaluation, newScore) => {
    setCurrentUserEvaluation(newEvaluation);
    setArticleScore(newScore);
  };

  // 削除ハンドラー
  const handleDelete = async () => {
    // 確認ダイアログでユーザーの意図を確認する
    if (!window.confirm('記事を削除してもよろしいですか？')) {
      return;
    }

    try {
      await api.articles.delete(id);
      navigate('/articles');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('この操作を行う権限がありません。');
      } else {
        setError(err.response?.data?.message || '予期しないエラーが発生しました。');
      }
    }
  };

  // 記事詳細を取得する。idが変わるたびに再実行
  useEffect(() => {
    let cancelled = false;

    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      setArticle(null);

      try {
        const response = await api.articles.detail(id);
        if (!cancelled) {
          const data = response.data.data;
          setArticle(data);
          // 評価ボタンの状態とスコアは初期値としてAPIレスポンスから設定し、その後は評価APIのレスポンスで直接更新する
          setArticleScore(data.score);
          setCurrentUserEvaluation(data.current_user_evaluation);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setError('指定された記事が見つかりません。');
          } else {
            setError(err.response?.data?.message || '予期しないエラーが発生しました。');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchArticle();

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  // 記事の取得に失敗した場合はエラーメッセージだけを表示する
  if (error && !article) {
    return (
      <div>
        <h1>エラー</h1>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div>
      <h1>{article.title}</h1>

      <p>
        <Link to={`/users/${article.author.id}`}>{article.author.username}</Link>
      </p>

      <p>投稿日時: {formatDate(article.published_at)}</p>
      {article.updated_at && <p>更新日時: {formatDate(article.updated_at)}</p>}

      <p>スコア: {articleScore}</p>

      <TagList tags={article.tags} />

      <ReactMarkdown skipHtml>{article.body}</ReactMarkdown>

      {/* 削除などの操作エラーは記事本文の下に表示する */}
      <ErrorMessage message={error} />

      {user && user.id !== article.author.id && (
        <EvaluationButtons
          articleId={id}
          currentEvaluation={currentUserEvaluation}
          onEvaluationChange={handleEvaluationChange}
        />
      )}

      {/* 編集・削除ボタンは投稿者本人だけに表示する */}
      {user?.id === article.author.id && (
        <>
          <Link to={`/articles/${id}/edit`}>編集</Link>
          <button onClick={handleDelete}>削除</button>
        </>
      )}
    </div>
  );
}
