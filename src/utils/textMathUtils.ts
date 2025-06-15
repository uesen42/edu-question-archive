
/**
 * Ortak math/metin tool'ları -- hem SVG hem PNG export için!
 */

import katex from "katex";

export const EXPORT_WIDTH = 250;
export const EXPORT_HEIGHT = 400;

// Metin sarma fonksiyonu
export function wrapText(ctxOrWidth: CanvasRenderingContext2D | number, text: string, maxWidth: number, fontSize: number = 12): string[] {
  if (typeof ctxOrWidth === "number") {
    // SVG versiyonu (fontSize üzerinden tahmini karakter sayısı)
    const charWidth = fontSize * 0.6;
    const maxChars = Math.floor(maxWidth / charWidth);
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";
    for (const word of words) {
      if ((currentLine + word).length <= maxChars) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  } else {
    // Canvas versiyonu (metrik ölçüm)
    const ctx = ctxOrWidth;
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }
}

export function simplifyMathContent(text: string): string {
  let simplified = text;
  // Basit yaygın LaTeX komutlarını insan okunur biçime çevir
  simplified = simplified.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1/$2)");
  simplified = simplified.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");
  simplified = simplified.replace(/\\pi/g, "π");
  simplified = simplified.replace(/\\alpha/g, "α");
  simplified = simplified.replace(/\\beta/g, "β");
  simplified = simplified.replace(/\\gamma/g, "γ");
  simplified = simplified.replace(/\\theta/g, "θ");
  simplified = simplified.replace(/\\sum/g, "∑");
  simplified = simplified.replace(/\\int/g, "∫");
  simplified = simplified.replace(/\\infty/g, "∞");
  simplified = simplified.replace(/\\leq/g, "≤");
  simplified = simplified.replace(/\\geq/g, "≥");
  simplified = simplified.replace(/\\neq/g, "≠");
  simplified = simplified.replace(/\\pm/g, "±");
  simplified = simplified.replace(/\\times/g, "×");
  simplified = simplified.replace(/\\div/g, "÷");
  simplified = simplified.replace(/[{}]/g, "");
  simplified = simplified.replace(/\\/g, "");
  return simplified;
}

// KaTeX içeriğini HTML içi olarak render et (fallback'li)
export function renderLatexInHtml(content: string): string {
  let rendered = content;
  try {
    rendered = rendered.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
      try {
        return katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false, trust: false, strict: "ignore", macros: {} });
      } catch {
        return `<div style="text-align: center; margin: 8px 0;">[${simplifyMathContent(latex.trim())}]</div>`;
      }
    });
    rendered = rendered.replace(/\$([^$]+)\$/g, (match, latex) => {
      try {
        return katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false, trust: false, strict: "ignore", macros: {} });
      } catch {
        return `[${simplifyMathContent(latex.trim())}]`;
      }
    });
  } catch (error) {
    rendered = content.replace(/\$\$([^$]+)\$\$/g, (match, latex) => `[${simplifyMathContent(latex)}]`);
    rendered = rendered.replace(/\$([^$]+)\$/g, (match, latex) => `[${simplifyMathContent(latex)}]`);
  }
  return rendered;
}
