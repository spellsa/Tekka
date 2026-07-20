import axios from 'axios';

// SanctumのSPA認証: CookieベースのセッションとXSRFトークンを自動送信
const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;

// 状態変更APIの前に必ず呼び、CSRF保護用のCookieを設定する
export function getCsrfCookie() {
  return axios.get('/sanctum/csrf-cookie', {
    baseURL: '',
  });
}
