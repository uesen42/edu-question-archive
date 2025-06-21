
import { Test, Question, Category } from '@/types';
import katex from 'katex';
import html2pdf from 'html2pdf.js';

/**
 * Metindeki $...$ ve $$...$$ ifadelerini KaTeX ile çevirir.
 */
function renderMathInText(text: string): string {
  // Block math ($$...$$)
  text = text.replace(/\$\$([^$]+)\$\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: true });
    } catch {
      return `$$${expr}$$`;
    }
  });

  // Inline math ($...$)
  text = text.replace(/\$([^$]+)\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false });
    } catch {
      return `$${expr}$`;
    }
  });

  return text;
}

/**
 * Test sorularını içeren HTML DOM elementi oluşturur
 */
export function generateTestPDFContent(test: Test, questions: Question[], categories: Category[]): HTMLElement {
  const container = document.createElement("div");
  container.style.maxWidth = "210mm"; // A4 genişliği
  container.style.margin = "0 auto";
  container.style.padding = "20px";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "12pt";

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
  
  const testDate = new Date(test.createdAt).toLocaleDateString('tr-TR');
  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  infoDiv.innerHTML = `Tarih: ${testDate} | Soru Sayısı: ${testQuestions.length}`;
  container.appendChild(infoDiv);

  // Açıklama
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

  for (let i = 0; i < testQuestions.length; i++) {
    const q = testQuestions[i];
    const category = categories.find(cat => cat.id === q.categoryId);

    const card = document.createElement("div");
    card.style.width = "48%";
    card.style.border = "1px solid #ddd";
    card.style.padding = "12px";
    card.style.boxSizing = "border-box";
    card.style.borderRadius = "8px";
    card.style.backgroundColor = "#fafafa";
    card.style.breakInside = "avoid";
    card.style.marginBottom = "10px";

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

    // Kategori badge
    if (category) {
      const categoryBadge = document.createElement("span");
      categoryBadge.textContent = category.name;
      categoryBadge.style.fontSize = "9pt";
      categoryBadge.style.backgroundColor = category.color || "#e0e0e0";
      categoryBadge.style.color = "white";
      categoryBadge.style.padding = "2px 6px";
      categoryBadge.style.borderRadius = "12px";
      categoryBadge.style.marginLeft = "8px";
      titleEl.appendChild(categoryBadge);
    }

    card.appendChild(titleEl);

    // Soru içeriği
    const contentEl = document.createElement("div");
    contentEl.innerHTML = renderMathInText(q.content);
    contentEl.style.lineHeight = "1.4";
    contentEl.style.marginBottom = "8px";
    card.appendChild(contentEl);

    // Seçenekler (varsa ve gösterilecekse)
    if (test.settings.showOptions && q.options && q.options.length > 0) {
      const optionsContainer = document.createElement("div");
      optionsContainer.style.marginTop = "10px";
      
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

    // Zorluk seviyesi ve sınıf bilgisi
    const metaInfo = document.createElement("div");
    metaInfo.style.fontSize = "9pt";
    metaInfo.style.color = "#888";
    metaInfo.style.marginTop = "8px";
    metaInfo.style.borderTop = "1px solid #eee";
    metaInfo.style.paddingTop = "5px";
    metaInfo.textContent = `${q.difficultyLevel} | ${q.grade}. Sınıf`;
    card.appendChild(metaInfo);

    questionsContainer.appendChild(card);
  }

  container.appendChild(questionsContainer);

  return container;
}

/**
 * PDF olarak indirme işlemi
 */
export async function exportTestToPDF(test: Test, questions: Question[], categories: Category[]) {
  try {
    console.log('Modern PDF export başlıyor...');
    
    const element = generateTestPDFContent(test, questions, categories);
    
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
