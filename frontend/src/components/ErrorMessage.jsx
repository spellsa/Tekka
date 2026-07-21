// エラーメッセージを表示する共通コンポーネント
// message が null や falsy のときは何も描画しない
export default function ErrorMessage({ message, className = '' }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`error-message ${className}`} role="alert">
      <p>{message}</p>
    </div>
  );
}
