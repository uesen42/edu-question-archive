
import { create } from 'zustand';
import { Question, Category, Test, QuestionFilter } from '@/types';
import { db } from '@/lib/database';
import { QuestionService } from '@/services/questionService';
import { CategoryService } from '@/services/categoryService';
import { TestService } from '@/services/testService';
import { DEFAULT_CATEGORIES, getSampleQuestions } from '@/constants/sampleData';

interface QuestionStore {
  questions: Question[];
  categories: Category[];
  tests: Test[];
  loading: boolean;
  filter: QuestionFilter;
  
  // Actions
  initDatabase: () => Promise<void>;
  loadQuestions: (userId?: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadTests: () => Promise<void>;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>, userId?: string, userName?: string) => Promise<void>;
  updateQuestion: (question: Question) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTest: (testData: Omit<Test, 'id' | 'createdAt'>, userId?: string, userName?: string) => Promise<void>;
  updateTest: (test: Test) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  addSampleQuestions: () => Promise<void>;
  setFilter: (filter: QuestionFilter) => void;
  getFilteredQuestions: () => Question[];
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],
  categories: [],
  tests: [],
  loading: false,
  filter: {}, // Initialize as empty object - all properties are optional now

  initDatabase: async () => {
    try {
      await db.init();
      
      // Add default categories if none exist
      const categories = await CategoryService.getAll();
      if (categories.length === 0) {
        for (const catData of DEFAULT_CATEGORIES) {
          await get().addCategory({ ...catData, updatedAt: new Date() });
        }
      }

      // Add sample questions if none exist
      const questions = await QuestionService.getAll();
      if (questions.length === 0) {
        await get().addSampleQuestions();
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  },

  loadQuestions: async (userId?: string) => {
    set({ loading: true });
    try {
      const questions = await QuestionService.getAll(userId);
      set({ questions });
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      set({ loading: false });
    }
  },

  loadCategories: async () => {
    try {
      const categories = await CategoryService.getAll();
      set({ categories });
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  },

  loadTests: async () => {
    try {
      const tests = await TestService.getAll();
      set({ tests });
    } catch (error) {
      console.error('Failed to load tests:', error);
    }
  },

  addQuestion: async (questionData, userId, userName) => {
    try {
      const question = await QuestionService.create(questionData, userId, userName);
      set(state => ({ questions: [...state.questions, question] }));
    } catch (error) {
      console.error('Failed to add question:', error);
      throw error;
    }
  },

  updateQuestion: async (question) => {
    try {
      const updatedQuestion = await QuestionService.update(question);
      set(state => ({
        questions: state.questions.map(q => q.id === question.id ? updatedQuestion : q)
      }));
    } catch (error) {
      console.error('Failed to update question:', error);
    }
  },

  deleteQuestion: async (id) => {
    try {
      await QuestionService.delete(id);
      set(state => ({
        questions: state.questions.filter(q => q.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  },

  addCategory: async (categoryData) => {
    try {
      const category = await CategoryService.create(categoryData);
      set(state => ({ categories: [...state.categories, category] }));
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  },

  updateCategory: async (category) => {
    try {
      await CategoryService.update(category);
      set(state => ({
        categories: state.categories.map(c => c.id === category.id ? category : c)
      }));
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  },

  deleteCategory: async (id) => {
    try {
      await CategoryService.delete(id);
      set(state => ({
        categories: state.categories.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  },

  addTest: async (testData, userId, userName) => {
    try {
      console.log('addTest çağrıldı:', { testData, userId, userName });
      const test = await TestService.create(testData, userId, userName);
      console.log('Test oluşturuldu:', test);
      set(state => ({ tests: [...state.tests, test] }));
      console.log('State güncellendi');
    } catch (error) {
      console.error('Failed to add test:', error);
      throw error;
    }
  },

  updateTest: async (test) => {
    try {
      await TestService.update(test);
      set(state => ({
        tests: state.tests.map(t => t.id === test.id ? test : t)
      }));
    } catch (error) {
      console.error('Failed to update test:', error);
    }
  },

  deleteTest: async (id) => {
    try {
      await TestService.delete(id);
      set(state => ({
        tests: state.tests.filter(t => t.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  },

  addSampleQuestions: async () => {
    const { categories } = get();
    const sampleQuestions = getSampleQuestions(categories);

    for (const questionData of sampleQuestions) {
      await get().addQuestion(questionData);
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

