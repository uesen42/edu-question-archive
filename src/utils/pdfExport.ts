
import jsPDF from 'jspdf';
import { Test, Question, Category } from '@/types';

// Math içeriğini daha iyi işlemek için geliştirilmiş fonksiyon
const processMathContent = (content: string): string => {
  return content
    // LaTeX matematik ifadelerini daha okunabilir forma çevir
    .replace(/\\\[([^\\]+)\\\]/g, '\n\n$1\n\n') // Display math
    .replace(/\\\(([^\\]+)\\\)/g, '$1') // Inline math
    .replace(/\$\$([^$]+)\$\$/g, '\n\n$1\n\n') // Display math with $$
    .replace(/\$([^$]+)\$/g, '$1') // Inline math with $
    // Yaygın LaTeX komutlarını değiştir
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\cdot/g, '·')
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\sum/g, '∑')
    .replace(/\\int/g, '∫')
    .replace(/\\lim/g, 'lim')
    .replace(/\\infty/g, '∞')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\^(\w+)/g, '⁽$1⁾') // Üst simge için basit çözüm
    .replace(/\_(\w+)/g, '₍$1₎') // Alt simge için basit çözüm
    // HTML etiketlerini kaldır
    .replace(/<[^>]*>/g, '')
    // Fazla boşlukları temizle
    .replace(/\s+/g, ' ')
    .trim();
};

const createFallbackJSONExport = (
  test: Test,
  testQuestions: Question[],
  categories: Category[]
) => {
  const exportData = {
    test: {
      title: test.title,
      description: test.description,
      createdAt: test.createdAt,
      settings: test.settings
    },
    questions: testQuestions.map(q => ({
      title: q.title,
      content: processMathContent(q.content),
      originalContent: q.content,
      categoryName: categories.find(c => c.id === q.categoryId)?.name || 'Bilinmeyen',
      difficultyLevel: q.difficultyLevel,
      grade: q.grade,
      tags: q.tags
    })),
    exportDate: new Date().toISOString(),
    note: "PDF oluşturulamadı, yedek JSON dosyası oluşturuldu"
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `test-${test.title.replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportTestToPDF = (
  test: Test,
  questions: Question[],
  categories: Category[]
) => {
  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 15;
    const columnWidth = (pageWidth - 3 * margin) / 2; // İki sütun için genişlik
    const lineHeight = 5;
    let leftColumnY = 30;
    let rightColumnY = 30;
    let currentColumn = 'left'; // 'left' veya 'right'
    
    // PDF başlığı - ortalanmış
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    const titleWidth = pdf.getTextWidth(test.title);
    pdf.text(test.title, (pageWidth - titleWidth) / 2, 20);
    
    // Test açıklaması ve bilgileri - tek satırda
    if (test.description) {
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const descWidth = pdf.getTextWidth(test.description);
      pdf.text(test.description, (pageWidth - descWidth) / 2, 26);
    }
    
    // Test bilgileri
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    const testInfo = `Tarih: ${new Date(test.createdAt).toLocaleDateString('tr-TR')} | Soru Sayısı: ${testQuestions.length}`;
    const infoWidth = pdf.getTextWidth(testInfo);
    pdf.text(testInfo, (pageWidth - infoWidth) / 2, 32);
    
    // Sütun ayırıcı çizgi
    pdf.setDrawColor(200, 200, 200);
    pdf.line(pageWidth / 2, 35, pageWidth / 2, pageHeight - 20);
    
    // Sorular - iki sütunlu düzen
    testQuestions.forEach((question, index) => {
      const categoryName = categories.find(c => c.id === question.categoryId)?.name || 'Bilinmeyen';
      const xPosition = currentColumn === 'left' ? margin : pageWidth / 2 + margin / 2;
      let yPosition = currentColumn === 'left' ? leftColumnY : rightColumnY;
      
      // Yeni sayfa kontrolü
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        leftColumnY = 30;
        rightColumnY = 30;
        yPosition = 30;
        currentColumn = 'left';
        
        // Yeni sayfada sütun ayırıcı çizgi
        pdf.setDrawColor(200, 200, 200);
        pdf.line(pageWidth / 2, 20, pageWidth / 2, pageHeight - 20);
      }
      
      // Soru numarası ve başlığı
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      const questionTitle = `${index + 1}. ${question.title}`;
      const titleLines = pdf.splitTextToSize(questionTitle, columnWidth - 5);
      pdf.text(titleLines, xPosition, yPosition);
      yPosition += titleLines.length * lineHeight + 2;
      
      // Soru içeriği - matematik formüllerini işleyerek
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const processedContent = processMathContent(question.content);
      const contentLines = pdf.splitTextToSize(processedContent, columnWidth - 5);
      pdf.text(contentLines, xPosition, yPosition);
      yPosition += contentLines.length * lineHeight + 3;
      
      // Soru meta bilgileri
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'italic');
      const metaInfo = `${categoryName} | ${question.difficultyLevel} | ${question.grade}. Sınıf`;
      const metaLines = pdf.splitTextToSize(metaInfo, columnWidth - 5);
      pdf.text(metaLines, xPosition, yPosition);
      yPosition += metaLines.length * lineHeight + 2;
      
      // Etiketler
      if (question.tags.length > 0) {
        const tagsText = `Etiketler: ${question.tags.join(', ')}`;
        const tagsLines = pdf.splitTextToSize(tagsText, columnWidth - 5);
        pdf.text(tagsLines, xPosition, yPosition);
        yPosition += tagsLines.length * lineHeight + 2;
      }
      
      yPosition += 8; // Sorular arası boşluk
      
      // Sütun değiştirme mantığı
      if (currentColumn === 'left') {
        leftColumnY = yPosition;
        currentColumn = 'right';
      } else {
        rightColumnY = yPosition;
        currentColumn = 'left';
      }
    });
    
    // Sayfa numaraları ekle
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      const pageText = `Sayfa ${i} / ${pageCount}`;
      const pageTextWidth = pdf.getTextWidth(pageText);
      pdf.text(pageText, (pageWidth - pageTextWidth) / 2, pageHeight - 10);
    }
    
    // Dosyayı indir
    const fileName = `test-${test.title.replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]/g, '-')}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('PDF oluşturulurken hata:', error);
    createFallbackJSONExport(test, testQuestions, categories);
  }
};
