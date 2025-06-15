
export interface Question {
  id: string;
  title: string;
  content: string; // HTML + KaTeX
  imageUrls: string[];
  categoryId: string;
  difficultyLevel: 'kolay' | 'orta' | 'zor';
  grade: number; // 1, 2, 3 vb.
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  questionIds: string[];
  createdAt: Date;
  settings: {
    showAnswers: boolean;
    randomizeOrder: boolean;
    timeLimit?: number;
  };
}

export interface QuestionFilter {
  search?: string;
  categoryId?: string;
  difficultyLevel?: string;
  grade?: number;
  tags?: string[];
}
