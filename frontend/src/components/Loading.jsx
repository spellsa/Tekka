/*
    Loading.jsx
    読み込み中の状態を表示するコンポーネント
    作成者：北 聖也
    作成日：2026年7月22日
*/

// ローディング中であることをユーザーに伝える共通コンポーネント
export default function Loading({ className = '' }) {
  return (
    <div className={`loading-state ${className}`} aria-live="polite">
      <p>記事を読み込んでいます。</p>
    </div>
  );
}
