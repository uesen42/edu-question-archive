
import { Question, Category, Test } from '@/types';
import { firebaseDb } from './firebaseDatabase';

const DB_NAME = 'QuestionBankDB';
const DB_VERSION = 1;

class DatabaseManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    // Firebase veritabanını başlat
    return firebaseDb.init();
  }

  // Question CRUD operations - Firebase'e yönlendir
  async addQuestion(question: Question): Promise<void> {
    return firebaseDb.addQuestion(question);
  }

  async getQuestions(): Promise<Question[]> {
    return firebaseDb.getQuestions();
  }

  async updateQuestion(question: Question): Promise<void> {
    return firebaseDb.updateQuestion(question);
  }

  async deleteQuestion(id: string): Promise<void> {
    return firebaseDb.deleteQuestion(id);
  }

  // Category CRUD operations - Firebase'e yönlendir
  async addCategory(category: Category): Promise<void> {
    return firebaseDb.addCategory(category);
  }

  async getCategories(): Promise<Category[]> {
    return firebaseDb.getCategories();
  }

  async updateCategory(category: Category): Promise<void> {
    return firebaseDb.updateCategory(category);
  }

  async deleteCategory(id: string): Promise<void> {
    return firebaseDb.deleteCategory(id);
  }

  // Test CRUD operations - Firebase'e yönlendir
  async addTest(test: Test): Promise<void> {
    return firebaseDb.addTest(test);
  }

  async getTests(): Promise<Test[]> {
    return firebaseDb.getTests();
  }

  async updateTest(test: Test): Promise<void> {
    return firebaseDb.updateTest(test);
  }

  async deleteTest(id: string): Promise<void> {
    return firebaseDb.deleteTest(id);
  }
}

export const db = new DatabaseManager();
