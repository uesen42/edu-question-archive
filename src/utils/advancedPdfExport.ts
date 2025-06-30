
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
  try {
    const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
    if (testQuestions.length === 0) {
      throw new Error('Test için geçerli soru bulunamadı');
    }

    const orderedQuestions = test.settings.randomizeOrder 
      ? [...testQuestions].sort(() => Math.random() - 0.5)
      : testQuestions;

    // Font ailesi seçimi - Güvenli fallback'ler
    const fontFamily = {
      'times': "'Times New Roman', Times, serif",
      'arial': "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
      'calibri': "'Calibri', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }[settings.fontFamily] || "'Arial', sans-serif";

    // Güvenli değer kontrolü
    const safePageMargin = Math.max(5, Math.min(50, settings.pageMargin || 20));
    const safeFontSize = Math.max(8, Math.min(24, settings.fontSize || 12));
    const safeLineHeight = Math.max(1.0, Math.min(3.0, settings.lineHeight || 1.5));
    const safeQuestionSpacing = Math.max(5, Math.min(50, settings.questionSpacing || 15));

    const styles = `
      <style>
        @page {
          size: A4;
          margin: ${safePageMargin}mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: ${fontFamily};
          font-size: ${safeFontSize}pt;
          line-height: ${safeLineHeight};
          color: #000;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
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
          font-size: ${safeFontSize + 4}pt;
          font-weight: bold;
          text-transform: uppercase;
          word-wrap: break-word;
        }
        .header p {
          margin: 5px 0 0 0;
          font-size: ${safeFontSize - 1}pt;
          color: #333;
          word-wrap: break-word;
        }
        .meta-info {
          margin-bottom: 15px;
          padding: 8px;
          background: #f8f8f8;
          border: 1px solid #ccc;
          font-size: ${safeFontSize - 2}pt;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .page {
          page-break-after: always;
          min-height: 100vh;
        }
        .page:last-child {
          page-break-after: auto;
        }
        .questions-container {
          display: ${settings.questionsPerRow === 2 ? 'grid' : 'block'};
          ${settings.questionsPerRow === 2 ? 'grid-template-columns: 1fr 1fr;' : ''}
          ${settings.questionsPerRow === 2 ? `gap: ${safeQuestionSpacing}px 20px;` : ''}
          margin-bottom: 30px;
        }
        .question {
          margin-bottom: ${safeQuestionSpacing}px;
          padding: ${Math.round(safeQuestionSpacing * 0.6)}px;
          border: 1px solid #ccc;
          border-radius: 5px;
          ${settings.preventOrphanQuestions ? 'page-break-inside: avoid;' : ''}
          background: #fafafa;
          word-wrap: break-word;
          overflow-wrap: break-word;
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
            font-size: ${safeFontSize - 1}pt;
            min-width: 20px;
            text-align: center;
            margin-right: 10px;
            flex-shrink: 0;
          ` : `
            font-weight: bold;
            margin-right: 10px;
            font-size: ${safeFontSize}pt;
            flex-shrink: 0;
          `}
        }
        .question-meta {
          margin-bottom: 6px;
          font-size: ${safeFontSize - 4}pt;
          color: #666;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .question-content {
          margin-bottom: 10px;
          line-height: ${safeLineHeight};
          word-wrap: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
          font-size: ${safeFontSize}pt;
        }
        .options {
          margin-top: 8px;
        }
        .option {
          margin-bottom: 3px;
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: ${safeFontSize - 1}pt;
        }
        .option-label {
          font-weight: bold;
          min-width: 18px;
          flex-shrink: 0;
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
          overflow-wrap: break-word;
          line-height: ${safeLineHeight};
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
          font-size: ${safeFontSize + 2}pt;
          text-align: center;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          padding-bottom: 10px;
        }
        .answer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
          gap: 8px;
          font-size: ${safeFontSize}pt;
          max-width: 100%;
        }
        .answer-cell {
          text-align: center;
          padding: 6px 4px;
          border: 1px solid #000;
          border-radius: 3px;
          background: #f0f0f0;
          font-weight: bold;
          word-wrap: break-word;
        }
        
        @media print {
          .container {
            max-width: none;
          }
          .question {
            ${settings.preventOrphanQuestions ? 'page-break-inside: avoid;' : ''}
          }
        }
      </style>
    `;

    // Test başlığı - Güvenli metin işleme
    const safeTitle = (test.title || 'İsimsiz Test').replace(/[<>&"]/g, '');
    const safeDescription = test.description ? test.description.replace(/[<>&"]/g, '') : '';

    const headerHTML = `
      <div class="header">
        <h1>${safeTitle}</h1>
        ${safeDescription ? `<p>${safeDescription}</p>` : ''}
      </div>
    `;

    // Meta bilgiler - Güvenli tarih formatı
    const currentDate = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const metaInfoHTML = settings.showMetaInfo ? `
      <div class="meta-info">
        <div>
          <strong>Adı Soyadı:</strong> ________________________
          <br><strong>Sınıfı:</strong> ________
        </div>
        <div>
          ${settings.showDate ? `<strong>Tarih:</strong> ${currentDate}<br>` : ''}
          <strong>Soru Sayısı:</strong> ${orderedQuestions.length}<br>
          ${test.settings.timeLimit ? `<strong>Süre:</strong> ${test.settings.timeLimit} dakika` : ''}
        </div>
      </div>
    ` : '';

    // Soruları sayfalara böl - Güvenli hesaplama
    const questionsPerPage = Math.max(1, settings.questionsPerPage || orderedQuestions.length);
    const totalPages = Math.ceil(orderedQuestions.length / questionsPerPage);
    
    let pagesHTML = '';
    
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const startIndex = pageIndex * questionsPerPage;
      const endIndex = Math.min(startIndex + questionsPerPage, orderedQuestions.length);
      const pageQuestions = orderedQuestions.slice(startIndex, endIndex);
      
      const questionsHTML = pageQuestions.map((question, localIndex) => {
        const globalIndex = startIndex + localIndex;
        const category = categories.find(cat => cat.id === question.categoryId);
        
        const metaItems = [];
        if (settings.showCategory && category) metaItems.push(category.name);
        if (settings.showGrade) metaItems.push(`${question.grade}. Sınıf`);
        if (settings.showDifficulty) {
          const difficultyText = {
            'kolay': 'Kolay',
            'orta': 'Orta', 
            'zor': 'Zor'
          }[question.difficultyLevel] || question.difficultyLevel;
          metaItems.push(difficultyText);
        }

        const questionNumber = settings.showQuestionNumbers 
          ? formatQuestionNumber(globalIndex, settings.numberingStyle, settings.numberingFormat)
          : '';

        // Güvenli metin işleme
        const safeContent = (question.content || '').replace(/[<>&"]/g, (match) => {
          const entityMap: { [key: string]: string } = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;'
          };
          return entityMap[match];
        });

        const optionsHTML = settings.showOptions && question.options && question.options.length > 0 
          ? `<div class="options">
              ${question.options.map((option, optionIndex) => {
                const safeOption = option.replace(/[<>&"]/g, (match) => {
                  const entityMap: { [key: string]: string } = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '&': '&amp;',
                    '"': '&quot;'
                  };
                  return entityMap[match];
                });
                return `
                  <div class="option">
                    <span class="option-label ${settings.showAnswerKey && question.correctAnswer === optionIndex ? 'correct' : ''}">
                      ${String.fromCharCode(65 + optionIndex)})
                    </span>
                    <span class="option-text">${safeOption}</span>
                  </div>
                `;
              }).join('')}
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
              ${safeContent}
            </div>
            ${optionsHTML}
          </div>
        `;
      }).join('');

      pagesHTML += `
        <div class="page">
          ${pageIndex === 0 ? headerHTML + metaInfoHTML : ''}
          <div class="questions-container">
            ${questionsHTML}
          </div>
        </div>
      `;
    }

    // Cevap anahtarı - Güvenli işleme
    const answerKeyHTML = settings.showAnswerKey && orderedQuestions.some(q => typeof q.correctAnswer === 'number') ? `
      <div class="answer-key">
        <h2>CEVAP ANAHTARI</h2>
        <div class="answer-grid">
          ${orderedQuestions.map((question, index) => {
            if (typeof question.correctAnswer === 'number' && question.correctAnswer >= 0) {
              const questionNumber = settings.showQuestionNumbers 
                ? formatQuestionNumber(index, settings.numberingStyle, settings.numberingFormat)
                : (index + 1).toString();
              const answerLetter = String.fromCharCode(65 + question.correctAnswer);
              return `<div class="answer-cell">${questionNumber} ${answerLetter}</div>`;
            }
            return '';
          }).filter(cell => cell).join('')}
        </div>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${safeTitle}</title>
        ${styles}
      </head>
      <body>
        <div class="container">
          ${pagesHTML}
          ${answerKeyHTML}
        </div>
      </body>
      </html>
    `;
  } catch (error) {
    console.error('PDF HTML oluşturma hatası:', error);
    throw new Error('PDF içeriği oluşturulamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
  }
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
  try {
    return generateAdvancedTestPDFHTML(test, questions, categories, settings);
  } catch (error) {
    console.error('PDF önizleme hatası:', error);
    return `
      <div style="padding: 20px; color: red; text-align: center;">
        <h2>Önizleme Hatası</h2>
        <p>PDF önizlemesi oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}</p>
      </div>
    `;
  }
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
    
    // Girdi doğrulama
    if (!test || !test.questionIds || test.questionIds.length === 0) {
      throw new Error('Geçerli test verisi bulunamadı');
    }

    if (!questions || questions.length === 0) {
      throw new Error('Geçerli soru verisi bulunamadı');
    }

    // HTML içeriği oluştur
    const htmlContent = generateAdvancedTestPDFHTML(test, questions, categories, settings);
    
    // Güvenli dosya adı oluştur
    const safeFileName = sanitizeTurkishChars(
      (test.title || 'test').replace(/[^\w\d\s]/g, "_")
    );

    const options = {
      margin: [
        Math.max(5, Math.min(50, settings.pageMargin || 20)),
        Math.max(5, Math.min(50, settings.pageMargin || 20)),
        Math.max(5, Math.min(50, settings.pageMargin || 20)),
        Math.max(5, Math.min(50, settings.pageMargin || 20))
      ],
      filename: `${safeFileName}_advanced.pdf`,
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
        letterRendering: true,
        removeContainer: true,
        imageTimeout: 15000,
        onclone: function(clonedDoc: Document) {
          // Klonlanan dokümanda stil düzeltmeleri
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
        precision: 2
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
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata oluştu';
    alert(`PDF oluşturulurken bir hata oluştu: ${errorMessage}\n\nLütfen tekrar deneyin.`);
    throw error;
  }
}
