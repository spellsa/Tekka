import { Link } from 'react-router-dom';
import ArticleMarkdown from './ArticleMarkdown';

// 記事作成と編集で共通の入力フォームと Markdown プレビューを表示する
export default function ArticleEditorForm({
  title,
  body,
  tagsInput,
  validationErrors,
  loading,
  submitLabel,
  cancelTo,
  onSubmit,
  onTitleChange,
  onBodyChange,
  onTagsChange,
}) {
  const previewTags = tagsInput
    .split('\n')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  let previewTagsContent = null;

  if (previewTags.length > 0) {
    previewTagsContent = (
      <div className="article-edit-preview__tags" aria-label="タグ">
        {previewTags.map((tag, index) => <span key={`${tag}-${index}`}>{tag}</span>)}
      </div>
    );
  }

  return (
    <form className="article-edit-form" onSubmit={onSubmit}>
      <div className="article-edit-form__editor">
        <div className="article-edit-form__field">
          <label htmlFor="title">タイトル</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            maxLength={100}
            required
          />
          {validationErrors.title && <p className="article-edit-form__validation">{validationErrors.title}</p>}
        </div>

        <div className="article-edit-form__field article-edit-form__field--body">
          <label htmlFor="body">
            本文
            <span className="article-edit-form__hint">{body.length} / 50000</span>
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            maxLength={50000}
            required
          />
          {validationErrors.body && <p className="article-edit-form__validation">{validationErrors.body}</p>}
        </div>

        <div className="article-edit-form__field">
          <label htmlFor="tags">タグ（1行につき1タグ）</label>
          <textarea
            id="tags"
            value={tagsInput}
            onChange={(event) => onTagsChange(event.target.value)}
            placeholder="タグ名を1行に1つずつ入力"
          />
          {validationErrors.tags && <p className="article-edit-form__validation">{validationErrors.tags}</p>}
        </div>
      </div>

      <aside className="article-edit-preview" aria-label="記事のプレビュー">
        <p className="article-edit-preview__label">プレビュー</p>
        <article className="article-edit-preview__article">
          {previewTagsContent}
          <h2>{title}</h2>
          <ArticleMarkdown markdown={body} />
        </article>
      </aside>

      <div className="article-edit-form__actions">
        <button className="article-edit-form__submit" type="submit" disabled={loading}>
          {submitLabel}
        </button>
        <Link to={cancelTo} className="article-edit-form__cancel">キャンセル</Link>
      </div>
    </form>
  );
}
