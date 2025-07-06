
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Test, Question, Category } from '@/types';
import { MathRenderer } from '@/components/MathRenderer';
import { AdvancedImageExportButton } from '@/components/AdvancedImageExportButton';
import { Calendar, Clock, Shuffle, Eye } from 'lucide-react';

interface TestViewDialogProps {
  test: Test | null;
  questions: Question[];
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestViewDialog({ 
  test, 
  questions, 
  categories, 
  open, 
  onOpenChange 
}: TestViewDialogProps) {
  if (!test) return null;

  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  
  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Bilinmeyen';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{test.title}</DialogTitle>
            <AdvancedImageExportButton 
              test={test} 
              questions={questions} 
              categories={categories} 
            />
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Test Bilgileri */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Test Bilgileri</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Oluşturulma: {new Date(test.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Soru Sayısı:</span>
                    <Badge variant="secondary">{test.questionIds.length}</Badge>
                  </div>
                  {test.description && (
                    <div>
                      <span className="font-medium">Açıklama:</span>
                      <p className="text-gray-600 mt-1">{test.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Test Ayarları</h3>
                <div className="flex flex-wrap gap-2">
                  {test.settings.showAnswers && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Cevaplar Gösteriliyor
                    </Badge>
                  )}
                  {test.settings.randomizeOrder && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shuffle className="h-3 w-3" />
                      Karışık Sıra
                    </Badge>
                  )}
                  {test.settings.showOptions && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Şıklı Sorular
                    </Badge>
                  )}
                  {test.settings.timeLimit && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {test.settings.timeLimit} dakika
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sorular */}
          <div>
            <h3 className="font-semibold mb-4">Test Soruları ({testQuestions.length})</h3>
            <div className="space-y-4">
              {testQuestions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        {index + 1}. {question.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(question.categoryId)}
                        </Badge>
                        <Badge 
                          variant={question.difficultyLevel === 'kolay' ? 'default' : 
                                  question.difficultyLevel === 'orta' ? 'secondary' : 'destructive'} 
                          className="text-xs"
                        >
                          {question.difficultyLevel}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.grade}. Sınıf
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <MathRenderer content={question.content} />
                      </div>
                      
                      {question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {question.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
