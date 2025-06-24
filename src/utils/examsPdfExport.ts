import html2pdf from 'html2pdf.js';
import { Exam } from '@/types/exam';
import { Question, Category } from '@/types';
import { parseMathSymbols, sanitizeTurkishChars, PDFExportSettings, defaultPDFSettings } from './modernPdfExport';

/**
 * Exams için HTML string oluşturur (birden fazla sınavı tek PDF'de gösterebilir)
 */
function generateExamsPDFHTML(
  exams: Exam[],
  questions: Question[],
  categories: Category[],
  settings: PDFExportSettings = defaultPDFSettings
): string {
  const styles = `
    <style>
      @page { size: A4; margin: 15mm; }
      body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; background: white; }
      .container { width: 100%; max-width: 210mm; margin: 0 auto; }
      .exam-title { font-size: 14pt; font-weight: bold; margin: 20px 0 10px 0; text-transform: uppercase; }
      .exam-meta { font-size: 10pt; margin-bottom: 10px; }
      .questions-container { margin-bottom: 30px; }
      .question { margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 5px; background: #fafafa; }
      .question-number { font-weight: bold; margin-right: 8px; }
      .question-content { margin-bottom: 6px; }
      .options { margin-top: 4px; }
      .option { margin-bottom: 2px; display: flex; align-items: flex-start; gap: 6px; font-size: 9pt; }
      .option-label { font-weight: bold; min-width: 18px; }
      .option-label.correct { background: #4CAF50; color: white; padding: 1px 5px; border-radius: 3px; }
      .option-text { flex: 1; }
      .answer-key { margin-top: 20px; padding: 10px; border: 1px solid #000; border-radius: 5px; background: white; }
      .answer-key h2 { font-size: 12pt; text-align: center; border-bottom: 1px solid #000; margin-bottom: 10px; }
      .answer-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; font-size: 10pt; }
      .answer-cell { text-align: center; padding: 4px 2px; border: 1px solid #000; border-radius: 3px; background: #f0f0f0; font-weight: bold; }
    </style>
  `;

  const examsHTML = exams.map((exam, examIdx) => {
    const examQuestions = questions.filter(q => exam.questionIds.includes(q.id));
    const orderedQuestions = exam.settings.randomizeOrder 
      ? [...examQuestions].sort(() => Math.random() - 0.5)
      : examQuestions;
    const questionsHTML = orderedQuestions.map((question, index) => {
      const optionsHTML = exam.settings.showOptions && question.options && question.options.length > 0 
        ? `<div class="options">${question.options.map((option, optionIndex) => `
            <div class="option">
              <span class="option-label ${exam.settings.showAnswers && question.correctAnswer === optionIndex ? 'correct' : ''}">
                ${String.fromCharCode(65 + optionIndex)})
              </span>
              <span class="option-text">${parseMathSymbols(option)}</span>
            </div>
          `).join('')}</div>` : '';
      return `<div class="question"><span class="question-number">${index + 1}</span> <span class="question-content">${parseMathSymbols(question.content)}</span>${optionsHTML}</div>`;
    }).join('');
    const answerKeyHTML = exam.settings.showAnswers && orderedQuestions.some(q => typeof q.correctAnswer === 'number') ?
      `<div class="answer-key"><h2>CEVAP ANAHTARI</h2><div class="answer-grid">${orderedQuestions.map((question, index) => {
        if (typeof question.correctAnswer === 'number') {
          return `<div class="answer-cell">${index + 1}) ${String.fromCharCode(65 + question.correctAnswer)}</div>`;
        }
        return '';
      }).join('')}</div></div>` : '';
    return `
      <div class="exam-block" style="page-break-after: always;">
        <div class="exam-title">${exam.title || ''}</div>
        <div class="exam-meta">
          Okul: ${exam.schoolName || ''} | Ders: ${exam.subject || ''} | Sınıf: ${exam.className || ''} | Tarih: ${exam.date ? new Date(exam.date).toLocaleDateString('tr-TR') : ''}
        </div>
        <div class="questions-container">${questionsHTML}</div>
        ${answerKeyHTML}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Sınavlar</title>${styles}</head><body><div class="container">${examsHTML}</div></body></html>`;
}

/**
 * Exams listesini PDF olarak dışa aktarır
 */
export async function exportExamsToPDF(
  exams: Exam[],
  questions: Question[],
  categories: Category[],
  settings: PDFExportSettings = defaultPDFSettings
) {
  try {
    const htmlContent = generateExamsPDFHTML(exams, questions, categories, settings);
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Tum_Sinavlar.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false, backgroundColor: '#ffffff', letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'], avoid: '.question' }
    };
    await html2pdf().set(options).from(htmlContent).save();
  } catch (error) {
    console.error('Sınavlar PDF oluşturulurken hata:', error);
    alert('Sınavlar PDF oluşturulurken bir hata oluştu.');
    throw error;
  }
}
