import { Question } from '@/types';
import katex from 'katex';
import { EXPORT_WIDTH, EXPORT_HEIGHT, wrapText, simplifyMathContent } from './textMathUtils';

// SVG text wrapping fonksiyonu
const wrapTextOld = (text: string, maxWidth: number, fontSize: number = 14): string[] => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  // Yaklaşık karakter genişliği (fontSize'a göre)
  const charWidth = fontSize * 0.6;
  const maxChars = Math.floor(maxWidth / charWidth);
  
  for (const word of words) {
    if ((currentLine + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines;
};

// LaTeX formüllerini basit metin olarak temizle
const cleanLatexToText = (content: string): string => {
  let cleaned = content || '';
  
  // HTML etiketlerini kaldır
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');
  
  // LaTeX formüllerini basitleştir
  cleaned = cleaned.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
    // Basit matematiksel ifadeleri düz metne çevir
    return formula
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\int/g, '∫')
      .replace(/\\sum/g, '∑')
      .replace(/\\prod/g, '∏')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\pi/g, 'π')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\theta/g, 'θ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\mu/g, 'μ')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\phi/g, 'φ')
      .replace(/\\omega/g, 'ω')
      .replace(/\\_/g, '_')
      .replace(/\\\^/g, '^')
      .replace(/\{([^}]+)\}/g, '$1');
  });
  
  // Tek $ işaretli formüller için aynı işlem
  cleaned = cleaned.replace(/\$([^$]+)\$/g, (match, formula) => {
    return formula
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\{([^}]+)\}/g, '$1');
  });
  
  // \[ \] ve \( \) formüllerini de temizle
  cleaned = cleaned.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
    return formula.replace(/\{([^}]+)\}/g, '$1');
  });
  
  cleaned = cleaned.replace(/\\\(([^)]+)\\\)/g, (match, formula) => {
    return formula.replace(/\{([^}]+)\}/g, '$1');
  });
  
  // Çoklu boşlukları tek boşluğa çevir
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
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

// Basit SVG text çıktısı oluştur
export const renderQuestionToSVG = (
  question: Question, 
  questionNumber: number, 
  showOptions: boolean = false,
  width: number = EXPORT_WIDTH,
  height: number = EXPORT_HEIGHT
): string => {
  const questionTitle = question.title
    ? `${questionNumber}. ${question.title}`
    : `${questionNumber}. Soru`;

  // İçeriği temizle
  const cleanContent = cleanLatexToText(question.content);
  
  // SVG içeriği oluştur
  let svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .title-text { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #1a1a1a; }
          .content-text { font-family: Arial, sans-serif; font-size: 14px; fill: #333; }
          .option-text { font-family: Arial, sans-serif; font-size: 12px; fill: #555; }
        </style>
      </defs>
      <rect width="100%" height="100%" fill="white" stroke="#e0e0e0" stroke-width="1"/>
  `;
  
  let currentY = 30;
  const margin = 20;
  const lineHeight = 20;
  
  // Başlık
  svgContent += `<text x="${margin}" y="${currentY}" class="title-text">${escapeXml(questionTitle)}</text>`;
  currentY += 30;
  
  // İçerik - metni satırlara böl
  const contentLines = wrapText(width - 2 * margin, cleanContent, 14);
  contentLines.forEach((line) => {
    svgContent += `<text x="${margin}" y="${currentY}" class="content-text">${escapeXml(line)}</text>`;
    currentY += lineHeight;
  });
  
  currentY += 10;
  
  // Seçenekler
  if (showOptions && question.options && question.options.length > 0) {
    question.options.forEach((option, index) => {
      const optionLetter = String.fromCharCode(65 + index);
      const cleanOption = cleanLatexToText(option);
      const optionText = `${optionLetter}) ${cleanOption}`;
      
      const optionLines = wrapText(width - 2 * margin - 20, optionText, 12);
      optionLines.forEach((line, lineIndex) => {
        const x = lineIndex === 0 ? margin + 20 : margin + 40;
        svgContent += `<text x="${x}" y="${currentY}" class="option-text">${escapeXml(line)}</text>`;
        currentY += 16;
      });
      currentY += 8;
    });
  }
  
  svgContent += '</svg>';
  
  return svgContent;
};
