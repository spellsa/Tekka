// ローディング中であることをユーザーに伝える共通コンポーネント
export default function Loading({ className = '' }) {
  return (
    <div className={`loading-state ${className}`} aria-live="polite">
      <p>記事を読み込んでいます。</p>
    </div>
  );
}
