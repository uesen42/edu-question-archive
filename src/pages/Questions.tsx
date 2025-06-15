
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { useQuestionStore } from '@/store/questionStore';
import { QuestionCard } from '@/components/QuestionCard';
import { Question } from '@/types';

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
    deleteQuestion
  } = useQuestionStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  useEffect(() => {
    loadQuestions();
    loadCategories();
  }, [loadQuestions, loadCategories]);

  useEffect(() => {
    setFilter({
      search: searchTerm,
      categoryId: selectedCategory || undefined,
      difficultyLevel: selectedDifficulty || undefined,
      grade: selectedGrade ? parseInt(selectedGrade) : undefined,
    });
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedGrade, setFilter]);

  const filteredQuestions = getFilteredQuestions();

  const handleEdit = (question: Question) => {
    // TODO: Open edit modal/dialog
    console.log('Edit question:', question);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      await deleteQuestion(id);
    }
  };

  const handleView = (question: Question) => {
    // TODO: Open view modal/dialog
    console.log('View question:', question);
  };

  const handleAddNew = () => {
    // TODO: Open add question modal/dialog
    console.log('Add new question');
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
          </p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Soru Ekle
        </Button>
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
              <SelectItem value="">Tüm Kategoriler</SelectItem>
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
              <SelectItem value="">Tüm Seviyeler</SelectItem>
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
              <SelectItem value="">Tüm Sınıflar</SelectItem>
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
            <QuestionCard
              key={question.id}
              question={question}
              category={getCategoryById(question.categoryId)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
