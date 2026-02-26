import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import MarkdownRenderer from './components/MarkdownRenderer';
import { Upload } from 'lucide-react';

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [fontSizeFactor, setFontSizeFactor] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);

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

  const loadFile = (fileObj) => {
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
      
      setFiles(prev => {
         const file = prev.find(f => f.name === newFile.name);
         if(file) setActiveFileId(file.id);
         return prev;
      });
    };
    reader.readAsText(fileObj);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      loadFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleNewFile = () => {
    const newFile = {
      id: Date.now().toString(),
      name: `Untitled-${files.length}.md`,
      content: '# New Document\n\nStart typing here...'
    };
    setFiles(prev => [newFile, ...prev]);
    setActiveFileId(newFile.id);
  };

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
        onNewFile={handleNewFile}
        onRemoveFile={handleRemoveFile}
        onFileUpload={loadFile}
      />
      
      <div className="main-area">
        <Toolbar 
          toggleSidebar={toggleSidebar}
          title={activeName}
          fontSizeFactor={fontSizeFactor}
          setFontSizeFactor={setFontSizeFactor}
        />
        
        <MarkdownRenderer 
          content={activeContent} 
          fontSizeFactor={fontSizeFactor} 
        />
        
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
