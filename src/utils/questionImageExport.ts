
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Question, Category } from '@/types';

// HTML to Canvas dönüşümü için yardımcı fonksiyon
const htmlToCanvas = async (htmlContent: string, width: number = 800, height: number = 600): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context oluşturulamadı'));
      return;
    }

    // High DPI için scale
    const scale = window.devicePixelRatio || 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(scale, scale);

    // Beyaz arka plan
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Temporary div oluştur
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = width + 'px';
    tempDiv.style.padding = '20px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.5';
    tempDiv.style.backgroundColor = 'white';

    document.body.appendChild(tempDiv);

    // DOM'da render olduktan sonra canvas'a çiz
    setTimeout(() => {
      try {
        // HTML2Canvas benzeri manuel rendering
        drawHtmlToCanvas(ctx, tempDiv, width, height);
        document.body.removeChild(tempDiv);
        resolve(canvas);
      } catch (error) {
        document.body.removeChild(tempDiv);
        reject(error);
      }
    }, 100);
  });
};

// HTML elementini canvas'a çizme fonksiyonu
const drawHtmlToCanvas = (ctx: CanvasRenderingContext2D, element: HTMLElement, maxWidth: number, maxHeight: number) => {
  let currentY = 20;
  const margin = 20;
  const lineHeight = 20;

  // Başlık
  const titleElements = element.querySelectorAll('.question-title');
  titleElements.forEach((titleEl) => {
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#1a1a1a';
    const title = titleEl.textContent || '';
    ctx.fillText(title, margin, currentY);
    currentY += 30;
  });

  // İçerik
  const contentElements = element.querySelectorAll('.question-content');
  contentElements.forEach((contentEl) => {
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    
    // KaTeX render edilmiş elementleri kontrol et
    const mathElements = contentEl.querySelectorAll('.katex');
    if (mathElements.length > 0) {
      // Matematik ifadeleri var, bunları özel olarak işle
      drawMathContent(ctx, contentEl, margin, currentY, maxWidth - 2 * margin);
      currentY += Math.min(mathElements.length * 25 + 50, maxHeight - currentY - 100);
    } else {
      // Normal metin
      const text = contentEl.textContent || '';
      const lines = wrapText(ctx, text, maxWidth - 2 * margin);
      lines.forEach(line => {
        ctx.fillText(line, margin, currentY);
        currentY += lineHeight;
      });
    }
  });

  // Seçenekler
  const optionElements = element.querySelectorAll('.question-option');
  optionElements.forEach((optionEl, index) => {
    ctx.font = '12px Arial';
    ctx.fillStyle = '#555';
    const optionLetter = String.fromCharCode(65 + index);
    const text = `${optionLetter}) ${optionEl.textContent || ''}`;
    const lines = wrapText(ctx, text, maxWidth - 2 * margin - 20);
    lines.forEach((line, lineIndex) => {
      const x = lineIndex === 0 ? margin + 20 : margin + 40;
      ctx.fillText(line, x, currentY);
      currentY += 16;
    });
    currentY += 8;
  });
};

// Matematik içeriğini özel olarak çizme
const drawMathContent = (ctx: CanvasRenderingContext2D, element: Element, x: number, y: number, maxWidth: number) => {
  const text = element.textContent || '';
  // Basit fallback - karmaşık matematik için
  const lines = wrapText(ctx, text, maxWidth);
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + (index * 20));
  });
};

// Metin sarma fonksiyonu
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// LaTeX içeriğini render et
const renderLatexInHtml = (content: string): string => {
  let rendered = content;
  
  try {
    // Block math $$...$$ 
    rendered = rendered.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
      try {
        return katex.renderToString(latex, { displayMode: true, throwOnError: false });
      } catch {
        return match;
      }
    });

    // Inline math $...$
    rendered = rendered.replace(/\$([^$]+)\$/g, (match, latex) => {
      try {
        return katex.renderToString(latex, { displayMode: false, throwOnError: false });
      } catch {
        return match;
      }
    });
  } catch (error) {
    console.warn('LaTeX rendering hatası:', error);
  }

  return rendered;
};

// Ana export fonksiyonu
export const exportQuestionToImage = async (
  question: Question,
  questionNumber: number,
  category?: Category,
  showOptions: boolean = false
): Promise<void> => {
  try {
    const questionTitle = question.title 
      ? `${questionNumber}. ${question.title}`
      : `${questionNumber}. Soru`;

    // LaTeX içeriğini render et
    const renderedContent = renderLatexInHtml(question.content);

    // HTML içeriği oluştur
    let htmlContent = `
      <div class="question-container">
        <div class="question-title">${questionTitle}</div>
        <div class="question-content">${renderedContent}</div>
    `;

    // Seçenekleri ekle
    if (showOptions && question.options && question.options.length > 0) {
      question.options.forEach((option, index) => {
        const renderedOption = renderLatexInHtml(option);
        htmlContent += `<div class="question-option">${renderedOption}</div>`;
      });
    }

    htmlContent += '</div>';

    // Canvas'a çevir
    const canvas = await htmlToCanvas(htmlContent, 800, 600);

    // PNG olarak indir
    const link = document.createElement('a');
    link.download = `soru-${questionNumber}-${question.title.replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    console.log(`Soru ${questionNumber} başarıyla resim olarak kaydedildi`);
  } catch (error) {
    console.error(`Soru ${questionNumber} resim olarak kaydedilemedi:`, error);
  }
};

// Tüm soruları export et
export const exportAllQuestionsToImages = async (
  questions: Question[],
  categories: Category[],
  showOptions: boolean = false
): Promise<void> => {
  console.log(`${questions.length} soru resim olarak kaydediliyor...`);
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const category = categories.find(cat => cat.id === question.categoryId);
    
    await exportQuestionToImage(question, i + 1, category, showOptions);
    
    // Tarayıcıyı bloke etmemek için kısa bir bekleme
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Tüm sorular başarıyla resim olarak kaydedildi!');
};
