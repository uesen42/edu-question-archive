
import { Test } from '@/types';
import { db } from '@/lib/database';

export class TestService {
  static async getAll(): Promise<Test[]> {
    try {
      return await db.getTests();
    } catch (error) {
      console.error('Failed to load tests:', error);
      throw error;
    }
  }

  static async create(testData: Omit<Test, 'id' | 'createdAt'>): Promise<Test> {
    const test: Test = {
      ...testData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    try {
      await db.addTest(test);
      return test;
    } catch (error) {
      console.error('Failed to add test:', error);
      throw error;
    }
  }

  static async update(test: Test): Promise<void> {
    try {
      await db.updateTest(test);
    } catch (error) {
      console.error('Failed to update test:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await db.deleteTest(id);
    } catch (error) {
      console.error('Failed to delete test:', error);
      throw error;
    }
  }
}
