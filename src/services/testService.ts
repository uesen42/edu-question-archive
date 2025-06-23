
import { Test } from '@/types';
import { db } from '@/lib/database';
import { addDoc, collection } from 'firebase/firestore';
import { db as firebaseDb } from '@/lib/firebase';

export class TestService {
  static async getAll(): Promise<Test[]> {
    try {
      return await db.getTests();
    } catch (error) {
      console.error('Failed to load tests:', error);
      throw error;
    }
  }

  static async create(
    testData: Omit<Test, 'id' | 'createdAt'>, 
    userId?: string, 
    userName?: string
  ): Promise<Test> {
    const test: Test = {
      ...testData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    try {
      // Firebase'e kullanıcı bilgileriyle birlikte ekle
      const docRef = await addDoc(collection(firebaseDb, 'tests'), {
        ...test,
        createdBy: userId || 'unknown',
        createdByName: userName || 'Anonim Kullanıcı'
      });
      return { ...test, id: docRef.id };
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
