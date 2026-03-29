import React, { useRef } from 'react';
import { PanelLeft } from 'lucide-react';

export default function Toolbar({ toggleSidebar, title, fontSizeFactor, setFontSizeFactor, isHidden }) {
  const dragState = useRef({ isDown: false, startX: 0, startY: 0, lastClick: 0 });

  const handleIncreaseFont = () => {
    setFontSizeFactor(prev => Math.min(prev + 0.1, 2.0));
  };

  const handleDecreaseFont = () => {
    setFontSizeFactor(prev => Math.max(prev - 0.1, 0.5));
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('button')) return;
    
    const now = Date.now();
    if (now - dragState.current.lastClick < 400) {
      // Double click confirmed
      if (dragState.current.dragTimeout) clearTimeout(dragState.current.dragTimeout);
      dragState.current.lastClick = 0;
      
      import('@tauri-apps/api/window').then(appWindow => {
        appWindow.getCurrentWindow().isMaximized().then(isMax => {
          if (isMax) appWindow.getCurrentWindow().unmaximize();
          else appWindow.getCurrentWindow().maximize();
        });
      }).catch(err => console.error(err));
      return;
    }
    
    dragState.current.lastClick = now;
    
    // Defer the OS window drag to allow double clicks to register
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
    <div 
      className={`toolbar ${isHidden ? 'hidden' : ''}`} 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="toolbar-group">
        <button 
          className="btn-icon" 
          onClick={toggleSidebar}
          title="Toggle Sidebar"
        >
          <PanelLeft size={18} />
        </button>
      </div>

      <div className="toolbar-title">
        {title || "MD Viewer"}
      </div>

      <div className="toolbar-group">
        <button className="btn-icon" onClick={handleDecreaseFont} title="Decrease Font Size" disabled={fontSizeFactor <= 0.5}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>T</span>
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '40px', textAlign: 'center' }}>
          {Math.round(fontSizeFactor * 100)}%
        </span>
        <button className="btn-icon" onClick={handleIncreaseFont} title="Increase Font Size" disabled={fontSizeFactor >= 2.0}>
          <span style={{ fontSize: '17px', fontWeight: 600 }}>T</span>
        </button>
      </div>
    </div>
  );
}
