
import { Question } from '@/types';
import katex from 'katex';

// KaTeX ile LaTeX'i işler ve HTML çıktısı döner
const renderLatexWithKatex = (content: string): string => {
  let processed = content || '';

  // Önce HTML etiketlerini kaldır (varsa)
  processed = processed.replace(/<[^>]*>/g, ' ');

  // LaTeX blok: $$ ... $$
  processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
    try {
      return `<div class="katex-display">${katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false,
        output: 'html'
      })}</div>`;
    } catch (error) {
      return `<div class="math-fallback">$$${formula}$$</div>`;
    }
  });

  // LaTeX blok: \[ ... \]
  processed = processed.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
    try {
      return `<div class="katex-display">${katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false,
        output: 'html'
      })}</div>`;
    } catch (error) {
      return `<div class="math-fallback">\\[${formula}\\]</div>`;
    }
  });

  // Inline math $ ... $ (bloklar kadar geçerli) - dikkat: bloklardan sonra olmalı!
  processed = processed.replace(/\$([^$]+)\$/g, (match, formula) => {
    try {
      return `<span class="katex-inline">${katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false,
        output: 'html'
      })}</span>`;
    } catch (error) {
      return `<span class="math-fallback">$${formula}$</span>`;
    }
  });

  // Inline math \( ... \)
  processed = processed.replace(/\\\(([^)]+)\\\)/g, (match, formula) => {
    try {
      return `<span class="katex-inline">${katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false,
        output: 'html'
      })}</span>`;
    } catch (error) {
      return `<span class="math-fallback">\\(${formula}\\)</span>`;
    }
  });

  return processed;
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

const katexFullCSS = `
.katex { font: normal 1.21em KaTeX_Main, Times New Roman, serif; }
.katex-display { margin: 1em 0; text-align: center; }
.katex .mfrac > span { display: block; text-align: center; }
.katex .mfrac > span + span { border-top: 1px solid; margin-top: 0.05em; padding-top: 0.05em; }
.katex .accent-body { position: relative; }
.katex .base { display: inline-block; }
.katex .strut { display: inline-block; }
.math-fallback { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
.katex-inline { }
.katex-html { display: inline; }
.katex .mord { font-family: KaTeX_Main, Times New Roman, serif; }
.katex .mop { font-family: KaTeX_Main, Times New Roman, serif; }
.katex .mbin { font-family: KaTeX_Main, Times New Roman, serif; }
.katex .mrel { font-family: KaTeX_Main, Times New Roman, serif; }
.katex .mopen { font-family: KaTeX_Main, Times New Roman, serif; }
.katex .mclose { font-family: KaTeX_Main, Times New Roman, serif; }
.katex .mpunct { font-family: KaTeX_Main, Times New Roman, serif; }
.katex .minner { font-family: KaTeX_Main, Times New Roman, serif; }
.katex .vlist { display: inline-block; }
.katex .vlist > span { display: block; }
`;

// SVG içinde HTML içeriği render etmek için foreignObject kullan
export const renderQuestionToSVG = (
  question: Question, 
  questionNumber: number, 
  showOptions: boolean = false,
  width: number = 800,
  height: number = 600
): string => {
  // Soru başlığı
  const questionTitle = question.title
    ? `${questionNumber}. ${question.title}`
    : `${questionNumber}. Soru`;

  // Soru içeriği KaTeX ile LaTeX dönüştürülerek hazırlanıyor
  const renderedContent = renderLatexWithKatex(question.content);

  // HTML içeriği (tam xhtml, foreignObject uyumlu!)
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #212121; width: 100%;">
      <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #1a1a1a;">
        ${escapeXml(questionTitle)}
      </h3>
      <div style="font-size: 14px; margin-bottom: 20px; color: #333;">
        ${renderedContent}
      </div>
  `;

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

  // SVG çıktısı (tam xhtml foreignObject ile)
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <foreignObject x="0" y="0" width="100%" height="100%">
        <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
            <style type="text/css"><![CDATA[
              ${katexFullCSS}
            ]]></style>
          </head>
          <body style="margin:0;padding:0;background:white;">
            ${htmlContent}
          </body>
        </html>
      </foreignObject>
    </svg>
  `;
};
