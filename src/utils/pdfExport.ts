
import jsPDF from 'jspdf';
import { Test, Question, Category } from '@/types';

// Gelişmiş LaTeX işleme fonksiyonu
const processMathContent = (content: string): string => {
  let processed = content;
  
  // HTML etiketlerini kaldır
  processed = processed.replace(/<[^>]*>/g, '');
  
  // LaTeX blok matematik ifadelerini işle $$...$$
  processed = processed.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
    return '\n' + processLatexFormula(formula.trim()) + '\n';
  });
  
  // LaTeX inline matematik ifadelerini işle $...$
  processed = processed.replace(/\$([^$]+)\$/g, (match, formula) => {
    return processLatexFormula(formula.trim());
  });
  
  // LaTeX bracket matematik ifadelerini işle \[...\]
  processed = processed.replace(/\\\[([^\]]+)\\\]/g, (match, formula) => {
    return '\n' + processLatexFormula(formula.trim()) + '\n';
  });
  
  // LaTeX parenthesis matematik ifadelerini işle \(...\)
  processed = processed.replace(/\\\(([^)]+)\\\)/g, (match, formula) => {
    return processLatexFormula(formula.trim());
  });
  
  // Fazla boşlukları temizle
  processed = processed.replace(/\s+/g, ' ').trim();
  
  return processed;
};

