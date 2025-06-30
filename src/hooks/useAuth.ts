
import { useState, useEffect, createContext, useContext } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { LogService } from '@/services/logService';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Admin UID listesi
const ADMIN_UIDS = ['OtXGIVXiOBeDVnpRZArp4e3lzD12'];

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        
        if (user) {
          // Admin kontrolü yap
          const isUserAdmin = ADMIN_UIDS.includes(user.uid);
          
          // Kullanıcı profil bilgilerini al veya oluştur
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          let profile: UserProfile;
          if (userDoc.exists()) {
            const userData = userDoc.data();
            profile = {
              uid: userData.uid || user.uid,
              email: userData.email || user.email || '',
              displayName: userData.displayName || user.displayName || 'Kullanıcı',
              role: isUserAdmin ? 'admin' : (userData.role || 'user'),
              createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt || Date.now())
            };
            
            // Admin durumunu güncelle
            if (profile.role !== (isUserAdmin ? 'admin' : 'user')) {
              profile = { ...profile, role: isUserAdmin ? 'admin' : 'user' };
              await setDoc(doc(db, 'users', user.uid), {
                ...profile,
                createdAt: profile.createdAt
              });
            }
          } else {
            // Yeni kullanıcı profili oluştur
            profile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Kullanıcı',
              role: isUserAdmin ? 'admin' : 'user',
              createdAt: new Date(),
            };
            await setDoc(doc(db, 'users', user.uid), profile);
          }
          
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Auth state değişikliği hatası:', error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('E-posta ve şifre gereklidir');
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Login log kaydı
      try {
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          await LogService.logLogin(profile.uid, profile.displayName);
        }
      } catch (logError) {
        console.error('Login log hatası:', logError);
        // Log hatası ana işlemi etkilemesin
      }
      
      toast({
        title: 'Başarılı',
        description: 'Giriş yapıldı.',
      });
    } catch (error: any) {
      console.error('Login hatası:', error);
      const errorMessage = error.code === 'auth/user-not-found' ? 'Kullanıcı bulunamadı' :
                          error.code === 'auth/wrong-password' ? 'Yanlış şifre' :
                          error.code === 'auth/invalid-email' ? 'Geçersiz e-posta adresi' :
                          error.message || 'Giriş yapılamadı';
      
      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      if (!email || !password || !displayName) {
        throw new Error('Tüm alanlar gereklidir');
      }

      if (password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalıdır');
      }

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Profil güncelle
      await updateProfile(user, { displayName });
      
      // Admin kontrolü
      const isUserAdmin = ADMIN_UIDS.includes(user.uid);
      
      // Firestore'a kullanıcı bilgilerini kaydet
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName,
        role: isUserAdmin ? 'admin' : 'user',
        createdAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);
      
      toast({
        title: 'Başarılı',
        description: 'Hesap oluşturuldu.',
      });
    } catch (error: any) {
      console.error('Register hatası:', error);
      const errorMessage = error.code === 'auth/email-already-in-use' ? 'Bu e-posta adresi zaten kullanılıyor' :
                          error.code === 'auth/weak-password' ? 'Şifre çok zayıf' :
                          error.code === 'auth/invalid-email' ? 'Geçersiz e-posta adresi' :
                          error.message || 'Kayıt olunamadı';
      
      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Logout log kaydı
      if (userProfile) {
        try {
          await LogService.logLogout(userProfile.uid, userProfile.displayName);
        } catch (logError) {
          console.error('Logout log hatası:', logError);
          // Log hatası ana işlemi etkilemesin
        }
      }
      
      await signOut(auth);
      toast({
        title: 'Başarılı',
        description: 'Çıkış yapıldı.',
      });
    } catch (error: any) {
      console.error('Logout hatası:', error);
      toast({
        title: 'Hata',
        description: 'Çıkış yapılamadı: ' + (error.message || 'Bilinmeyen hata'),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const isAdmin = userProfile?.role === 'admin';

  return {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    isAdmin,
  };
}

export { AuthContext };
