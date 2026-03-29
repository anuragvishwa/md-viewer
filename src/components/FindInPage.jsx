import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

export default function FindInPage({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      window.getSelection()?.removeAllRanges();
    }
  }, [isOpen]);

  const handleSearch = (forward = true) => {
    if (!query) return;
    window.find(query, false, !forward, true, false, false, false);
  };

  if (!isOpen) return null;

  return (
    <div className="find-in-page">
      <Search size={16} className="search-icon-small" />
      <input
        ref={inputRef}
        type="text"
        className="find-input"
        placeholder="Find in this file..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'Enter') handleSearch(!e.shiftKey);
        }}
      />
      <div className="find-controls">
        <button className="btn-icon-small" onClick={() => handleSearch(false)}><ChevronUp size={16} /></button>
        <button className="btn-icon-small" onClick={() => handleSearch(true)}><ChevronDown size={16} /></button>
        <div className="find-divider" />
        <button className="btn-icon-small" onClick={onClose}><X size={16} /></button>
      </div>
    </div>
  );
}