// LaTeX formüllerini Unicode'a çeviren fonksiyon
const processLatexFormula = (formula: string): string => {
  let processed = formula;
  
  // Temel matematik sembolleri
  processed = processed.replace(/\\times/g, '×');
  processed = processed.replace(/\\div/g, '÷');
  processed = processed.replace(/\\pm/g, '±');
  processed = processed.replace(/\\mp/g, '∓');
  processed = processed.replace(/\\cdot/g, '·');
  processed = processed.replace(/\\ast/g, '∗');
  
  // Karşılaştırma sembolleri
  processed = processed.replace(/\\leq/g, '≤');
  processed = processed.replace(/\\geq/g, '≥');
  processed = processed.replace(/\\neq/g, '≠');
  processed = processed.replace(/\\approx/g, '≈');
  processed = processed.replace(/\\equiv/g, '≡');
  processed = processed.replace(/\\sim/g, '∼');
  
  // Yunanca harfler
  processed = processed.replace(/\\alpha/g, 'α');
  processed = processed.replace(/\\beta/g, 'β');
  processed = processed.replace(/\\gamma/g, 'γ');
  processed = processed.replace(/\\delta/g, 'δ');
  processed = processed.replace(/\\epsilon/g, 'ε');
  processed = processed.replace(/\\zeta/g, 'ζ');
  processed = processed.replace(/\\eta/g, 'η');
  processed = processed.replace(/\\theta/g, 'θ');
  processed = processed.replace(/\\lambda/g, 'λ');
  processed = processed.replace(/\\mu/g, 'μ');
  processed = processed.replace(/\\pi/g, 'π');
  processed = processed.replace(/\\rho/g, 'ρ');
  processed = processed.replace(/\\sigma/g, 'σ');
  processed = processed.replace(/\\tau/g, 'τ');
  processed = processed.replace(/\\phi/g, 'φ');
  processed = processed.replace(/\\chi/g, 'χ');
  processed = processed.replace(/\\psi/g, 'ψ');
  processed = processed.replace(/\\omega/g, 'ω');
  
  // Büyük Yunanca harfler
  processed = processed.replace(/\\Gamma/g, 'Γ');
  processed = processed.replace(/\\Delta/g, 'Δ');
  processed = processed.replace(/\\Theta/g, 'Θ');
  processed = processed.replace(/\\Lambda/g, 'Λ');
  processed = processed.replace(/\\Pi/g, 'Π');
  processed = processed.replace(/\\Sigma/g, 'Σ');
  processed = processed.replace(/\\Phi/g, 'Φ');
  processed = processed.replace(/\\Psi/g, 'Ψ');
  processed = processed.replace(/\\Omega/g, 'Ω');
  
  // Matematik fonksiyonları
  processed = processed.replace(/\\sin/g, 'sin');
  processed = processed.replace(/\\cos/g, 'cos');
  processed = processed.replace(/\\tan/g, 'tan');
  processed = processed.replace(/\\log/g, 'log');
  processed = processed.replace(/\\ln/g, 'ln');
  processed = processed.replace(/\\exp/g, 'exp');
  
  // Özel sembeller
  processed = processed.replace(/\\infty/g, '∞');
  processed = processed.replace(/\\sum/g, '∑');
  processed = processed.replace(/\\prod/g, '∏');
  processed = processed.replace(/\\int/g, '∫');
  processed = processed.replace(/\\partial/g, '∂');
  processed = processed.replace(/\\nabla/g, '∇');
  
  // Kesirler \frac{a}{b} -> (a)/(b)
  processed = processed.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)');
  
  // Kök \sqrt{x} -> √(x)
  processed = processed.replace(/\\sqrt\{([^}]*)\}/g, '√($1)');
  
  // Üst simge x^{n} -> x^n veya x^{abc} -> x^(abc)
  processed = processed.replace(/\^\{([^}]*)\}/g, (match, exp) => {
    if (exp.length === 1) return '^' + exp;
    return '^(' + exp + ')';
  });
  
  // Alt simge x_{n} -> x_n veya x_{abc} -> x_(abc)
  processed = processed.replace(/\_\{([^}]*)\}/g, (match, sub) => {
    if (sub.length === 1) return '_' + sub;
    return '_(' + sub + ')';
  });
  
  // Basit üst simge x^a -> x^a
  processed = processed.replace(/\^([a-zA-Z0-9])/g, '^$1');
  
  // Basit alt simge x_a -> x_a
  processed = processed.replace(/\_([a-zA-Z0-9])/g, '_$1');
  
  // Gereksiz süslü parantezleri kaldır
  processed = processed.replace(/\{([^{}]*)\}/g, '$1');
  
  // Backslash'leri temizle
  processed = processed.replace(/\\/g, '');
  
  return processed;
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
      options: test.settings.showOptions && q.options ? q.options.map(opt => processMathContent(opt)) : undefined,
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
    const margin = 12;
    const columnWidth = (pageWidth - 3 * margin) / 2;
    const lineHeight = 5;
    
    // Başlangıç pozisyonları
    let leftColumnY = 35;
    let rightColumnY = 35;
    let currentColumn: 'left' | 'right' = 'left';
    
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
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        leftColumnY = 25;
        rightColumnY = 25;
        yPosition = 25;
        currentColumn = 'left';
        
        // Yeni sayfada sütun ayırıcı çizgi
        pdf.setDrawColor(200, 200, 200);
        pdf.line(pageWidth / 2, 15, pageWidth / 2, pageHeight - 15);
      }
      
      // Soru numarası ve başlık
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      const questionHeader = `${index + 1}. ${question.title || ''}`;
      const headerLines = pdf.splitTextToSize(questionHeader, columnWidth - 5);
      pdf.text(headerLines, xPosition, yPosition);
      yPosition += headerLines.length * lineHeight + 2;
      
      // Soru içeriği
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const processedContent = processMathContent(question.content);
      if (processedContent.trim()) {
        const contentLines = pdf.splitTextToSize(processedContent, columnWidth - 5);
        pdf.text(contentLines, xPosition, yPosition);
        yPosition += contentLines.length * lineHeight + 3;
      }
      
      // Şıklar (eğer ayar açıksa ve şıklar varsa)
      if (test.settings.showOptions && question.options && question.options.length > 0) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        
        question.options.forEach((option, optionIndex) => {
          // Yeni sayfa kontrolü şıklar için
          if (yPosition > pageHeight - 25) {
            pdf.addPage();
            leftColumnY = 25;
            rightColumnY = 25;
            yPosition = 25;
            currentColumn = 'left';
            
            pdf.setDrawColor(200, 200, 200);
            pdf.line(pageWidth / 2, 15, pageWidth / 2, pageHeight - 15);
          }
          
          const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
          const processedOption = processMathContent(option);
          const optionText = `${optionLetter}) ${processedOption}`;
          const optionLines = pdf.splitTextToSize(optionText, columnWidth - 10);
          pdf.text(optionLines, xPosition + 3, yPosition);
          yPosition += optionLines.length * (lineHeight - 0.5) + 1;
        });
        yPosition += 2;
      }
      
      yPosition += 4; // Sorular arası boşluk
      
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
