
import { Question } from '@/types';
import katex from 'katex';

// KaTeX ile LaTeX'i HTML'e çeviren fonksiyon
const renderLatexWithKatex = (content: string): string => {
  let processed = content;
  
  // HTML etiketlerini kaldır
  processed = processed.replace(/<[^>]*>/g, ' ');
  
  try {
    // Display matematik ($$...$$)
    processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
          strict: false
        });
      } catch (error) {
        console.warn('KaTeX display render error:', error);
        return formula;
      }
    });
    
    // Inline matematik ($...$)
    processed = processed.replace(/\$([^$]+)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
          strict: false
        });
      } catch (error) {
        console.warn('KaTeX inline render error:', error);
        return formula;
      }
    });
    
    // LaTeX blok matematik \[...\]
    processed = processed.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
          strict: false
        });
      } catch (error) {
        console.warn('KaTeX block render error:', error);
        return formula;
      }
    });
    
    // LaTeX inline matematik \(...\)
    processed = processed.replace(/\\\(([^)]+)\\\)/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
          strict: false
        });
      } catch (error) {
        console.warn('KaTeX parenthesis render error:', error);
        return formula;
      }
    });
    
  } catch (error) {
    console.error('KaTeX processing error:', error);
  }
  
  // Fazla boşlukları temizle
  processed = processed.replace(/\s+/g, ' ').trim();
  
  return processed;
};

// HTML'i temiz metne çeviren fonksiyon
const htmlToText = (html: string): string => {
  // Basit HTML etiketlerini kaldır ama matematiksel içeriği koru
  let text = html;
  
  // KaTeX HTML yapılarını basit metne çevir
  text = text.replace(/<span class="katex[^"]*"[^>]*>/g, '');
  text = text.replace(/<\/span>/g, '');
  text = text.replace(/<span[^>]*>/g, '');
  
  // Diğer HTML etiketlerini kaldır
  text = text.replace(/<[^>]*>/g, '');
  
  // HTML entities'leri çöz
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  return text.trim();
};

// Metni satırlara böl (daha akıllı)
const wrapText = (text: string, maxWidth: number, fontSize: number = 12): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const charWidth = fontSize * 0.6; // Ortalama karakter genişliği
  
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

// SVG içinde matematik render etmek için geliştirilmiş renderer
export const renderQuestionToSVG = (
  question: Question, 
  questionNumber: number, 
  showOptions: boolean = false,
  width: number = 800,
  height: number = 600
): string => {
  
  // Soru içeriğini işle - önce KaTeX ile render et, sonra temiz metne çevir
  const questionTitle = question.title ? `${questionNumber}. ${question.title}` : `${questionNumber}. Soru`;
  const renderedContent = renderLatexWithKatex(question.content);
  const questionContent = htmlToText(renderedContent);
  
  console.log('Original content:', question.content);
  console.log('Rendered with KaTeX:', renderedContent);
  console.log('Final text:', questionContent);
  
  // Metin satırlarını oluştur (daha büyük font boyutları)
  const titleFontSize = 16;
  const contentFontSize = 14;
  const optionFontSize = 12;
  
  const titleLines = wrapText(questionTitle, width - 60, titleFontSize);
  const contentLines = wrapText(questionContent, width - 60, contentFontSize);
  
  let yPos = 40;
  let svgContent = '';
  
  // Başlık (kalın ve büyük)
  titleLines.forEach((line) => {
    svgContent += `<text x="30" y="${yPos}" font-family="Arial, sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="#1a1a1a">${escapeXml(line)}</text>\n`;
    yPos += titleFontSize + 6;
  });
  
  yPos += 15;
  
  // İçerik (düzenli boyut)
  contentLines.forEach((line) => {
    svgContent += `<text x="30" y="${yPos}" font-family="Arial, sans-serif" font-size="${contentFontSize}" fill="#333333">${escapeXml(line)}</text>\n`;
    yPos += contentFontSize + 4;
  });
  
  // Şıklar
  if (showOptions && question.options && question.options.length > 0) {
    yPos += 20;
    
    question.options.forEach((option, index) => {
      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
      const renderedOption = renderLatexWithKatex(option);
      const processedOption = htmlToText(renderedOption);
      const optionText = `${optionLetter}) ${processedOption}`;
      const optionLines = wrapText(optionText, width - 100, optionFontSize);
      
      optionLines.forEach((line, lineIndex) => {
        const xOffset = lineIndex === 0 ? 50 : 70; // İlk satır için harf ile hizala
        svgContent += `<text x="${xOffset}" y="${yPos}" font-family="Arial, sans-serif" font-size="${optionFontSize}" fill="#555555">${escapeXml(line)}</text>\n`;
        yPos += optionFontSize + 3;
      });
      yPos += 8;
    });
  }
  
  // Dinamik yükseklik hesapla
  const finalHeight = Math.max(height, yPos + 40);
  
  return `
    <svg width="${width}" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .svg-text { font-family: 'Arial', 'Helvetica', sans-serif; }
        </style>
      </defs>
      <rect width="100%" height="100%" fill="white" stroke="#e0e0e0" stroke-width="1"/>
      ${svgContent}
    </svg>
  `;
};
