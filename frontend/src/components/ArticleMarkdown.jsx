/*
    ArticleMarkdown.jsx
    記事本文とプレビューで共通のMarkdown表示を行うコンポーネント
    作成者：北 聖也
    作成日：2026年7月22日
*/

import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 記事先頭にある YAML Front Matter を本文表示の対象から外す
function removeFrontMatter(markdown) {
  return markdown.replace(/^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)\s*(?:\r?\n|$)/, '');
}

// 言語名が付いたコードブロックをシンタックスハイライト付きで表示する
function MarkdownCode({ children, className, ...props }) {
  const languageMatch = /language-([\w-]+)/.exec(className || '');

  if (languageMatch) {
    const language = languageMatch[1];
    const code = String(children).replace(/\n$/, '');

    return (
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        PreTag="div"
        className="article-code-block"
        customStyle={{
          margin: '0',
          padding: 'var(--space-md)',
          background: 'var(--color-paper-2)',
          border: 'var(--rule) solid var(--color-rule-2)',
          borderRadius: 'var(--radius-sm)',
        }}
        codeTagProps={{
          style: {
            background: 'transparent',
            fontFamily: 'var(--font-data)',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    );
  }

  return <code className={className} {...props}>{children}</code>;
}

// シンタックスハイライト済みコードにだけ Markdown 標準の pre を重ねない
function MarkdownPre({ children, node, ...props }) {
  const codeNode = node.children[0];
  const classNames = codeNode.properties.className;
  let isHighlightedCodeBlock = false;

  if (Array.isArray(classNames)) {
    isHighlightedCodeBlock = classNames.some((className) => className.startsWith('language-'));
  }

  if (isHighlightedCodeBlock) {
    return children;
  }

  return <pre {...props}>{children}</pre>;
}

// 記事本文と編集プレビューで共通の Markdown 表示を提供する
export default function ArticleMarkdown({ markdown, className = '' }) {
  let markdownClassName = 'article-markdown';

  if (className) {
    markdownClassName += ` ${className}`;
  }

  return (
    <div className={markdownClassName}>
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{ code: MarkdownCode, pre: MarkdownPre }}
      >
        {removeFrontMatter(markdown)}
      </ReactMarkdown>
    </div>
  );
}
