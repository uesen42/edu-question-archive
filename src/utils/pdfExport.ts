
import jsPDF from 'jspdf';
import { Test, Question, Category } from '@/types';
import { renderQuestionToSVG } from './svgRenderer';

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
      content: q.content,
      options: test.settings.showOptions && q.options ? q.options : undefined,
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

// SVG'yi PDF'e eklemek için yardımcı fonksiyon
const addSVGToPDF = async (pdf: jsPDF, svgString: string, x: number, y: number, width: number, height: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // SVG string'i blob'a çevir
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      // Image oluştur
      const img = new Image();
      img.onload = () => {
        try {
          // Canvas oluştur
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context oluşturulamadı'));
            return;
          }
          
          // Canvas boyutlarını ayarla
          canvas.width = width * 2; // Daha yüksek çözünürlük için
          canvas.height = height * 2;
          
          // Arka planı beyaz yap
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // SVG'yi canvas'a çiz
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Canvas'ı base64'e çevir
          const imgData = canvas.toDataURL('image/png');
          
          // PDF'e ekle
          pdf.addImage(imgData, 'PNG', x, y, width, height);
          
          URL.revokeObjectURL(url);
          resolve();
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('SVG yükleme hatası'));
      };
      
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

export const exportTestToPDF = async (
  test: Test,
  questions: Question[],
  categories: Category[]
) => {
  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  
  try {
    console.log('PDF oluşturma başlıyor...');
    
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
    const maxQuestionHeight = 80; // Her soru için maksimum yükseklik
    
    // PDF başlığı
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    const title = test.title;
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, 20);
    
    // Test bilgileri
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const testDate = new Date(test.createdAt).toLocaleDateString('tr-TR');
    const testInfo = `Tarih: ${testDate} | Soru Sayısı: ${testQuestions.length}`;
    const infoWidth = pdf.getTextWidth(testInfo);
    pdf.text(testInfo, (pageWidth - infoWidth) / 2, 28);
    
    // Sütun ayırıcı çizgi
    pdf.setDrawColor(200, 200, 200);
    pdf.line(pageWidth / 2, 35, pageWidth / 2, pageHeight - 15);
    
    // Başlangıç pozisyonları
    let leftColumnY = 40;
    let rightColumnY = 40;
    let currentColumn: 'left' | 'right' = 'left';
    
    console.log(`${testQuestions.length} soru işlenecek...`);
    
    // Her soru için SVG oluştur ve PDF'e ekle
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      console.log(`Soru ${i + 1} işleniyor...`);
      
      // SVG oluştur
      const svgString = renderQuestionToSVG(
        question, 
        i + 1, 
        test.settings.showOptions,
        columnWidth * 3.78, // mm to px conversion
        maxQuestionHeight * 3.78
      );
      
      // Kolon pozisyonunu belirle
      const xPosition = currentColumn === 'left' ? margin : (pageWidth / 2) + (margin / 2);
      let yPosition = currentColumn === 'left' ? leftColumnY : rightColumnY;
      
      // Yeni sayfa kontrolü
      if (yPosition + maxQuestionHeight > pageHeight - 20) {
        pdf.addPage();
        leftColumnY = 25;
        rightColumnY = 25;
        yPosition = 25;
        currentColumn = 'left';
        
        // Yeni sayfada sütun ayırıcı çizgi
        pdf.setDrawColor(200, 200, 200);
        pdf.line(pageWidth / 2, 15, pageWidth / 2, pageHeight - 15);
      }
      
      try {
        // SVG'yi PDF'e ekle
        await addSVGToPDF(pdf, svgString, xPosition, yPosition, columnWidth, maxQuestionHeight);
        console.log(`Soru ${i + 1} başarıyla eklendi`);
      } catch (svgError) {
        console.warn(`Soru ${i + 1} SVG olarak eklenemedi, metin olarak eklenecek:`, svgError);
        
        // SVG eklenemezse basit metin olarak ekle
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        const questionTitle = `${i + 1}. ${question.title || 'Soru'}`;
        pdf.text(questionTitle, xPosition, yPosition + 5);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        const contentLines = pdf.splitTextToSize(question.content.replace(/<[^>]*>/g, ''), columnWidth - 5);
        pdf.text(contentLines, xPosition, yPosition + 15);
      }
      
      // Sütun değiştir
      if (currentColumn === 'left') {
        leftColumnY = yPosition + maxQuestionHeight + 10;
        currentColumn = 'right';
      } else {
        rightColumnY = yPosition + maxQuestionHeight + 10;
        currentColumn = 'left';
      }
    }
    
    // Sayfa numaraları ekle
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
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
