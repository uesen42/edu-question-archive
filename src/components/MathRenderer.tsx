
import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  content: string;
  className?: string;
  isMobile?: boolean;
}

export function MathRenderer({ content, className = '', isMobile = false }: MathRendererProps) {
  // Mobil cihaz kontrolü
  const isMobileDevice = isMobile || window.innerWidth <= 768;
  
  const renderWithMath = (text: string): (string | React.ReactElement)[] => {
    // First handle block math $$...$$ 
    const blockMathRegex = /\$\$([^$]+)\$\$/g;
    let parts: (string | React.ReactElement)[] = [text];
    
    // Handle block math first
    parts = parts.flatMap((part, partIndex) => {
      if (typeof part !== 'string') return [part];
      
      const blockMatches = part.split(blockMathRegex);
      return blockMatches.map((match, index) => {
        if (index % 2 === 1) {
          try {
            return (
              <BlockMath 
                key={`block-${partIndex}-${index}`} 
                math={match}
                renderError={(error) => (
                  <div className="math-error bg-red-50 border border-red-200 p-2 rounded text-sm">
                    Matematik hatası: {match}
                  </div>
                )}
              />
            );
          } catch (error) {
            return (
              <div key={`block-error-${partIndex}-${index}`} className="math-fallback bg-gray-100 p-2 rounded text-sm">
                {match}
              </div>
            );
          }
        }
        return match;
      });
    });

    // Handle inline math $...$
    const inlineMathRegex = /\$([^$]+)\$/g;
    parts = parts.flatMap((part, partIndex) => {
      if (typeof part !== 'string') return [part];
      
      const inlineMatches = part.split(inlineMathRegex);
      return inlineMatches.map((match, index) => {
        if (index % 2 === 1) {
          try {
            return (
              <InlineMath 
                key={`inline-${partIndex}-${index}`} 
                math={match}
                renderError={(error) => (
                  <span className="math-error bg-red-50 border border-red-200 px-1 rounded text-xs">
                    {match}
                  </span>
                )}
              />
            );
          } catch (error) {
            return (
              <span key={`inline-error-${partIndex}-${index}`} className="math-fallback bg-gray-100 px-1 rounded text-xs">
                {match}
              </span>
            );
          }
        }
        return match;
      });
    });

    return parts;
  };

  const renderedContent = renderWithMath(content);

  return (
    <div className={`math-renderer ${className} ${isMobileDevice ? 'mobile-math' : ''}`}>
      <style jsx>{`
        .math-renderer.mobile-math .katex {
          font-size: 1.1em !important;
          line-height: 1.4 !important;
        }
        .math-renderer.mobile-math .katex-display {
          margin: 0.5em 0 !important;
          text-align: center !important;
        }
        .math-renderer.mobile-math .katex .base {
          display: inline-block !important;
          max-width: 100% !important;
          overflow-x: auto !important;
        }
        .math-fallback {
          font-family: 'Times New Roman', serif;
          font-style: italic;
        }
        .math-error {
          font-size: 0.85em;
          color: #dc2626;
        }
      `}</style>
      {renderedContent.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={`text-${index}`}>{part}</span>;
        }
        return part;
      })}
    </div>
  );
}
