import { useState } from 'react';
import * as api from '../api';

// 高評価・低評価ボタン
// POST /api/articles/{id}/evaluation でトグル
// 成功レスポンスから article_score と current_user_evaluation を即時反映
export default function EvaluationButtons({ articleId, currentEvaluation, onEvaluationChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEvaluate = async (value) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.evaluations.toggle(articleId, value);
      onEvaluationChange(
        response.data.data.current_user_evaluation,
        response.data.data.article_score,
      );
    } catch (err) {
      if (err.response?.status === 401) {
        setError('ログインしてください');
      } else if (err.response?.status === 403) {
        setError('自分の記事を評価することはできません。');
      } else if (err.response?.status === 422) {
        setError('入力内容に問題があります。');
      } else {
        setError('予期しないエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => handleEvaluate('high')}
        disabled={loading}
        aria-pressed={currentEvaluation === 'high'}
      >
        高評価{currentEvaluation === 'high' && ' (選択中)'}
      </button>
      <button
        onClick={() => handleEvaluate('low')}
        disabled={loading}
        aria-pressed={currentEvaluation === 'low'}
      >
        低評価{currentEvaluation === 'low' && ' (選択中)'}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
