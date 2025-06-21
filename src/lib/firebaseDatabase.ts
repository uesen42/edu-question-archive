
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { Question, Category, Test } from '@/types';

export class FirebaseDatabase {
  // Questions Collection
  async addQuestion(question: Question): Promise<void> {
    try {
      await addDoc(collection(db, 'questions'), question);
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  }

  async getQuestions(): Promise<Question[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'questions'));
      const questions: Question[] = [];
      querySnapshot.forEach((doc) => {
        questions.push({ id: doc.id, ...doc.data() } as Question);
      });
      return questions;
    } catch (error) {
      console.error('Error getting questions:', error);
      throw error;
    }
  }

  async updateQuestion(question: Question): Promise<void> {
    try {
      const questionRef = doc(db, 'questions', question.id);
      await updateDoc(questionRef, { ...question });
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  async deleteQuestion(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'questions', id));
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  // Categories Collection
  async addCategory(category: Category): Promise<void> {
    try {
      await addDoc(collection(db, 'categories'), category);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categories: Category[] = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() } as Category);
      });
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  async updateCategory(category: Category): Promise<void> {
    try {
      const categoryRef = doc(db, 'categories', category.id);
      await updateDoc(categoryRef, { ...category });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Tests Collection
  async addTest(test: Test): Promise<void> {
    try {
      await addDoc(collection(db, 'tests'), test);
    } catch (error) {
      console.error('Error adding test:', error);
      throw error;
    }
  }

  async getTests(): Promise<Test[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'tests'));
      const tests: Test[] = [];
      querySnapshot.forEach((doc) => {
        tests.push({ id: doc.id, ...doc.data() } as Test);
      });
      return tests;
    } catch (error) {
      console.error('Error getting tests:', error);
      throw error;
    }
  }

  async updateTest(test: Test): Promise<void> {
    try {
      const testRef = doc(db, 'tests', test.id);
      await updateDoc(testRef, { ...test });
    } catch (error) {
      console.error('Error updating test:', error);
      throw error;
    }
  }

  async deleteTest(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tests', id));
    } catch (error) {
      console.error('Error deleting test:', error);
      throw error;
    }
  }

  // Init method for compatibility
  async init(): Promise<void> {
    // Firebase otomatik olarak bağlantı kurar, ekstra init gerekmez
    console.log('Firebase Database initialized');
  }
}

export const firebaseDb = new FirebaseDatabase();
