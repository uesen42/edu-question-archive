
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, Download, Eye } from 'lucide-react';
import { TestCreateDialog } from '@/components/TestCreateDialog';
import { TestViewDialog } from '@/components/TestViewDialog';
import { useQuestionStore } from '@/store/questionStore';
import { Test } from '@/types';
import jsPDF from 'jspdf';

export default function Tests() {
  const [isTestCreateOpen, setIsTestCreateOpen] = useState(false);
  const [isTestViewOpen, setIsTestViewOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const { 
    tests, 
    questions, 
    categories, 
    loadTests, 
    loadQuestions, 
    loadCategories,
    addTest 
  } = useQuestionStore();

  useEffect(() => {
    loadTests();
    loadQuestions();
    loadCategories();
  }, [loadTests, loadQuestions, loadCategories]);

  const handleCreateTest = (testData: any) => {
    addTest(testData);
  };

  const handleViewTest = (test: Test) => {
    setSelectedTest(test);
    setIsTestViewOpen(true);
  };

  // Math içeriğini temizlemek için yardımcı fonksiyon
  const cleanMathContent = (content: string): string => {
    return content
      // LaTeX matematik ifadelerini temizle
      .replace(/\$\$([^$]+)\$\$/g, '$1')
      .replace(/\$([^$]+)\$/g, '$1')
      // HTML etiketlerini kaldır
      .replace(/<[^>]*>/g, '')
      // Fazla boşlukları temizle
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleDownloadTest = (test: Test) => {
    const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;
      const pageHeight = 297; // A4 yüksekliği
      const margin = 20;
      const lineHeight = 6;
      
      // PDF başlığı
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text(test.title, margin, yPosition);
      yPosition += 15;
      
      if (test.description) {
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        const descLines = pdf.splitTextToSize(test.description, 170);
        pdf.text(descLines, margin, yPosition);
        yPosition += descLines.length * lineHeight + 5;
      }
      
      // Test bilgileri
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Tarih: ${new Date(test.createdAt).toLocaleDateString('tr-TR')}`, margin, yPosition);
      pdf.text(`Soru Sayısı: ${testQuestions.length}`, margin + 80, yPosition);
      yPosition += 15;
      
      // Sorular
      testQuestions.forEach((question, index) => {
        // Yeni sayfa kontrolü
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = margin;
        }
        
        const categoryName = categories.find(c => c.id === question.categoryId)?.name || 'Bilinmeyen';
        
        // Soru numarası ve başlığı
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        const questionTitle = `${index + 1}. ${question.title}`;
        const titleLines = pdf.splitTextToSize(questionTitle, 170);
        pdf.text(titleLines, margin, yPosition);
        yPosition += titleLines.length * lineHeight + 3;
        
        // Soru içeriği - math içeriğini temizleyerek
        pdf.setFont(undefined, 'normal');
        const cleanContent = cleanMathContent(question.content);
        const contentLines = pdf.splitTextToSize(cleanContent, 170);
        pdf.text(contentLines, margin, yPosition);
        yPosition += contentLines.length * lineHeight + 5;
        
        // Soru bilgileri
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'italic');
        const metaInfo = `Kategori: ${categoryName} | Zorluk: ${question.difficultyLevel} | Sınıf: ${question.grade}`;
        pdf.text(metaInfo, margin, yPosition);
        yPosition += 10;
        
        // Etiketler varsa
        if (question.tags.length > 0) {
          const tagsText = `Etiketler: ${question.tags.join(', ')}`;
          const tagsLines = pdf.splitTextToSize(tagsText, 170);
          pdf.text(tagsLines, margin, yPosition);
          yPosition += tagsLines.length * lineHeight + 5;
        }
        
        yPosition += 5; // Sorular arası boşluk
      });
      
      // Sayfa numaraları ekle
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Sayfa ${i} / ${pageCount}`, pdf.internal.pageSize.width - 30, pdf.internal.pageSize.height - 10);
      }
      
      // Dosyayı indir
      const fileName = `test-${test.title.replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]/g, '-')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF oluşturulurken hata:', error);
      
      // Fallback olarak detaylı JSON indir
      const exportData = {
        test: {
          title: test.title,
          description: test.description,
          createdAt: test.createdAt,
          settings: test.settings
        },
        questions: testQuestions.map(q => ({
          title: q.title,
          content: cleanMathContent(q.content),
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
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testler</h1>
          <p className="text-gray-600 mt-2">Test oluşturun ve yönetin</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsTestCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Yeni Test Oluştur
        </Button>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Henüz test yok
          </h3>
          <p className="mt-2 text-gray-600">
            İlk testinizi oluşturarak başlayın.
          </p>
          <Button 
            className="mt-4"
            onClick={() => setIsTestCreateOpen(true)}
          >
            İlk Testi Oluştur
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{test.title}</CardTitle>
                  <Badge variant="secondary">
                    {test.questionIds.length} soru
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  {test.description || 'Açıklama yok'}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {test.settings.showAnswers && (
                    <Badge variant="outline" className="text-xs">
                      Cevaplar gösteriliyor
                    </Badge>
                  )}
                  {test.settings.randomizeOrder && (
                    <Badge variant="outline" className="text-xs">
                      Karışık sıra
                    </Badge>
                  )}
                  {test.settings.timeLimit && (
                    <Badge variant="outline" className="text-xs">
                      {test.settings.timeLimit} dk
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {new Date(test.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTest(test)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Görüntüle
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadTest(test)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      İndir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TestCreateDialog
        open={isTestCreateOpen}
        onOpenChange={setIsTestCreateOpen}
        onSave={handleCreateTest}
        questions={questions}
        categories={categories}
      />

      <TestViewDialog
        test={selectedTest}
        questions={questions}
        categories={categories}
        open={isTestViewOpen}
        onOpenChange={setIsTestViewOpen}
      />
    </div>
  );
}
