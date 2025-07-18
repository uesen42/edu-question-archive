import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Download, 
  FileText, 
  CheckSquare, 
  Square, 
  BookOpen,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useQuestionStore } from '@/store/questionStore';
import { EnhancedQuestionCard } from '@/components/EnhancedQuestionCard';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { QuestionViewDialog } from '@/components/QuestionViewDialog';
import { QuestionEditDialog } from '@/components/QuestionEditDialog';
import { QuestionCreateDialog } from '@/components/QuestionCreateDialog';
import { AdvancedImageExportButton } from '@/components/AdvancedImageExportButton';
import { Question } from '@/types';
import { exportAllQuestionsToImages, exportQuestionToImage } from '@/utils/questionImageExport';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { LogService } from '@/services/logService';

export default function Questions() {
  const {
    questions,
    categories,
    loading,
    filter,
    loadQuestions,
    loadCategories,
    setFilter,
    getFilteredQuestions,
    deleteQuestion,
    updateQuestion,
    addQuestion,
    addTest
  } = useQuestionStore();

  const { userProfile, isAdmin } = useAuth();

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Selection states
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // View states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'difficulty' | 'grade'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Kullanıcı ID'si ile sorular yükle
    loadQuestions(userProfile?.uid);
    loadCategories();
  }, [loadQuestions, loadCategories, userProfile?.uid]);

  const filteredQuestions = getFilteredQuestions();
  
  // Sıralama uygula
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title, 'tr');
        break;
      case 'difficulty':
        const difficultyOrder = { 'kolay': 1, 'orta': 2, 'zor': 3 };
        comparison = difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel];
        break;
      case 'grade':
        comparison = a.grade - b.grade;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Tüm etiketleri topla
  const availableTags = [...new Set(questions.flatMap(q => q.tags))];

  const handleEdit = (question: Question) => {
    // Sadece soru sahibi veya admin düzenleyebilir
    if (!isAdmin && question.createdBy !== userProfile?.uid) {
      alert('Bu soruyu sadece sahibi düzenleyebilir.');
      return;
    }
    setSelectedQuestion(question);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const question = questions.find(q => q.id === id);
    
    // Sadece soru sahibi veya admin silebilir
    if (!isAdmin && question?.createdBy !== userProfile?.uid) {
      alert('Bu soruyu sadece sahibi silebilir.');
      return;
    }
    
    if (window.confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      if (question && userProfile) {
        await LogService.logActivity(
          userProfile.uid, 
          userProfile.displayName, 
          'Soru Silindi', 
          { questionTitle: question.title }, 
          'question'
        );
      }
      await deleteQuestion(id);
    }
  };

  const handleView = async (question: Question) => {
    // Görüntüleme sayısını artır
    const updatedQuestion = { 
      ...question, 
      viewCount: (question.viewCount || 0) + 1 
    };
    await updateQuestion(updatedQuestion);
    
    // Log kaydı
    if (userProfile) {
      await LogService.logQuestionView(userProfile.uid, userProfile.displayName, question.title);
    }
    
    setSelectedQuestion(question);
    setViewDialogOpen(true);
  };

  const handleToggleFavorite = async (id: string) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      await updateQuestion({
        ...question,
        isFavorite: !question.isFavorite
      });
    }
  };

  const handleDuplicate = async (question: Question) => {
    const duplicatedQuestion = {
      ...question,
      id: crypto.randomUUID(),
      title: `${question.title} (Kopya)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (userProfile) {
      await addQuestion(duplicatedQuestion, userProfile.uid, userProfile.displayName);
      await LogService.logQuestionCreate(userProfile.uid, userProfile.displayName, duplicatedQuestion.title);
    }
  };

  const handleSaveQuestion = async (question: Question) => {
    await updateQuestion(question);
    if (userProfile) {
      await LogService.logQuestionUpdate(userProfile.uid, userProfile.displayName, question.title);
    }
  };

  const handleExportAllImages = async () => {
    // Sadece admin resim indirebilir
    if (!isAdmin) {
      alert('Bu işlem için admin yetkisi gereklidir.');
      return;
    }
    
    if (userProfile) {
      await LogService.logExport(userProfile.uid, userProfile.displayName, 'Tüm Sorular Resim', sortedQuestions.length);
    }
    await exportAllQuestionsToImages(sortedQuestions, categories, true);
  };

  const handleSelectQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === sortedQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(sortedQuestions.map(q => q.id)));
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedQuestions(new Set());
  };

  const handleExportSelectedImages = async () => {
    // Sadece admin resim indirebilir
    if (!isAdmin) {
      alert('Bu işlem için admin yetkisi gereklidir.');
      return;
    }
    
    const selectedQuestionsList = sortedQuestions.filter(q => selectedQuestions.has(q.id));
    
    if (userProfile) {
      await LogService.logExport(userProfile.uid, userProfile.displayName, 'Seçili Sorular Resim', selectedQuestionsList.length);
    }
    
    for (let i = 0; i < selectedQuestionsList.length; i++) {
      const question = selectedQuestionsList[i];
      const category = categories.find(cat => cat.id === question.categoryId);
      await exportQuestionToImage(question, i + 1, category, true);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handleCreateTestFromSelected = async () => {
    const selectedQuestionsList = sortedQuestions.filter(q => selectedQuestions.has(q.id));
    if (selectedQuestionsList.length === 0) {
      alert('Lütfen en az bir soru seçin.');
      return;
    }

    const testTitle = prompt('Test başlığını girin:');
    if (!testTitle) return;

    const testDescription = prompt('Test açıklamasını girin (opsiyonel):') || '';

    const testData = {
      title: testTitle,
      description: testDescription,
      questionIds: Array.from(selectedQuestions),
      settings: {
        showAnswers: true,
        randomizeOrder: false,
        showOptions: true,
        timeLimit: undefined
      }
    };

    await addTest(testData);
    
    if (userProfile) {
      await LogService.logTestCreate(userProfile.uid, userProfile.displayName, testTitle);
    }
    
    alert(`"${testTitle}" adlı test ${selectedQuestions.size} soru ile oluşturuldu!`);
    setSelectedQuestions(new Set());
    setIsSelectionMode(false);
  };

  const handleCreateQuestion = async (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addQuestion(questionData, userProfile?.uid, userProfile?.displayName);
    if (userProfile) {
      await LogService.logQuestionCreate(userProfile.uid, userProfile.displayName, questionData.title);
    }
  };

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sorular</h1>
          <p className="text-gray-600 mt-2">
            Toplam {questions.length} soru • Filtrelenen: {sortedQuestions.length}
            {selectedQuestions.size > 0 && ` • Seçilen: ${selectedQuestions.size}`}
            {!isAdmin && (
              <span className="block text-sm text-blue-600 mt-1">
                Herkese açık sorular ve kendi sorularınız gösteriliyor
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isSelectionMode ? (
            <>
              {isAdmin && (
                <Button 
                  variant="outline"
                  onClick={handleExportAllImages}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Resim Olarak İndir
                </Button>
              )}
              <AdvancedImageExportButton 
                questions={sortedQuestions} 
                categories={categories} 
              />
              <Button 
                variant="outline"
                onClick={handleToggleSelectionMode}
                className="flex items-center gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Toplu Seçim
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Yeni Soru Ekle
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {selectedQuestions.size === sortedQuestions.length ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <CheckSquare className="h-4 w-4" />
                )}
                {selectedQuestions.size === sortedQuestions.length ? 'Seçimi Kaldır' : 'Hepsini Seç'}
              </Button>
              {selectedQuestions.size > 0 && (
                <>
                  {isAdmin && (
                    <Button 
                      variant="outline"
                      onClick={handleExportSelectedImages}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Resim İndir ({selectedQuestions.size})
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={handleCreateTestFromSelected}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Test Oluştur ({selectedQuestions.size})
                  </Button>
                </>
              )}
              <Button 
                variant="outline"
                onClick={handleToggleSelectionMode}
              >
                İptal
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Gelişmiş Arama ve Filtreler */}
      <AdvancedSearch
        filter={filter}
        categories={categories}
        onFilterChange={setFilter}
        availableTags={availableTags}
      />

      {/* Görünüm ve Sıralama Kontrolleri */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Görünüm:</span>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sırala:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Tarih</SelectItem>
                <SelectItem value="title">Başlık</SelectItem>
                <SelectItem value="difficulty">Zorluk</SelectItem>
                <SelectItem value="grade">Sınıf</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Sorular Listesi */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Sorular yükleniyor...</p>
        </div>
      ) : sortedQuestions.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {questions.length === 0 ? 'Henüz soru yok' : 'Arama kriterlerine uygun soru bulunamadı'}
          </h3>
          <p className="mt-2 text-gray-600">
            {questions.length === 0 
              ? 'İlk sorunuzu ekleyerek başlayın.'
              : 'Farklı filtreler deneyerek arama yapabilirsiniz.'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {sortedQuestions.map((question) => (
            <EnhancedQuestionCard
              key={question.id}
              question={question}
              category={getCategoryById(question.categoryId)}
              onEdit={handleEdit}
              onDelete={isAdmin ? handleDelete : undefined}
              onView={handleView}
              onToggleFavorite={handleToggleFavorite}
              onExport={isAdmin ? (q) => exportQuestionToImage(q, 1, getCategoryById(q.categoryId), true) : undefined}
              onDuplicate={handleDuplicate}
              isSelected={selectedQuestions.has(question.id)}
              onSelect={isSelectionMode ? handleSelectQuestion : undefined}
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <QuestionViewDialog
        question={selectedQuestion}
        category={selectedQuestion ? getCategoryById(selectedQuestion.categoryId) : undefined}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <QuestionEditDialog
        question={selectedQuestion}
        categories={categories}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveQuestion}
      />

      <QuestionCreateDialog
        categories={categories}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreateQuestion}
      />
    </div>
  );
}
