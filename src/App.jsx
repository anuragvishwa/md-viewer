import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import MarkdownRenderer from './components/MarkdownRenderer';
import { Upload } from 'lucide-react';
import FindInPage from './components/FindInPage';

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [fontSizeFactor, setFontSizeFactor] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut for Search (Ctrl+F / Cmd+F)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for Tauri native file drop
  React.useEffect(() => {
    let unlisten;
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen('tauri://file-drop', (event) => {
        if (event.payload && Array.isArray(event.payload)) {
          loadFilesByPath(event.payload);
        } else if (event.payload && event.payload.paths) {
          loadFilesByPath(event.payload.paths);
        }
        setIsDragging(false);
      }).then(u => unlisten = u);
      
      listen('tauri://file-drop-hover', () => setIsDragging(true));
      listen('tauri://file-drop-cancelled', () => setIsDragging(false));
    }).catch(e => console.log('Not running in Tauri', e));

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  // Load initial files from local storage or set welcome note
  React.useEffect(() => {
    const savedFiles = localStorage.getItem('md-viewer-files');
    const savedActiveId = localStorage.getItem('md-viewer-active-id');

    if (savedFiles) {
      const parsedFiles = JSON.parse(savedFiles);
      if (parsedFiles.length > 0) {
        setFiles(parsedFiles);
        setActiveFileId(savedActiveId || parsedFiles[0].id);
        return;
      }
    }

    const welcomeId = Date.now().toString();
    const welcomeContent = `# Welcome to MD Viewer for Mac\n\nThis is a beautifully minimal, macOS-inspired markdown viewer.\n\n## Features\n\n- **Glassmorphism**: A sleek, native feeling UI.\n- **Typography**: Uses system fonts for the application UI and gives you granular control over markdown rendering size.\n- **GitHub Flavored Markdown**: Supports tables, strikethrough, tasklists.\n\n### Open a file to start!\n\nYou can click the upload icon in the sidebar, or simply drag and drop a \`.md\` file anywhere in this window.`;
    
    setFiles([{
      id: welcomeId,
      name: 'Welcome.md',
      content: welcomeContent
    }]);
    setActiveFileId(welcomeId);
  }, []);

  // Save files to local storage whenever they change
  React.useEffect(() => {
    localStorage.setItem('md-viewer-files', JSON.stringify(files));
    localStorage.setItem('md-viewer-active-id', activeFileId);
  }, [files, activeFileId]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const loadFilesByPath = async (paths) => {
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const newFiles = [];
      
      for (const path of paths) {
        try {
          const content = await readTextFile(path);
          const name = path.split(/[/\\]/).pop();
          newFiles.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name,
            content,
            path
          });
        } catch (e) {
          console.error("Failed to read", path, e);
        }
      }

      setFiles(prev => {
        let updated = [...prev];
        for (const nf of newFiles) {
          const existsIdx = updated.findIndex(f => f.path === nf.path || (!f.path && f.name === nf.name));
          if (existsIdx >= 0) {
            updated[existsIdx] = { ...updated[existsIdx], content: nf.content, path: nf.path };
          } else {
            updated.unshift(nf);
          }
        }
        return updated;
      });

      if (newFiles.length > 0) setActiveFileId(newFiles[0].id);
    } catch (err) {
      console.error("Not running in Tauri or plugin-fs missing", err);
    }
  };

  const loadFile = (filesToLoad) => {
    const filesArray = Array.isArray(filesToLoad) ? filesToLoad : [filesToLoad];
    
    filesArray.forEach((fileObj, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const newFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name: fileObj.name,
          content: content
        };
        
        setFiles(prev => {
          const exists = prev.find(f => f.name === newFile.name);
          if (exists) {
            return prev.map(f => f.id === exists.id ? {...f, content: newFile.content} : f);
          }
          return [newFile, ...prev];
        });
        
        // Only set the first loaded file as active, or the last one, let's set the first one
        if (index === 0) {
          setFiles(prev => {
             const file = prev.find(f => f.name === newFile.name);
             if(file) setActiveFileId(file.id);
             return prev;
          });
        }
      };
      reader.readAsText(fileObj);
    });
  };

  const handleRemoveFile = (idToRemove, e) => {
    e.stopPropagation(); // Prevent selecting the file when clicking remove
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== idToRemove);
      if (activeFileId === idToRemove) {
        setActiveFileId(newFiles.length > 0 ? newFiles[0].id : null);
      }
      return newFiles;
    });
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    // Ignore HTML5 drop in favor of Tauri's native `tauri://file-drop`
    // which gives us exact absolute paths.
  }, []);



  const activeContent = files.find(f => f.id === activeFileId)?.content || '';
  const activeName = files.find(f => f.id === activeFileId)?.name || '';

  return (
    <div 
      className="app-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Sidebar 
        isOpen={isOpen} 
        files={files} 
        activeFileId={activeFileId} 
        onSelectFile={setActiveFileId}
        onRemoveFile={handleRemoveFile}
        onFileUpload={loadFile}
        onFileUploadDialog={async () => {
          try {
            const { open } = await import('@tauri-apps/plugin-dialog');
            const selected = await open({
              multiple: true,
              filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
            });
            if (selected) {
               const paths = Array.isArray(selected) ? selected : [selected];
               loadFilesByPath(paths);
            }
          } catch (e) {
            console.error('Failed to open dialog', e);
          }
        }}
      />

      <div className="main-area">
        <FindInPage 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)}
        />
        
        <Toolbar 
          toggleSidebar={toggleSidebar}
          title={activeName}
          fontSizeFactor={fontSizeFactor}
          setFontSizeFactor={setFontSizeFactor}
          isHidden={false}
        />
        
        <div className="content-scroll">
          <MarkdownRenderer 
            content={activeContent} 
            fontSizeFactor={fontSizeFactor} 
          />
        </div>
        
        {isDragging && (
          <div className="drop-overlay">
            <div className="drop-overlay-content">
              <Upload size={48} />
              <span>Drop Markdown file here</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
