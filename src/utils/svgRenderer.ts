
import { Question } from '@/types';
import katex from 'katex';

// KaTeX ile LaTeX'i render eden fonksiyon
const renderLatexWithKatex = (content: string): string => {
  let processed = content;
  
  // HTML etiketlerini kaldır
  processed = processed.replace(/<[^>]*>/g, ' ');
  
  try {
    // Display matematik ($$...$$)
    processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
          strict: false,
          output: 'html'
        });
        return `<div class="katex-display">${rendered}</div>`;
      } catch (error) {
        console.warn('KaTeX display render error:', error);
        return `<div class="math-fallback">$$${formula}$$</div>`;
      }
    });
    
    // Inline matematik ($...$)
    processed = processed.replace(/\$([^$]+)\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
          strict: false,
          output: 'html'
        });
        return `<span class="katex-inline">${rendered}</span>`;
      } catch (error) {
        console.warn('KaTeX inline render error:', error);
        return `<span class="math-fallback">$${formula}$</span>`;
      }
    });
    
    // LaTeX blok matematik \[...\]
    processed = processed.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
          strict: false,
          output: 'html'
        });
        return `<div class="katex-display">${rendered}</div>`;
      } catch (error) {
        console.warn('KaTeX block render error:', error);
        return `<div class="math-fallback">\\[${formula}\\]</div>`;
      }
    });
    
    // LaTeX inline matematik \(...\)
    processed = processed.replace(/\\\(([^)]+)\\\)/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
          strict: false,
          output: 'html'
        });
        return `<span class="katex-inline">${rendered}</span>`;
      } catch (error) {
        console.warn('KaTeX parenthesis render error:', error);
        return `<span class="math-fallback">\\(${formula}\\)</span>`;
      }
    });
    
  } catch (error) {
    console.error('KaTeX processing error:', error);
  }
  
  return processed;
};

// Metni satırlara böl
const wrapText = (text: string, maxWidth: number, fontSize: number = 12): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const charWidth = fontSize * 0.6;
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * charWidth < maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines;
};

// XML karakterlerini escape et
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// SVG içinde HTML içeriği render etmek için foreignObject kullan
export const renderQuestionToSVG = (
  question: Question, 
  questionNumber: number, 
  showOptions: boolean = false,
  width: number = 800,
  height: number = 600
): string => {
  
  const questionTitle = question.title ? `${questionNumber}. ${question.title}` : `${questionNumber}. Soru`;
  const renderedContent = renderLatexWithKatex(question.content);
  
  console.log('Original content:', question.content);
  console.log('Rendered with KaTeX:', renderedContent);
  
  // HTML içeriği oluştur
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
      <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #1a1a1a;">
        ${escapeXml(questionTitle)}
      </h3>
      <div style="font-size: 14px; margin-bottom: 20px; color: #333;">
        ${renderedContent}
      </div>
  `;
  
  // Şıkları ekle
  if (showOptions && question.options && question.options.length > 0) {
    htmlContent += '<div style="margin-top: 20px;">';
    question.options.forEach((option, index) => {
      const optionLetter = String.fromCharCode(65 + index);
      const renderedOption = renderLatexWithKatex(option);
      htmlContent += `
        <div style="margin: 8px 0; padding-left: 20px; font-size: 12px; color: #555;">
          <strong>${optionLetter})</strong> ${renderedOption}
        </div>
      `;
    });
    htmlContent += '</div>';
  }
  
  htmlContent += '</div>';
  
  // KaTeX CSS'ini dahil et
  const katexCSS = `
    <style>
      .katex { font-size: 1.1em; }
      .katex-display { margin: 1em 0; text-align: center; }
      .katex-inline { }
      .math-fallback { 
        background: #f0f0f0; 
        padding: 2px 4px; 
        border-radius: 3px; 
        font-family: monospace; 
      }
      .base { display: inline-block; }
      .strut { display: inline-block; }
      .frac-line { border-bottom: 1px solid; margin: 0 0.05em; }
      .accent-body { position: relative; }
      .msupsub { text-align: left; }
      .mfrac > span { text-align: center; display: block; }
      .mfrac > span + span { border-top: 1px solid; margin-top: 0.05em; padding-top: 0.05em; }
    </style>
  `;
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${katexCSS}
      </defs>
      <rect width="100%" height="100%" fill="white" stroke="#e0e0e0" stroke-width="1"/>
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${htmlContent}
        </div>
      </foreignObject>
    </svg>
  `;
};
