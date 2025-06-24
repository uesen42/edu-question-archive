
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { useQuestionStore } from '@/store/questionStore';
import { useAuth } from '@/hooks/useAuth';
import { Test } from '@/types';
import { TestCreateDialog } from '@/components/TestCreateDialog';
import { TestEditDialog } from '@/components/TestEditDialog';
import { TestViewDialog } from '@/components/TestViewDialog';
import { PDFPreviewDialog } from '@/components/PDFPreviewDialog';
import { toast } from '@/components/ui/use-toast';

export default function Tests() {
  const { userProfile } = useAuth();
  const { 
    tests, 
    questions, 
    categories, 
    loadTests, 
    loadQuestions, 
    loadCategories,
    addTest,
    updateTest,
    deleteTest
  } = useQuestionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  useEffect(() => {
    loadTests();
    loadQuestions();
    loadCategories();
  }, []);

  // Kullanıcı bazlı test filtreleme
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Admin tüm testleri görebilir
    if (userProfile?.email === 'admin@example.com') {
      return matchesSearch;
    }
    
    // Normal kullanıcılar sadece kendi testlerini görebilir
    return matchesSearch && test.createdBy === userProfile?.uid;
  });

  const handleCreateTest = async (testData: Omit<Test, 'id' | 'createdAt'>) => {
    try {
      await addTest(testData, userProfile?.uid, userProfile?.displayName);
      toast({
        title: "Başarılı",
        description: "Test başarıyla oluşturuldu.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Test oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTest = async (testData: Omit<Test, 'id' | 'createdAt'>) => {
    if (!selectedTest) return;
    
    try {
      const updatedTest: Test = {
        ...selectedTest,
        ...testData,
      };
      await updateTest(updatedTest);
      toast({
        title: "Başarılı",
        description: "Test başarıyla güncellendi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Test güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (window.confirm('Bu testi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteTest(testId);
        toast({
          title: "Başarılı",
          description: "Test başarıyla silindi.",
        });
      } catch (error) {
        toast({
          title: "Hata",
          description: "Test silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewTest = (test: Test) => {
    setSelectedTest(test);
    setViewDialogOpen(true);
  };

  const handleEditTest = (test: Test) => {
    setSelectedTest(test);
    setEditDialogOpen(true);
  };

  const handleDownload = (test: Test) => {
    setSelectedTest(test);
    setPdfDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Testler</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Test
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Test ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredTests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Henüz test oluşturulmamış.</p>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              İlk Testinizi Oluşturun
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTests.map((test) => (
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
                  {test.settings.showOptions && (
                    <Badge variant="outline" className="text-xs">
                      Şıklı sorular
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
                      onClick={() => handleDownload(test)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      İndir
                    </Button>
                    {(userProfile?.email === 'admin@example.com' || test.createdBy === userProfile?.uid) && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTest(test)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TestCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreateTest}
        questions={questions}
        categories={categories}
      />

      <TestEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        test={selectedTest}
        onSave={handleUpdateTest}
        questions={questions}
        categories={categories}
      />

      <TestViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        test={selectedTest}
        questions={questions}
        categories={categories}
      />

      <PDFPreviewDialog
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        test={selectedTest}
        questions={questions}
        categories={categories}
      />
    </div>
  );
}
