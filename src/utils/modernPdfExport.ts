import { Test, Question, Category } from '@/types';
import katex from 'katex';
import html2pdf from 'html2pdf.js';

// ====================
// Yardımcı Fonksiyonlar
// ====================

/**
 * Türkçe karakterleri LaTeX'e uygun hale getirir.
 */
function sanitizeTurkishChars(text: string): string {
  return text
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C');
}

/**
 * Metindeki $...$ ve $$...$$ ifadelerini KaTeX ile çevirir.
 */
function renderMathInText(text: string): string {
  // Block math ($$...$$)
  text = text.replace(/\$\$([^$]+)\$\$/g, (_, expr) => {
    try {
      const sanitizedExpr = sanitizeTurkishChars(expr.trim());
      return katex.renderToString(sanitizedExpr, {
        displayMode: true,
        strict: false,
        trust: true,
        throwOnError: false,
      });
    } catch {
      return `<div style="text-align: center; margin: 8px 0; font-weight: bold;">[${expr}]</div>`;
    }
  });

  // Inline math ($...$)
  text = text.replace(/\$([^$]+)\$/g, (_, expr) => {
    try {
      const sanitizedExpr = sanitizeTurkishChars(expr.trim());
      return katex.renderToString(sanitizedExpr, {
        displayMode: false,
        strict: false,
        trust: true,
        throwOnError: false,
      });
    } catch {
      return `<span style="font-weight: bold;">[${expr}]</span>`;
    }
  });

  return text;
}

// ====================
// Ayarlar
// ====================

export interface PDFExportSettings {
  showMetaInfo: boolean;
  showCategory: boolean;
  showGrade: boolean;
  showDifficulty: boolean;
  showDate: boolean;
  showOptions: boolean;
  showAnswerKey: boolean;
  questionsPerRow: 1 | 2;
}

export const defaultPDFSettings: PDFExportSettings = {
  showMetaInfo: true,
  showCategory: true,
  showGrade: true,
  showDifficulty: true,
  showDate: false,
  showOptions: true,
  showAnswerKey: false,
  questionsPerRow: 2,
};

// ====================
// DOM Oluşturma
// ====================

/**
 * Soru kartlarını içeren bir HTML elementi oluşturur.
 */
