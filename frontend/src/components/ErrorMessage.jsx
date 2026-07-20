// エラーメッセージを表示する共通コンポーネント
// message が null や falsy のときは何も描画しない
export default function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return <p>{message}</p>;
}
