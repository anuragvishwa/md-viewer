import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText } from 'lucide-react';

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
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
