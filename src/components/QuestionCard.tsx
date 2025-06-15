
import { Question, Category } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { MathRenderer } from '@/components/MathRenderer';

interface QuestionCardProps {
  question: Question;
  category?: Category;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  onView: (question: Question) => void;
}

const difficultyColors = {
  kolay: 'bg-green-100 text-green-800',
  orta: 'bg-yellow-100 text-yellow-800',
  zor: 'bg-red-100 text-red-800',
};

export function QuestionCard({ question, category, onEdit, onDelete, onView }: QuestionCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {question.title}
          </CardTitle>
          <div className="flex gap-2 ml-4">
            <Button variant="ghost" size="sm" onClick={() => onView(question)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(question.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600 line-clamp-3">
            <MathRenderer content={question.content} />
          </div>
          
          {question.imageUrls.length > 0 && (
            <div className="flex gap-2">
              {question.imageUrls.slice(0, 3).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Question image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded border"
                />
              ))}
              {question.imageUrls.length > 3 && (
                <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                  +{question.imageUrls.length - 3}
                </div>
              )}
            </div>
          )}

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

          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {question.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-500">
            Oluşturulma: {new Date(question.createdAt).toLocaleDateString('tr-TR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
