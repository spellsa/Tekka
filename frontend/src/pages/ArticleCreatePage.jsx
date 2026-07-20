import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';
import ErrorMessage from '../components/ErrorMessage';

// 記事投稿画面
// POST /api/articles { title, body, tags }
// 成功 → response.data.data.id で /articles/{id} へ遷移
export default function ArticleCreatePage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();

  // タグ入力をパースする: 改行区切りで分割し、各タグをトリムして空を除去
  const parseTags = (input) => {
    return input
      .split('\n')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

  // クライアント側でバリデーションを行う
  // APIを呼ぶ前に明らかな入力をチェックし、ユーザーに即時フィードバックを返す
  const validate = () => {
    const errors = {};

    if (title.length < 1 || title.length > 100) {
      errors.title = 'タイトルは1文字以上100文字以内で入力してください。';
    }

    if (body.length < 1 || body.length > 50000) {
      errors.body = '本文は1文字以上50000文字以内で入力してください。';
    }

    const tags = parseTags(tagsInput);
    if (tags.length > 5) {
      errors.tags = 'タグは5件以内で入力してください。';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // クライアント側バリデーションに引っかかったらAPIを呼ばない
    if (!validate()) {
      return;
    }

    const tags = parseTags(tagsInput);

    setLoading(true);
    setError(null);

    try {
      const response = await api.articles.create({ title, body, tags });
      // 作成した記事IDをレスポンスから取得し、詳細画面へ遷移する
      const articleId = response.data.data.id;
      navigate(`/articles/${articleId}`);
    } catch (err) {
      // 401: 認証切れ。ログイン画面へ促す
      if (err.response?.status === 401) {
        setError('認証が必要です。');
      // 422: サーバー側のバリデーションエラー
      } else if (err.response?.status === 422) {
        setError('入力内容に問題があります。');
      } else {
        setError(err.response?.data?.message || 'エラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>記事投稿</h1>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">タイトル</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
          />
          {validationErrors.title && <div>{validationErrors.title}</div>}
        </div>

        <div>
          <label htmlFor="body">本文</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={50000}
            required
          />
          {validationErrors.body && <div>{validationErrors.body}</div>}
        </div>

        <div>
          <label htmlFor="tags">タグ（1行につき1タグ）</label>
          <textarea
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="タグ名を1行に1つずつ入力"
          />
          {validationErrors.tags && <div>{validationErrors.tags}</div>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '投稿中…' : '投稿する'}
        </button>
      </form>
    </div>
  );
}
