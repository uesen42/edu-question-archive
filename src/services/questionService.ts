
import { Question } from '@/types';
import { db } from '@/lib/database';
import { addDoc, collection } from 'firebase/firestore';
import { db as firebaseDb } from '@/lib/firebase';

export class QuestionService {
  static async getAll(): Promise<Question[]> {
    try {
      return await db.getQuestions();
    } catch (error) {
      console.error('Failed to load questions:', error);
      throw error;
    }
  }

  static async create(
    questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>, 
    userId?: string, 
    userName?: string
  ): Promise<Question> {
    const question: Question = {
      ...questionData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      // Firebase'e kullanıcı bilgileriyle birlikte ekle
      const docRef = await addDoc(collection(firebaseDb, 'questions'), {
        ...question,
        createdBy: userId || 'unknown',
        createdByName: userName || 'Anonim Kullanıcı'
      });
      return { ...question, id: docRef.id };
    } catch (error) {
      console.error('Failed to add question:', error);
      throw error;
    }
  }

  static async update(question: Question): Promise<Question> {
    const updatedQuestion = { ...question, updatedAt: new Date() };
    try {
      await db.updateQuestion(updatedQuestion);
      return updatedQuestion;
    } catch (error) {
      console.error('Failed to update question:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await db.deleteQuestion(id);
    } catch (error) {
      console.error('Failed to delete question:', error);
      throw error;
    }
  }
}
