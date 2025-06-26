
import html2pdf from 'html2pdf.js';
import { Test, Question, Category } from '@/types';
import { AdvancedPDFSettings } from '@/components/PDFExportSettings';
import { sanitizeTurkishChars, parseMathSymbols } from './modernPdfExport';

/**
 * Gelişmiş numaralandırma fonksiyonları
 */
function formatQuestionNumber(
  index: number, 
  style: 'numeric' | 'alphabetic' | 'roman', 
  format: 'circle' | 'parenthesis' | 'dot' | 'square'
): string {
  let number: string;
  
  switch (style) {
    case 'alphabetic':
      number = String.fromCharCode(65 + (index % 26));
      break;
    case 'roman':
      number = toRoman(index + 1);
      break;
    default:
      number = (index + 1).toString();
  }
  
  switch (format) {
    case 'circle':
      return `⊕${number}`;
    case 'parenthesis':
      return `(${number})`;
    case 'dot':
      return `${number}.`;
    case 'square':
      return `[${number}]`;
    default:
      return number;
  }
}

function toRoman(num: number): string {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }
  
  return result;
}

/**
 * Gelişmiş Test PDF HTML'i oluşturur
 */
function generateAdvancedTestPDFHTML(
  test: Test,
  questions: Question[],
  categories: Category[],
  settings: AdvancedPDFSettings
): string {
  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  const orderedQuestions = test.settings.randomizeOrder 
    ? [...testQuestions].sort(() => Math.random() - 0.5)
    : testQuestions;

  // Font ailesi seçimi
  const fontFamily = {
    'times': "'Times New Roman', serif",
    'arial': "'Arial', sans-serif",
    'calibri': "'Calibri', sans-serif"
  }[settings.fontFamily];

  const styles = `
    <style>
      @page {
        size: A4;
        margin: ${settings.pageMargin}mm;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: ${fontFamily};
        font-size: ${settings.fontSize}pt;
        line-height: ${settings.lineHeight};
        color: #000;
        background: white;
      }
      .container {
        width: 100%;
        max-width: 210mm;
        margin: 0 auto;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }
      .header h1 {
        margin: 0;
        font-size: ${settings.fontSize + 4}pt;
        font-weight: bold;
        text-transform: uppercase;
      }
      .header p {
        margin: 5px 0 0 0;
        font-size: ${settings.fontSize - 1}pt;
        color: #333;
      }
      .meta-info {
        margin-bottom: 15px;
        padding: 8px;
        background: #f8f8f8;
        border: 1px solid #ccc;
        font-size: ${settings.fontSize - 2}pt;
        display: flex;
        justify-content: space-between;
      }
      .questions-container {
        display: ${settings.questionsPerRow === 2 ? 'grid' : 'block'};
        ${settings.questionsPerRow === 2 ? 'grid-template-columns: 1fr 1fr;' : ''}
        ${settings.questionsPerRow === 2 ? `gap: ${settings.questionSpacing}px; column-gap: 20px;` : ''}
        margin-bottom: 30px;
      }
      .question {
        margin-bottom: ${settings.questionSpacing}px;
        padding: ${Math.round(settings.questionSpacing * 0.6)}px;
        border: 1px solid #ccc;
        border-radius: 5px;
        ${settings.pageBreakBetweenQuestions ? 'page-break-before: always;' : ''}
        ${settings.preventOrphanQuestions ? 'page-break-inside: avoid;' : ''}
        background: #fafafa;
      }
      .question-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 8px;
        font-weight: bold;
      }
      .question-number {
        ${settings.numberingFormat === 'circle' ? `
          background: #000;
          color: white;
          padding: 3px 8px;
          border-radius: 50%;
          font-size: ${settings.fontSize - 1}pt;
          min-width: 20px;
          text-align: center;
          margin-right: 10px;
        ` : `
          font-weight: bold;
          margin-right: 10px;
          font-size: ${settings.fontSize}pt;
        `}
      }
      .question-meta {
        margin-bottom: 6px;
        font-size: ${settings.fontSize - 4}pt;
        color: #666;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .question-content {
        margin-bottom: 10px;
        line-height: ${settings.lineHeight};
        word-wrap: break-word;
        max-width: 100%;
        font-size: ${settings.fontSize}pt;
      }
      .options {
        margin-top: 8px;
      }
      .option {
        margin-bottom: 3px;
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: ${settings.fontSize - 1}pt;
      }
      .option-label {
        font-weight: bold;
        min-width: 18px;
      }
      .option-label.correct {
        background: #4CAF50;
        color: white;
        padding: 1px 5px;
        border-radius: 3px;
      }
      .option-text {
        flex: 1;
        word-wrap: break-word;
        line-height: ${settings.lineHeight};
      }
      .answer-key {
        margin-top: 30px;
        padding: 20px;
        border: 2px solid #000;
        border-radius: 5px;
        page-break-before: always;
        background: white;
      }
      .answer-key h2 {
        margin: 0 0 15px 0;
        font-size: ${settings.fontSize + 2}pt;
        text-align: center;
        text-transform: uppercase;
        border-bottom: 1px solid #000;
        padding-bottom: 10px;
      }
      .answer-grid {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 8px;
        font-size: ${settings.fontSize}pt;
        max-width: 100%;
      }
      .answer-cell {
        text-align: center;
        padding: 6px 4px;
        border: 1px solid #000;
        border-radius: 3px;
        background: #f0f0f0;
        font-weight: bold;
      }
      
      ${settings.optimizeForMobile ? `
        @media screen and (max-width: 768px) {
          .questions-container {
            display: block !important;
          }
          .question {
            margin-bottom: ${settings.questionSpacing + 5}px;
            padding: ${Math.round(settings.questionSpacing * 0.8)}px;
          }
          .question-content {
            font-size: ${settings.fontSize + 1}pt;
          }
        }
      ` : ''}
    </style>
  `;

  // Test başlığı
  const headerHTML = `
    <div class="header">
      <h1>${test.title}</h1>
      ${test.description ? `<p>${test.description}</p>` : ''}
    </div>
  `;

  // Meta bilgiler
  const metaInfoHTML = settings.showMetaInfo ? `
    <div class="meta-info">
      <div>
        <strong>Adı Soyadı:</strong> ________________________
        <br><strong>Sınıfı:</strong> ________
      </div>
      <div>
        ${settings.showDate ? `<strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}<br>` : ''}
        <strong>Soru Sayısı:</strong> ${orderedQuestions.length}<br>
        ${test.settings.timeLimit ? `<strong>Süre:</strong> ${test.settings.timeLimit} dakika` : ''}
      </div>
    </div>
  ` : '';

  // Soruları sayfa başına böl
  let questionsToShow = orderedQuestions;
  if (settings.questionsPerPage > 0) {
    questionsToShow = orderedQuestions.slice(0, settings.questionsPerPage);
  }

  // Sorular
  const questionsHTML = questionsToShow.map((question, index) => {
    const category = categories.find(cat => cat.id === question.categoryId);
    
    const metaItems = [];
    if (settings.showCategory && category) metaItems.push(category.name);
    if (settings.showGrade) metaItems.push(`${question.grade}. Sınıf`);
    if (settings.showDifficulty) metaItems.push(question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1));

    const questionNumber = settings.showQuestionNumbers 
      ? formatQuestionNumber(index, settings.numberingStyle, settings.numberingFormat)
      : '';

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
        <div class="question-header">
          ${questionNumber ? `<span class="question-number">${questionNumber}</span>` : ''}
        </div>
        ${settings.showMetaInfo && metaItems.length > 0 ? `
          <div class="question-meta">
            ${metaItems.join(' | ')}
          </div>
        ` : ''}
        <div class="question-content">
          ${parseMathSymbols(question.content)}
        </div>
        ${optionsHTML}
      </div>
    `;
  }).join('');

  // Cevap anahtarı
  const answerKeyHTML = settings.showAnswerKey && questionsToShow.some(q => typeof q.correctAnswer === 'number') ? `
    <div class="answer-key">
      <h2>CEVAP ANAHTARI</h2>
      <div class="answer-grid">
        ${questionsToShow.map((question, index) => {
          if (typeof question.correctAnswer === 'number') {
            const questionNumber = settings.showQuestionNumbers 
              ? formatQuestionNumber(index, settings.numberingStyle, settings.numberingFormat)
              : (index + 1).toString();
            return `<div class="answer-cell">${questionNumber} ${String.fromCharCode(65 + question.correctAnswer)}</div>`;
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
      <title>${test.title}</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        ${headerHTML}
        ${metaInfoHTML}
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
 * Gelişmiş test PDF önizlemesi oluşturur
 */
export function generateAdvancedPDFPreviewContent(
  test: Test,
  questions: Question[],
  categories: Category[],
  settings: AdvancedPDFSettings
): string {
  return generateAdvancedTestPDFHTML(test, questions, categories, settings);
}

/**
 * Gelişmiş ayarlarla testi PDF olarak dışa aktarır
 */
export async function exportAdvancedTestToPDF(
  test: Test, 
  questions: Question[], 
  categories: Category[],
  settings: AdvancedPDFSettings
) {
  try {
    console.log('Gelişmiş PDF export başlıyor...');
    
    // HTML içeriği oluştur
    const htmlContent = generateAdvancedTestPDFHTML(test, questions, categories, settings);
    
    const options = {
      margin: [settings.pageMargin, settings.pageMargin, settings.pageMargin, settings.pageMargin],
      filename: `${sanitizeTurkishChars(test.title.replace(/[^\w\d\s]/g, "_"))}_advanced.pdf`,
      image: { 
        type: "jpeg", 
        quality: 0.98 
      },
      html2canvas: {
        scale: settings.optimizeForMobile ? 1.5 : 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff',
        letterRendering: true
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true
      },
      pagebreak: { 
        mode: settings.preventOrphanQuestions ? ['avoid-all', 'css', 'legacy'] : ['css'],
        before: settings.pageBreakBetweenQuestions ? '.question' : '.answer-key',
        after: '',
        avoid: settings.preventOrphanQuestions ? '.question' : ''
      }
    };

    console.log('Gelişmiş PDF oluşturma başlatılıyor...');
    
    // PDF oluştur ve indir
    await html2pdf().set(options).from(htmlContent).save();
    
    console.log('Gelişmiş PDF başarıyla oluşturuldu ve indirildi');

  } catch (error) {
    console.error('Gelişmiş PDF oluşturulurken hata:', error);
    alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    throw error;
  }
}
