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
    tempDiv.style.width = '250px'; // Sabit genişlik
    tempDiv.style.maxWidth = '250px';
    tempDiv.style.padding = '10px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.4';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.wordWrap = 'break-word';
    tempDiv.style.overflow = 'hidden';

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
    }, 500); // Daha fazla bekleme süresi
  });
};

// HTML elementini canvas'a çizme fonksiyonu
const drawHtmlToCanvas = (ctx: CanvasRenderingContext2D, element: HTMLElement, maxWidth: number, maxHeight: number) => {
  let currentY = 20;
  const margin = 15;
  const lineHeight = 18;
  const maxTextWidth = 250; // Sabit metin genişliği

  // Başlık
  const titleElements = element.querySelectorAll('.question-title');
  titleElements.forEach((titleEl) => {
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#1a1a1a';
    const title = titleEl.textContent || '';
    const titleLines = wrapText(ctx, title, maxTextWidth);
    titleLines.forEach(line => {
      ctx.fillText(line, margin, currentY);
      currentY += lineHeight;
    });
    currentY += 10;
  });

  // İçerik
  const contentElements = element.querySelectorAll('.question-content');
  contentElements.forEach((contentEl) => {
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    
    // KaTeX render edilmiş elementleri kontrol et
    const mathElements = contentEl.querySelectorAll('.katex');
    if (mathElements.length > 0) {
      // Matematik ifadeleri var, bunları metin olarak çevir
      const mathText = extractMathText(contentEl);
      const lines = wrapText(ctx, mathText, maxTextWidth);
      lines.forEach(line => {
        ctx.fillText(line, margin, currentY);
        currentY += lineHeight;
      });
    } else {
      // Normal metin
      const text = contentEl.textContent || '';
      const lines = wrapText(ctx, text, maxTextWidth);
      lines.forEach(line => {
        ctx.fillText(line, margin, currentY);
        currentY += lineHeight;
      });
    }
    currentY += 10;
  });

  // Seçenekler
  const optionElements = element.querySelectorAll('.question-option');
  optionElements.forEach((optionEl, index) => {
    ctx.font = '11px Arial';
    ctx.fillStyle = '#555';
    const optionLetter = String.fromCharCode(65 + index);
    const optionText = optionEl.textContent || '';
    const text = `${optionLetter}) ${optionText}`;
    const lines = wrapText(ctx, text, maxTextWidth - 15);
    lines.forEach((line, lineIndex) => {
      const x = lineIndex === 0 ? margin : margin + 15;
      ctx.fillText(line, x, currentY);
      currentY += 16;
    });
    currentY += 5;
  });
};

// Matematik metinlerini düz metne çevir
const extractMathText = (element: Element): string => {
  let text = '';
  
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.parentElement && !node.parentElement.classList.contains('katex')) {
      text += node.textContent + ' ';
    }
  }
  
  // KaTeX elementlerini basit metne çevir
  const mathElements = element.querySelectorAll('.katex');
  mathElements.forEach(mathEl => {
    // Math elementinin title attribute'ünü kullan (orijinal LaTeX)
    const mathTitle = mathEl.getAttribute('title') || mathEl.textContent || '';
    text += ' ' + mathTitle + ' ';
  });
  
  return text.trim();
};

// Metin sarma fonksiyonu - 250 pixel için optimize edilmiş
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

// LaTeX içeriğini daha güvenli şekilde render et
const renderLatexInHtml = (content: string): string => {
  let rendered = content;
  
  try {
    // Block math $$...$$ 
    rendered = rendered.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
      try {
        return katex.renderToString(latex.trim(), { 
          displayMode: true, 
          throwOnError: false,
          trust: false,
          strict: false
        });
      } catch {
        return `[${latex.trim()}]`; // Fallback
      }
    });

    // Inline math $...$
    rendered = rendered.replace(/\$([^$]+)\$/g, (match, latex) => {
      try {
        return katex.renderToString(latex.trim(), { 
          displayMode: false, 
          throwOnError: false,
          trust: false,
          strict: false
        });
      } catch {
        return `[${latex.trim()}]`; // Fallback
      }
    });
  } catch (error) {
    console.warn('LaTeX rendering hatası:', error);
    // LaTeX render edilemezse orijinal metni döndür
    return content;
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

    // HTML içeriği oluştur - 250px genişlik için optimize edilmiş
    let htmlContent = `
      <div class="question-container" style="width: 250px; max-width: 250px;">
        <div class="question-title" style="font-weight: bold; margin-bottom: 8px;">${questionTitle}</div>
        <div class="question-content" style="margin-bottom: 12px; word-wrap: break-word;">${renderedContent}</div>
    `;

    // Seçenekleri ekle
    if (showOptions && question.options && question.options.length > 0) {
      question.options.forEach((option, index) => {
        const renderedOption = renderLatexInHtml(option);
        htmlContent += `<div class="question-option" style="margin-bottom: 4px; word-wrap: break-word;">${renderedOption}</div>`;
      });
    }

    htmlContent += '</div>';

    // Canvas'a çevir - 280px genişlik (250px + padding)
    const canvas = await htmlToCanvas(htmlContent, 280, 400);

    // PNG olarak indir
    const link = document.createElement('a');
    const fileName = `soru-${questionNumber}-${question.title.replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]/g, '-').substring(0, 30)}`;
    link.download = `${fileName}.png`;
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
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  console.log('Tüm sorular başarıyla resim olarak kaydedildi!');
};
