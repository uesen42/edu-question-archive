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

  const handleDownloadTest = (test: Test) => {
    const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
    
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      
      // PDF başlığı
      pdf.setFontSize(18);
      pdf.text(test.title, 20, yPosition);
      yPosition += 15;
      
      if (test.description) {
        pdf.setFontSize(12);
        pdf.text(test.description, 20, yPosition);
        yPosition += 10;
      }
      
      // Test bilgileri
      pdf.setFontSize(10);
      pdf.text(`Tarih: ${new Date(test.createdAt).toLocaleDateString('tr-TR')}`, 20, yPosition);
      pdf.text(`Soru Sayısı: ${testQuestions.length}`, 120, yPosition);
      yPosition += 15;
      
      // Sorular
      pdf.setFontSize(12);
      testQuestions.forEach((question, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const categoryName = categories.find(c => c.id === question.categoryId)?.name || 'Bilinmeyen';
        
        // Soru başlığı
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${question.title}`, 20, yPosition);
        yPosition += 8;
        
        // Soru içeriği (LaTeX formülleri basit metin olarak)
        pdf.setFont(undefined, 'normal');
        const cleanContent = question.content.replace(/\$\$?([^$]+)\$\$?/g, '$1');
        const lines = pdf.splitTextToSize(cleanContent, 170);
        pdf.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 5;
        
        // Soru bilgileri
        pdf.setFontSize(9);
        pdf.text(`Kategori: ${categoryName} | Zorluk: ${question.difficultyLevel} | Sınıf: ${question.grade}`, 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
      });
      
      pdf.save(`test-${test.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
      
    } catch (error) {
      console.error('PDF oluşturulurken hata:', error);
      // Fallback olarak JSON indir
      const exportData = {
        test: {
          title: test.title,
          description: test.description,
          createdAt: test.createdAt,
          settings: test.settings
        },
        questions: testQuestions.map(q => ({
          title: q.title,
          content: q.content,
          categoryName: categories.find(c => c.id === q.categoryId)?.name || 'Bilinmeyen',
          difficultyLevel: q.difficultyLevel,
          grade: q.grade,
          tags: q.tags
        })),
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-${test.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
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
