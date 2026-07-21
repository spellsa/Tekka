/*
    AuthContext.jsx
    ログインユーザーの認証状態を共有するContext
    作成者：北 聖也
    作成日：2026年7月22日
*/

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ログイン成功時にユーザー情報を保持する
  const login = useCallback(async (email, password) => {
    const response = await api.auth.login({ email, password });
    setUser(response.data.data);
  }, []);

  // 登録成功時にユーザー情報を保持する（自動ログイン）
  const register = useCallback(async (username, email, password, password_confirmation) => {
    const response = await api.auth.register({
      username, email, password, password_confirmation,
    });
    setUser(response.data.data);
  }, []);

  // ログアウト時に保持していたユーザー情報を破棄する
  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  // 現在のユーザー情報をサーバーから再取得する
  const fetchUser = useCallback(async () => {
    const response = await api.auth.getUser();
    setUser(response.data.data);
  }, []);

  // マウント時に既存のセッションからログイン状態を復元する
  useEffect(() => {
    let cancelled = false;
    api.auth.getUser()
      .then((response) => {
        if (!cancelled) setUser(response.data.data);
      })
      .catch((error) => {
        // 401は未ログインを示すためエラーとして扱わない
        // それ以外のエラーは予期しない問題としてログ出力する
        if (error.response?.status !== 401) {
          console.error(error);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
