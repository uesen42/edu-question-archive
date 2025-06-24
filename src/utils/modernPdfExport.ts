
import html2pdf from 'html2pdf.js';
import { Test, Question, Category } from '@/types';

/**
 * Türkçe karakterleri LaTeX uyumlu hale getirir
 */
function sanitizeTurkishChars(text: string): string {
  return text
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
}

/**
 * Matematik sembollerini Unicode karakterlere çevirir
 */
function parseMathSymbols(content: string): string {
  let parsed = content;
  
  // LaTeX matematik sembollerini Unicode'a çevir
  parsed = parsed.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
  parsed = parsed.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
  parsed = parsed.replace(/\\pi/g, 'π');
  parsed = parsed.replace(/\\alpha/g, 'α');
  parsed = parsed.replace(/\\beta/g, 'β');
  parsed = parsed.replace(/\\gamma/g, 'γ');
  parsed = parsed.replace(/\\delta/g, 'δ');
  parsed = parsed.replace(/\\theta/g, 'θ');
  parsed = parsed.replace(/\\lambda/g, 'λ');
  parsed = parsed.replace(/\\mu/g, 'μ');
  parsed = parsed.replace(/\\sigma/g, 'σ');
  parsed = parsed.replace(/\\sum/g, '∑');
  parsed = parsed.replace(/\\int/g, '∫');
  parsed = parsed.replace(/\\infty/g, '∞');
  parsed = parsed.replace(/\\leq/g, '≤');
  parsed = parsed.replace(/\\geq/g, '≥');
  parsed = parsed.replace(/\\neq/g, '≠');
  parsed = parsed.replace(/\\pm/g, '±');
  parsed = parsed.replace(/\\times/g, '×');
  parsed = parsed.replace(/\\div/g, '÷');
  parsed = parsed.replace(/\\cdot/g, '·');
  parsed = parsed.replace(/\\subset/g, '⊂');
  parsed = parsed.replace(/\\supset/g, '⊃');
  parsed = parsed.replace(/\\in/g, '∈');
  parsed = parsed.replace(/\\notin/g, '∉');
  parsed = parsed.replace(/\\cup/g, '∪');
  parsed = parsed.replace(/\\cap/g, '∩');
  parsed = parsed.replace(/\\angle/g, '∠');
  parsed = parsed.replace(/\\triangle/g, '△');
  parsed = parsed.replace(/\\parallel/g, '∥');
  parsed = parsed.replace(/\\perp/g, '⊥');
  
  // Üstel ve alt simgeler
  parsed = parsed.replace(/\^2/g, '²');
  parsed = parsed.replace(/\^3/g, '³');
  parsed = parsed.replace(/\^(\d)/g, (match, digit) => {
    const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
    return superscripts[parseInt(digit)] || `^${digit}`;
  });
  
  // Kesirler için özel işlem
  parsed = parsed.replace(/(\d+)\/(\d+)/g, '$1⁄$2');
  
  // $ işaretlerini temizle ve matematik içeriğini parse et
  parsed = parsed.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
    return parseMathSymbols(sanitizeTurkishChars(math.trim()));
  });
  
  parsed = parsed.replace(/\$([^$]+)\$/g, (match, math) => {
    return parseMathSymbols(sanitizeTurkishChars(math.trim()));
  });
  
  // Gereksiz karakterleri temizle
  parsed = parsed.replace(/\{([^{}]*)\}/g, '$1');
  parsed = parsed.replace(/\\\\/g, ' ');
  parsed = parsed.replace(/\s+/g, ' ').trim();
  
  return parsed;
}

export interface PDFExportSettings {
  showOptions: boolean;
  showAnswerKey: boolean;
  showMetaInfo: boolean;
  showCategory: boolean;
  showGrade: boolean;
  showDifficulty: boolean;
  showDate: boolean;
  questionsPerRow: 1 | 2;
}

export const defaultPDFSettings: PDFExportSettings = {
  showOptions: true,
  showAnswerKey: true,
  showMetaInfo: true,
  showCategory: true,
  showGrade: true,
  showDifficulty: true,
  showDate: true,
  questionsPerRow: 2,
};

/**
 * Test sorularını içeren HTML string oluşturur
 */
