
import { Category } from '@/types';
import { db } from '@/lib/database';
import { addDoc, collection } from 'firebase/firestore';
import { db as firebaseDb } from '@/lib/firebase';

export class CategoryService {
  static async getAll(): Promise<Category[]> {
    try {
      return await db.getCategories();
    } catch (error) {
      console.error('Failed to load categories:', error);
      throw error;
    }
  }

  static async create(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const category: Category = {
      ...categoryData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    try {
      // Firebase'e ekle
      const docRef = await addDoc(collection(firebaseDb, 'categories'), category);
      return { ...category, id: docRef.id };
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  }

  static async update(category: Category): Promise<void> {
    try {
      await db.updateCategory(category);
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await db.deleteCategory(id);
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }
}
