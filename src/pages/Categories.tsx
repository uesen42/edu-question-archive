
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  FolderOpen, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical,
  BookOpen,
  Calendar,
  TrendingUp,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CategoryCreateDialog } from '@/components/CategoryCreateDialog';
import { CategoryEditDialog } from '@/components/CategoryEditDialog';
import { useQuestionStore } from '@/store/questionStore';
import { Category } from '@/types';

export default function Categories() {
  const [isCategoryCreateOpen, setIsCategoryCreateOpen] = useState(false);
  const [isCategoryEditOpen, setIsCategoryEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'questions' | 'date'>('name');
  
  const { 
    categories, 
    questions, 
    loadCategories, 
    loadQuestions,
    addCategory,
    updateCategory,
    deleteCategory: removeCategoryFromStore
  } = useQuestionStore();

  useEffect(() => {
    loadCategories();
    loadQuestions();
  }, [loadCategories, loadQuestions]);

  const getCategoryQuestionCount = (categoryId: string) => {
    return questions.filter(q => q.categoryId === categoryId).length;
  };

  const getCategoryStats = (categoryId: string) => {
    const categoryQuestions = questions.filter(q => q.categoryId === categoryId);
    const difficultyStats = {
      kolay: categoryQuestions.filter(q => q.difficultyLevel === 'kolay').length,
      orta: categoryQuestions.filter(q => q.difficultyLevel === 'orta').length,
      zor: categoryQuestions.filter(q => q.difficultyLevel === 'zor').length,
    };
    return { total: categoryQuestions.length, difficulty: difficultyStats };
  };

  const handleCreateCategory = (categoryData: any) => {
    addCategory(categoryData);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryEditOpen(true);
  };

  const handleUpdateCategory = (categoryData: any) => {
    if (selectedCategory) {
      updateCategory({ ...selectedCategory, ...categoryData });
      setSelectedCategory(null);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    const questionCount = getCategoryQuestionCount(category.id);
    if (questionCount > 0) {
      // Show warning if category has questions
      return;
    }
    setDeleteCategory(category);
  };

  const confirmDeleteCategory = () => {
    if (deleteCategory) {
      removeCategoryFromStore(deleteCategory.id);
      setDeleteCategory(null);
    }
  };

  const filteredAndSortedCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'questions':
          return getCategoryQuestionCount(b.id) - getCategoryQuestionCount(a.id);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const totalQuestions = questions.length;
  const totalCategories = categories.length;
  const averageQuestionsPerCategory = totalCategories > 0 ? Math.round(totalQuestions / totalCategories) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategoriler</h1>
          <p className="text-gray-600 mt-2">Soru kategorilerini yönetin ve düzenleyin</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCategoryCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Yeni Kategori Ekle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kategori</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Aktif kategoriler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Soru</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Tüm kategorilerde
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageQuestionsPerCategory}</div>
            <p className="text-xs text-muted-foreground">
              Soru/kategori
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Kategorilerde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Sırala: {sortBy === 'name' ? 'İsim' : sortBy === 'questions' ? 'Soru Sayısı' : 'Tarih'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy('name')}>
              İsme Göre
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('questions')}>
              Soru Sayısına Göre
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('date')}>
              Tarihe Göre
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Categories Grid */}
      {filteredAndSortedCategories.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <>
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Arama sonucu bulunamadı
              </h3>
              <p className="mt-2 text-gray-600">
                "{searchTerm}" için kategori bulunamadı.
              </p>
            </>
          ) : (
            <>
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Henüz kategori yok
              </h3>
              <p className="mt-2 text-gray-600">
                İlk kategorinizi ekleyerek başlayın.
              </p>
              <Button 
                className="mt-4"
                onClick={() => setIsCategoryCreateOpen(true)}
              >
                İlk Kategoriyi Ekle
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCategories.map((category) => {
            const stats = getCategoryStats(category.id);
            return (
              <Card key={category.id} className="hover:shadow-lg transition-all duration-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {stats.total} soru
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600"
                            disabled={stats.total > 0}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description || 'Açıklama yok'}
                  </p>
                  
                  {/* Difficulty Distribution */}
                  {stats.total > 0 && (
                    <div className="space-y-2 mb-4">
                      <div className="text-xs font-medium text-gray-700">Zorluk Dağılımı:</div>
                      <div className="flex gap-2">
                        {stats.difficulty.kolay > 0 && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Kolay: {stats.difficulty.kolay}
                          </Badge>
                        )}
                        {stats.difficulty.orta > 0 && (
                          <Badge variant="outline" className="text-xs text-yellow-600">
                            Orta: {stats.difficulty.orta}
                          </Badge>
                        )}
                        {stats.difficulty.zor > 0 && (
                          <Badge variant="outline" className="text-xs text-red-600">
                            Zor: {stats.difficulty.zor}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(category.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {stats.total} soru
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <CategoryCreateDialog
        open={isCategoryCreateOpen}
        onOpenChange={setIsCategoryCreateOpen}
        onSave={handleCreateCategory}
      />

      <CategoryEditDialog
        open={isCategoryEditOpen}
        onOpenChange={setIsCategoryEditOpen}
        category={selectedCategory}
        onSave={handleUpdateCategory}
      />

      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteCategory?.name}" kategorisini silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
