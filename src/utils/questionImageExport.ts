
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Question, Category } from '@/types';

// HTML to Canvas dönüşümü için yardımcı fonksiyon
const htmlToCanvas = async (htmlContent: string, width: number = 250, height: number = 400): Promise<HTMLCanvasElement> => {
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
    tempDiv.style.width = '250px'; // Tam 250px genişlik
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
    }, 500);
  });
};

// HTML elementini canvas'a çizme fonksiyonu
const drawHtmlToCanvas = (ctx: CanvasRenderingContext2D, element: HTMLElement, maxWidth: number, maxHeight: number) => {
  let currentY = 20;
  const margin = 10;
  const lineHeight = 16;
  const contentWidth = 230; // 250px - 20px margin (left + right)

  // Başlık
  const titleElements = element.querySelectorAll('.question-title');
  titleElements.forEach((titleEl) => {
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#1a1a1a';
    const title = titleEl.textContent || '';
    const titleLines = wrapText(ctx, title, contentWidth);
    titleLines.forEach(line => {
      ctx.fillText(line, margin, currentY);
      currentY += lineHeight + 2;
    });
    currentY += 8;
  });

  // İçerik
  const contentElements = element.querySelectorAll('.question-content');
  contentElements.forEach((contentEl) => {
    ctx.font = '11px Arial';
    ctx.fillStyle = '#333';
    
    // Matematik ifadeleri var mı kontrol et
    const mathElements = contentEl.querySelectorAll('.katex');
    if (mathElements.length > 0) {
      // LaTeX içeriğini sadeleştir
      const simplifiedText = simplifyMathContent(contentEl.textContent || '');
      const lines = wrapText(ctx, simplifiedText, contentWidth);
      lines.forEach(line => {
        ctx.fillText(line, margin, currentY);
        currentY += lineHeight;
      });
    } else {
      // Normal metin
      const text = contentEl.textContent || '';
      const lines = wrapText(ctx, text, contentWidth);
      lines.forEach(line => {
        ctx.fillText(line, margin, currentY);
        currentY += lineHeight;
      });
    }
    currentY += 8;
  });

  // Seçenekler
  const optionElements = element.querySelectorAll('.question-option');
  optionElements.forEach((optionEl, index) => {
    ctx.font = '10px Arial';
    ctx.fillStyle = '#555';
    const optionLetter = String.fromCharCode(65 + index);
    const optionText = optionEl.textContent || '';
    const text = `${optionLetter}) ${optionText}`;
    const lines = wrapText(ctx, text, contentWidth - 10);
    lines.forEach((line, lineIndex) => {
      const x = lineIndex === 0 ? margin : margin + 10;
      ctx.fillText(line, x, currentY);
      currentY += 15;
    });
    currentY += 3;
  });
};

// Matematik içeriğini sadeleştir
const simplifyMathContent = (text: string): string => {
  // LaTeX ifadelerini basit metne çevir
  let simplified = text;
  
  // Çok yaygın LaTeX komutlarını çevir
  simplified = simplified.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');
  simplified = simplified.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
  simplified = simplified.replace(/\\pi/g, 'π');
  simplified = simplified.replace(/\\alpha/g, 'α');
  simplified = simplified.replace(/\\beta/g, 'β');
  simplified = simplified.replace(/\\gamma/g, 'γ');
  simplified = simplified.replace(/\\theta/g, 'θ');
  simplified = simplified.replace(/\\sum/g, '∑');
  simplified = simplified.replace(/\\int/g, '∫');
  simplified = simplified.replace(/\\infty/g, '∞');
  simplified = simplified.replace(/\\leq/g, '≤');
  simplified = simplified.replace(/\\geq/g, '≥');
  simplified = simplified.replace(/\\neq/g, '≠');
  simplified = simplified.replace(/\\pm/g, '±');
  simplified = simplified.replace(/\\times/g, '×');
  simplified = simplified.replace(/\\div/g, '÷');
  
  // Süslü parantezleri temizle
  simplified = simplified.replace(/[{}]/g, '');
  
  // Backslash'leri temizle
  simplified = simplified.replace(/\\/g, '');
  
  return simplified;
};

// Metin sarma fonksiyonu - tam 250px için optimize edilmiş
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

// LaTeX içeriğini güvenli render et
const renderLatexInHtml = (content: string): string => {
  let rendered = content;
  
  try {
    // Block math $$...$$ - daha güvenli ayarlarla
    rendered = rendered.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
      try {
        return katex.renderToString(latex.trim(), { 
          displayMode: true, 
          throwOnError: false,
          trust: false,
          strict: 'ignore', // Türkçe karakterler için
          macros: {}
        });
      } catch {
        // LaTeX render edilemezse basit matematiksel gösterim
        return `<div style="text-align: center; margin: 8px 0;">[${simplifyMathContent(latex.trim())}]</div>`;
      }
    });

    // Inline math $...$
    rendered = rendered.replace(/\$([^$]+)\$/g, (match, latex) => {
      try {
        return katex.renderToString(latex.trim(), { 
          displayMode: false, 
          throwOnError: false,
          trust: false,
          strict: 'ignore', // Türkçe karakterler için
          macros: {}
        });
      } catch {
        // LaTeX render edilemezse basit matematiksel gösterim
        return `[${simplifyMathContent(latex.trim())}]`;
      }
    });
  } catch (error) {
    console.warn('LaTeX rendering hatası:', error);
    // Tüm LaTeX ifadelerini basitleştir
    rendered = content.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
      return `[${simplifyMathContent(latex)}]`;
    });
    rendered = rendered.replace(/\$([^$]+)\$/g, (match, latex) => {
      return `[${simplifyMathContent(latex)}]`;
    });
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

    // HTML içeriği oluştur - tam 250px genişlik için
    let htmlContent = `
      <div class="question-container" style="width: 250px; max-width: 250px; box-sizing: border-box;">
        <div class="question-title" style="font-weight: bold; margin-bottom: 8px; word-wrap: break-word;">${questionTitle}</div>
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

    // Canvas'a çevir - tam 250px genişlik
    const canvas = await htmlToCanvas(htmlContent, 250, 400);

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
