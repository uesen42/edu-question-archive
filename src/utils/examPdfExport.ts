import html2pdf from 'html2pdf.js';
import { Exam } from '@/types/exam';
import { Question, Category } from '@/types';
import { parseMathSymbols, sanitizeTurkishChars, PDFExportSettings, defaultPDFSettings } from './modernPdfExport';

/**
 * Sınav için HTML string oluşturur
 */
function generateExamPDFHTML(
  exam: Exam,
  questions: Question[],
  categories: Category[],
  settings: PDFExportSettings = defaultPDFSettings
): string {
  const examQuestions = Array.isArray(exam.questionIds)
    ? questions.filter(q => exam.questionIds.includes(q.id))
    : [];
  const orderedQuestions = exam && exam.settings && exam.settings.randomizeOrder
    ? [...examQuestions].sort(() => Math.random() - 0.5)
    : examQuestions;

  const styles = `
    <style>
      @page { size: A4; margin: 15mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.3; color: #000; background: white; }
      .container { width: 100%; max-width: 210mm; margin: 0 auto; }
      .exam-header { border: 2px solid #000; margin-bottom: 20px; padding: 0; page-break-after: avoid; }
      .header-top { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #000; }
      .school-logo { width: 60px; height: 60px; border: 1px solid #000; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; font-size: 8pt; text-align: center; background: #f0f0f0; }
      .exam-title-section { flex: 1; text-align: center; padding: 0 10px; }
      .exam-title { font-size: 12pt; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
      .exam-subtitle { font-size: 10pt; margin-bottom: 3px; }
      .score-section { width: 80px; text-align: center; border-left: 1px solid #000; padding: 10px 5px; }
      .score-label { font-size: 10pt; font-weight: bold; margin-bottom: 20px; }
      .score-box { width: 60px; height: 40px; border: 2px solid #000; margin: 0 auto; }
      .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
      .student-left, .student-right { padding: 8px 15px; border-right: 1px solid #000; }
      .student-right { border-right: none; }
      .info-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 10pt; }
      .info-label { font-weight: bold; min-width: 70px; margin-right: 10px; }
      .info-line { flex: 1; border-bottom: 1px solid #000; height: 20px; position: relative; }
      .info-value { position: absolute; top: -2px; left: 5px; font-size: 9pt; }
      .questions-container { display: ${settings.questionsPerRow === 2 ? 'grid' : 'block'};${settings.questionsPerRow === 2 ? 'grid-template-columns: 1fr 1fr;' : ''}${settings.questionsPerRow === 2 ? 'gap: 15px; column-gap: 20px;' : ''} margin-top: 20px; }
      .question { margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; page-break-inside: avoid; background: #fafafa; }
      .question-header { display: flex; align-items: flex-start; margin-bottom: 8px; font-weight: bold; }
      .question-number { background: #000; color: white; padding: 3px 8px; border-radius: 50%; font-size: 10pt; min-width: 20px; text-align: center; margin-right: 10px; }
      .question-content { margin-bottom: 10px; line-height: 1.4; word-wrap: break-word; max-width: 100%; font-size: 10pt; }
      .options { margin-top: 8px; }
      .option { margin-bottom: 3px; display: flex; align-items: flex-start; gap: 6px; font-size: 9pt; }
      .option-label { font-weight: bold; min-width: 18px; }
      .option-label.correct { background: #4CAF50; color: white; padding: 1px 5px; border-radius: 3px; }
      .option-text { flex: 1; word-wrap: break-word; }
      .answer-key { margin-top: 30px; padding: 20px; border: 2px solid #000; border-radius: 5px; page-break-before: always; background: white; }
      .answer-key h2 { margin: 0 0 15px 0; font-size: 14pt; text-align: center; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 10px; }
      .answer-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 8px; font-size: 10pt; max-width: 100%; }
      .answer-cell { text-align: center; padding: 6px 4px; border: 1px solid #000; border-radius: 3px; background: #f0f0f0; font-weight: bold; }
    </style>
  `;

  // Sınav başlık sayfası
  const examHeaderHTML = `
    <div class="exam-header">
      <div class="header-top">
        <div class="school-logo">OKUL<br>LOGOSU</div>
        <div class="exam-title-section">
          <div class="exam-title">${exam.title}</div>
          <div class="exam-subtitle">${exam.subject || 'Ders Adı'}</div>
          <div class="exam-subtitle">Tarih: ${new Date(exam.date).toLocaleDateString('tr-TR')}</div>
          ${exam.duration ? `<div class="exam-subtitle">Süre: ${exam.duration} dakika</div>` : ''}
        </div>
        <div class="score-section">
          <div class="score-label">PUANI:</div>
          <div class="score-box"></div>
        </div>
      </div>
      <div class="student-info">
        <div class="student-left">
          <div class="info-row">
            <span class="info-label">ADI VE SOYADI:</span>
            <div class="info-line"><span class="info-value"></span></div>
          </div>
          <div class="info-row">
            <span class="info-label">SINIFI:</span>
            <div class="info-line"><span class="info-value">${exam.className || ''}</span></div>
          </div>
        </div>
        <div class="student-right">
          <div class="info-row">
            <span class="info-label">NO:</span>
            <div class="info-line"><span class="info-value"></span></div>
          </div>
          <div class="info-row">
            <span class="info-label">OKUL:</span>
            <div class="info-line"><span class="info-value">${exam.schoolName}</span></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Sorular
  const questionsHTML = orderedQuestions.map((question, index) => {
    const optionsHTML = settings.showOptions && question.options && question.options.length > 0 
      ? `<div class="options">${question.options.map((option, optionIndex) => `
            <div class="option">
              <span class="option-label ${settings.showAnswerKey && question.correctAnswer === optionIndex ? 'correct' : ''}">
                ${String.fromCharCode(65 + optionIndex)})
              </span>
              <span class="option-text">${parseMathSymbols(option)}</span>
            </div>
          `).join('')}</div>` 
      : '';

    return `
      <div class="question">
        <div class="question-header">
          <span class="question-number">${index + 1}</span>
        </div>
        <div class="question-content">
          ${parseMathSymbols(question.content)}
        </div>
        ${optionsHTML}
      </div>
    `;
  }).join('');

  // Cevap anahtarı
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
      <title>${exam.title}</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        ${examHeaderHTML}
        <div class="questions-container">
          ${questionsHTML}
        </div>
        ${answerKeyHTML}
      </div>
    </body>
    </html>
  `;
}

