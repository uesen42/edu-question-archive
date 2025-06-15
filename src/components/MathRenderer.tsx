
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className = '' }: MathRendererProps) {
  const renderWithMath = (text: string): (string | JSX.Element)[] => {
    // First handle block math $$...$$ 
    const blockMathRegex = /\$\$([^$]+)\$\$/g;
    let parts: (string | JSX.Element)[] = [text];
    
    // Handle block math first
    parts = parts.flatMap((part, partIndex) => {
      if (typeof part !== 'string') return [part];
      
      const blockMatches = part.split(blockMathRegex);
      return blockMatches.map((match, index) => {
        if (index % 2 === 1) {
          return <BlockMath key={`block-${partIndex}-${index}`} math={match} />;
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
          return <InlineMath key={`inline-${partIndex}-${index}`} math={match} />;
        }
        return match;
      });
    });

    return parts;
  };

  const renderedContent = renderWithMath(content);

  return (
    <div className={className}>
      {renderedContent.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={`text-${index}`}>{part}</span>;
        }
        return part;
      })}
    </div>
  );
}
