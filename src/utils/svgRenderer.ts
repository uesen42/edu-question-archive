
import { Question } from '@/types';

// SVG içinde matematik render etmek için basit bir renderer
export const renderQuestionToSVG = (
  question: Question, 
  questionNumber: number, 
  showOptions: boolean = false,
  width: number = 400,
  height: number = 300
): string => {
  
  // LaTeX'i Unicode'a çevir
  const processLatexToText = (content: string): string => {
    let processed = content;
    
    // HTML etiketlerini kaldır
    processed = processed.replace(/<[^>]*>/g, ' ');
    
    // LaTeX matematik ifadelerini işle
    processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      return processLatexFormula(formula.trim());
    });
    
    processed = processed.replace(/\$([^$]+)\$/g, (match, formula) => {
      return processLatexFormula(formula.trim());
    });
    
    processed = processed.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
      return processLatexFormula(formula.trim());
    });
    
    processed = processed.replace(/\\\(([^)]+)\\\)/g, (match, formula) => {
      return processLatexFormula(formula.trim());
    });
    
    // Fazla boşlukları temizle
    processed = processed.replace(/\s+/g, ' ').trim();
    
    return processed;
  };

  const processLatexFormula = (formula: string): string => {
    let processed = formula;
    
    // Temel matematik sembolleri
    const replacements = {
      '\\times': '×', '\\div': '÷', '\\pm': '±', '\\mp': '∓', '\\cdot': '·',
      '\\leq': '≤', '\\geq': '≥', '\\neq': '≠', '\\approx': '≈', '\\equiv': '≡',
      '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\epsilon': 'ε',
      '\\theta': 'θ', '\\lambda': 'λ', '\\mu': 'μ', '\\pi': 'π', '\\sigma': 'σ',
      '\\phi': 'φ', '\\omega': 'ω', '\\infty': '∞', '\\sum': '∑', '\\int': '∫',
      '\\partial': '∂', '\\nabla': '∇'
    };
    
    Object.entries(replacements).forEach(([latex, unicode]) => {
      processed = processed.replace(new RegExp(latex.replace('\\', '\\\\'), 'g'), unicode);
    });
    
    // Kesirler
    processed = processed.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)');
    
    // Kök
    processed = processed.replace(/\\sqrt\{([^}]*)\}/g, '√($1)');
    
    // Üst ve alt simgeler
    processed = processed.replace(/\^\{([^}]*)\}/g, (match, exp) => {
      return exp.length === 1 ? '^' + exp : '^(' + exp + ')';
    });
    
    processed = processed.replace(/\_\{([^}]*)\}/g, (match, sub) => {
      return sub.length === 1 ? '_' + sub : '_(' + sub + ')';
    });
    
    // Gereksiz karakterleri temizle
    processed = processed.replace(/\{([^{}]*)\}/g, '$1');
    processed = processed.replace(/\\/g, '');
    
    return processed;
  };

  // Metni satırlara böl
  const wrapText = (text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length * 8 < maxWidth) { // Yaklaşık karakter genişliği
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    return lines;
  };

  // Soru içeriğini işle
  const questionTitle = question.title ? `${questionNumber}. ${question.title}` : `${questionNumber}. Soru`;
  const questionContent = processLatexToText(question.content);
  
  // Metin satırlarını oluştur
  const titleLines = wrapText(questionTitle, width - 40);
  const contentLines = wrapText(questionContent, width - 40);
  
  let yPos = 30;
  let svgContent = '';
  
  // Başlık
  titleLines.forEach((line, index) => {
    svgContent += `<text x="20" y="${yPos}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#000">${escapeXml(line)}</text>\n`;
    yPos += 18;
  });
  
  yPos += 10;
  
  // İçerik
  contentLines.forEach((line, index) => {
    svgContent += `<text x="20" y="${yPos}" font-family="Arial, sans-serif" font-size="12" fill="#333">${escapeXml(line)}</text>\n`;
    yPos += 16;
  });
  
  // Şıklar
  if (showOptions && question.options && question.options.length > 0) {
    yPos += 15;
    
    question.options.forEach((option, index) => {
      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
      const processedOption = processLatexToText(option);
      const optionText = `${optionLetter}) ${processedOption}`;
      const optionLines = wrapText(optionText, width - 60);
      
      optionLines.forEach((line, lineIndex) => {
        const xOffset = lineIndex === 0 ? 40 : 55; // İlk satır için harf ile hizala
        svgContent += `<text x="${xOffset}" y="${yPos}" font-family="Arial, sans-serif" font-size="11" fill="#555">${escapeXml(line)}</text>\n`;
        yPos += 15;
      });
      yPos += 5;
    });
  }
  
  // Dinamik yükseklik hesapla
  const finalHeight = Math.max(height, yPos + 20);
  
  return `
    <svg width="${width}" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white" stroke="#ddd" stroke-width="1"/>
      ${svgContent}
    </svg>
  `;
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
