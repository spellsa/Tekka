/*
    UserArticleListItem.jsx
    ユーザーページの記事一覧行と管理メニューを表示するコンポーネント
    作成者：北 聖也
    作成日：2026年7月22日
*/

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';

// ユーザーページ用の記事一覧行
export default function UserArticleListItem({ article, canManage, onDeleted }) {
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const date = new Date(article.published_at);
  const jstDate = date.toLocaleDateString('ja-JP');

  // メニュー外の操作で記事メニューを閉じる
  useEffect(() => {
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const closeMenuWithEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeMenu);
    document.addEventListener('keydown', closeMenuWithEscape);

    return () => {
      document.removeEventListener('pointerdown', closeMenu);
      document.removeEventListener('keydown', closeMenuWithEscape);
    };
  }, []);

  // 自分の記事を削除する
  const handleDelete = async () => {
    if (!window.confirm('記事を削除してもよろしいですか？')) {
      return;
    }

    setIsMenuOpen(false);
    setDeleting(true);
    setError(null);

    try {
      await api.articles.delete(article.id);
      onDeleted();
    } catch (err) {
      setError(err.response?.data?.message || '記事を削除できませんでした。');
      setDeleting(false);
    }
  };

  return (
    <article className="user-article-row">
      <div className="user-article-row__body">
        <h3>
          <Link to={`/articles/${article.id}`}>{article.title}</Link>
        </h3>
        <p className="user-article-row__excerpt">{article.excerpt}</p>
        <div className="user-article-row__meta">
          <span>スコア {article.score}</span>
          <time dateTime={article.published_at}>{jstDate}</time>
        </div>
      </div>

      {canManage && (
        <div className="article-action-menu" ref={menuRef}>
          <button
            type="button"
            className="article-action-menu__trigger"
            aria-label={`${article.title}の操作`}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ⋯
          </button>
          {isMenuOpen && (
            <div className="article-action-menu__items" role="menu">
              <Link to={`/articles/${article.id}/edit`} role="menuitem" onClick={() => setIsMenuOpen(false)}>編集</Link>
            <button type="button" onClick={handleDelete} disabled={deleting}>
              {deleting ? '削除中…' : '削除'}
            </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="user-article-row__error" role="alert">{error}</p>}
    </article>
  );
}
