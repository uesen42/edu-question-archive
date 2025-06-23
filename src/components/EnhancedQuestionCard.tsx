
import { Question, Category } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  Download, 
  Copy,
  Clock,
  User
} from 'lucide-react';
import { MathRenderer } from '@/components/MathRenderer';

interface EnhancedQuestionCardProps {
  question: Question;
  category?: Category;
  onEdit: (question: Question) => void;
  onDelete?: (id: string) => void; // Optional for non-admin users
  onView: (question: Question) => void;
  onToggleFavorite: (id: string) => void;
  onExport?: (question: Question) => void; // Optional for non-admin users
  onDuplicate: (question: Question) => void;
  isSelected?: boolean;
  onSelect?: (questionId: string) => void;
  compact?: boolean;
}

const difficultyColors = {
  kolay: 'bg-green-100 text-green-800',
  orta: 'bg-yellow-100 text-yellow-800',
  zor: 'bg-red-100 text-red-800',
};

export function EnhancedQuestionCard({ 
  question, 
  category, 
  onEdit, 
  onDelete, 
  onView, 
  onToggleFavorite,
  onExport,
  onDuplicate,
  isSelected = false,
  onSelect,
  compact = false
}: EnhancedQuestionCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    } ${compact ? 'p-2' : ''}`}>
      <CardHeader className={compact ? "pb-2" : "pb-3"}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {onSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(question.id)}
                className="mt-1"
              />
            )}
            <div className="flex-1">
              <CardTitle className={`${compact ? 'text-base' : 'text-lg'} font-semibold line-clamp-2`}>
                {question.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                {question.viewCount && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{question.viewCount}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(question.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                {question.createdByName && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{question.createdByName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onToggleFavorite(question.id)}
              className={question.isFavorite ? 'text-red-500' : 'text-gray-400'}
            >
              <Heart className={`h-4 w-4 ${question.isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onView(question)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDuplicate(question)}>
              <Copy className="h-4 w-4" />
            </Button>
            {onExport && (
              <Button variant="ghost" size="sm" onClick={() => onExport(question)}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(question.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={compact ? "pt-0" : ""}>
        <div className="space-y-3">
          {!compact && (
            <div className="text-sm text-gray-600 line-clamp-3">
              <MathRenderer content={question.content} />
            </div>
          )}
          
          {question.imageUrls.length > 0 && (
            <div className="flex gap-2">
              {question.imageUrls.slice(0, compact ? 2 : 3).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Question image ${index + 1}`}
                  className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} object-cover rounded border`}
                />
              ))}
              {question.imageUrls.length > (compact ? 2 : 3) && (
                <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500`}>
                  +{question.imageUrls.length - (compact ? 2 : 3)}
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

          {question.tags.length > 0 && !compact && (
            <div className="flex flex-wrap gap-1">
              {question.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {question.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{question.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
