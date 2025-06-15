
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
  
  // Daha güvenli LaTeX komut değişimi
  simplified = simplified.replace(/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, "($1)/($2)");
  simplified = simplified.replace(/\\sqrt\s*\{([^}]*)\}/g, "√($1)");
  simplified = simplified.replace(/\\pi\b/g, "π");
  simplified = simplified.replace(/\\alpha\b/g, "α");
  simplified = simplified.replace(/\\beta\b/g, "β");
  simplified = simplified.replace(/\\gamma\b/g, "γ");  
  simplified = simplified.replace(/\\theta\b/g, "θ");
  simplified = simplified.replace(/\\sum\b/g, "∑");
  simplified = simplified.replace(/\\int\b/g, "∫");
  simplified = simplified.replace(/\\infty\b/g, "∞");
  simplified = simplified.replace(/\\leq\b/g, "≤");
  simplified = simplified.replace(/\\geq\b/g, "≥");
  simplified = simplified.replace(/\\neq\b/g, "≠");
  simplified = simplified.replace(/\\pm\b/g, "±");
  simplified = simplified.replace(/\\times\b/g, "×");
  simplified = simplified.replace(/\\div\b/g, "÷");
  simplified = simplified.replace(/\\cdot\b/g, "·");
  
  // Gereksiz {} ve \ karakterlerini temizle
  simplified = simplified.replace(/\{([^{}]*)\}/g, "$1");
  simplified = simplified.replace(/\\\\/g, " ");
  simplified = simplified.replace(/\s+/g, " ").trim();
  
  return simplified;
}

// Daha güvenli LaTeX render fonksiyonu
export function renderLatexInHtml(content: string): string {
  if (!content) return "";
  
  let rendered = content;
  
  try {
    // Önce block math ($$...$$) işle
    rendered = rendered.replace(/\$\$([^$]*)\$\$/g, (match, latex) => {
      if (!latex || latex.trim() === "") return match;
      
      try {
        const cleanLatex = latex.trim();
        return katex.renderToString(cleanLatex, { 
          displayMode: true, 
          throwOnError: false,
          trust: false,
          strict: "ignore",
          output: "html"
        });
      } catch (error) {
        console.warn("Block LaTeX render hatası:", latex, error);
        return `<div style="text-align: center; margin: 8px 0; padding: 4px; border: 1px solid #ddd; background: #f9f9f9;">${simplifyMathContent(latex)}</div>`;
      }
    });
    
    // Sonra inline math ($...$) işle
    rendered = rendered.replace(/\$([^$]*)\$/g, (match, latex) => {
      if (!latex || latex.trim() === "") return match;
      
      try {
        const cleanLatex = latex.trim();
        return katex.renderToString(cleanLatex, { 
          displayMode: false, 
          throwOnError: false,
          trust: false,
          strict: "ignore",
          output: "html"
        });
      } catch (error) {
        console.warn("Inline LaTeX render hatası:", latex, error);
        return `<span style="padding: 2px 4px; background: #f0f0f0; border-radius: 3px;">${simplifyMathContent(latex)}</span>`;
      }
    });
    
  } catch (generalError) {
    console.error("LaTeX render genel hatası:", generalError);
    // Tüm LaTeX'i basit metne çevir
    rendered = content.replace(/\$\$([^$]*)\$\$/g, (match, latex) => {
      return `[${simplifyMathContent(latex)}]`;
    });
    rendered = rendered.replace(/\$([^$]*)\$/g, (match, latex) => {
      return `[${simplifyMathContent(latex)}]`;
    });
  }
  
  return rendered;
}

// LaTeX'i düz metne çeviren güvenli fonksiyon
export function convertLatexToPlainText(content: string): string {
  if (!content) return "";
  
  let plainText = content;
  
  // HTML etiketlerini kaldır
  plainText = plainText.replace(/<[^>]*>/g, " ");
  
  // LaTeX formüllerini basit metne çevir
  plainText = plainText.replace(/\$\$([^$]*)\$\$/g, (match, formula) => {
    return simplifyMathContent(formula || "");
  });
  
  plainText = plainText.replace(/\$([^$]*)\$/g, (match, formula) => {
    return simplifyMathContent(formula || "");
  });
  
  // Çoklu boşlukları temizle
  plainText = plainText.replace(/\s+/g, " ").trim();
  
  return plainText;
}
