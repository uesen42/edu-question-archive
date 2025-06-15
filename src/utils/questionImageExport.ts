import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Question, Category } from '@/types';
import { EXPORT_WIDTH, EXPORT_HEIGHT, wrapText, simplifyMathContent, renderLatexInHtml } from './textMathUtils';

// HTML to Canvas dönüşümü için yardımcı fonksiyon
const htmlToCanvas = async (htmlContent: string, width: number = EXPORT_WIDTH, height: number = EXPORT_HEIGHT): Promise<HTMLCanvasElement> => {
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
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any existing transforms
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
    tempDiv.style.width = `${EXPORT_WIDTH}px`; // HER YERDE ARTIK 250px garantili olur
    tempDiv.style.maxWidth = `${EXPORT_WIDTH}px`;

    document.body.appendChild(tempDiv);

    setTimeout(() => {
      try {
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
  const marginLeft = 10;
  const marginRight = 10;
  const lineHeight = 16;
  const contentWidth = maxWidth - marginLeft - marginRight;

  // Başlık
  const titleElements = element.querySelectorAll('.question-title');
  titleElements.forEach((titleEl) => {
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#1a1a1a';
    const title = titleEl.textContent || '';
    const titleLines = wrapText(ctx, title, contentWidth);
    titleLines.forEach(line => {
      ctx.fillText(line, marginLeft, currentY);
      currentY += lineHeight + 2;
    });
    currentY += 8;
  });

  // İçerik
  const contentElements = element.querySelectorAll('.question-content');
  contentElements.forEach((contentEl) => {
    ctx.font = '11px Arial';
    ctx.fillStyle = '#333';
    const mathElements = contentEl.querySelectorAll('.katex');
    if (mathElements.length > 0) {
      const simplifiedText = simplifyMathContent(contentEl.textContent || '');
      const lines = wrapText(ctx, simplifiedText, contentWidth);
      lines.forEach(line => {
        ctx.fillText(line, marginLeft, currentY);
        currentY += lineHeight;
      });
    } else {
      const text = contentEl.textContent || '';
      const lines = wrapText(ctx, text, contentWidth);
      lines.forEach(line => {
        ctx.fillText(line, marginLeft, currentY);
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
      const x = lineIndex === 0 ? marginLeft : marginLeft + 10;
      ctx.fillText(line, x, currentY);
      currentY += 15;
    });
    currentY += 3;
  });
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

    // LaTeX içeriğini daha güvenli şekilde render et
    const renderedContent = renderLatexInHtml(question.content);

    // HTML içeriği oluştur - tam 250px genişlik için
    let htmlContent = `
      <div class="question-container" style="width: 250px; max-width: 250px; box-sizing: border-box; font-family: Arial, sans-serif;">
        <div class="question-title" style="font-weight: bold; margin-bottom: 8px; word-wrap: break-word; font-size: 14px;">${questionTitle}</div>
        <div class="question-content" style="margin-bottom: 12px; word-wrap: break-word; font-size: 12px; line-height: 1.4;">${renderedContent}</div>
    `;

    // Seçenekleri ekle
    if (showOptions && question.options && question.options.length > 0) {
      question.options.forEach((option, index) => {
        const renderedOption = renderLatexInHtml(option);
        const optionLetter = String.fromCharCode(65 + index);
        htmlContent += `<div class="question-option" style="margin-bottom: 4px; word-wrap: break-word; font-size: 11px;">${optionLetter}) ${renderedOption}</div>`;
      });
    }

    htmlContent += '</div>';

    // Canvas'a çevir - tam 250px genişlik
    const canvas = await htmlToCanvas(htmlContent, EXPORT_WIDTH, EXPORT_HEIGHT);

    // PNG olarak indir
    const link = document.createElement('a');
    const fileName = `soru-${questionNumber}-${(question.title || 'soru').replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]/g, '-').substring(0, 30)}`;
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
