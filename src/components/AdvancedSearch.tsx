
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  X, 
  Star,
  Calendar,
  Tag as TagIcon
} from 'lucide-react';
import { QuestionFilter, Category } from '@/types';
import { cn } from '@/lib/utils';

interface AdvancedSearchProps {
  filter: QuestionFilter;
  categories: Category[];
  onFilterChange: (filter: QuestionFilter) => void;
  availableTags: string[];
}

export function AdvancedSearch({ 
  filter, 
  categories, 
  onFilterChange, 
  availableTags 
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(filter.tags || []);

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filter, search: value });
  };

  const handleCategoryChange = (categoryId: string) => {
    onFilterChange({ 
      ...filter, 
      categoryId: categoryId === 'all' ? undefined : categoryId 
    });
  };

  const handleDifficultyChange = (difficulty: string) => {
    onFilterChange({ 
      ...filter, 
      difficultyLevel: difficulty === 'all' ? undefined : difficulty as any
    });
  };

  const handleGradeChange = (grade: string) => {
    onFilterChange({ 
      ...filter, 
      grade: grade === 'all' ? undefined : parseInt(grade)
    });
  };

  const handleFavoriteToggle = (checked: boolean) => {
    onFilterChange({ ...filter, isFavorite: checked ? true : undefined });
  };

  const handleTagToggle = (tag: string, checked: boolean) => {
    const newTags = checked 
      ? [...selectedTags, tag]
      : selectedTags.filter(t => t !== tag);
    
    setSelectedTags(newTags);
    onFilterChange({ ...filter, tags: newTags.length > 0 ? newTags : undefined });
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    onFilterChange({});
  };

  const hasActiveFilters = filter.categoryId || filter.difficultyLevel || 
    filter.grade || filter.isFavorite || (filter.tags && filter.tags.length > 0);

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
      {/* Ana arama çubuğu */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Sorularda ara..."
            value={filter.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-2",
            hasActiveFilters && "bg-blue-50 border-blue-200"
          )}
        >
          <Filter className="h-4 w-4" />
          Gelişmiş Filtre
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              Aktif
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Aktif filtre etiketleri */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filter.categoryId && (
            <Badge variant="outline" className="gap-1">
              Kategori: {categories.find(c => c.id === filter.categoryId)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleCategoryChange('all')}
              />
            </Badge>
          )}
          {filter.difficultyLevel && (
            <Badge variant="outline" className="gap-1">
              Zorluk: {filter.difficultyLevel}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleDifficultyChange('all')}
              />
            </Badge>
          )}
          {filter.grade && (
            <Badge variant="outline" className="gap-1">
              Sınıf: {filter.grade}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleGradeChange('all')}
              />
            </Badge>
          )}
          {filter.isFavorite && (
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3" />
              Favoriler
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFavoriteToggle(false)}
              />
            </Badge>
          )}
          {filter.tags && filter.tags.map(tag => (
            <Badge key={tag} variant="outline" className="gap-1">
              #{tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleTagToggle(tag, false)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Gelişmiş filtreler */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <Select value={filter.categoryId || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Kategori seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filter.difficultyLevel || 'all'} onValueChange={handleDifficultyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Zorluk seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Seviyeler</SelectItem>
              <SelectItem value="kolay">Kolay</SelectItem>
              <SelectItem value="orta">Orta</SelectItem>
              <SelectItem value="zor">Zor</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filter.grade?.toString() || 'all'} onValueChange={handleGradeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sınıf seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Sınıflar</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                <SelectItem key={grade} value={grade.toString()}>
                  {grade}. Sınıf
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filter.isFavorite || false}
                onCheckedChange={handleFavoriteToggle}
              />
              <Star className="h-4 w-4" />
              <span className="text-sm">Sadece Favoriler</span>
            </label>
          </div>
        </div>
      )}

      {/* Etiket seçimi */}
      {isExpanded && availableTags.length > 0 && (
        <div className="pt-4 border-t">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <TagIcon className="h-4 w-4" />
                Etiket Seç
                {selectedTags.length > 0 && (
                  <Badge variant="secondary">{selectedTags.length}</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Etiketler</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {availableTags.map(tag => (
                    <label key={tag} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => handleTagToggle(tag, checked as boolean)}
                      />
                      <span className="text-sm">#{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
