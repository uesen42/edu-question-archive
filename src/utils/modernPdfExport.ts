
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
 * KaTeX formüllerini düzgün parse eder
 */
function parseKaTeX(content: string): string {
  // Türkçe karakterleri temizle
  content = sanitizeTurkishChars(content);
  
  // Block math $$...$$ 
  content = content.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
    return `<div class="math-block" data-math="${math.trim()}">$$${math.trim()}$$</div>`;
  });
  
  // Inline math $...$
  content = content.replace(/\$([^$]+)\$/g, (match, math) => {
    return `<span class="math-inline" data-math="${math.trim()}">$${math.trim()}$</span>`;
  });
  
  return content;
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
  showAnswerKey: false,
  showMetaInfo: true,
  showCategory: true,
  showGrade: true,
  showDifficulty: true,
  showDate: true,
  questionsPerRow: 1,
};

/**
 * Test sorularını içeren HTML DOM elementi oluşturur
 */
export function generateTestPDFContent(
  test: Test,
  questions: Question[],
  categories: Category[],
  settings: PDFExportSettings = defaultPDFSettings
): HTMLElement {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 190mm;
    min-height: 250mm;
    margin: 0;
    padding: 15mm;
    font-family: 'Arial', sans-serif;
    font-size: 11pt;
    line-height: 1.4;
    color: #000;
    background: white;
    box-sizing: border-box;
    page-break-inside: avoid;
  `;

  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  const orderedQuestions = test.settings.randomizeOrder 
    ? [...testQuestions].sort(() => Math.random() - 0.5)
    : testQuestions;

  // Test başlığı
  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
  `;
  header.innerHTML = `
    <h1 style="margin: 0; font-size: 18pt; font-weight: bold;">${test.title}</h1>
    ${test.description ? `<p style="margin: 5px 0 0 0; font-size: 10pt; color: #666;">${test.description}</p>` : ''}
  `;
  container.appendChild(header);

  // Meta bilgiler
  if (settings.showMetaInfo) {
    const metaInfo = document.createElement('div');
    metaInfo.style.cssText = `
      margin-bottom: 15px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 9pt;
    `;
    
    const metaItems = [];
    if (settings.showDate) {
      metaItems.push(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`);
    }
    metaItems.push(`Soru Sayısı: ${orderedQuestions.length}`);
    if (test.settings.timeLimit) {
      metaItems.push(`Süre: ${test.settings.timeLimit} dakika`);
    }
    
    metaInfo.innerHTML = metaItems.join(' | ');
    container.appendChild(metaInfo);
  }

  // Sorular
  const questionsContainer = document.createElement('div');
  questionsContainer.style.cssText = settings.questionsPerRow === 2 
    ? 'display: grid; grid-template-columns: 1fr 1fr; gap: 15px; column-gap: 20px;'
    : 'display: block;';

  orderedQuestions.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.style.cssText = `
      margin-bottom: 20px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      page-break-inside: avoid;
      background: white;
    `;

    // Soru başlığı ve numarası
    const questionHeader = document.createElement('div');
    questionHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      font-weight: bold;
    `;

    const questionNumber = document.createElement('span');
    questionNumber.style.cssText = `
      background: #333;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10pt;
    `;
    questionNumber.textContent = `${index + 1}`;

    const questionTitle = document.createElement('span');
    questionTitle.style.cssText = 'flex: 1; margin-left: 10px; font-size: 10pt;';
    questionTitle.textContent = question.title;

    questionHeader.appendChild(questionNumber);
    questionHeader.appendChild(questionTitle);
    questionDiv.appendChild(questionHeader);

    // Meta bilgiler
    if (settings.showMetaInfo) {
      const metaDiv = document.createElement('div');
      metaDiv.style.cssText = `
        margin-bottom: 8px;
        font-size: 8pt;
        color: #666;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      `;

      const metaItems = [];
      if (settings.showCategory) {
        const category = categories.find(cat => cat.id === question.categoryId);
        if (category) metaItems.push(`Kategori: ${category.name}`);
      }
      if (settings.showGrade) {
        metaItems.push(`Sınıf: ${question.grade}`);
      }
      if (settings.showDifficulty) {
        metaItems.push(`Zorluk: ${question.difficultyLevel}`);
      }

      metaDiv.innerHTML = metaItems.join(' | ');
      questionDiv.appendChild(metaDiv);
    }

    // Soru içeriği
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
      margin-bottom: 10px;
      line-height: 1.6;
      word-wrap: break-word;
      max-width: 100%;
    `;
    
    // KaTeX içeriği parse et
    const parsedContent = parseKaTeX(question.content);
    contentDiv.innerHTML = parsedContent;
    questionDiv.appendChild(contentDiv);

    // Şıklar
    if (settings.showOptions && question.options && question.options.length > 0) {
      const optionsDiv = document.createElement('div');
      optionsDiv.style.cssText = 'margin-top: 10px;';

      question.options.forEach((option, optionIndex) => {
        const optionDiv = document.createElement('div');
        optionDiv.style.cssText = `
          margin-bottom: 4px;
          display: flex;
          align-items: flex-start;
          gap: 6px;
        `;

        const optionLabel = document.createElement('span');
        optionLabel.style.cssText = `
          font-weight: bold;
          min-width: 20px;
          ${settings.showAnswerKey && question.correctAnswer === optionIndex ? 
            'background: #4CAF50; color: white; padding: 1px 6px; border-radius: 3px;' : ''}
        `;
        optionLabel.textContent = String.fromCharCode(65 + optionIndex) + ')';

        const optionText = document.createElement('span');
        optionText.style.cssText = 'flex: 1; word-wrap: break-word;';
        optionText.innerHTML = parseKaTeX(option);

        optionDiv.appendChild(optionLabel);
        optionDiv.appendChild(optionText);
        optionsDiv.appendChild(optionDiv);
      });

      questionDiv.appendChild(optionsDiv);
    }

    // Cevap anahtarı (sadece şık yoksa)
    if (settings.showAnswerKey && !settings.showOptions && typeof question.correctAnswer === 'number') {
      const answerDiv = document.createElement('div');
      answerDiv.style.cssText = `
        margin-top: 8px;
        padding: 4px 8px;
        background: #4CAF50;
        color: white;
        border-radius: 3px;
        font-size: 9pt;
        display: inline-block;
      `;
      answerDiv.textContent = `Cevap: ${String.fromCharCode(65 + question.correctAnswer)}`;
      questionDiv.appendChild(answerDiv);
    }

    questionsContainer.appendChild(questionDiv);
  });

  container.appendChild(questionsContainer);

  // Cevap anahtarı (ayrı bölüm)
  if (settings.showAnswerKey && orderedQuestions.some(q => typeof q.correctAnswer === 'number')) {
    const answerKeyDiv = document.createElement('div');
    answerKeyDiv.style.cssText = `
      margin-top: 30px;
      padding: 15px;
      border: 2px solid #333;
      border-radius: 4px;
      page-break-before: always;
    `;

    const answerKeyTitle = document.createElement('h3');
    answerKeyTitle.style.cssText = `
      margin: 0 0 10px 0;
      font-size: 14pt;
      text-align: center;
    `;
    answerKeyTitle.textContent = 'CEVAP ANAHTARI';
    answerKeyDiv.appendChild(answerKeyTitle);

    const answerGrid = document.createElement('div');
    answerGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
      gap: 8px;
      font-size: 10pt;
    `;

    orderedQuestions.forEach((question, index) => {
      if (typeof question.correctAnswer === 'number') {
        const answerCell = document.createElement('div');
        answerCell.style.cssText = `
          text-align: center;
          padding: 4px;
          border: 1px solid #ddd;
          border-radius: 3px;
        `;
        answerCell.innerHTML = `
          <strong>${index + 1}.</strong> ${String.fromCharCode(65 + question.correctAnswer)}
        `;
        answerGrid.appendChild(answerCell);
      }
    });

    answerKeyDiv.appendChild(answerGrid);
    container.appendChild(answerKeyDiv);
  }

  return container;
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
  const element = generateTestPDFContent(test, questions, categories, settings);
  return element.outerHTML;
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
    console.log('Modern PDF export başlıyor...');
    const element = generateTestPDFContent(test, questions, categories, settings);

    element.style.opacity = '0';
    element.style.position = 'fixed';
    element.style.top = '0';
    element.style.left = '0';
    element.style.zIndex = '-1';
    document.body.appendChild(element);
    console.log('DOM elementi oluşturuldu ve eklendi');

    await new Promise(resolve => setTimeout(resolve, 3000));

    const katexElements = element.querySelectorAll('.math-block, .math-inline');
    if (katexElements.length > 0) {
      console.log(`${katexElements.length} KaTeX elementi bulundu, render bekleniyor...`);
      
      // KaTeX elementlerini manuel olarak render et
      katexElements.forEach(el => {
        const mathContent = el.getAttribute('data-math');
        if (mathContent) {
          try {
            el.textContent = mathContent; // Fallback olarak text içeriği
          } catch (error) {
            console.warn('KaTeX render hatası:', error);
          }
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('DOM render tamamlandı, PDF oluşturuluyor...');

    const options = {
      margin: [10, 10, 10, 10],
      filename: `${test.title.replace(/[^\w\d\s]/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: true,
        letterRendering: true,
        foreignObjectRendering: true,
        scrollX: 0,
        scrollY: 0,
        onclone: function(clonedDoc: Document) {
          const clonedElement = clonedDoc.querySelector('div');
          if (clonedElement) {
            clonedElement.style.opacity = '1';
          }
        }
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(options).from(element).save();
    console.log('PDF başarıyla oluşturuldu ve kaydedildi');

    document.body.removeChild(element);
    console.log('DOM temizlendi');

  } catch (error) {
    console.error('PDF oluşturulurken hata:', error);
    
    const existingElement = document.querySelector('div[style*="position: fixed"]');
    if (existingElement) document.body.removeChild(existingElement);
    throw error;
  }
}
