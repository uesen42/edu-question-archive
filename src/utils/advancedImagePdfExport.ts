import jsPDF from 'jspdf';
import { Question, Category, Test } from '@/types';
import { Exam } from '@/types/exam';
import { renderLatexInHtml, simplifyMathContent } from './textMathUtils';

/**
 * Gelişmiş resim tabanlı PDF export sistemi
 * Soruları önce HTML olarak render edip canvas'a çevirir, sonra PDF'e yerleştirir
 */

export interface ImageExportSettings {
  singleColumnWidth: number;
  doubleColumnWidth: number;
  questionHeight: number;
  showOptions: boolean;
  showAnswers: boolean;
  marginSize: number;
}

export const defaultImageExportSettings: ImageExportSettings = {
  singleColumnWidth: 400,  // Tek sütun genişliği
  doubleColumnWidth: 190,  // İki sütun için her bir sütun genişliği
  questionHeight: 200,     // Soru yüksekliği
  showOptions: true,
  showAnswers: false,
  marginSize: 15
};

/**
 * HTML içeriğini canvas'a çevirir
 */
async function htmlToCanvas(
  htmlContent: string, 
  width: number, 
  height: number
): Promise<HTMLCanvasElement> {
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
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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
    tempDiv.style.width = `${width}px`;
    tempDiv.style.maxWidth = `${width}px`;
    tempDiv.style.padding = '10px';
    tempDiv.style.boxSizing = 'border-box';

    document.body.appendChild(tempDiv);

    setTimeout(() => {
      try {
        // HTML2Canvas kullanmaya alternatif basit canvas çizimi
        drawHtmlToCanvas(ctx, tempDiv, width, height);
        document.body.removeChild(tempDiv);
        resolve(canvas);
      } catch (error) {
        document.body.removeChild(tempDiv);
        reject(error);
      }
    }, 300);
  });
}

/**
 * HTML elementini canvas'a çizer
 */
function drawHtmlToCanvas(
  ctx: CanvasRenderingContext2D, 
  element: HTMLElement, 
  maxWidth: number, 
  maxHeight: number
) {
  let currentY = 15;
  const marginLeft = 10;
  const marginRight = 10;
  const lineHeight = 16;
  const contentWidth = maxWidth - marginLeft - marginRight;

  // Soru numarası ve başlık
  const titleElements = element.querySelectorAll('.question-number, .question-title');
  titleElements.forEach((titleEl) => {
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillStyle = '#1a1a1a';
    const title = titleEl.textContent || '';
    const titleLines = wrapText(ctx, title, contentWidth);
    titleLines.forEach(line => {
      ctx.fillText(line, marginLeft, currentY);
      currentY += lineHeight + 2;
    });
    currentY += 8;
  });

  // Soru içeriği
  const contentElements = element.querySelectorAll('.question-content');
  contentElements.forEach((contentEl) => {
    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = '#333';
    const text = contentEl.textContent || '';
    const lines = wrapText(ctx, text, contentWidth);
    lines.forEach(line => {
      ctx.fillText(line, marginLeft, currentY);
      currentY += lineHeight;
    });
    currentY += 10;
  });

  // Seçenekler
  const optionElements = element.querySelectorAll('.question-option');
  optionElements.forEach((optionEl) => {
    ctx.font = '11px Arial, sans-serif';
    ctx.fillStyle = '#555';
    const text = optionEl.textContent || '';
    const lines = wrapText(ctx, text, contentWidth - 15);
    lines.forEach((line, lineIndex) => {
      const x = lineIndex === 0 ? marginLeft : marginLeft + 15;
      ctx.fillText(line, x, currentY);
      currentY += 14;
    });
    currentY += 3;
  });
}

/**
 * Metin satırlarını böler
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  lines.push(currentLine);
  return lines;
}

/**
 * Soru için HTML içeriği oluşturur
 */
