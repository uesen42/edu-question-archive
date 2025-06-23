
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ActivityLog {
  userId: string;
  userDisplayName: string;
  action: string;
  details: Record<string, any>;
  timestamp: any;
  category: 'question' | 'test' | 'category' | 'auth' | 'export';
}

export class LogService {
  static async logActivity(
    userId: string,
    userDisplayName: string,
    action: string,
    details: Record<string, any> = {},
    category: ActivityLog['category'] = 'question'
  ): Promise<void> {
    try {
      const log: Omit<ActivityLog, 'timestamp'> & { timestamp: any } = {
        userId,
        userDisplayName,
        action,
        details,
        category,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'activity_logs'), log);
      console.log('Activity logged:', action);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  // Özel log fonksiyonları
  static async logQuestionCreate(userId: string, userDisplayName: string, questionTitle: string) {
    await this.logActivity(userId, userDisplayName, 'Soru Oluşturuldu', { questionTitle }, 'question');
  }

  static async logQuestionUpdate(userId: string, userDisplayName: string, questionTitle: string) {
    await this.logActivity(userId, userDisplayName, 'Soru Güncellendi', { questionTitle }, 'question');
  }

  static async logQuestionView(userId: string, userDisplayName: string, questionTitle: string) {
    await this.logActivity(userId, userDisplayName, 'Soru Görüntülendi', { questionTitle }, 'question');
  }

  static async logTestCreate(userId: string, userDisplayName: string, testTitle: string) {
    await this.logActivity(userId, userDisplayName, 'Test Oluşturuldu', { testTitle }, 'test');
  }

  static async logExport(userId: string, userDisplayName: string, exportType: string, itemCount: number) {
    await this.logActivity(userId, userDisplayName, 'Export İşlemi', { exportType, itemCount }, 'export');
  }

  static async logLogin(userId: string, userDisplayName: string) {
    await this.logActivity(userId, userDisplayName, 'Giriş Yapıldı', {}, 'auth');
  }

  static async logLogout(userId: string, userDisplayName: string) {
    await this.logActivity(userId, userDisplayName, 'Çıkış Yapıldı', {}, 'auth');
  }
}
