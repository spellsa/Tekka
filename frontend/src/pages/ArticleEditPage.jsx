/*
    ArticleEditPage.jsx
    既存記事を編集する画面
    作成者：北 聖也
    作成日：2026年7月22日
*/

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../api';
import ArticleEditorForm from '../components/ArticleEditorForm';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

// 記事編集画面
// GET /api/articles/{id} で既存データ取得 → フォームに初期値設定
// PUT /api/articles/{id} { title, body, tags }
// 成功 → /articles/{id} へ遷移
export default function ArticleEditPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  // タグ入力をパースする: 改行区切りで分割し、各タグをトリムして空を除去
  const parseTags = (input) => {
    return input
      .split('\n')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  };

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

    if (!validate()) {
      return;
    }

    const tags = parseTags(tagsInput);

    setLoading(true);
    setError(null);

    try {
      await api.articles.update(id, { title, body, tags });
      navigate(`/articles/${id}`);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('認証が必要です。');
      } else if (err.response?.status === 403) {
        setError('この操作を行う権限がありません。');
      } else if (err.response?.status === 404) {
        setError('指定された記事が見つかりません。');
      } else if (err.response?.status === 422) {
        setError('入力内容に問題があります。');
      } else {
        setError(err.response?.data?.message || 'エラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  // マウント時に既存の記事データを取得し、フォームへ初期値としてセットする
  useEffect(() => {
    let cancelled = false;

    api.articles.detail(id)
      .then((response) => {
        if (cancelled) return;
        const article = response.data.data;
        setTitle(article.title);
        setBody(article.body);
        // APIから返ってくるタグは { display_name, normalized_name } の配列
        // display_name を取り出して改行区切りの文字列に変換する
        const tagNames = article.tags.map((tag) => tag.display_name);
        setTagsInput(tagNames.join('\n'));
      })
      .catch((err) => {
        if (cancelled) return;
        // 404: 記事が存在しないか論理削除済み
        if (err.response?.status === 404) {
          setError('指定された記事が見つかりません。');
        } else {
          setError(err.response?.data?.message || 'エラーが発生しました');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setFetchLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [id]);

  // 初期データ取得中はローディング表示
  if (fetchLoading) {
    return <Loading />;
  }

  // 初期データ取得に失敗した場合はエラーメッセージのみを表示し、空フォームを表示しない
  if (error) {
    return (
      <div>
        <h1>エラー</h1>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <section className="article-edit-page" aria-labelledby="article-edit-title">
      <header className="article-edit-page__heading">
        <h1 id="article-edit-title">記事編集</h1>
      </header>

      <ErrorMessage className="article-edit-page__error" message={error} />

      <ArticleEditorForm
        title={title}
        body={body}
        tagsInput={tagsInput}
        validationErrors={validationErrors}
        loading={loading}
        submitLabel={loading ? '更新中…' : '更新する'}
        cancelTo={`/articles/${id}`}
        onSubmit={handleSubmit}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        onTagsChange={setTagsInput}
      />
    </section>
  );
}
