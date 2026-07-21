/*
    EvaluationButtons.jsx
    記事への高評価・低評価を操作するコンポーネント
    作成者：北 聖也
    作成日：2026年7月22日
*/

import { useState } from 'react';
import * as api from '../api';

// 高評価・低評価ボタン
// POST /api/articles/{id}/evaluation でトグル
// 成功レスポンスから article_score と current_user_evaluation を即時反映
export default function EvaluationButtons({ articleId, currentEvaluation, score, onEvaluationChange, disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  let highButtonClassName = 'article-vote__button';
  let lowButtonClassName = 'article-vote__button';

  if (currentEvaluation === 'high') {
    highButtonClassName += ' is-selected';
  }

  if (currentEvaluation === 'low') {
    lowButtonClassName += ' is-selected';
  }

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
    <div className="article-vote">
      <button
        type="button"
        className={highButtonClassName}
        onClick={() => handleEvaluate('high')}
        disabled={loading || disabled}
        aria-pressed={currentEvaluation === 'high'}
        aria-label="高評価する"
      >
        <span className="article-vote__icon article-vote__icon--up" aria-hidden="true" />
      </button>
      <output className="article-vote__score" aria-label={`現在のスコア: ${score}`}>{score}</output>
      <button
        type="button"
        className={lowButtonClassName}
        onClick={() => handleEvaluate('low')}
        disabled={loading || disabled}
        aria-pressed={currentEvaluation === 'low'}
        aria-label="低評価する"
      >
        <span className="article-vote__icon article-vote__icon--down" aria-hidden="true" />
      </button>
      {error && <p className="article-vote__error">{error}</p>}
    </div>
  );
}
