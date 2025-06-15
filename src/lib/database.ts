
import { Question, Category, Test } from '@/types';

const DB_NAME = 'QuestionBankDB';
const DB_VERSION = 1;

class DatabaseManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Questions store
        if (!db.objectStoreNames.contains('questions')) {
          const questionStore = db.createObjectStore('questions', { keyPath: 'id' });
          questionStore.createIndex('categoryId', 'categoryId', { unique: false });
          questionStore.createIndex('difficultyLevel', 'difficultyLevel', { unique: false });
          questionStore.createIndex('grade', 'grade', { unique: false });
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        // Tests store
        if (!db.objectStoreNames.contains('tests')) {
          db.createObjectStore('tests', { keyPath: 'id' });
        }
      };
    });
  }

  // Question CRUD operations
  async addQuestion(question: Question): Promise<void> {
    const transaction = this.db!.transaction(['questions'], 'readwrite');
    const store = transaction.objectStore('questions');
    await store.add(question);
  }

  async getQuestions(): Promise<Question[]> {
    const transaction = this.db!.transaction(['questions'], 'readonly');
    const store = transaction.objectStore('questions');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateQuestion(question: Question): Promise<void> {
    const transaction = this.db!.transaction(['questions'], 'readwrite');
    const store = transaction.objectStore('questions');
    await store.put(question);
  }

  async deleteQuestion(id: string): Promise<void> {
    const transaction = this.db!.transaction(['questions'], 'readwrite');
    const store = transaction.objectStore('questions');
    await store.delete(id);
  }

  // Category CRUD operations
  async addCategory(category: Category): Promise<void> {
    const transaction = this.db!.transaction(['categories'], 'readwrite');
    const store = transaction.objectStore('categories');
    await store.add(category);
  }

  async getCategories(): Promise<Category[]> {
    const transaction = this.db!.transaction(['categories'], 'readonly');
    const store = transaction.objectStore('categories');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateCategory(category: Category): Promise<void> {
    const transaction = this.db!.transaction(['categories'], 'readwrite');
    const store = transaction.objectStore('categories');
    await store.put(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const transaction = this.db!.transaction(['categories'], 'readwrite');
    const store = transaction.objectStore('categories');
    await store.delete(id);
  }

  // Test CRUD operations
  async addTest(test: Test): Promise<void> {
    const transaction = this.db!.transaction(['tests'], 'readwrite');
    const store = transaction.objectStore('tests');
    await store.add(test);
  }

  async getTests(): Promise<Test[]> {
    const transaction = this.db!.transaction(['tests'], 'readonly');
    const store = transaction.objectStore('tests');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTest(test: Test): Promise<void> {
    const transaction = this.db!.transaction(['tests'], 'readwrite');
    const store = transaction.objectStore('tests');
    await store.put(test);
  }

  async deleteTest(id: string): Promise<void> {
    const transaction = this.db!.transaction(['tests'], 'readwrite');
    const store = transaction.objectStore('tests');
    await store.delete(id);
  }
}

export const db = new DatabaseManager();
