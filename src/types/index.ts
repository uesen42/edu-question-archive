export interface Question {
  id: string;
  title: string;
  content: string;
  imageUrls: string[];
  categoryId: string;
  difficultyLevel: 'kolay' | 'orta' | 'zor';
  grade: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean; // Yeni favori özelliği
  viewCount?: number; // Görüntülenme sayısı
  usageCount?: number; // Kullanım sayısı
  options?: string[]; // Çoktan seçmeli soru seçenekleri
  correctAnswer?: number; // Doğru cevap index'i
  createdByName?: string; // Soruyu oluşturan kullanıcının adı
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  questionCount?: number; // Otomatik hesaplanan soru sayısı
}

export interface Test {
  id: string;
  title: string;
  description: string;
  questionIds: string[];
  createdAt: Date;
  createdBy?: string; // Kullanıcı ID'si
  createdByName?: string; // Kullanıcı adı
  settings: {
    showAnswers: boolean;
    randomizeOrder: boolean;
    showOptions: boolean;
    timeLimit?: number;
  };
  completionCount?: number; // Tamamlanma sayısı
  averageScore?: number; // Ortalama puan
}

export interface QuestionFilter {
  search?: string;
  categoryId?: string;
  difficultyLevel?: 'kolay' | 'orta' | 'zor';
  grade?: number;
  isFavorite?: boolean;
  tags?: string[];
}

export interface QuestionStats {
  totalQuestions: number;
  byDifficulty: Record<string, number>;
  byGrade: Record<number, number>;
  byCategory: Record<string, number>;
  favoriteCount: number;
  recentlyAdded: number;
}

export interface DashboardData {
  stats: QuestionStats;
  recentQuestions: Question[];
  recentTests: Test[];
  popularCategories: Category[];
}
