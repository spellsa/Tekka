import { Link } from 'react-router-dom';
import TagList from './TagList';

// 記事一覧で各記事を表示するカードコンポーネント
// タイトル、概要、スコア、投稿者、投稿日時、タグ一覧を表示する
export default function ArticleCard({ article }) {
  // ISO 8601 UTC を日本時間（JST）で表示する
  const date = new Date(article.published_at);
  const jstDate = date.toLocaleDateString('ja-JP');

  return (
    <div>
      <Link to={`/articles/${article.id}`}>{article.title}</Link>
      <p>{article.excerpt}</p>
      <p>{article.score}</p>
      <Link to={`/users/${article.author.id}`}>{article.author.username}</Link>
      <p>{jstDate}</p>
      <TagList tags={article.tags} />
    </div>
  );
}
