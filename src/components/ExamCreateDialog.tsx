
import { useState } from 'react';
import { Question, Category } from '@/types';
import { Exam } from '@/types/exam';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MathRenderer } from '@/components/MathRenderer';

interface ExamCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  questions: Question[];
  categories: Category[];
}

export function ExamCreateDialog({ 
  open, 
  onOpenChange, 
  onSave,
  questions,
  categories
}: ExamCreateDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    schoolName: '',
    className: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    selectedQuestionIds: [] as string[],
    showAnswers: false,
    randomizeOrder: false,
    showOptions: true,
    timeLimit: ''
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
    if (formData.title.trim() && formData.schoolName.trim() && formData.selectedQuestionIds.length > 0) {
      const examData: Omit<Exam, 'id' | 'createdAt'> = {
        title: formData.title.trim(),
        schoolName: formData.schoolName.trim(),
        className: formData.className.trim(),
        subject: formData.subject.trim(),
        date: formData.date,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        questionIds: formData.selectedQuestionIds,
        settings: {
          showAnswers: formData.showAnswers,
          randomizeOrder: formData.randomizeOrder,
          showOptions: formData.showOptions,
          ...(formData.timeLimit && !isNaN(parseInt(formData.timeLimit)) ? 
            { timeLimit: parseInt(formData.timeLimit) } : {})
        },
        createdBy: 'current-user',
        createdByName: 'Current User'
      };
      
      onSave(examData);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        schoolName: '',
        className: '',
        subject: '',
        date: new Date().toISOString().split('T')[0],
        duration: '',
        selectedQuestionIds: [],
        showAnswers: false,
        randomizeOrder: false,
        showOptions: true,
        timeLimit: ''
      });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Sınav Oluştur</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sınav Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Sınav Adı</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Sınav adını girin..."
              />
            </div>

            <div>
              <Label htmlFor="schoolName">Okul Adı</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                placeholder="Okul adını girin..."
              />
            </div>

            <div>
              <Label htmlFor="className">Sınıf</Label>
              <Input
                id="className"
                value={formData.className}
                onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
                placeholder="Sınıf bilgisini girin..."
              />
            </div>

            <div>
              <Label htmlFor="subject">Ders</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Ders adını girin..."
              />
            </div>

            <div>
              <Label htmlFor="date">Tarih</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="duration">Süre (dakika)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Sınav süresi..."
              />
            </div>
          </div>

          {/* Sınav Ayarları */}
          <div className="space-y-4">
            <h3 className="font-semibold">Sınav Ayarları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            disabled={!formData.title.trim() || !formData.schoolName.trim() || formData.selectedQuestionIds.length === 0}
          >
            Sınav Oluştur ({formData.selectedQuestionIds.length} soru)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
