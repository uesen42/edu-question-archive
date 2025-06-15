
import { Question } from '@/types';
import { EXPORT_WIDTH, EXPORT_HEIGHT, wrapText, convertLatexToPlainText } from './textMathUtils';

// XML karakterlerini escape et
const escapeXml = (text: string): string => {
  if (!text) return "";
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

  // İçeriği düz metne çevir
  const cleanContent = convertLatexToPlainText(question.content);
  
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
      const cleanOption = convertLatexToPlainText(option);
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
