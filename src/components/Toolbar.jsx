import React from 'react';
import { FileText, PanelLeft } from 'lucide-react';

export default function Toolbar({ 
  toggleSidebar,
  title, 
  fontSizeFactor, 
  setFontSizeFactor,
  isHidden
}) {
  const handleIncreaseFont = () => {
    setFontSizeFactor(prev => Math.min(prev + 0.1, 2.0));
  };

  const handleDecreaseFont = () => {
    setFontSizeFactor(prev => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className={`toolbar ${isHidden ? 'hidden' : ''}`}>
      <div className="toolbar-group">
        <button className="btn-icon" onClick={toggleSidebar} title="Toggle Sidebar">
          <PanelLeft size={18} />
        </button>
        <FileText size={18} style={{ color: 'var(--text-secondary)', marginLeft: '8px' }} />
        <span className="toolbar-title" style={{ marginLeft: '4px' }}>{title || "Untitled"}</span>
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
