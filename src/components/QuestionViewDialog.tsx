
import { Question, Category } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MathRenderer } from '@/components/MathRenderer';

interface QuestionViewDialogProps {
  question: Question | null;
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const difficultyColors = {
  kolay: 'bg-green-100 text-green-800',
  orta: 'bg-yellow-100 text-yellow-800',
  zor: 'bg-red-100 text-red-800',
};

export function QuestionViewDialog({ question, category, open, onOpenChange }: QuestionViewDialogProps) {
  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{question.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Soru İçeriği */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Soru İçeriği:</h3>
            <div className="text-gray-700">
              <MathRenderer content={question.content} />
            </div>
          </div>

          {/* Resimler */}
          {question.imageUrls.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Görseller:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {question.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Soru görseli ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Meta Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Özellikler:</h3>
              <div className="flex flex-wrap gap-2">
                <Badge className={difficultyColors[question.difficultyLevel]}>
                  {question.difficultyLevel.charAt(0).toUpperCase() + question.difficultyLevel.slice(1)}
                </Badge>
                <Badge variant="outline">
                  {question.grade}. Sınıf
                </Badge>
                {category && (
                  <Badge style={{ backgroundColor: category.color, color: 'white' }}>
                    {category.name}
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tarihler:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Oluşturulma: {new Date(question.createdAt).toLocaleDateString('tr-TR')}</p>
                <p>Güncellenme: {new Date(question.updatedAt).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
          </div>

          {/* Etiketler */}
          {question.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Etiketler:</h3>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
