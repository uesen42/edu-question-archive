
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar, Download, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { useQuestionStore } from '@/store/questionStore';
import { useAuth } from '@/hooks/useAuth';
import { Exam } from '@/types/exam';
import { ExamCreateDialog } from '@/components/ExamCreateDialog';
import { toast } from '@/components/ui/use-toast';

export default function Exams() {
  const { userProfile } = useAuth();
  const { 
    questions, 
    categories, 
    loadQuestions, 
    loadCategories
  } = useQuestionStore();

  const [exams, setExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadCategories();
  }, []);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (userProfile?.email === 'admin@example.com') {
      return matchesSearch;
    }
    
    return matchesSearch && exam.createdBy === userProfile?.uid;
  });

  const handleCreateExam = async (examData: Omit<Exam, 'id' | 'createdAt'>) => {
    try {
      const newExam: Exam = {
        ...examData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        createdBy: userProfile?.uid || 'unknown',
        createdByName: userProfile?.displayName || 'Anonim Kullanıcı'
      };
      
      setExams(prev => [...prev, newExam]);
      
      toast({
        title: "Başarılı",
        description: "Sınav başarıyla oluşturuldu.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Sınav oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (window.confirm('Bu sınavı silmek istediğinizden emin misiniz?')) {
      try {
        setExams(prev => prev.filter(exam => exam.id !== examId));
        toast({
          title: "Başarılı",
          description: "Sınav başarıyla silindi.",
        });
      } catch (error) {
        toast({
          title: "Hata",
          description: "Sınav silinirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sınavlar</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Sınav
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Sınav ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Henüz sınav oluşturulmamış.</p>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              İlk Sınavınızı Oluşturun
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                  <Badge variant="secondary">
                    {exam.questionIds.length} soru
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Okul:</strong> {exam.schoolName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Ders:</strong> {exam.subject}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Sınıf:</strong> {exam.className}
                  </p>
                  {exam.duration && (
                    <p className="text-sm text-gray-600">
                      <strong>Süre:</strong> {exam.duration} dakika
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {exam.settings.showAnswers && (
                    <Badge variant="outline" className="text-xs">
                      Cevaplar gösteriliyor
                    </Badge>
                  )}
                  {exam.settings.randomizeOrder && (
                    <Badge variant="outline" className="text-xs">
                      Karışık sıra
                    </Badge>
                  )}
                  {exam.settings.showOptions && (
                    <Badge variant="outline" className="text-xs">
                      Şıklı sorular
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {new Date(exam.date).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // PDF indirme işlemi burada yapılacak
                        console.log('PDF indir:', exam);
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      İndir
                    </Button>
                    {(userProfile?.email === 'admin@example.com' || exam.createdBy === userProfile?.uid) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteExam(exam.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ExamCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreateExam}
        questions={questions}
        categories={categories}
      />
    </div>
  );
}
