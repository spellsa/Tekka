import { Link } from 'react-router-dom';
import TagList from './TagList';

// 記事一覧で各記事を表示するカードコンポーネント
// タイトル、概要、スコア、投稿者、投稿日時、タグ一覧を表示する
export default function ArticleCard({ article }) {
  // ISO 8601 UTC を日本時間（JST）で表示する
  const date = new Date(article.published_at);
  const jstDate = date.toLocaleDateString('ja-JP');

  return (
    <article className="article-row">
      <div className="article-row__content">
        <div className="article-row__tags" aria-label="タグ">
          <TagList tags={article.tags} />
        </div>
        <h2>
          <Link to={`/articles/${article.id}`}>{article.title}</Link>
        </h2>
        <p className="article-row__excerpt">{article.excerpt}</p>
      </div>
      <aside className="article-row__meta" aria-label="記事情報">
        <span className="article-score">{article.score}</span>
        <div>
          <Link to={`/users/${article.author.id}`} className="article-author">{article.author.username}</Link>
          <time dateTime={article.published_at}>{jstDate}</time>
        </div>
      </aside>
    </article>
  );
}