function createQuestionCards(
  testQuestions: Question[],
  categories: Category[],
  settings: PDFExportSettings
): HTMLElement {
  const questionsWrapper = document.createElement('div');
  questionsWrapper.style.cssText = `
    width: 100%;
    display: block;
    overflow: visible;
  `;

  testQuestions.forEach((q, index) => {
    const category = categories.find(cat => cat.id === q.categoryId);
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card';
    questionCard.style.cssText = `
      width: ${settings.questionsPerRow === 1 ? '100%' : '48%'};
      border: 1px solid #ccc;
      margin-bottom: 8mm;
      padding: 5mm;
      border-radius: 3mm;
      background-color: #fafafa;
      display: inline-block;
      vertical-align: top;
      box-sizing: border-box;
      ${settings.questionsPerRow === 2 ? 'margin-right: 4%;' : ''}
      page-break-inside: avoid;
      min-height: 20mm;
      position: relative;
    `;

    // Başlık
    const header = document.createElement('div');
    header.style.cssText = `
      margin-bottom: 3mm;
      border-bottom: 1px solid #ddd;
      padding-bottom: 2mm;
      display: block;
    `;
    const questionNum = document.createElement('strong');
    questionNum.textContent = `${index + 1}. `;
    questionNum.style.cssText = `color: #000; font-size: 11pt; display: inline;`;
    const questionTitle = document.createElement('span');
    questionTitle.textContent = q.title || 'Soru';
    questionTitle.style.cssText = `color: #000; font-size: 11pt; display: inline;`;
    header.appendChild(questionNum);
    header.appendChild(questionTitle);

    // Meta bilgiler
    if (settings.showMetaInfo) {
      const metaDiv = document.createElement('div');
      metaDiv.style.cssText = `margin-top: 2mm; display: block;`;

      if (settings.showCategory && category) {
        const catBadge = document.createElement('span');
        catBadge.textContent = category.name;
        catBadge.style.cssText = `
          font-size: 8pt;
          background-color: ${category.color || '#666'};
          color: white;
          padding: 1mm 2mm;
          border-radius: 2mm;
          display: inline-block;
          margin-right: 2mm;
        `;
        metaDiv.appendChild(catBadge);
      }

      if (settings.showGrade) {
        const gradeBadge = document.createElement('span');
        gradeBadge.textContent = `${q.grade}. Sınıf`;
        gradeBadge.style.cssText = `
          font-size: 8pt;
          background-color: #4CAF50;
          color: white;
          padding: 1mm 2mm;
          border-radius: 2mm;
          display: inline-block;
          margin-right: 2mm;
        `;
        metaDiv.appendChild(gradeBadge);
      }

      if (settings.showDifficulty) {
        const diffColors = { 'kolay': '#2196F3', 'orta': '#FF9800', 'zor': '#F44336' };
        const diffBadge = document.createElement('span');
        diffBadge.textContent = q.difficultyLevel;
        diffBadge.style.cssText = `
          font-size: 8pt;
          background-color: ${diffColors[q.difficultyLevel] || '#666'};
          color: white;
          padding: 1mm 2mm;
          border-radius: 2mm;
          display: inline-block;
          margin-right: 2mm;
        `;
        metaDiv.appendChild(diffBadge);
      }

      if (metaDiv.children.length > 0) header.appendChild(metaDiv);
    }

    questionCard.appendChild(header);

    // İçerik
    if (q.content?.trim()) {
      const content = document.createElement('div');
      content.innerHTML = renderMathInText(q.content);
      content.style.cssText = `
        line-height: 1.5;
        margin-bottom: 3mm;
        color: #000;
        font-size: 10pt;
        display: block;
      `;
      questionCard.appendChild(content);
    }

    // Görseller
    if (q.imageUrls?.length) {
      const imgContainer = document.createElement('div');
      imgContainer.style.cssText = `display: block; margin-bottom: 3mm;`;
      q.imageUrls.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = `
          max-width: 25mm;
          max-height: 20mm;
          object-fit: contain;
          border: 1px solid #ccc;
          border-radius: 1mm;
          margin-right: 2mm;
          display: inline-block;
        `;
        imgContainer.appendChild(img);
      });
      questionCard.appendChild(imgContainer);
    }

    // Seçenekler
    if (settings.showOptions && q.options?.length) {
      const optionsDiv = document.createElement('div');
      optionsDiv.style.cssText = `margin-top: 3mm; display: block;`;
      q.options.forEach((option, optIndex) => {
        const optionItem = document.createElement('div');
        optionItem.style.cssText = `
          margin-bottom: 1mm;
          font-size: 9pt;
          line-height: 1.3;
          display: block;
        `;
        const optLetter = document.createElement('strong');
        optLetter.textContent = `${String.fromCharCode(65 + optIndex)}) `;
        optLetter.style.cssText = `color: #333; display: inline;`;
        const optText = document.createElement('span');
        optText.innerHTML = renderMathInText(option);
        optText.style.cssText = `display: inline;`;
        optionItem.appendChild(optLetter);
        optionItem.appendChild(optText);
        optionsDiv.appendChild(optionItem);
      });
      questionCard.appendChild(optionsDiv);
    }

    questionsWrapper.appendChild(questionCard);
  });

  return questionsWrapper;
}

/**
 * Cevap anahtarı için HTML elementi oluşturur.
 */
function createAnswerKeySection(test: Test, testQuestions: Question[]): HTMLElement | null {
  const answeredQuestions = testQuestions.filter(q =>
    q.options?.length && typeof q.correctAnswer === 'number'
  );

  if (!answeredQuestions.length) return null;

  const answerSection = document.createElement('div');
  answerSection.style.cssText = `
    margin-top: 15mm;
    padding: 5mm;
    border: 2px solid #000;
    border-radius: 3mm;
    background-color: #f5f5f5;
    page-break-before: always;
    display: block;
  `;

  const answerTitle = document.createElement('h2');
  answerTitle.textContent = 'CEVAP ANAHTARI';
  answerTitle.style.cssText = `
    text-align: center;
    margin: 0 0 5mm 0;
    font-size: 14pt;
    font-weight: bold;
    color: #000;
    display: block;
  `;
  answerSection.appendChild(answerTitle);

  const answerGrid = document.createElement('div');
  answerGrid.style.cssText = `
    display: block;
    overflow: visible;
  `;

  answeredQuestions.forEach(q => {
    const answerItem = document.createElement('div');
    answerItem.style.cssText = `
      display: inline-block;
      width: 30mm;
      margin: 2mm;
      padding: 2mm 3mm;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 2mm;
      text-align: center;
    `;

    const qNum = document.createElement('strong');
    const questionIndex = testQuestions.findIndex(tq => tq.id === q.id) + 1;
    qNum.textContent = `${questionIndex}. `;
    qNum.style.cssText = `color: #000; display: inline;`;

    const correctAnswer = document.createElement('span');
    correctAnswer.textContent = String.fromCharCode(65 + (q.correctAnswer || 0));
    correctAnswer.style.cssText = `
      font-weight: bold;
      color: #2196F3;
      font-size: 11pt;
      display: inline;
    `;

    answerItem.appendChild(qNum);
    answerItem.appendChild(correctAnswer);
    answerGrid.appendChild(answerItem);
  });

  answerSection.appendChild(answerGrid);
  return answerSection;
}