function generateQuestionHTML(
  question: Question,
  questionNumber: number,
  settings: ImageExportSettings,
  width: number
): string {
  const renderedContent = renderLatexInHtml(question.content);
  
  let htmlContent = `
    <div class="question-container" style="
      width: ${width}px; 
      max-width: ${width}px; 
      box-sizing: border-box; 
      font-family: Arial, sans-serif;
      padding: 10px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
    ">
      <div class="question-number" style="
        font-weight: bold; 
        margin-bottom: 8px; 
        font-size: 14px;
        color: #1a1a1a;
      ">
        ${questionNumber}. Soru
      </div>
      <div class="question-content" style="
        margin-bottom: 12px; 
        word-wrap: break-word; 
        font-size: 12px; 
        line-height: 1.4;
        color: #333;
      ">
        ${renderedContent}
      </div>
  `;

  // Seçenekleri ekle
  if (settings.showOptions && question.options && question.options.length > 0) {
    question.options.forEach((option, index) => {
      const renderedOption = renderLatexInHtml(option);
      const optionLetter = String.fromCharCode(65 + index);
      const isCorrect = settings.showAnswers && question.correctAnswer === index;
      
      htmlContent += `
        <div class="question-option" style="
          margin-bottom: 6px; 
          word-wrap: break-word; 
          font-size: 11px;
          color: ${isCorrect ? '#4CAF50' : '#555'};
          font-weight: ${isCorrect ? 'bold' : 'normal'};
        ">
          ${optionLetter}) ${renderedOption}
        </div>
      `;
    });
  }

  htmlContent += '</div>';
  return htmlContent;
}

/**
 * Soru resmini oluşturur
 */
async function generateQuestionImage(
  question: Question,
  questionNumber: number,
  settings: ImageExportSettings,
  width: number
): Promise<string> {
  const htmlContent = generateQuestionHTML(question, questionNumber, settings, width);
  const canvas = await htmlToCanvas(htmlContent, width, settings.questionHeight);
  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Test için tek sütun PDF oluşturur
 */
export async function exportTestSingleColumnImagePDF(
  test: Test,
  questions: Question[],
  categories: Category[],
  settings: ImageExportSettings = defaultImageExportSettings
): Promise<void> {
  try {
    console.log('Tek sütun resim tabanlı PDF oluşturuluyor...');
    
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = settings.marginSize;
    const contentWidth = pageWidth - (2 * margin);
    
    // Başlık ekle
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(test.title, margin, margin + 10);
    
    let currentY = margin + 25;
    
    const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
    
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      
      // Soru resmini oluştur
      const imageData = await generateQuestionImage(
        question, 
        i + 1, 
        settings, 
        settings.singleColumnWidth
      );
      
      // Resim boyutunu hesapla
      const imageWidth = contentWidth;
      const imageHeight = (settings.questionHeight * imageWidth) / settings.singleColumnWidth;
      
      // Yeni sayfa gerekli mi kontrol et
      if (currentY + imageHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }
      
      // Resmi PDF'e ekle
      pdf.addImage(imageData, 'PNG', margin, currentY, imageWidth, imageHeight);
      currentY += imageHeight + 10;
      
      // İlerleme bildirimi
      console.log(`Soru ${i + 1}/${testQuestions.length} eklendi`);
    }
    
    // PDF'i kaydet
    const fileName = `${test.title.replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]/g, '-')}_tek_sutun.pdf`;
    pdf.save(fileName);
    
    console.log('Tek sütun PDF başarıyla oluşturuldu!');
    
  } catch (error) {
    console.error('Tek sütun PDF oluşturma hatası:', error);
    throw error;
  }
}

/**
 * Test için çift sütun PDF oluşturur
 */
export async function exportTestDoubleColumnImagePDF(
  test: Test,
  questions: Question[],
  categories: Category[],
  settings: ImageExportSettings = defaultImageExportSettings
): Promise<void> {
  try {
    console.log('Çift sütun resim tabanlı PDF oluşturuluyor...');
    
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = settings.marginSize;
    const columnWidth = (pageWidth - (3 * margin)) / 2;
    
    // Başlık ekle
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(test.title, margin, margin + 10);
    
    let currentY = margin + 25;
    let currentColumn = 0; // 0: sol sütun, 1: sağ sütun
    
    const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
    
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      
      // Soru resmini oluştur
      const imageData = await generateQuestionImage(
        question, 
        i + 1, 
        settings, 
        settings.doubleColumnWidth
      );
      
      // Resim boyutunu hesapla
      const imageWidth = columnWidth;
      const imageHeight = (settings.questionHeight * imageWidth) / settings.doubleColumnWidth;
      
      // X pozisyonunu hesapla
      const xPos = currentColumn === 0 ? margin : margin + columnWidth + margin;
      
      // Yeni sayfa gerekli mi kontrol et
      if (currentY + imageHeight > pageHeight - margin) {
        if (currentColumn === 0) {
          // Sol sütundaysak sağ sütuna geç
          currentColumn = 1;
        } else {
          // Sağ sütundaysak yeni sayfa
          pdf.addPage();
          currentY = margin + 25;
          currentColumn = 0;
        }
      }
      
      // X pozisyonunu yeniden hesapla
      const finalXPos = currentColumn === 0 ? margin : margin + columnWidth + margin;
      
      // Resmi PDF'e ekle
      pdf.addImage(imageData, 'PNG', finalXPos, currentY, imageWidth, imageHeight);
      
      // Sonraki pozisyonu hesapla
      if (currentColumn === 0) {
        currentColumn = 1;
      } else {
        currentColumn = 0;
        currentY += imageHeight + 10;
      }
      
      // İlerleme bildirimi
      console.log(`Soru ${i + 1}/${testQuestions.length} eklendi`);
    }
    
    // PDF'i kaydet
    const fileName = `${test.title.replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]/g, '-')}_cift_sutun.pdf`;
    pdf.save(fileName);
    
    console.log('Çift sütun PDF başarıyla oluşturuldu!');
    
  } catch (error) {
    console.error('Çift sütun PDF oluşturma hatası:', error);
    throw error;
  }
}

