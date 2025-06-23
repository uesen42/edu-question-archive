
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
      setUser(user);
      
      if (user) {
        // Kullanıcı profil bilgilerini al
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Başarılı',
        description: 'Giriş yapıldı.',
      });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Giriş yapılamadı: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Profil güncelle
      await updateProfile(user, { displayName });
      
      // Firestore'a kullanıcı bilgilerini kaydet
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        role: 'user', // Varsayılan rol
        createdAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);
      
      toast({
        title: 'Başarılı',
        description: 'Hesap oluşturuldu.',
      });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Kayıt olunamadı: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Başarılı',
        description: 'Çıkış yapıldı.',
      });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Çıkış yapılamadı: ' + error.message,
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
