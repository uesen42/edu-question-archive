
import { useState } from 'react';
import { Question, Category } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Download, 
  Copy, 
  Share2,
  MoreHorizontal,
  Clock,
  Users
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MathRenderer } from '@/components/MathRenderer';
import { cn } from '@/lib/utils';

interface EnhancedQuestionCardProps {
  question: Question;
  category?: Category;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
  onView: (question: Question) => void;
  onToggleFavorite: (id: string) => void;
  onExport: (question: Question) => void;
  onDuplicate: (question: Question) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  compact?: boolean;
}

const difficultyColors = {
  kolay: 'bg-green-100 text-green-800 border-green-200',
  orta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  zor: 'bg-red-100 text-red-800 border-red-200',
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
  const [imageError, setImageError] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setImageError(prev => new Set([...prev, index]));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: question.title,
          text: question.content,
          url: window.location.href + '?question=' + question.id,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${question.title}\n\n${question.content}\n\n${window.location.href}?question=${question.id}`
      );
    }
  };

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 group relative",
      isSelected && "ring-2 ring-blue-500 shadow-lg",
      question.isFavorite && "ring-1 ring-yellow-300",
      compact ? "p-3" : ""
    )}>
      {/* Favori yıldızı */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggleFavorite(question.id)}
        className={cn(
          "absolute top-2 right-2 p-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10",
          question.isFavorite && "opacity-100 text-yellow-500"
        )}
      >
        <Star className={cn("h-4 w-4", question.isFavorite && "fill-current")} />
      </Button>

      {onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(question.id)}
            className="w-4 h-4 rounded border-gray-300"
          />
        </div>
      )}

      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-start justify-between">
          <CardTitle className={cn(
            "font-semibold line-clamp-2 pr-8",
            compact ? "text-base" : "text-lg"
          )}>
            {question.title}
          </CardTitle>
        </div>
        
        {/* Meta bilgiler */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{new Date(question.createdAt).toLocaleDateString('tr-TR')}</span>
          {question.viewCount && (
            <>
              <Users className="h-3 w-3 ml-2" />
              <span>{question.viewCount} görüntüleme</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-3", compact && "space-y-2")}>
        <div className={cn(
          "text-gray-600 line-clamp-3",
          compact ? "text-xs" : "text-sm"
        )}>
          <MathRenderer content={question.content} />
        </div>
        
        {/* Resimler */}
        {question.imageUrls.length > 0 && !compact && (
          <div className="flex gap-2">
            {question.imageUrls.slice(0, 3).map((url, index) => (
              !imageError.has(index) && (
                <img
                  key={index}
                  src={url}
                  alt={`Question image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded border"
                  onError={() => handleImageError(index)}
                />
              )
            ))}
            {question.imageUrls.length > 3 && (
              <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                +{question.imageUrls.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Seçenekler (kısaltılmış) */}
        {question.options && question.options.length > 0 && !compact && (
          <div className="bg-gray-50 p-2 rounded text-xs">
            <span className="font-medium">Seçenekler: </span>
            <span className="text-gray-600">
              {question.options.length} seçenek
            </span>
          </div>
        )}

        {/* Etiketler ve bilgiler */}
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

        {/* Etiketler */}
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

        {/* Eylem butonları */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onView(question)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDuplicate(question)}>
                <Copy className="mr-2 h-4 w-4" />
                Kopyala
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport(question)}>
                <Download className="mr-2 h-4 w-4" />
                Resim Olarak İndir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Paylaş
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(question.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
