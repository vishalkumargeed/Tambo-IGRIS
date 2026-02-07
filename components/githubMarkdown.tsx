import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Import the GitHub CSS styles
import 'github-markdown-css/github-markdown-light.css';
import '@/app/github-markdown-dark-scoped.css';

interface GitHubMarkdownProps {
  content: string;
  /** When true, minimal padding for inline/compact use (e.g. chat bubbles) */
  compact?: boolean;
}

export default function GitHubMarkdown({ content, compact = false }: GitHubMarkdownProps) {
  return (
    <div
      className={`markdown-body ${compact ? "p-0" : "p-4"}`}
      style={compact ? undefined : { padding: "20px" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}