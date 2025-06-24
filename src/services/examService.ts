import { Exam } from '@/types/exam';
import { db } from '@/lib/database';
import { addDoc, collection, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db as firebaseDb } from '@/lib/firebase';

export class ExamService {
  static async getAll(): Promise<Exam[]> {
    try {
      const querySnapshot = await getDocs(collection(firebaseDb, 'exams'));
      const exams: Exam[] = [];
      querySnapshot.forEach((docSnap) => {
        exams.push({ id: docSnap.id, ...docSnap.data() } as Exam);
      });
      return exams;
    } catch (error) {
      console.error('Failed to load exams:', error);
      throw error;
    }
  }

  static async create(
    examData: Omit<Exam, 'id' | 'createdAt'>,
    userId?: string,
    userName?: string
  ): Promise<Exam> {
    const exam: Exam = {
      ...examData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      createdBy: userId || 'unknown',
      createdByName: userName || 'Anonim Kullanıcı'
    };
    try {
      const docRef = await addDoc(collection(firebaseDb, 'exams'), exam);
      return { ...exam, id: docRef.id };
    } catch (error) {
      console.error('Failed to add exam:', error);
      throw error;
    }
  }

  static async update(exam: Exam): Promise<void> {
    try {
      const examRef = doc(firebaseDb, 'exams', exam.id);
      await updateDoc(examRef, { ...exam });
    } catch (error) {
      console.error('Failed to update exam:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const examRef = doc(firebaseDb, 'exams', id);
      await deleteDoc(examRef);
    } catch (error) {
      console.error('Failed to delete exam:', error);
      throw error;
    }
  }
}
