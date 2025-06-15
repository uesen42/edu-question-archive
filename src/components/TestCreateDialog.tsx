
import { useState, useEffect } from 'react';
import { Question, Category, Test } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface TestCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (test: Omit<Test, 'id' | 'createdAt'>) => void;
  questions: Question[];
  categories: Category[];
}

export function TestCreateDialog({ 
  open, 
  onOpenChange, 
  onSave,
  questions,
  categories
}: TestCreateDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    selectedQuestionIds: [] as string[],
    showAnswers: false,
    randomizeOrder: false,
    timeLimit: ''
  });

  const handleQuestionToggle = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedQuestionIds: prev.selectedQuestionIds.includes(questionId)
        ? prev.selectedQuestionIds.filter(id => id !== questionId)
        : [...prev.selectedQuestionIds, questionId]
    }));
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
          timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : undefined
        }
      };
      onSave(testData);
      onOpenChange(false);
      // Reset form
      setFormData({
        title: '',
        description: '',
        selectedQuestionIds: [],
        showAnswers: false,
        randomizeOrder: false,
        timeLimit: ''
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Bilinmeyen';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Test Oluştur</DialogTitle>
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

            <div>
              <Label htmlFor="timeLimit">Süre Sınırı (dakika)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={formData.timeLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: e.target.value }))}
                placeholder="Opsiyonel süre sınırı..."
              />
            </div>
          </div>

          {/* Soru Seçimi */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Sorular ({formData.selectedQuestionIds.length} seçili)</h3>
              <Badge variant="outline">
                Toplam {questions.length} soru
              </Badge>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {questions.map((question) => (
                <Card key={question.id} className="cursor-pointer" onClick={() => handleQuestionToggle(question.id)}>
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={formData.selectedQuestionIds.includes(question.id)}
                        onChange={() => handleQuestionToggle(question.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{question.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(question.categoryId)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {question.difficultyLevel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.grade}. Sınıf
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
            Test Oluştur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
