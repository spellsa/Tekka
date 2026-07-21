/*
    client.js
    Laravel APIとの通信設定とCSRF Cookie取得を担当するモジュール
    作成者：北 聖也
    作成日：2026年7月22日
*/

import axios from 'axios';

const apiOrigin = import.meta.env.VITE_API_ORIGIN;

if (!apiOrigin) {
  throw new Error('VITE_API_ORIGINが設定されていません。');
}

// SanctumのSPA認証: CookieベースのセッションとXSRFトークンを自動送信
const client = axios.create({
  baseURL: `${apiOrigin}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401かつ/loginにいない場合はリダイレクト
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;

// 状態変更APIの前に必ず呼び、CSRF保護用のCookieを設定する
export function getCsrfCookie() {
  return axios.get(`${apiOrigin}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
}
