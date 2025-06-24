import { useState } from 'react';
import { Question, Category } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Image, MoveUp, MoveDown } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { LaTeXEditor } from './LaTeXEditor';

interface QuestionCreateDialogProps {
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

interface ImageData {
  url: string;
  id: string;
  width?: number;
  height?: number;
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
    images: [] as ImageData[],
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
          const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, {
              url: reader.result as string,
              id: imageId,
              width: 300,
              height: 200
            }]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  });

  const insertImageTag = (imageId: string) => {
    const imageTag = `[IMG:${imageId}]`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + imageTag
    }));
  };

  const handleImageResize = (imageId: string, dimension: 'width' | 'height', value: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => 
        img.id === imageId 
          ? { ...img, [dimension]: Math.max(50, Math.min(800, value)) }
          : img
      )
    }));
  };

  const handleRemoveImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId),
      content: prev.content.replace(new RegExp(`\\[IMG:${imageId}\\]`, 'g'), '')
    }));
  };

  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    setFormData(prev => {
      const currentIndex = prev.images.findIndex(img => img.id === imageId);
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.images.length) return prev;
      
      const newImages = [...prev.images];
      [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];
      
      return { ...prev, images: newImages };
    });
  };

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
      // Convert images array to imageUrls for compatibility
      const processedContent = formData.content;
      let imageUrls = formData.images.map(img => img.url);
      
      const questionData = {
        title: formData.title.trim(),
        content: processedContent,
        categoryId: formData.categoryId,
        difficultyLevel: formData.difficultyLevel,
        grade: formData.grade,
        tags: formData.tags,
        imageUrls: imageUrls,
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
        images: [],
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
            <div className="text-sm text-gray-600 mb-2">
              Resim eklemek için [IMG:resim_id] etiketini kullanın veya aşağıdaki butonları kullanın.
            </div>
            <LaTeXEditor
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="Soru içeriğini girin... LaTeX formüller için $ veya $$ kullanın. Resim için [IMG:resim_id] kullanın."
            />
          </div>

          {/* Resim Yönetimi */}
          <div>
            <Label>Soru Görselleri</Label>
            
            {/* Yüklenen Resimler Listesi */}
            {formData.images.length > 0 && (
              <div className="space-y-4 mb-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium">Yüklenen Resimler:</h4>
                {formData.images.map((image, index) => (
                  <div key={image.id} className="flex items-start gap-4 p-3 bg-white rounded border">
                    <img
                      src={image.url}
                      alt={`Resim ${index + 1}`}
                      className="object-cover rounded border"
                      style={{ 
                        width: `${image.width || 300}px`, 
                        height: `${image.height || 200}px`,
                        maxWidth: '300px',
                        maxHeight: '200px'
                      }}
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">ID: {image.id}</span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveImage(image.id, 'up')}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => moveImage(image.id, 'down')}
                            disabled={index === formData.images.length - 1}
                          >
                            <MoveDown className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveImage(image.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Genişlik (px)</Label>
                          <Input
                            type="number"
                            value={image.width || 300}
                            onChange={(e) => handleImageResize(image.id, 'width', parseInt(e.target.value) || 300)}
                            min={50}
                            max={800}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Yükseklik (px)</Label>
                          <Input
                            type="number"
                            value={image.height || 200}
                            onChange={(e) => handleImageResize(image.id, 'height', parseInt(e.target.value) || 200)}
                            min={50}
                            max={600}
                            className="h-8"
                          />
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertImageTag(image.id)}
                        className="w-full flex items-center gap-2"
                      >
                        <Image className="h-3 w-3" />
                        İçeriğe Ekle: [IMG:{image.id}]
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resim Yükleme Alanı */}
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
