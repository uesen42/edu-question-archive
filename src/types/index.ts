
export interface Question {
  id: string;
  title: string;
  content: string;
  imageUrls?: string[];
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

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  questionIds: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  createdByName?: string;
  settings: {
    showAnswers: boolean;
    randomizeOrder: boolean;
    showOptions: boolean;
    timeLimit?: number;
  };
}

export interface QuestionFilter {
  searchTerm: string;
  category: string;
  difficulty: string;
  grade: number | null;
  tags: string[];
  showFavorites: boolean;
}
