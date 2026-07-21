// ページネーションコンポーネント
// 最初のページでは「前へ」を無効化し、最後のページでは「次へ」を無効化する
export default function Pagination({ meta, onPageChange }) {
  // 1ページしかない場合はページネーションを表示しない
  if (meta.last_page <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="記事一覧のページ送り">
      <button
        onClick={() => onPageChange(meta.current_page - 1)}
        disabled={meta.current_page <= 1}
      >
        前へ
      </button>
      <span className="pagination__status">{meta.current_page} / {meta.last_page}</span>
      <button
        onClick={() => onPageChange(meta.current_page + 1)}
        disabled={meta.current_page >= meta.last_page}
      >
        次へ
      </button>
    </nav>
  );
}
