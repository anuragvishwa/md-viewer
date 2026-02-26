import React, { useRef } from 'react';
import { FileText, Plus, Ghost, Upload, X } from 'lucide-react';

export default function Sidebar({ isOpen, files, activeFileId, onSelectFile, onNewFile, onRemoveFile, onFileUpload }) {
  const fileInputRef = useRef(null);

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
    // Reset the input so the same file can be uploaded again if needed
    e.target.value = null;
  };

  return (
    <div className={`sidebar ${isOpen ? '' : 'hidden'}`}>
      <div className="sidebar-header">
        <span>Files</span>
        <div style={{ flex: 1 }} />
        <button className="btn-icon" onClick={handleClickUpload} title="Open Markdown File" style={{ marginRight: '4px' }}>
          <Upload size={16} />
        </button>
        <button className="btn-icon" onClick={onNewFile} title="New empty file">
          <Plus size={16} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".md,.markdown,text/markdown,text/plain" 
          style={{ display: 'none' }} 
        />
      </div>
      <div className="sidebar-content">
        {files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Ghost size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p>No files open</p>
          </div>
        ) : (
          files.map(file => (
            <div 
              key={file.id} 
              className={`file-item ${file.id === activeFileId ? 'active' : ''}`}
              onClick={() => onSelectFile(file.id)}
            >
              <FileText size={16} style={{ flexShrink: 0 }} />
              <span className="file-name" style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </span>
              <button 
                className="btn-icon file-remove-btn" 
                onClick={(e) => onRemoveFile(file.id, e)}
                title="Remove file"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
