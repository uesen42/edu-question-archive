
import { create } from 'zustand';
import { Question, Category, Test, QuestionFilter } from '@/types';
import { db } from '@/lib/database';

interface QuestionStore {
  questions: Question[];
  categories: Category[];
  tests: Test[];
  loading: boolean;
  filter: QuestionFilter;
  
  // Actions
  initDatabase: () => Promise<void>;
  loadQuestions: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadTests: () => Promise<void>;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateQuestion: (question: Question) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  setFilter: (filter: QuestionFilter) => void;
  getFilteredQuestions: () => Question[];
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],
  categories: [],
  tests: [],
  loading: false,
  filter: {},

  initDatabase: async () => {
    try {
      await db.init();
      // Add default categories if none exist
      const categories = await db.getCategories();
      if (categories.length === 0) {
        const defaultCategories = [
          { name: 'Matematik', description: 'Matematik soruları', color: '#3B82F6' },
          { name: 'Fizik', description: 'Fizik soruları', color: '#10B981' },
          { name: 'Kimya', description: 'Kimya soruları', color: '#F59E0B' },
          { name: 'Biyoloji', description: 'Biyoloji soruları', color: '#EF4444' },
        ];
        
        for (const cat of defaultCategories) {
          await get().addCategory(cat);
        }
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  },

  loadQuestions: async () => {
    set({ loading: true });
    try {
      const questions = await db.getQuestions();
      set({ questions });
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      set({ loading: false });
    }
  },

  loadCategories: async () => {
    try {
      const categories = await db.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  },

  loadTests: async () => {
    try {
      const tests = await db.getTests();
      set({ tests });
    } catch (error) {
      console.error('Failed to load tests:', error);
    }
  },

  addQuestion: async (questionData) => {
    const question: Question = {
      ...questionData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      await db.addQuestion(question);
      set(state => ({ questions: [...state.questions, question] }));
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  },

  updateQuestion: async (question) => {
    const updatedQuestion = { ...question, updatedAt: new Date() };
    try {
      await db.updateQuestion(updatedQuestion);
      set(state => ({
        questions: state.questions.map(q => q.id === question.id ? updatedQuestion : q)
      }));
    } catch (error) {
      console.error('Failed to update question:', error);
    }
  },

  deleteQuestion: async (id) => {
    try {
      await db.deleteQuestion(id);
      set(state => ({
        questions: state.questions.filter(q => q.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  },

  addCategory: async (categoryData) => {
    const category: Category = {
      ...categoryData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    try {
      await db.addCategory(category);
      set(state => ({ categories: [...state.categories, category] }));
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  },

  setFilter: (filter) => {
    set({ filter });
  },

  getFilteredQuestions: () => {
    const { questions, filter } = get();
    return questions.filter(question => {
      if (filter.search && !question.title.toLowerCase().includes(filter.search.toLowerCase()) &&
          !question.content.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }
      if (filter.categoryId && question.categoryId !== filter.categoryId) {
        return false;
      }
      if (filter.difficultyLevel && question.difficultyLevel !== filter.difficultyLevel) {
        return false;
      }
      if (filter.grade && question.grade !== filter.grade) {
        return false;
      }
      return true;
    });
  },
}));
