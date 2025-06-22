import { Test, Question, Category } from '@/types';
import katex from 'katex';
import html2pdf from 'html2pdf.js';

/**
 * Türkçe karakterleri LaTeX uyumlu hale getirir
 */
function sanitizeTurkishChars(text: string): string {
  return text
    .replace(/ş/g, '\\text{ş}')
    .replace(/Ş/g, '\\text{Ş}')
    .replace(/ğ/g, '\\text{ğ}')
    .replace(/Ğ/g, '\\text{Ğ}')
    .replace(/ı/g, '\\text{ı}')
    .replace(/İ/g, '\\text{İ}')
    .replace(/ö/g, '\\text{ö}')
    .replace(/Ö/g, '\\text{Ö}')
    .replace(/ü/g, '\\text{ü}')
    .replace(/Ü/g, '\\text{Ü}')
    .replace(/ç/g, '\\text{ç}')
    .replace(/Ç/g, '\\text{Ç}');
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
        trust: true
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
        trust: true
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
  container.style.maxWidth = "210mm";
  container.style.margin = "0 auto";
  container.style.padding = "20px";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "12pt";
  container.className = "pdf-container";

  // Başlık
  const title = document.createElement("h1");
  title.textContent = test.title;
  title.style.fontSize = "18pt";
  title.style.marginBottom = "10px";
  title.style.textAlign = "center";
  container.appendChild(title);

  // Test bilgileri
  const infoDiv = document.createElement("div");
  infoDiv.style.textAlign = "center";
  infoDiv.style.marginBottom = "20px";
  infoDiv.style.fontSize = "11pt";
  infoDiv.style.color = "#666";
  
  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  let infoText = `Soru Sayısı: ${testQuestions.length}`;
  
  if (settings.showDate) {
    const testDate = new Date(test.createdAt).toLocaleDateString('tr-TR');
    infoText = `Tarih: ${testDate} | ${infoText}`;
  }
  
  infoDiv.innerHTML = infoText;
  container.appendChild(infoDiv);

  // Test açıklaması
  if (test.description) {
    const desc = document.createElement("p");
    desc.innerHTML = renderMathInText(test.description);
    desc.style.fontSize = "11pt";
    desc.style.marginBottom = "20px";
    desc.style.textAlign = "center";
    container.appendChild(desc);
  }

  // Sorular Konteyneri
  const questionsContainer = document.createElement("div");
  questionsContainer.style.display = "flex";
  questionsContainer.style.flexWrap = "wrap";
  questionsContainer.style.gap = "15px";
  questionsContainer.style.justifyContent = "space-between";
  questionsContainer.className = "questions-container";

  for (let i = 0; i < testQuestions.length; i++) {
    const q = testQuestions[i];
    const category = categories.find(cat => cat.id === q.categoryId);

    const card = document.createElement("div");
    card.style.width = settings.questionsPerRow === 1 ? "100%" : "48%";
    card.style.border = "1px solid #ddd";
    card.style.padding = "12px";
    card.style.boxSizing = "border-box";
    card.style.borderRadius = "8px";
    card.style.backgroundColor = "#fafafa";
    card.style.breakInside = "avoid";
    card.style.marginBottom = "10px";
    card.className = "question-card";

    // Soru başlığı
    const titleEl = document.createElement("div");
    titleEl.style.marginBottom = "8px";
    titleEl.style.borderBottom = "1px solid #eee";
    titleEl.style.paddingBottom = "5px";
    
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
      metaContainer.style.display = "flex";
      metaContainer.style.flexWrap = "wrap";
      metaContainer.style.gap = "5px";
      metaContainer.style.marginLeft = "8px";

      if (settings.showCategory && category) {
        const categoryBadge = document.createElement("span");
        categoryBadge.textContent = category.name;
        categoryBadge.style.fontSize = "9pt";
        categoryBadge.style.backgroundColor = category.color || "#e0e0e0";
        categoryBadge.style.color = "white";
        categoryBadge.style.padding = "2px 6px";
        categoryBadge.style.borderRadius = "12px";
        metaContainer.appendChild(categoryBadge);
      }

      if (settings.showGrade) {
        const gradeBadge = document.createElement("span");
        gradeBadge.textContent = `${q.grade}. Sınıf`;
        gradeBadge.style.fontSize = "9pt";
        gradeBadge.style.backgroundColor = "#4CAF50";
        gradeBadge.style.color = "white";
        gradeBadge.style.padding = "2px 6px";
        gradeBadge.style.borderRadius = "12px";
        metaContainer.appendChild(gradeBadge);
      }

      if (settings.showDifficulty) {
        const difficultyBadge = document.createElement("span");
        difficultyBadge.textContent = q.difficultyLevel;
        const diffColors = { 'kolay': '#2196F3', 'orta': '#FF9800', 'zor': '#F44336' };
        difficultyBadge.style.fontSize = "9pt";
        difficultyBadge.style.backgroundColor = diffColors[q.difficultyLevel] || "#666";
        difficultyBadge.style.color = "white";
        difficultyBadge.style.padding = "2px 6px";
        difficultyBadge.style.borderRadius = "12px";
        metaContainer.appendChild(difficultyBadge);
      }

      if (metaContainer.children.length > 0) {
        titleEl.appendChild(metaContainer);
      }
    }

    card.appendChild(titleEl);

    // Soru içeriği
    const contentEl = document.createElement("div");
    contentEl.innerHTML = renderMathInText(q.content);
    contentEl.style.lineHeight = "1.4";
    contentEl.style.marginBottom = "8px";
    contentEl.className = "question-content";
    card.appendChild(contentEl);

    // Resimler
    if (q.imageUrls && q.imageUrls.length > 0) {
      const imagesContainer = document.createElement("div");
      imagesContainer.style.display = "flex";
      imagesContainer.style.flexWrap = "wrap";
      imagesContainer.style.gap = "8px";
      imagesContainer.style.marginBottom = "8px";
      
      q.imageUrls.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.style.maxWidth = "100px";
        img.style.maxHeight = "80px";
        img.style.objectFit = "contain";
        img.style.border = "1px solid #ddd";
        img.style.borderRadius = "4px";
        imagesContainer.appendChild(img);
      });
      
      card.appendChild(imagesContainer);
    }

    // Seçenekler
    if (settings.showOptions && q.options && q.options.length > 0) {
      const optionsContainer = document.createElement("div");
      optionsContainer.style.marginTop = "10px";
      optionsContainer.className = "question-options";
      
      q.options.forEach((option, optIndex) => {
        const optionDiv = document.createElement("div");
        optionDiv.style.marginBottom = "4px";
        optionDiv.style.fontSize = "10pt";
        
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
      answerKeySection.style.marginTop = "30px";
      answerKeySection.style.pageBreakBefore = "always";
      answerKeySection.style.padding = "20px";
      answerKeySection.style.border = "2px solid #333";
      answerKeySection.style.borderRadius = "8px";
      answerKeySection.style.backgroundColor = "#f9f9f9";

      const answerKeyTitle = document.createElement("h2");
      answerKeyTitle.textContent = "CEVAP ANAHTARI";
      answerKeyTitle.style.textAlign = "center";
      answerKeyTitle.style.marginBottom = "20px";
      answerKeyTitle.style.fontSize = "16pt";
      answerKeySection.appendChild(answerKeyTitle);

      const answerGrid = document.createElement("div");
      answerGrid.style.display = "grid";
      answerGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(150px, 1fr))";
      answerGrid.style.gap = "10px";

      answersWithKeys.forEach((q, index) => {
        const answerItem = document.createElement("div");
        answerItem.style.display = "flex";
        answerItem.style.justifyContent = "space-between";
        answerItem.style.padding = "5px 10px";
        answerItem.style.backgroundColor = "white";
        answerItem.style.border = "1px solid #ddd";
        answerItem.style.borderRadius = "4px";

        const questionNum = document.createElement("strong");
        const questionIndex = testQuestions.findIndex(tq => tq.id === q.id) + 1;
        questionNum.textContent = `${questionIndex}.`;

        const correctLetter = document.createElement("span");
        correctLetter.textContent = String.fromCharCode(65 + (q.correctAnswer || 0));
        correctLetter.style.fontWeight = "bold";
        correctLetter.style.color = "#2196F3";

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
    
    // DOM'a geçici olarak ekle (render için gerekli)
    document.body.appendChild(element);

    const opt = {
      margin: 10,
      filename: `${test.title.replace(/[^\w\d\s]/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: true
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
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
