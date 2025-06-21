
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
  orderBy,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Question, Category, Test } from '@/types';

export class FirebaseDatabase {
  // Questions Collection
  async addQuestion(question: Question): Promise<void> {
    try {
      const docRef = doc(collection(db, 'questions'));
      const questionWithId = { ...question, id: docRef.id };
      await setDoc(docRef, questionWithId);
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
      // Check if document exists first
      const docSnap = await getDoc(questionRef);
      if (docSnap.exists()) {
        await updateDoc(questionRef, { ...question });
      } else {
        // If document doesn't exist, create it
        await setDoc(questionRef, question);
      }
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
      const docRef = doc(collection(db, 'categories'));
      const categoryWithId = { ...category, id: docRef.id };
      await setDoc(docRef, categoryWithId);
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
      const docSnap = await getDoc(categoryRef);
      if (docSnap.exists()) {
        await updateDoc(categoryRef, { ...category });
      } else {
        await setDoc(categoryRef, category);
      }
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
      const docRef = doc(collection(db, 'tests'));
      const testWithId = { ...test, id: docRef.id };
      await setDoc(docRef, testWithId);
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
      const docSnap = await getDoc(testRef);
      if (docSnap.exists()) {
        await updateDoc(testRef, { ...test });
      } else {
        await setDoc(testRef, test);
      }
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
