
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className = '' }: MathRendererProps) {
  // Simple regex to find LaTeX expressions
  const renderWithMath = (text: string) => {
    // Replace inline math $...$ with InlineMath component
    const inlineMathRegex = /\$([^$]+)\$/g;
    // Replace block math $$...$$ with BlockMath component
    const blockMathRegex = /\$\$([^$]+)\$\$/g;

    let parts = [text];
    
    // Handle block math first
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return [part];
      
      const blockMatches = part.split(blockMathRegex);
      return blockMatches.map((match, index) => {
        if (index % 2 === 1) {
          return <BlockMath key={`block-${index}`} math={match} />;
        }
        return match;
      });
    });

    // Handle inline math
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return [part];
      
      const inlineMatches = part.split(inlineMathRegex);
      return inlineMatches.map((match, index) => {
        if (index % 2 === 1) {
          return <InlineMath key={`inline-${index}`} math={match} />;
        }
        return match;
      });
    });

    return parts;
  };

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ 
        __html: content.replace(/\$\$([^$]+)\$\$/g, '<div class="block-math">$$1$</div>')
                      .replace(/\$([^$]+)\$/g, '<span class="inline-math">$1</span>')
      }}
    />
  );
}
