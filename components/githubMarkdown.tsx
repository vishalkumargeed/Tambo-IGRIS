import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Import the GitHub CSS styles
import 'github-markdown-css/github-markdown.css';

interface GitHubMarkdownProps {
  content: string;
}

export default function GitHubMarkdown({ content }: GitHubMarkdownProps) {
  return (
    // The "markdown-body" class triggers the GitHub styling
    <div className="markdown-body p-4 " style={{ padding: '20px' }}>
      <ReactMarkdown  
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}