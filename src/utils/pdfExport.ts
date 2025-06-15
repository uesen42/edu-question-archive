
import jsPDF from 'jspdf';
import { Test, Question, Category } from '@/types';

// LaTeX ve matematik işaretlerini Unicode'a çeviren fonksiyon
const processMathContent = (content: string): string => {
  return content
    // HTML etiketlerini kaldır
    .replace(/<[^>]*>/g, '')
    // LaTeX matematik ifadelerini temizle
    .replace(/\\\[([^\\]+)\\\]/g, ' $1 ')
    .replace(/\\\(([^\\]+)\\\)/g, '$1')
    .replace(/\$\$([^$]+)\$\$/g, ' $1 ')
    .replace(/\$([^$]+)\$/g, '$1')
    // Temel LaTeX komutlarını Unicode'a çevir
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
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
    .replace(/\\infty/g, '∞')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    // Üst ve alt simgeler için basit çözüm
    .replace(/\^(\w+)/g, '^$1')
    .replace(/\_(\w+)/g, '_$1')
    // Fazla boşlukları temizle
    .replace(/\s+/g, ' ')
    .trim();
};

// Yedek JSON export fonksiyonu
const createFallbackJSONExport = (test: Test, testQuestions: Question[]) => {
  const exportData = {
    test: {
      title: test.title,
      description: test.description,
      createdAt: test.createdAt,
      settings: test.settings
    },
    questions: testQuestions.map((q, index) => ({
      number: index + 1,
      title: q.title,
      content: processMathContent(q.content),
      options: test.settings.showOptions && q.options ? q.options : undefined,
      originalContent: q.content
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
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Sayfa boyutları ve marjinler
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const columnWidth = (pageWidth - 3 * margin) / 2;
    const lineHeight = 6;
    
    // Başlangıç pozisyonları
    let leftColumnY = 35;
    let rightColumnY = 35;
    let currentColumn: 'left' | 'right' = 'left';
    let currentPage = 1;
    
    // Font ayarları
    pdf.setFont("helvetica");
    
    // PDF başlığı
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    const title = test.title;
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, 20);
    
    // Test bilgileri
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    const testDate = new Date(test.createdAt).toLocaleDateString('tr-TR');
    const testInfo = `Tarih: ${testDate} | Soru Sayısı: ${testQuestions.length}`;
    const infoWidth = pdf.getTextWidth(testInfo);
    pdf.text(testInfo, (pageWidth - infoWidth) / 2, 28);
    
    // Sütun ayırıcı çizgi
    pdf.setDrawColor(200, 200, 200);
    pdf.line(pageWidth / 2, 32, pageWidth / 2, pageHeight - 15);
    
    // Sorular
    testQuestions.forEach((question, index) => {
      const xPosition = currentColumn === 'left' ? margin : (pageWidth / 2) + (margin / 2);
      let yPosition = currentColumn === 'left' ? leftColumnY : rightColumnY;
      
      // Yeni sayfa kontrolü
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        currentPage++;
        leftColumnY = 25;
        rightColumnY = 25;
        yPosition = 25;
        currentColumn = 'left';
        
        // Yeni sayfada sütun ayırıcı çizgi
        pdf.setDrawColor(200, 200, 200);
        pdf.line(pageWidth / 2, 15, pageWidth / 2, pageHeight - 15);
      }
      
      // Soru numarası
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}.`, xPosition, yPosition);
      yPosition += lineHeight + 2;
      
      // Soru başlığı
      if (question.title && question.title.trim()) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        const titleText = question.title.substring(0, 100); // Uzun başlıkları kısalt
        const titleLines = pdf.splitTextToSize(titleText, columnWidth - 10);
        pdf.text(titleLines, xPosition, yPosition);
        yPosition += titleLines.length * lineHeight + 2;
      }
      
      // Soru içeriği
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const processedContent = processMathContent(question.content);
      const contentText = processedContent.substring(0, 200); // İçeriği kısalt
      const contentLines = pdf.splitTextToSize(contentText, columnWidth - 10);
      pdf.text(contentLines, xPosition, yPosition);
      yPosition += contentLines.length * lineHeight + 3;
      
      // Şıklar (eğer ayar açıksa ve şıklar varsa)
      if (test.settings.showOptions && question.options && question.options.length > 0) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        
        question.options.forEach((option, optionIndex) => {
          if (yPosition > pageHeight - 30) {
            // Şık için yeni sayfa gerekirse
            pdf.addPage();
            currentPage++;
            leftColumnY = 25;
            rightColumnY = 25;
            yPosition = 25;
            currentColumn = 'left';
            
            pdf.setDrawColor(200, 200, 200);
            pdf.line(pageWidth / 2, 15, pageWidth / 2, pageHeight - 15);
          }
          
          const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
          const optionText = `${optionLetter}) ${processMathContent(option).substring(0, 80)}`;
          const optionLines = pdf.splitTextToSize(optionText, columnWidth - 15);
          pdf.text(optionLines, xPosition + 5, yPosition);
          yPosition += optionLines.length * (lineHeight - 1) + 1;
        });
        yPosition += 2; // Şıklar sonrası ek boşluk
      }
      
      yPosition += 5; // Sorular arası boşluk
      
      // Sütun değiştir
      if (currentColumn === 'left') {
        leftColumnY = yPosition;
        currentColumn = 'right';
      } else {
        rightColumnY = yPosition;
        currentColumn = 'left';
      }
    });
    
    // Sayfa numaraları ekle
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      const pageText = `${i} / ${totalPages}`;
      const pageTextWidth = pdf.getTextWidth(pageText);
      pdf.text(pageText, (pageWidth - pageTextWidth) / 2, pageHeight - 8);
    }
    
    // Dosyayı kaydet
    const fileName = `test-${test.title.replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]/g, '-')}.pdf`;
    pdf.save(fileName);
    
    console.log('PDF başarıyla oluşturuldu:', fileName);
    
  } catch (error) {
    console.error('PDF oluşturulurken hata:', error);
    console.log('Yedek JSON dosyası oluşturuluyor...');
    createFallbackJSONExport(test, testQuestions);
  }
};
