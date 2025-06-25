
import { Test, Question, Category } from '@/types';
import { Exam } from '@/types/exam';
import { parseMathSymbols, sanitizeTurkishChars, PDFExportSettings, defaultPDFSettings } from './modernPdfExport';

/**
 * Mobil cihazlar için optimize edilmiş PDF export
 */

interface MobilePDFSettings extends PDFExportSettings {
  simplifiedLayout: boolean;
  largerFonts: boolean;
  singleColumn: boolean;
}

export const defaultMobilePDFSettings: MobilePDFSettings = {
  ...defaultPDFSettings,
  simplifiedLayout: true,
  largerFonts: true,
  singleColumn: true,
  questionsPerRow: 1
};

/**
 * Mobil cihaz kontrolü
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
}

/**
 * Mobil için basitleştirilmiş HTML oluştur
 */
function generateMobileTestHTML(
  test: Test,
  questions: Question[],
  categories: Category[],
  settings: MobilePDFSettings = defaultMobilePDFSettings
): string {
  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  const orderedQuestions = test.settings.randomizeOrder 
    ? [...testQuestions].sort(() => Math.random() - 0.5)
    : testQuestions;

  const styles = `
    <style>
      @page { 
        size: A4; 
        margin: 10mm; 
      }
      * { 
        box-sizing: border-box; 
        margin: 0; 
        padding: 0; 
      }
      body { 
        font-family: Arial, sans-serif; 
        font-size: ${settings.largerFonts ? '12pt' : '10pt'}; 
        line-height: 1.4; 
        color: #000; 
        background: white; 
      }
      .container { 
        width: 100%; 
        padding: 10px; 
      }
      .header { 
        text-align: center; 
        margin-bottom: 20px; 
        padding-bottom: 10px; 
        border-bottom: 2px solid #000; 
      }
      .header h1 { 
        font-size: ${settings.largerFonts ? '18pt' : '16pt'}; 
        font-weight: bold; 
        margin-bottom: 10px; 
      }
      .meta-info { 
        margin-bottom: 20px; 
        padding: 10px; 
        background: #f5f5f5; 
        border: 1px solid #ccc; 
        font-size: ${settings.largerFonts ? '11pt' : '9pt'}; 
      }
      .question { 
        margin-bottom: 20px; 
        padding: 15px; 
        border: 1px solid #ddd; 
        page-break-inside: avoid; 
        background: #fafafa; 
      }
      .question-number { 
        background: #000; 
        color: white; 
        padding: 5px 10px; 
        border-radius: 5px; 
        font-size: ${settings.largerFonts ? '12pt' : '10pt'}; 
        font-weight: bold; 
        display: inline-block; 
        margin-bottom: 10px; 
      }
      .question-content { 
        margin-bottom: 15px; 
        font-size: ${settings.largerFonts ? '12pt' : '10pt'}; 
        line-height: 1.5; 
      }
      .options { 
        margin-top: 10px; 
      }
      .option { 
        margin-bottom: 8px; 
        padding: 5px 0; 
        font-size: ${settings.largerFonts ? '11pt' : '9pt'}; 
        display: flex; 
        align-items: flex-start; 
        gap: 10px; 
      }
      .option-label { 
        font-weight: bold; 
        min-width: 25px; 
        background: #e0e0e0; 
        padding: 3px 8px; 
        border-radius: 3px; 
      }
      .option-label.correct { 
        background: #4CAF50; 
        color: white; 
      }
      .option-text { 
        flex: 1; 
        line-height: 1.4; 
      }
      .answer-key { 
        margin-top: 30px; 
        padding: 20px; 
        border: 2px solid #000; 
        page-break-before: always; 
      }
      .answer-key h2 { 
        font-size: ${settings.largerFonts ? '16pt' : '14pt'}; 
        text-align: center; 
        margin-bottom: 20px; 
        border-bottom: 1px solid #000; 
        padding-bottom: 10px; 
      }
      .answer-grid { 
        display: grid; 
        grid-template-columns: repeat(5, 1fr); 
        gap: 10px; 
        font-size: ${settings.largerFonts ? '12pt' : '10pt'}; 
      }
      .answer-cell { 
        text-align: center; 
        padding: 8px 4px; 
        border: 2px solid #000; 
        background: #f0f0f0; 
        font-weight: bold; 
      }
    </style>
  `;

  const headerHTML = `
    <div class="header">
      <h1>${test.title}</h1>
      ${test.description ? `<p>${test.description}</p>` : ''}
    </div>
  `;

  const metaInfoHTML = settings.showMetaInfo ? `
    <div class="meta-info">
      <div><strong>Adı Soyadı:</strong> ________________________</div>
      <div><strong>Sınıfı:</strong> ________</div>
      <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
      <div><strong>Soru Sayısı:</strong> ${orderedQuestions.length}</div>
      ${test.settings.timeLimit ? `<div><strong>Süre:</strong> ${test.settings.timeLimit} dakika</div>` : ''}
    </div>
  ` : '';

  const questionsHTML = orderedQuestions.map((question, index) => {
    const category = categories.find(cat => cat.id === question.categoryId);
    
    const optionsHTML = settings.showOptions && question.options && question.options.length > 0 
      ? `<div class="options">
          ${question.options.map((option, optionIndex) => `
            <div class="option">
              <span class="option-label ${settings.showAnswerKey && question.correctAnswer === optionIndex ? 'correct' : ''}">
                ${String.fromCharCode(65 + optionIndex)})
              </span>
              <span class="option-text">${parseMathSymbols(option)}</span>
            </div>
          `).join('')}
        </div>` 
      : '';

    return `
      <div class="question">
        <div class="question-number">${index + 1}</div>
        <div class="question-content">
          ${parseMathSymbols(question.content)}
        </div>
        ${optionsHTML}
      </div>
    `;
  }).join('');

  const answerKeyHTML = settings.showAnswerKey && orderedQuestions.some(q => typeof q.correctAnswer === 'number') ? `
    <div class="answer-key">
      <h2>CEVAP ANAHTARI</h2>
      <div class="answer-grid">
        ${orderedQuestions.map((question, index) => {
          if (typeof question.correctAnswer === 'number') {
            return `<div class="answer-cell">${index + 1}) ${String.fromCharCode(65 + question.correctAnswer)}</div>`;
          }
          return '';
        }).join('')}
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${test.title}</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        ${headerHTML}
        ${metaInfoHTML}
        ${questionsHTML}
        ${answerKeyHTML}
      </div>
    </body>
    </html>
  `;
}

