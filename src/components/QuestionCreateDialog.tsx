
import { useState } from 'react';
import { Question, Category } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { LaTeXEditor } from './LaTeXEditor';

interface QuestionCreateDialogProps {
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function QuestionCreateDialog({ 
  categories, 
  open, 
  onOpenChange, 
  onSave 
}: QuestionCreateDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    difficultyLevel: 'kolay' as 'kolay' | 'orta' | 'zor',
    grade: 1,
    tags: [] as string[],
    newTag: '',
    imageUrls: [] as string[],
    options: [] as string[],
    newOption: ''
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({
            ...prev,
            imageUrls: [...prev.imageUrls, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  });

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleAddOption = () => {
    if (formData.newOption.trim() && formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, prev.newOption.trim()],
        newOption: ''
      }));
    }
  };

  const handleRemoveOption = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSave = () => {
    if (formData.title.trim() && formData.content.trim() && formData.categoryId) {
      const questionData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId,
        difficultyLevel: formData.difficultyLevel,
        grade: formData.grade,
        tags: formData.tags,
        imageUrls: formData.imageUrls,
        options: formData.options.length > 0 ? formData.options : undefined,
        isFavorite: false,
        viewCount: 0
      };
      onSave(questionData);
      
      // Form'u temizle
      setFormData({
        title: '',
        content: '',
        categoryId: '',
        difficultyLevel: 'kolay',
        grade: 1,
        tags: [],
        newTag: '',
        imageUrls: [],
        options: [],
        newOption: ''
      });
      
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Soru Ekle</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Başlık */}
          <div>
            <Label htmlFor="title">Soru Başlığı *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Soru başlığını girin..."
            />
          </div>

          {/* İçerik - LaTeX Editor */}
          <div>
            <Label>Soru İçeriği *</Label>
            <LaTeXEditor
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="Soru içeriğini girin... LaTeX formüller için $ veya $$ kullanın"
            />
          </div>

          {/* Seçenekler */}
          <div>
            <Label>Seçenekler (Opsiyonel)</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <LaTeXEditor
                    value={formData.newOption}
                    onChange={(newOption) => setFormData(prev => ({ ...prev, newOption }))}
                    placeholder="Yeni seçenek ekle... (LaTeX desteklenir)"
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddOption} 
                  variant="outline"
                  disabled={formData.options.length >= 6}
                  className="self-start mt-2"
                >
                  Ekle
                </Button>
              </div>
              
              {formData.options.length > 0 && (
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <span className="font-medium text-sm w-8">
                        {String.fromCharCode(65 + index)})
                      </span>
                      <div className="flex-1">
                        <LaTeXEditor value={option} onChange={() => {}} />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resim Yükleme */}
          <div>
            <Label>Soru Görselleri</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              {isDragActive ? (
                <p className="text-blue-600">Resimleri buraya bırakın...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-1">
                    Resimleri sürükleyip bırakın veya seçmek için tıklayın
                  </p>
                  <p className="text-sm text-gray-400">
                    PNG, JPG, GIF, WEBP formatları desteklenir (Maksimum 5 resim)
                  </p>
                </div>
              )}
            </div>

            {/* Yüklenen Resimler */}
            {formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Yüklenen resim ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kategori, Zorluk, Sınıf */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Kategori *</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seç" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Zorluk Seviyesi</Label>
              <Select 
                value={formData.difficultyLevel} 
                onValueChange={(value: 'kolay' | 'orta' | 'zor') => 
                  setFormData(prev => ({ ...prev, difficultyLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kolay">Kolay</SelectItem>
                  <SelectItem value="orta">Orta</SelectItem>
                  <SelectItem value="zor">Zor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sınıf</Label>
              <Select 
                value={formData.grade.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, grade: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      {grade}. Sınıf
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Etiketler */}
          <div>
            <Label>Etiketler</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={formData.newTag}
                onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                placeholder="Yeni etiket ekle..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Ekle
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
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
            disabled={!formData.title.trim() || !formData.content.trim() || !formData.categoryId}
          >
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