/**
 * Tam PDF DOM elementini oluşturur.
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
    position: relative;
    display: block;
  `;

  // Başlık
  const title = document.createElement('h1');
  title.textContent = test.title;
  title.style.cssText = `
    font-size: 16pt;
    margin: 0 0 15mm 0;
    text-align: center;
    font-weight: bold;
    color: #000;
    page-break-after: avoid;
    display: block;
  `;
  container.appendChild(title);

  // Bilgi satırı
  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  if (testQuestions.length > 0) {
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
      text-align: center;
      margin-bottom: 10mm;
      font-size: 10pt;
      color: #333;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5mm;
      display: block;
    `;
    let infoText = `Toplam Soru Sayısı: ${testQuestions.length}`;
    if (settings.showDate) {
      const testDate = new Date(test.createdAt).toLocaleDateString('tr-TR');
      infoText = `Tarih: ${testDate} | ${infoText}`;
    }
    infoDiv.innerHTML = infoText;
    container.appendChild(infoDiv);
  }

  // Açıklama
  if (test.description?.trim()) {
    const desc = document.createElement('div');
    desc.innerHTML = renderMathInText(test.description);
    desc.style.cssText = `
      font-size: 10pt;
      margin-bottom: 10mm;
      text-align: center;
      color: #555;
      font-style: italic;
      display: block;
    `;
    container.appendChild(desc);
  }

  // Sorular
  container.appendChild(createQuestionCards(testQuestions, categories, settings));

  // Cevap Anahtarı
  const answerKeySection = createAnswerKeySection(test, testQuestions);
  if (answerKeySection) container.appendChild(answerKeySection);

  return container;
}
  
// ====================
// PDF Export
// ====================

/**
 * PDF önizleme içeriği oluşturur.
 */
export function generatePDFPreviewContent(
  test: Test,
  questions: Question[],
  categories: Category[],
  settings: PDFExportSettings
): string {
  const element = generateTestPDFContent(test, questions, categories, settings);
  return element.outerHTML;
}

/**
 * PDF export işlemi - İyileştirilmiş ve daha güvenilir yaklaşım.
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

    // Elementi DOM’a ekle ama görünmez ama render edilebilir şekilde
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.opacity = '1';
    element.style.zIndex = '9999';
    element.style.pointerEvents = 'none';

    document.body.appendChild(element);
    console.log('DOM elementi oluşturuldu ve eklendi');

    // DOM’un tam olarak render edilmesini bekle
    await waitForRender(element);
    console.log('DOM render tamamlandı');

    // KaTeX varsa ekstra bekle
    const katexElements = element.querySelectorAll('.katex');
    if (katexElements.length > 0) {
      console.log(`${katexElements.length} KaTeX elementi bulundu, render bekleniyor...`);
      await waitForKatex(element);
      console.log('KaTeX render tamamlandı');
    }

    // PDF ayarları
    const options = {
      margin: [10, 10, 10, 10],
      filename: `${test.title.replace(/[^\w\d\s]/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: true,
        letterRendering: true,
        foreignObjectRendering: false,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // PDF oluştur
    await html2pdf().set(options).from(element).save();
    console.log('PDF başarıyla oluşturuldu ve kaydedildi');

    // Temizlik
    document.body.removeChild(element);
    console.log('DOM temizlendi');

  } catch (error) {
    console.error('PDF oluşturulurken hata:', error);
    alert('PDF oluşturulurken bir hata oluştu.');
    throw error;
  }
};

  // PDF oluştur ve kaydet
  await html2pdf().set(options).from(element).save();
  console.log('PDF başarıyla oluşturuldu ve kaydedildi');

  // Temizlik
  document.body.removeChild(element);
  console.log('DOM temizlendi');
}

/**
 * KaTeX'in render edilmesini beklemek için yardımcı fonksiyon.
 */
async function waitForKatexRender(element: HTMLElement): Promise<void> {
  return new Promise(resolve => {
    const checkKatex = () => {
      const katexElements = element.querySelectorAll('.katex');
      if (!katexElements.length || [...katexElements].every(el => el.clientHeight > 0)) {
        resolve();
      } else {
        setTimeout(checkKatex, 500);
      }
    };
    checkKatex();
  });
}
