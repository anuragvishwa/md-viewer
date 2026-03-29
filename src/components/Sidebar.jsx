import React, { useRef, useState, useEffect } from 'react';
import { FileText, Ghost, Upload, X } from 'lucide-react';

export default function Sidebar({ isOpen, files, activeFileId, onSelectFile, onRemoveFile, onFileUpload, onFileUploadDialog }) {
  const fileInputRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const dragState = useRef({ isDown: false, startX: 0, startY: 0, lastClick: 0 });
  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const savedWidth = localStorage.getItem('md-viewer-sidebar-width');
    if (savedWidth) {
      document.documentElement.style.setProperty('--sidebar-width', `${savedWidth}px`);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !sidebarRef.current) return;
      const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
      if (newWidth > 150 && newWidth < 800) {
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        const currentWidth = document.documentElement.style.getPropertyValue('--sidebar-width');
        if (currentWidth) {
          localStorage.setItem('md-viewer-sidebar-width', parseFloat(currentWidth));
        }
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Disable text selection while dragging
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleClickUpload = () => {
    if (onFileUploadDialog) {
      onFileUploadDialog();
    } else {
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu) setContextMenu(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenu]);

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files);
    if (fileList.length > 0) {
      onFileUpload(fileList);
    }
    // Reset the input so the same file(s) can be uploaded again if needed
    e.target.value = null;
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('button')) return;
    
    const now = Date.now();
    if (now - dragState.current.lastClick < 400) {
      if (dragState.current.dragTimeout) clearTimeout(dragState.current.dragTimeout);
      dragState.current.lastClick = 0;
      
      import('@tauri-apps/api/window').then(appWindow => {
        appWindow.getCurrentWindow().isMaximized().then(isMax => {
          if (isMax) appWindow.getCurrentWindow().unmaximize();
          else appWindow.getCurrentWindow().maximize();
        });
      });
      return;
    }
    
    dragState.current.lastClick = now;

    dragState.current.dragTimeout = setTimeout(() => {
      import('@tauri-apps/api/window').then((m) => {
        m.getCurrentWindow().startDragging();
      });
    }, 200);
  };

  const handlePointerUp = () => {
    if (dragState.current.dragTimeout) {
      clearTimeout(dragState.current.dragTimeout);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? '' : 'hidden'}`} ref={sidebarRef}>
      <div 
        className="sidebar-header" 
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <span>Files</span>
        <div style={{ flex: 1 }} />
        <button className="btn-icon" onClick={handleClickUpload} title="Open Markdown File" style={{ marginRight: '4px' }}>
          <Upload size={16} />
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".md,.markdown,text/markdown,text/plain" 
          multiple
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
              onContextMenu={(e) => handleContextMenu(e, file)}
            >
              <FileText size={16} style={{ flexShrink: 0 }} />
              <span title={file.name} className="file-name" style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
      
      {contextMenu && (
        <div 
          className="context-menu"
          style={{ 
            position: 'fixed',
            top: contextMenu.y, 
            left: contextMenu.x,
            zIndex: 1000 
          }}
        >
          <button 
            className="context-menu-item"
            onClick={(e) => {
              e.stopPropagation();
              if (contextMenu.file?.path) {
                import('@tauri-apps/api/core').then(({ invoke }) => {
                  invoke('reveal_file', { path: contextMenu.file.path }).catch(console.error);
                }).catch(err => console.log('Tauri API not available', err));
              } else {
                alert('Path not available for this file.');
              }
              setContextMenu(null);
            }}
          >
            Reveal in Finder
          </button>
        </div>
      )}
      <div 
        className="sidebar-resizer" 
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }} 
      />
    </div>
  );
}