/**
 * Mobil için basitleştirilmiş sınav HTML'i oluştur
 */
function generateMobileExamHTML(
  exam: Exam,
  questions: Question[],
  categories: Category[],
  settings: MobilePDFSettings = defaultMobilePDFSettings
): string {
  const examQuestions = Array.isArray(exam.questionIds)
    ? questions.filter(q => exam.questionIds.includes(q.id))
    : [];

  const styles = `
    <style>
      @page { size: A4; margin: 15mm; }
      body { font-family: Arial, sans-serif; font-size: ${settings.largerFonts ? '12pt' : '11pt'}; color: #000; background: white; }
      .container { width: 100%; padding: 10px; }
      .exam-header { border: 2px solid #000; margin-bottom: 20px; padding: 15px; text-align: center; }
      .exam-title { font-size: ${settings.largerFonts ? '16pt' : '14pt'}; font-weight: bold; margin-bottom: 10px; }
      .exam-info { font-size: ${settings.largerFonts ? '11pt' : '10pt'}; margin: 5px 0; }
      .student-info { margin: 20px 0; padding: 15px; border: 1px solid #000; }
      .info-row { margin: 10px 0; display: flex; align-items: center; }
      .info-label { font-weight: bold; min-width: 80px; margin-right: 10px; }
      .info-line { flex: 1; border-bottom: 1px solid #000; height: 25px; }
      .question { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; background: #fafafa; }
      .question-number { background: #000; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold; display: inline-block; margin-bottom: 10px; }
      .question-content { margin-bottom: 15px; font-size: ${settings.largerFonts ? '12pt' : '10pt'}; line-height: 1.5; }
      .options { margin-top: 10px; }
      .option { margin-bottom: 8px; display: flex; align-items: flex-start; gap: 10px; font-size: ${settings.largerFonts ? '11pt' : '9pt'}; }
      .option-label { font-weight: bold; min-width: 25px; background: #e0e0e0; padding: 3px 8px; border-radius: 3px; }
      .option-label.correct { background: #4CAF50; color: white; }
      .option-text { flex: 1; }
    </style>
  `;

  const examHeaderHTML = `
    <div class="exam-header">
      <div class="exam-title">${exam.title}</div>
      <div class="exam-info">Ders: ${exam.subject || ''}</div>
      <div class="exam-info">Tarih: ${new Date(exam.date).toLocaleDateString('tr-TR')}</div>
      <div class="exam-info">Süre: ${exam.duration || 0} dakika</div>
    </div>
    <div class="student-info">
      <div class="info-row">
        <span class="info-label">ADI SOYADI:</span>
        <div class="info-line"></div>
      </div>
      <div class="info-row">
        <span class="info-label">SINIFI:</span>
        <div class="info-line"></div>
      </div>
      <div class="info-row">
        <span class="info-label">NUMARASI:</span>
        <div class="info-line"></div>
      </div>
    </div>
  `;

  const questionsHTML = examQuestions.map((question, index) => {
    const optionsHTML = exam.settings.showOptions && question.options && question.options.length > 0 
      ? `<div class="options">
          ${question.options.map((option, optionIndex) => `
            <div class="option">
              <span class="option-label ${exam.settings.showAnswers && question.correctAnswer === optionIndex ? 'correct' : ''}">
                ${String.fromCharCode(65 + optionIndex)})
              </span>
              <span class="option-text">${parseMathSymbols(option)}</span>
            </div>
          `).join('')}
        </div>` 
      : '';

    return `
      <div class="question">
        <div class="question-number">${index + 1}</div>
        <div class="question-content">
          ${parseMathSymbols(question.content)}
        </div>
        ${optionsHTML}
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${exam.title}</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        ${examHeaderHTML}
        ${questionsHTML}
      </div>
    </body>
    </html>
  `;
}

/**
 * Mobil cihazlar için test PDF'i oluştur
 */
export async function exportMobileTestToPDF(
  test: Test, 
  questions: Question[], 
  categories: Category[],
  settings: MobilePDFSettings = defaultMobilePDFSettings
) {
  try {
    console.log('Mobil PDF export başlıyor...');
    
    // Mobil için basitleştirilmiş HTML
    const htmlContent = generateMobileTestHTML(test, questions, categories, settings);
    
    // Mobil için basit PDF seçenekleri - html2canvas kullanmadan
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    element.style.width = '210mm';
    element.style.minHeight = '297mm';
    element.style.padding = '0';
    element.style.margin = '0';
    element.style.backgroundColor = 'white';
    
    // Geçici olarak DOM'a ekle
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);
    
    // Mobil için basit indirme yöntemi
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
    
    // Elementi temizle
    document.body.removeChild(element);
    
    console.log('Mobil PDF başarıyla oluşturuldu');

  } catch (error) {
    console.error('Mobil PDF oluşturulurken hata:', error);
    
    // Alternatif yöntem: Basit HTML sayfası aç
    try {
      const htmlContent = generateMobileTestHTML(test, questions, categories, settings);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sanitizeTurkishChars(test.title)}_mobil.html`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (fallbackError) {
      console.error('Alternatif mobil export hatası:', fallbackError);
      alert('Mobil cihazda PDF oluşturulamadı. Lütfen bilgisayardan deneyin.');
    }
  }
}

/**
 * Mobil cihazlar için sınav PDF'i oluştur
 */
export async function exportMobileExamToPDF(
  exam: Exam, 
  questions: Question[], 
  categories: Category[],
  settings: MobilePDFSettings = defaultMobilePDFSettings
) {
  try {
    const htmlContent = generateMobileExamHTML(exam, questions, categories, settings);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }

  } catch (error) {
    console.error('Mobil sınav PDF hatası:', error);
    
    try {
      const htmlContent = generateMobileExamHTML(exam, questions, categories, settings);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sanitizeTurkishChars(exam.title || 'Sinav')}_mobil.html`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (fallbackError) {
      alert('Mobil cihazda sınav PDF\'i oluşturulamadı.');
    }
  }
}
