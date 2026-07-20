import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 認証必須ページのガードコンポーネント
// 未認証時は /login へリダイレクト、認証済みなら子要素を表示
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // セッション確認中は何も表示しない
  if (loading) {
    return null;
  }

  // 未ログイン → ログイン画面へ
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
