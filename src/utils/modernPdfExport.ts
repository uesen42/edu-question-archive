
import { Test, Question, Category } from '@/types';
import katex from 'katex';
import html2pdf from 'html2pdf.js';

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
        throwOnError: false
      });
    } catch {
      return `$$${expr}$$`;
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
        throwOnError: false
      });
    } catch {
      return `$${expr}$`;
    }
  });

  return text;
}

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
  questionsPerRow: 2
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
  const container = document.createElement("div");
  container.style.cssText = `
    max-width: 210mm;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    font-size: 12pt;
    line-height: 1.4;
    color: #000;
    background: white;
  `;
  container.className = "pdf-container";

  // Başlık
  const title = document.createElement("h1");
  title.textContent = test.title;
  title.style.cssText = `
    font-size: 18pt;
    margin: 0 0 10px 0;
    text-align: center;
    font-weight: bold;
    color: #000;
  `;
  container.appendChild(title);

  // Test bilgileri
  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  if (testQuestions.length > 0) {
    const infoDiv = document.createElement("div");
    infoDiv.style.cssText = `
      text-align: center;
      margin-bottom: 20px;
      font-size: 11pt;
      color: #666;
    `;
    
    let infoText = `Soru Sayısı: ${testQuestions.length}`;
    
    if (settings.showDate) {
      const testDate = new Date(test.createdAt).toLocaleDateString('tr-TR');
      infoText = `Tarih: ${testDate} | ${infoText}`;
    }
    
    infoDiv.textContent = infoText;
    container.appendChild(infoDiv);
  }

  // Test açıklaması
  if (test.description && test.description.trim()) {
    const desc = document.createElement("p");
    desc.innerHTML = renderMathInText(test.description);
    desc.style.cssText = `
      font-size: 11pt;
      margin-bottom: 20px;
      text-align: center;
      color: #333;
    `;
    container.appendChild(desc);
  }

  // Sorular Konteyneri
  const questionsContainer = document.createElement("div");
  questionsContainer.style.cssText = `
    display: block;
    width: 100%;
  `;

  for (let i = 0; i < testQuestions.length; i++) {
    const q = testQuestions[i];
    const category = categories.find(cat => cat.id === q.categoryId);

    const card = document.createElement("div");
    card.style.cssText = `
      width: ${settings.questionsPerRow === 1 ? "100%" : "48%"};
      border: 1px solid #ddd;
      padding: 12px;
      margin-bottom: 15px;
      border-radius: 8px;
      background-color: #fafafa;
      display: inline-block;
      vertical-align: top;
      box-sizing: border-box;
      ${settings.questionsPerRow === 2 ? "margin-right: 2%;" : ""}
      page-break-inside: avoid;
    `;

    // Soru başlığı
    const titleEl = document.createElement("div");
    titleEl.style.cssText = `
      margin-bottom: 8px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    `;
    
    const questionNumber = document.createElement("strong");
    questionNumber.textContent = `${i + 1}. `;
    questionNumber.style.color = "#333";
    titleEl.appendChild(questionNumber);

    const questionTitle = document.createElement("span");
    questionTitle.textContent = q.title || "Soru";
    questionTitle.style.color = "#333";
    titleEl.appendChild(questionTitle);

    // Meta bilgiler
    if (settings.showMetaInfo) {
      const metaContainer = document.createElement("div");
      metaContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 5px;
      `;

      if (settings.showCategory && category) {
        const categoryBadge = document.createElement("span");
        categoryBadge.textContent = category.name;
        categoryBadge.style.cssText = `
          font-size: 9pt;
          background-color: ${category.color || "#e0e0e0"};
          color: white;
          padding: 2px 6px;
          border-radius: 12px;
          display: inline-block;
        `;
        metaContainer.appendChild(categoryBadge);
      }

      if (settings.showGrade) {
        const gradeBadge = document.createElement("span");
        gradeBadge.textContent = `${q.grade}. Sınıf`;
        gradeBadge.style.cssText = `
          font-size: 9pt;
          background-color: #4CAF50;
          color: white;
          padding: 2px 6px;
          border-radius: 12px;
          display: inline-block;
        `;
        metaContainer.appendChild(gradeBadge);
      }

      if (settings.showDifficulty) {
        const difficultyBadge = document.createElement("span");
        difficultyBadge.textContent = q.difficultyLevel;
        const diffColors = { 'kolay': '#2196F3', 'orta': '#FF9800', 'zor': '#F44336' };
        difficultyBadge.style.cssText = `
          font-size: 9pt;
          background-color: ${diffColors[q.difficultyLevel] || "#666"};
          color: white;
          padding: 2px 6px;
          border-radius: 12px;
          display: inline-block;
        `;
        metaContainer.appendChild(difficultyBadge);
      }

      if (metaContainer.children.length > 0) {
        titleEl.appendChild(metaContainer);
      }
    }

    card.appendChild(titleEl);

    // Soru içeriği
    if (q.content && q.content.trim()) {
      const contentEl = document.createElement("div");
      contentEl.innerHTML = renderMathInText(q.content);
      contentEl.style.cssText = `
        line-height: 1.4;
        margin-bottom: 8px;
        color: #333;
      `;
      card.appendChild(contentEl);
    }

    // Resimler
    if (q.imageUrls && q.imageUrls.length > 0) {
      const imagesContainer = document.createElement("div");
      imagesContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;
      `;
      
      q.imageUrls.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.style.cssText = `
          max-width: 100px;
          max-height: 80px;
          object-fit: contain;
          border: 1px solid #ddd;
          border-radius: 4px;
        `;
        imagesContainer.appendChild(img);
      });
      
      card.appendChild(imagesContainer);
    }

    // Seçenekler
    if (settings.showOptions && q.options && q.options.length > 0) {
      const optionsContainer = document.createElement("div");
      optionsContainer.style.cssText = `
        margin-top: 10px;
      `;
      
      q.options.forEach((option, optIndex) => {
        const optionDiv = document.createElement("div");
        optionDiv.style.cssText = `
          margin-bottom: 4px;
          font-size: 10pt;
        `;
        
        const optionLetter = document.createElement("strong");
        optionLetter.textContent = `${String.fromCharCode(65 + optIndex)}) `;
        optionLetter.style.color = "#555";
        optionDiv.appendChild(optionLetter);
        
        const optionText = document.createElement("span");
        optionText.innerHTML = renderMathInText(option);
        optionDiv.appendChild(optionText);
        
        optionsContainer.appendChild(optionDiv);
      });
      
      card.appendChild(optionsContainer);
    }

    questionsContainer.appendChild(card);
  }

  container.appendChild(questionsContainer);

  // Cevap anahtarı
  if (settings.showAnswerKey) {
    const answersWithKeys = testQuestions.filter(q => 
      q.options && q.options.length > 0 && typeof q.correctAnswer === 'number'
    );
    
    if (answersWithKeys.length > 0) {
      const answerKeySection = document.createElement("div");
      answerKeySection.style.cssText = `
        margin-top: 30px;
        padding: 20px;
        border: 2px solid #333;
        border-radius: 8px;
        background-color: #f9f9f9;
        page-break-before: always;
      `;

      const answerKeyTitle = document.createElement("h2");
      answerKeyTitle.textContent = "CEVAP ANAHTARI";
      answerKeyTitle.style.cssText = `
        text-align: center;
        margin: 0 0 20px 0;
        font-size: 16pt;
        font-weight: bold;
      `;
      answerKeySection.appendChild(answerKeyTitle);

      const answerGrid = document.createElement("div");
      answerGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
      `;

      answersWithKeys.forEach((q) => {
        const answerItem = document.createElement("div");
        answerItem.style.cssText = `
          display: flex;
          justify-content: space-between;
          padding: 5px 10px;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 4px;
        `;

        const questionNum = document.createElement("strong");
        const questionIndex = testQuestions.findIndex(tq => tq.id === q.id) + 1;
        questionNum.textContent = `${questionIndex}.`;

        const correctLetter = document.createElement("span");
        correctLetter.textContent = String.fromCharCode(65 + (q.correctAnswer || 0));
        correctLetter.style.cssText = `
          font-weight: bold;
          color: #2196F3;
        `;

        answerItem.appendChild(questionNum);
        answerItem.appendChild(correctLetter);
        answerGrid.appendChild(answerItem);
      });

      answerKeySection.appendChild(answerGrid);
      container.appendChild(answerKeySection);
    }
  }

  return container;
}

/**
 * PDF önizleme için HTML content oluşturur
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
 * PDF olarak indirme işlemi
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
    
    // DOM'a geçici olarak ekle ve bekleme süresi ver
    document.body.appendChild(element);
    
    // Render için kısa bir bekleme
    await new Promise(resolve => setTimeout(resolve, 500));

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${test.title.replace(/[^\w\d\s]/g, "_")}.pdf`,
      image: { 
        type: "jpeg", 
        quality: 0.98 
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        foreignObjectRendering: true,
        width: element.offsetWidth,
        height: element.offsetHeight
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true
      },
    };

    await html2pdf().set(opt).from(element).save();
    
    console.log('PDF başarıyla oluşturuldu');

    // Bellek temizliği
    document.body.removeChild(element);
    
  } catch (error) {
    console.error('PDF oluşturulurken hata:', error);
    throw error;
  }
}
