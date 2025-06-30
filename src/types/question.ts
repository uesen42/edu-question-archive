
export interface Question {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  difficultyLevel: 'kolay' | 'orta' | 'zor';
  grade: number;
  tags: string[];
  options?: string[];
  correctAnswer?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  createdByName?: string;
  viewCount?: number;
  isFavorite?: boolean;
  isPublic?: boolean; // Yeni alan - sorunun herkese açık olup olmadığı
}