/**
 * Sınavı PDF olarak dışa aktarır
 */
export async function exportExamToPDF(
  exam: Exam, 
  questions: Question[], 
  categories: Category[],
  settings: PDFExportSettings = defaultPDFSettings
) {
  try {
    const htmlContent = generateExamPDFHTML(exam, questions, categories, settings);
    const safeTitle = exam.title ? exam.title : 'Sinav';
    const options = {
      margin: [10, 10, 10, 10],
      filename: `${sanitizeTurkishChars(safeTitle.replace(/[\w\d\s]/g, "_"))}_Sinavi.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false, width: 794, height: 1123, scrollX: 0, scrollY: 0, backgroundColor: '#ffffff', letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.answer-key', after: '', avoid: '.question' }
    };
    await html2pdf().set(options).from(htmlContent).save();
  } catch (error) {
    console.error('Sınav PDF oluşturulurken hata:', error);
    alert('Sınav PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    throw error;
  }
}

/**
 * Sınav içeriğini HTML string olarak önizleme için döndürür
 */
export function generateExamPDFPreviewContent(
  exam: Exam,
  questions: Question[],
  categories: Category[],
  settings: PDFExportSettings = defaultPDFSettings
): string {
  return generateExamPDFHTML(exam, questions, categories, settings);
}
