import client, { getCsrfCookie } from './client';

/**
 * 認証API
 * Sanctum SPA認証を使用したユーザー登録・ログイン・ログアウト
 */
export const auth = {
  /**
   * ユーザー登録
   * CSRF Cookieを取得後、新規ユーザーを作成して自動ログインする
   * @param {Object} data - { username, email, password, password_confirmation }
   * @returns {Promise}
   */
  async register(data) {
    await getCsrfCookie();
    return client.post('/register', data);
  },

  /**
   * ログイン
   * CSRF Cookieを取得後、メールアドレスとパスワードで認証する
   * @param {Object} data - { email, password }
   * @returns {Promise}
   */
  async login(data) {
    await getCsrfCookie();
    return client.post('/login', data);
  },

  /**
   * ログアウト
   * CSRF Cookieを取得後、現在のセッションを無効化する
   * @returns {Promise}
   */
  async logout() {
    await getCsrfCookie();
    return client.post('/logout');
  },

  /**
   * ログインユーザー情報を取得する
   * @returns {Promise}
   */
  getUser() {
    return client.get('/user');
  },
};

/**
 * 記事API
 * 記事の一覧取得・詳細取得・投稿・更新・削除
 */
export const articles = {
  /**
   * 公開記事の一覧を取得する
   * @param {number} [page] - ページ番号（省略時は1）
   * @returns {Promise}
   */
  list(page) {
    return client.get('/articles', { params: { page } });
  },

  /**
   * 指定記事の詳細を取得する
   * @param {number} id - 記事ID
   * @returns {Promise}
   */
  detail(id) {
    return client.get(`/articles/${id}`);
  },

  /**
   * 新しい記事を投稿する
   * CSRF Cookieを取得後、記事を作成する
   * @param {Object} data - { title, body, tags }
   * @returns {Promise}
   */
  async create(data) {
    await getCsrfCookie();
    return client.post('/articles', data);
  },

  /**
   * ログインユーザー自身の記事を更新する
   * CSRF Cookieを取得後、記事を更新する
   * @param {number} id - 記事ID
   * @param {Object} data - { title, body, tags }
   * @returns {Promise}
   */
  async update(id, data) {
    await getCsrfCookie();
    return client.put(`/articles/${id}`, data);
  },

  /**
   * ログインユーザー自身の記事を論理削除する
   * CSRF Cookieを取得後、記事を削除する
   * @param {number} id - 記事ID
   * @returns {Promise}
   */
  async delete(id) {
    await getCsrfCookie();
    return client.delete(`/articles/${id}`);
  },
};

/**
 * ユーザーAPI
 * 公開プロフィール取得・プロフィール更新・ユーザー別記事一覧
 */
export const users = {
  /**
   * 指定ユーザーの公開プロフィールを取得する
   * @param {number} id - ユーザーID
   * @returns {Promise}
   */
  profile(id) {
    return client.get(`/users/${id}`);
  },

  /**
   * ログインユーザー自身のプロフィールを更新する
   * CSRF Cookieを取得後、ユーザー名とプロフィール文を更新する
   * @param {Object} data - { username, profile }
   * @returns {Promise}
   */
  async updateProfile(data) {
    await getCsrfCookie();
    return client.put('/user', data);
  },

  /**
   * 指定ユーザーが投稿した記事一覧を取得する
   * @param {number} id - ユーザーID
   * @param {number} [page] - ページ番号（省略時は1）
   * @returns {Promise}
   */
  articles(id, page) {
    return client.get(`/users/${id}/articles`, { params: { page } });
  },
};

/**
 * タグAPI
 * タグ別の記事一覧取得
 */
export const tags = {
  /**
   * 指定タグが付いた記事一覧を取得する
   * @param {string} tag - タグ名（normalized_name）
   * @param {number} [page] - ページ番号（省略時は1）
   * @returns {Promise}
   */
  articles(tag, page) {
    return client.get('/tag-articles', { params: { tag, page } });
  },
};

/**
 * 検索API
 * キーワードによる記事検索
 */
export const search = {
  /**
   * キーワードで記事を検索する
   * @param {string} q - 検索キーワード
   * @param {number} [page] - ページ番号（省略時は1）
   * @returns {Promise}
   */
  articles(q, page) {
    return client.get('/search', { params: { q, page } });
  },
};

/**
 * 評価API
 * 記事への高評価・低評価のトグル
 */
export const evaluations = {
  /**
   * 記事への評価を作成・切り替え・取り消しする
   * CSRF Cookieを取得後、評価値を送信する
   * @param {number} id - 記事ID
   * @param {string} value - "high" または "low"
   * @returns {Promise}
   */
  async toggle(id, value) {
    await getCsrfCookie();
    return client.post(`/articles/${id}/evaluation`, { value });
  },
};
