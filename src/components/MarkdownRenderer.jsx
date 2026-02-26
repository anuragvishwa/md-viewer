import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText } from 'lucide-react';
import Mermaid from './Mermaid';

export default function MarkdownRenderer({ content, fontSizeFactor }) {
  if (!content) {
    return (
      <div className="empty-state">
        <FileText size={48} className="empty-icon" />
        <h2 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>No file selected</h2>
        <p>Open a markdown file from the sidebar or click upload on the toolbar.</p>
      </div>
    );
  }

  // Update CSS variable for markdown scale
  React.useEffect(() => {
    document.documentElement.style.setProperty('--md-scale', fontSizeFactor);
  }, [fontSizeFactor]);

  return (
    <div className="content-scroll">
      <div className="markdown-body">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              if (!inline && match && match[1] === 'mermaid') {
                return <Mermaid chart={String(children).replace(/\n$/, '')} />;
              }
              return <code className={className} {...props}>{children}</code>;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
