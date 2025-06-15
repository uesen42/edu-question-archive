
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderOpen } from 'lucide-react';
import { CategoryCreateDialog } from '@/components/CategoryCreateDialog';
import { useQuestionStore } from '@/store/questionStore';

export default function Categories() {
  const [isCategoryCreateOpen, setIsCategoryCreateOpen] = useState(false);
  const { 
    categories, 
    questions, 
    loadCategories, 
    loadQuestions,
    addCategory 
  } = useQuestionStore();

  useEffect(() => {
    loadCategories();
    loadQuestions();
  }, [loadCategories, loadQuestions]);

  const getCategoryQuestionCount = (categoryId: string) => {
    return questions.filter(q => q.categoryId === categoryId).length;
  };

  const handleCreateCategory = (categoryData: any) => {
    addCategory(categoryData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategoriler</h1>
          <p className="text-gray-600 mt-2">Soru kategorilerini yönetin</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCategoryCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Yeni Kategori Ekle
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </CardTitle>
                  <Badge variant="secondary">
                    {getCategoryQuestionCount(category.id)} soru
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>
                <div className="text-xs text-gray-500">
                  Oluşturulma: {new Date(category.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryCreateDialog
        open={isCategoryCreateOpen}
        onOpenChange={setIsCategoryCreateOpen}
        onSave={handleCreateCategory}
      />
    </div>
  );
}