function generateTestPDFHTML(
  test: Test,
  questions: Question[],
  categories: Category[],
  settings: PDFExportSettings = defaultPDFSettings
): string {
  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  const orderedQuestions = test.settings.randomizeOrder 
    ? [...testQuestions].sort(() => Math.random() - 0.5)
    : testQuestions;

  const styles = `
    <style>
      @page {
        size: A4;
        margin: 20mm;
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: 'Times New Roman', serif;
        font-size: 11pt;
        line-height: 1.3;
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
        font-size: 16pt;
        font-weight: bold;
        text-transform: uppercase;
      }
      .header p {
        margin: 5px 0 0 0;
        font-size: 10pt;
        color: #333;
      }
      .meta-info {
        margin-bottom: 15px;
        padding: 8px;
        background: #f8f8f8;
        border: 1px solid #ccc;
        font-size: 9pt;
        display: flex;
        justify-content: space-between;
      }
      .questions-container {
        display: ${settings.questionsPerRow === 2 ? 'grid' : 'block'};
        ${settings.questionsPerRow === 2 ? 'grid-template-columns: 1fr 1fr;' : ''}
        ${settings.questionsPerRow === 2 ? 'gap: 15px; column-gap: 20px;' : ''}
        margin-bottom: 30px;
      }
      .question {
        margin-bottom: 15px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        page-break-inside: avoid;
        background: #fafafa;
      }
      .question-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 8px;
        font-weight: bold;
      }
      .question-number {
        background: #000;
        color: white;
        padding: 3px 8px;
        border-radius: 50%;
        font-size: 10pt;
        min-width: 20px;
        text-align: center;
        margin-right: 10px;
      }
      .question-meta {
        margin-bottom: 6px;
        font-size: 7pt;
        color: #666;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .question-content {
        margin-bottom: 10px;
        line-height: 1.4;
        word-wrap: break-word;
        max-width: 100%;
        font-size: 10pt;
      }
      .options {
        margin-top: 8px;
      }
      .option {
        margin-bottom: 3px;
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 9pt;
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
        font-size: 14pt;
        text-align: center;
        text-transform: uppercase;
        border-bottom: 1px solid #000;
        padding-bottom: 10px;
      }
      .answer-grid {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 8px;
        font-size: 10pt;
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

  // Sorular
  const questionsHTML = orderedQuestions.map((question, index) => {
    const category = categories.find(cat => cat.id === question.categoryId);
    
    const metaItems = [];
    if (settings.showCategory && category) metaItems.push(category.name);
    if (settings.showGrade) metaItems.push(`${question.grade}. Sınıf`);
    if (settings.showDifficulty) metaItems.push(question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1));

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
          <span class="question-number">${index + 1}</span>
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
 * Test sorularını içeren HTML DOM elementi oluşturur
 */
export function generateTestPDFContent(
  test: Test,
  questions: Question[],
  categories: Category[],
  settings: PDFExportSettings = defaultPDFSettings
): HTMLElement {
  const htmlContent = generateTestPDFHTML(test, questions, categories, settings);
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  return doc.body.firstElementChild as HTMLElement;
}

/**
 * Test içeriğini HTML string olarak önizleme için döndürür
 */
export function generatePDFPreviewContent(
  test: Test,
  questions: Question[],
  categories: Category[],
  settings: PDFExportSettings = defaultPDFSettings
): string {
  return generateTestPDFHTML(test, questions, categories, settings);
}

/**
 * Testi PDF olarak dışa aktarır
 */
export async function exportTestToPDF(
  test: Test, 
  questions: Question[], 
  categories: Category[],
  settings: PDFExportSettings = defaultPDFSettings
) {
  try {
    console.log('PDF export başlıyor...');
    
    // HTML içeriği oluştur
    const htmlContent = generateTestPDFHTML(test, questions, categories, settings);
    
    console.log('HTML içeriği oluşturuldu');
    
    const options = {
      margin: [15, 15, 15, 15],
      filename: `${sanitizeTurkishChars(test.title.replace(/[^\w\d\s]/g, "_"))}.pdf`,
      image: { 
        type: "jpeg", 
        quality: 0.98 
      },
      html2canvas: {
        scale: 2,
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
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.answer-key',
        after: '',
        avoid: '.question'
      }
    };

    console.log('PDF oluşturma başlatılıyor...');
    
    // PDF oluştur ve indir
    await html2pdf().set(options).from(htmlContent).save();
    
    console.log('PDF başarıyla oluşturuldu ve indirildi');

  } catch (error) {
    console.error('PDF oluşturulurken hata:', error);
    alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    throw error;
  }
}
