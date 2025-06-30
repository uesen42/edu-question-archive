

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
  updatedAt?: Date; // Make optional to fix existing code
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  questionIds: string[];
  createdAt: Date;
  updatedAt?: Date; // Make optional to fix existing code
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
  search?: string; // Change back to search to match existing code
  categoryId?: string; // Change back to categoryId to match existing code  
  difficultyLevel?: 'kolay' | 'orta' | 'zor'; // Change back to difficultyLevel to match existing code
  grade?: number; // Make optional to match existing code
  tags?: string[]; // Make optional to match existing code
  isFavorite?: boolean; // Add back isFavorite to match existing code
}

