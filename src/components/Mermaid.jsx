import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark', // Since it's a dark mode app
  securityLevel: 'loose',
});

export default function Mermaid({ chart }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      try {
        setError(false);
        const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.error("Mermaid generation error", err);
        if (isMounted) {
          setError(true);
        }
      }
    };

    if (chart) {
      renderChart();
    }

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return <div className="mermaid-error" style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>Found syntax error in Mermaid diagram.</div>;
  }

  return (
    <div 
      className="mermaid-container" 
      ref={containerRef} 
      dangerouslySetInnerHTML={{ __html: svgContent }} 
      style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}
    />
  );
}
