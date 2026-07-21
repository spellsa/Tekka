/*
    TagList.jsx
    タグ一覧をリンク付きで表示するコンポーネント
    作成者：北 聖也
    作成日：2026年7月22日
*/

import { Link } from 'react-router-dom';

// タグ一覧をリンク付きで表示する共通コンポーネント
export default function TagList({ tags }) {
  return tags.map((tag) => {
    // URLSearchParams を使用してクエリパラメータを正しくエンコードする
    const params = new URLSearchParams({ tag: tag.normalized_name }).toString();

    return (
      <Link to={`/tags?${params}`} key={tag.id}>
        {tag.display_name}
      </Link>
    );
  });
}
