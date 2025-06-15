
import { useState, useEffect } from 'react';
import { Question, Category, Test } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MathRenderer } from '@/components/MathRenderer';

interface TestEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: Test | null;
  onSave: (test: Omit<Test, 'id' | 'createdAt'>) => void;
  questions: Question[];
  categories: Category[];
}

export function TestEditDialog({ 
  open, 
  onOpenChange, 
  test,
  onSave,
  questions,
  categories
}: TestEditDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    selectedQuestionIds: [] as string[],
    showAnswers: false,
    randomizeOrder: false,
    showOptions: true,
    timeLimit: ''
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (test) {
      setFormData({
        title: test.title,
        description: test.description,
        selectedQuestionIds: test.questionIds,
        showAnswers: test.settings.showAnswers,
        randomizeOrder: test.settings.randomizeOrder,
        showOptions: test.settings.showOptions,
        timeLimit: test.settings.timeLimit ? test.settings.timeLimit.toString() : ''
      });
    }
  }, [test]);

  const handleQuestionToggle = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedQuestionIds: prev.selectedQuestionIds.includes(questionId)
        ? prev.selectedQuestionIds.filter(id => id !== questionId)
        : [...prev.selectedQuestionIds, questionId]
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    if (formData.title.trim() && formData.selectedQuestionIds.length > 0) {
      const testData: Omit<Test, 'id' | 'createdAt'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        questionIds: formData.selectedQuestionIds,
        settings: {
          showAnswers: formData.showAnswers,
          randomizeOrder: formData.randomizeOrder,
          showOptions: formData.showOptions,
          timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : undefined
        }
      };
      onSave(testData);
      onOpenChange(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Bilinmeyen';
  };

  const getQuestionsByCategory = () => {
    const filtered = selectedCategory === 'all' 
      ? questions 
      : questions.filter(q => q.categoryId === selectedCategory);
    
    const grouped = filtered.reduce((acc, question) => {
      const categoryId = question.categoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(question);
      return acc;
    }, {} as Record<string, Question[]>);

    return grouped;
  };

  const questionsByCategory = getQuestionsByCategory();

  if (!test) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Testi Düzenle</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Test Bilgileri */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Test Başlığı</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Test başlığını girin..."
              />
            </div>

            <div>
              <Label htmlFor="description">Test Açıklaması</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Test açıklamasını girin..."
                rows={3}
              />
            </div>
          </div>

          {/* Test Ayarları */}
          <div className="space-y-4">
            <h3 className="font-semibold">Test Ayarları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showAnswers"
                  checked={formData.showAnswers}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, showAnswers: checked as boolean }))
                  }
                />
                <Label htmlFor="showAnswers">Cevapları göster</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="randomizeOrder"
                  checked={formData.randomizeOrder}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, randomizeOrder: checked as boolean }))
                  }
                />
                <Label htmlFor="randomizeOrder">Soruları karıştır</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showOptions"
                  checked={formData.showOptions}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, showOptions: checked as boolean }))
                  }
                />
                <Label htmlFor="showOptions">Şıkları göster</Label>
              </div>

              <div>
                <Label htmlFor="timeLimit">Süre Sınırı (dakika)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: e.target.value }))}
                  placeholder="Opsiyonel..."
                />
              </div>
            </div>
          </div>

          {/* Soru Seçimi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Sorular ({formData.selectedQuestionIds.length} seçili)</h3>
              <div className="flex items-center gap-4">
                <Badge variant="outline">Toplam {questions.length} soru</Badge>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Kategori filtrele" />
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
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3 border rounded-lg p-4">
              {Object.entries(questionsByCategory).map(([categoryId, categoryQuestions]) => (
                <div key={categoryId} className="space-y-2">
                  <Collapsible 
                    open={expandedCategories.has(categoryId)}
                    onOpenChange={() => handleCategoryToggle(categoryId)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {getCategoryName(categoryId)} ({categoryQuestions.length} soru)
                          </Badge>
                        </div>
                        {expandedCategories.has(categoryId) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 ml-4">
                      {categoryQuestions.map((question) => (
                        <Card key={question.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleQuestionToggle(question.id)}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={formData.selectedQuestionIds.includes(question.id)}
                                onChange={() => handleQuestionToggle(question.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm mb-2">{question.title}</p>
                                <div className="text-sm text-gray-600 mb-3">
                                  <MathRenderer content={question.content} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {question.difficultyLevel}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {question.grade}. Sınıf
                                  </Badge>
                                  {question.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.title.trim() || formData.selectedQuestionIds.length === 0}
          >
            Güncelle ({formData.selectedQuestionIds.length} soru)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
