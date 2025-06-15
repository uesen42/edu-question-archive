
import { Question } from '@/types';

// Geliştirilmiş LaTeX'i Unicode'a çeviren fonksiyon
const processLatexToText = (content: string): string => {
  let processed = content;
  
  // HTML etiketlerini kaldır
  processed = processed.replace(/<[^>]*>/g, ' ');
  
  // LaTeX matematik ifadelerini işle (daha kapsamlı)
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
  
  // Geliştirilmiş matematik sembolleri
  const replacements = {
    // Temel operatörler
    '\\times': '×', '\\div': '÷', '\\pm': '±', '\\mp': '∓', '\\cdot': '·',
    '\\ast': '*', '\\star': '⋆', '\\circ': '∘', '\\bullet': '•',
    
    // Karşılaştırma operatörleri
    '\\leq': '≤', '\\geq': '≥', '\\neq': '≠', '\\approx': '≈', '\\equiv': '≡',
    '\\sim': '∼', '\\simeq': '≃', '\\cong': '≅', '\\propto': '∝',
    
    // Set sembolleri
    '\\in': '∈', '\\notin': '∉', '\\subset': '⊂', '\\supset': '⊃',
    '\\subseteq': '⊆', '\\supseteq': '⊇', '\\cup': '∪', '\\cap': '∩',
    '\\emptyset': '∅', '\\infty': '∞',
    
    // Yunanca harfler
    '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', 
    '\\epsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
    '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ',
    '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π', '\\rho': 'ρ',
    '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ',
    '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
    
    // Büyük yunanca harfler
    '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
    '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Upsilon': 'Υ',
    '\\Phi': 'Φ', '\\Psi': 'Ψ', '\\Omega': 'Ω',
    
    // Matematik fonksiyonları
    '\\sum': '∑', '\\int': '∫', '\\prod': '∏', '\\partial': '∂', 
    '\\nabla': '∇', '\\triangle': '△', '\\angle': '∠',
    
    // Ok sembolleri
    '\\rightarrow': '→', '\\leftarrow': '←', '\\leftrightarrow': '↔',
    '\\Rightarrow': '⇒', '\\Leftarrow': '⇐', '\\Leftrightarrow': '⇔',
    
    // Diğer semboller
    '\\forall': '∀', '\\exists': '∃', '\\neg': '¬', '\\land': '∧', '\\lor': '∨'
  };
  
  Object.entries(replacements).forEach(([latex, unicode]) => {
    processed = processed.replace(new RegExp(latex.replace('\\', '\\\\'), 'g'), unicode);
  });
  
  // Kesirler - daha iyi formatla
  processed = processed.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)');
  
  // Kök - daha iyi formatla
  processed = processed.replace(/\\sqrt\{([^}]*)\}/g, '√($1)');
  processed = processed.replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, '$1√($2)');
  
  // Üst simgeler - daha iyi formatla
  processed = processed.replace(/\^\{([^}]*)\}/g, (match, exp) => {
    const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    if (exp.length === 1 && /\d/.test(exp)) {
      return superscripts[parseInt(exp)];
    }
    return '^(' + exp + ')';
  });
  
  // Alt simgeler - daha iyi formatla
  processed = processed.replace(/_{([^}]*)}/g, (match, sub) => {
    const subscripts = '₀₁₂₃₄₅₆₇₈₉';
    if (sub.length === 1 && /\d/.test(sub)) {
      return subscripts[parseInt(sub)];
    }
    return '_(' + sub + ')';
  });
  
  // Logaritma ve trigonometrik fonksiyonlar
  processed = processed.replace(/\\log/g, 'log');
  processed = processed.replace(/\\ln/g, 'ln');
  processed = processed.replace(/\\sin/g, 'sin');
  processed = processed.replace(/\\cos/g, 'cos');
  processed = processed.replace(/\\tan/g, 'tan');
  
  // Gereksiz karakterleri temizle
  processed = processed.replace(/\{([^{}]*)\}/g, '$1');
  processed = processed.replace(/\\/g, '');
  
  return processed;
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
  
  // Soru içeriğini işle
  const questionTitle = question.title ? `${questionNumber}. ${question.title}` : `${questionNumber}. Soru`;
  const questionContent = processLatexToText(question.content);
  
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
      const processedOption = processLatexToText(option);
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
