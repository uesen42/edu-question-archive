
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, BookOpen, Download, FileText, CheckSquare, Square } from 'lucide-react';
import { useQuestionStore } from '@/store/questionStore';
import { QuestionCard } from '@/components/QuestionCard';
import { QuestionViewDialog } from '@/components/QuestionViewDialog';
import { QuestionEditDialog } from '@/components/QuestionEditDialog';
import { Question } from '@/types';
import { exportAllQuestionsToImages, exportQuestionToImage } from '@/utils/questionImageExport';

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
    addTest
  } = useQuestionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Selection states
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadCategories();
  }, [loadQuestions, loadCategories]);

  useEffect(() => {
    setFilter({
      search: searchTerm,
      categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
      difficultyLevel: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
      grade: selectedGrade === 'all' ? undefined : parseInt(selectedGrade),
    });
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedGrade, setFilter]);

  const filteredQuestions = getFilteredQuestions();

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      await deleteQuestion(id);
    }
  };

  const handleView = (question: Question) => {
    setSelectedQuestion(question);
    setViewDialogOpen(true);
  };

  const handleAddNew = () => {
    // TODO: Open add question modal/dialog
    console.log('Add new question');
  };

  const handleSaveQuestion = async (question: Question) => {
    await updateQuestion(question);
  };

  const handleExportAllImages = async () => {
    await exportAllQuestionsToImages(filteredQuestions, categories, true);
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
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedQuestions(new Set());
  };

  const handleExportSelectedImages = async () => {
    const selectedQuestionsList = filteredQuestions.filter(q => selectedQuestions.has(q.id));
    for (let i = 0; i < selectedQuestionsList.length; i++) {
      const question = selectedQuestionsList[i];
      const category = categories.find(cat => cat.id === question.categoryId);
      await exportQuestionToImage(question, i + 1, category, true);
      // Tarayıcıyı bloke etmemek için kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handleCreateTestFromSelected = async () => {
    const selectedQuestionsList = filteredQuestions.filter(q => selectedQuestions.has(q.id));
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
    alert(`"${testTitle}" adlı test ${selectedQuestions.size} soru ile oluşturuldu!`);
    setSelectedQuestions(new Set());
    setIsSelectionMode(false);
  };

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sorular</h1>
          <p className="text-gray-600 mt-2">
            Toplam {questions.length} soru • Filtrelenen: {filteredQuestions.length}
            {selectedQuestions.size > 0 && ` • Seçilen: ${selectedQuestions.size}`}
          </p>
        </div>
        <div className="flex gap-2">
          {!isSelectionMode ? (
            <>
              <Button 
                variant="outline"
                onClick={handleExportAllImages}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Tüm Soruları Resim Olarak İndir
              </Button>
              <Button 
                variant="outline"
                onClick={handleToggleSelectionMode}
                className="flex items-center gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Soru Seç
              </Button>
              <Button onClick={handleAddNew} className="flex items-center gap-2">
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
                {selectedQuestions.size === filteredQuestions.length ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <CheckSquare className="h-4 w-4" />
                )}
                {selectedQuestions.size === filteredQuestions.length ? 'Seçimi Kaldır' : 'Hepsini Seç'}
              </Button>
              {selectedQuestions.size > 0 && (
                <>
                  <Button 
                    variant="outline"
                    onClick={handleExportSelectedImages}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Seçilenleri Resim Olarak İndir ({selectedQuestions.size})
                  </Button>
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

      {/* Arama ve Filtreler */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Soru ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Kategori seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Zorluk seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Seviyeler</SelectItem>
              <SelectItem value="kolay">Kolay</SelectItem>
              <SelectItem value="orta">Orta</SelectItem>
              <SelectItem value="zor">Zor</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger>
              <SelectValue placeholder="Sınıf seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Sınıflar</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                <SelectItem key={grade} value={grade.toString()}>
                  {grade}. Sınıf
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sorular Listesi */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Sorular yükleniyor...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
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
          {questions.length === 0 && (
            <Button onClick={handleAddNew} className="mt-4">
              İlk Soruyu Ekle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="relative">
              {isSelectionMode && (
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedQuestions.has(question.id)}
                    onCheckedChange={() => handleSelectQuestion(question.id)}
                    className="bg-white border-2"
                  />
                </div>
              )}
              <QuestionCard
                question={question}
                category={getCategoryById(question.categoryId)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            </div>
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
    </div>
  );
}
