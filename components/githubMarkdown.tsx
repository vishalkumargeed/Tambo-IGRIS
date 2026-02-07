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
  /** When true, minimal styling – no box/borders, clean flowing text (for chat) */
  simple?: boolean;
}

export default function GitHubMarkdown({ content, compact = false, simple = false }: GitHubMarkdownProps) {
  const wrapperClass = simple
    ? "text-inherit [&_p]:mb-1 [&_p:last-child]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_a]:text-primary [&_a]:underline [&_a:hover]:opacity-80 [&_strong]:font-semibold [&_pre]:whitespace-pre-wrap [&_pre]:break-words"
    : `markdown-body ${compact ? "p-0" : "p-4"}`;

  return (
    <div
      className={wrapperClass}
      style={compact && !simple ? undefined : simple ? undefined : { padding: "20px" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={simple ? [] : [rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}