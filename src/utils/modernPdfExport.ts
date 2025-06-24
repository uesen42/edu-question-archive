
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
    width: 210mm;
    min-height: 297mm;
    margin: 0;
    padding: 20mm;
    font-family: 'Times New Roman', serif;
    font-size: 11pt;
    line-height: 1.3;
    color: #000;
    background: white;
    box-sizing: border-box;
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
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
  `;
  header.innerHTML = `
    <h1 style="margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase;">${test.title}</h1>
    ${test.description ? `<p style="margin: 5px 0 0 0; font-size: 10pt; color: #333;">${test.description}</p>` : ''}
  `;
  container.appendChild(header);

  // Meta bilgiler
  if (settings.showMetaInfo) {
    const metaInfo = document.createElement('div');
    metaInfo.style.cssText = `
      margin-bottom: 15px;
      padding: 8px;
      background: #f8f8f8;
      border: 1px solid #ccc;
      font-size: 9pt;
      display: flex;
      justify-content: space-between;
    `;
    
    const leftMeta = document.createElement('div');
    const rightMeta = document.createElement('div');
    
    leftMeta.innerHTML = `
      <strong>Adı Soyadı:</strong> ________________________
      <br><strong>Sınıfı:</strong> ________
    `;
    
    const metaItems = [];
    if (settings.showDate) {
      metaItems.push(`<strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}`);
    }
    metaItems.push(`<strong>Soru Sayısı:</strong> ${orderedQuestions.length}`);
    if (test.settings.timeLimit) {
      metaItems.push(`<strong>Süre:</strong> ${test.settings.timeLimit} dakika`);
    }
    
    rightMeta.innerHTML = metaItems.join('<br>');
    
    metaInfo.appendChild(leftMeta);
    metaInfo.appendChild(rightMeta);
    container.appendChild(metaInfo);
  }

  // Sorular için container
  const questionsContainer = document.createElement('div');
  questionsContainer.style.cssText = settings.questionsPerRow === 2 
    ? `
        display: grid; 
        grid-template-columns: 1fr 1fr; 
        gap: 15px; 
        column-gap: 20px;
        margin-bottom: 30px;
      `
    : `
        display: block;
        margin-bottom: 30px;
      `;

  orderedQuestions.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.style.cssText = `
      margin-bottom: 15px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      page-break-inside: avoid;
      background: #fafafa;
    `;

    // Soru numarası ve başlık
    const questionHeader = document.createElement('div');
    questionHeader.style.cssText = `
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;
      font-weight: bold;
    `;

    const questionNumber = document.createElement('span');
    questionNumber.style.cssText = `
      background: #000;
      color: white;
      padding: 3px 8px;
      border-radius: 50%;
      font-size: 10pt;
      min-width: 20px;
      text-align: center;
      margin-right: 10px;
    `;
    questionNumber.textContent = `${index + 1}`;

    questionHeader.appendChild(questionNumber);
    questionDiv.appendChild(questionHeader);

    // Meta bilgiler (küçük)
    if (settings.showMetaInfo) {
      const metaDiv = document.createElement('div');
      metaDiv.style.cssText = `
        margin-bottom: 6px;
        font-size: 7pt;
        color: #666;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      `;

      const metaItems = [];
      if (settings.showCategory) {
        const category = categories.find(cat => cat.id === question.categoryId);
        if (category) metaItems.push(`${category.name}`);
      }
      if (settings.showGrade) {
        metaItems.push(`${question.grade}. Sınıf`);
      }
      if (settings.showDifficulty) {
        metaItems.push(`${question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1)}`);
      }

      metaDiv.innerHTML = metaItems.join(' | ');
      questionDiv.appendChild(metaDiv);
    }

    // Soru içeriği
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
      margin-bottom: 10px;
      line-height: 1.4;
      word-wrap: break-word;
      max-width: 100%;
      font-size: 10pt;
    `;
    
    // Matematik sembollerini parse et
    const parsedContent = parseMathSymbols(question.content);
    contentDiv.innerHTML = parsedContent;
    questionDiv.appendChild(contentDiv);

    // Şıklar
    if (settings.showOptions && question.options && question.options.length > 0) {
      const optionsDiv = document.createElement('div');
      optionsDiv.style.cssText = 'margin-top: 8px;';

      question.options.forEach((option, optionIndex) => {
        const optionDiv = document.createElement('div');
        optionDiv.style.cssText = `
          margin-bottom: 3px;
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 9pt;
        `;

        const optionLabel = document.createElement('span');
        optionLabel.style.cssText = `
          font-weight: bold;
          min-width: 18px;
          ${settings.showAnswerKey && question.correctAnswer === optionIndex ? 
            'background: #4CAF50; color: white; padding: 1px 5px; border-radius: 3px;' : ''}
        `;
        optionLabel.textContent = String.fromCharCode(65 + optionIndex) + ')';

        const optionText = document.createElement('span');
        optionText.style.cssText = 'flex: 1; word-wrap: break-word;';
        optionText.innerHTML = parseMathSymbols(option);

        optionDiv.appendChild(optionLabel);
        optionDiv.appendChild(optionText);
        optionsDiv.appendChild(optionDiv);
      });

      questionDiv.appendChild(optionsDiv);
    }

    questionsContainer.appendChild(questionDiv);
  });

  container.appendChild(questionsContainer);

  // Cevap anahtarı (ayrı sayfa)
  if (settings.showAnswerKey && orderedQuestions.some(q => typeof q.correctAnswer === 'number')) {
    const answerKeyDiv = document.createElement('div');
    answerKeyDiv.style.cssText = `
      margin-top: 30px;
      padding: 20px;
      border: 2px solid #000;
      border-radius: 5px;
      page-break-before: always;
      background: white;
    `;

    const answerKeyTitle = document.createElement('h2');
    answerKeyTitle.style.cssText = `
      margin: 0 0 15px 0;
      font-size: 14pt;
      text-align: center;
      text-transform: uppercase;
      border-bottom: 1px solid #000;
      padding-bottom: 10px;
    `;
    answerKeyTitle.textContent = 'CEVAP ANAHTARI';
    answerKeyDiv.appendChild(answerKeyTitle);

    const answerGrid = document.createElement('div');
    answerGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 8px;
      font-size: 10pt;
      max-width: 100%;
    `;

    orderedQuestions.forEach((question, index) => {
      if (typeof question.correctAnswer === 'number') {
        const answerCell = document.createElement('div');
        answerCell.style.cssText = `
          text-align: center;
          padding: 6px 4px;
          border: 1px solid #000;
          border-radius: 3px;
          background: #f0f0f0;
          font-weight: bold;
        `;
        answerCell.innerHTML = `${index + 1}) ${String.fromCharCode(65 + question.correctAnswer)}`;
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
    console.log('PDF export başlıyor...');
    
    // DOM elementi oluştur
    const element = generateTestPDFContent(test, questions, categories, settings);
    
    // Test amaçlı: elementi geçici olarak sayfaya ekle
    element.style.position = 'fixed';
    element.style.top = '0';
    element.style.left = '0';
    element.style.zIndex = '9999';
    element.style.background = 'white';
    element.style.transform = 'scale(0.5)';
    element.style.transformOrigin = 'top left';
    document.body.appendChild(element);
    
    console.log('DOM elementi oluşturuldu ve geçici olarak eklendi');
    
    // Render için bekle
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('PDF oluşturma başlatılıyor...');
    
    const options = {
      margin: [5, 5, 5, 5],
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
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true
      },
      pagebreak: { 
        mode: ['avoid-all', 'css'],
        before: '.page-break-before',
        after: '.page-break-after'
      }
    };

    // PDF oluştur ve indir
    await html2pdf().set(options).from(element).save();
    
    console.log('PDF başarıyla oluşturuldu ve indirildi');
    
    // Geçici elementi kaldır
    document.body.removeChild(element);
    console.log('Geçici element temizlendi');

  } catch (error) {
    console.error('PDF oluşturulurken hata:', error);
    
    // Hata durumunda geçici elementi temizle
    const tempElement = document.querySelector('div[style*="position: fixed"]');
    if (tempElement && tempElement.parentNode) {
      tempElement.parentNode.removeChild(tempElement);
    }
    
    alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    throw error;
  }
}