/**
 * Açık uçlu sorular için hem tek hem çift sütun PDF oluşturur
 */
export async function exportOpenEndedQuestionsPDF(
  questions: Question[],
  categories: Category[],
  settings: ImageExportSettings = defaultImageExportSettings
): Promise<void> {
  try {
    // Açık uçlu soruları filtrele (seçeneği olmayan sorular)
    const openEndedQuestions = questions.filter(q => !q.options || q.options.length === 0);
    
    if (openEndedQuestions.length === 0) {
      console.log('Açık uçlu soru bulunamadı');
      return;
    }
    
    // Tek sütun PDF
    await exportQuestionsImagePDF(
      openEndedQuestions, 
      categories, 
      'Açık Uçlu Sorular - Tek Sütun', 
      'single',
      settings
    );
    
    // Çift sütun PDF
    await exportQuestionsImagePDF(
      openEndedQuestions, 
      categories, 
      'Açık Uçlu Sorular - Çift Sütun', 
      'double',
      settings
    );
    
    console.log('Açık uçlu sorular için PDF\'ler oluşturuldu!');
    
  } catch (error) {
    console.error('Açık uçlu soru PDF oluşturma hatası:', error);
    throw error;
  }
}

/**
 * Genel soru listesi için PDF oluşturur
 */
async function exportQuestionsImagePDF(
  questions: Question[],
  categories: Category[],
  title: string,
  layout: 'single' | 'double',
  settings: ImageExportSettings
): Promise<void> {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = settings.marginSize;
  
  // Başlık ekle
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, margin + 10);
  
  if (layout === 'single') {
    // Tek sütun layout
    const contentWidth = pageWidth - (2 * margin);
    let currentY = margin + 25;
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      const imageData = await generateQuestionImage(
        question, 
        i + 1, 
        settings, 
        settings.singleColumnWidth
      );
      
      const imageWidth = contentWidth;
      const imageHeight = (settings.questionHeight * imageWidth) / settings.singleColumnWidth;
      
      if (currentY + imageHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }
      
      pdf.addImage(imageData, 'PNG', margin, currentY, imageWidth, imageHeight);
      currentY += imageHeight + 10;
    }
  } else {
    // Çift sütun layout
    const columnWidth = (pageWidth - (3 * margin)) / 2;
    let currentY = margin + 25;
    let currentColumn = 0;
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      const imageData = await generateQuestionImage(
        question, 
        i + 1, 
        settings, 
        settings.doubleColumnWidth
      );
      
      const imageWidth = columnWidth;
      const imageHeight = (settings.questionHeight * imageWidth) / settings.doubleColumnWidth;
      
      if (currentY + imageHeight > pageHeight - margin) {
        if (currentColumn === 0) {
          currentColumn = 1;
        } else {
          pdf.addPage();
          currentY = margin + 25;
          currentColumn = 0;
        }
      }
      
      const xPos = currentColumn === 0 ? margin : margin + columnWidth + margin;
      pdf.addImage(imageData, 'PNG', xPos, currentY, imageWidth, imageHeight);
      
      if (currentColumn === 0) {
        currentColumn = 1;
      } else {
        currentColumn = 0;
        currentY += imageHeight + 10;
      }
    }
  }
  
  // PDF'i kaydet
  const fileName = `${title.replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ\s]/g, '-')}.pdf`;
  pdf.save(fileName);
}