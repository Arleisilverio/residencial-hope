import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile, UserRole } from '../types';
import { ADMIN_EMAIL } from '../constants';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, pass: string) => Promise<any>;
  signOut: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  signUp: (fullName: string, email: string, pass: string, apartmentNumber: number) => Promise<any>;
  sendPasswordResetEmail: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const {data: allUsers} = await supabase.from('users').select('*');
        const profile = allUsers?.find(u => u.id === session.user.id) || null;

        setUser(profile);
        setRole(profile?.email === ADMIN_EMAIL ? 'admin' : 'tenant');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };

    checkUser();
  }, []);
  
  const signIn = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (!error) {
        const { data: { session } } = await supabase.auth.getSession();
        const {data: allUsers} = await supabase.from('users').select('*');
        const profile = allUsers?.find(u => u.id === session!.user.id) || null;
        setUser(profile);
        setRole(profile?.email === ADMIN_EMAIL ? 'admin' : 'tenant');
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (user) {
        setUser({ ...user, ...updates });
    }
  };

  const signUp = async (fullName: string, email: string, pass: string, apartmentNumber: number) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          apartment_number: apartmentNumber,
        }
      }
    });
    if (!error && data.user) {
      // In our mock, we log the user in directly after sign up.
      const {data: allUsers} = await supabase.from('users').select('*');
      const profile = allUsers?.find(u => u.id === data.user!.id) || null;
      setUser(profile);
      setRole(profile?.email === ADMIN_EMAIL ? 'admin' : 'tenant');
    }
    return { data, error };
  };

  const sendPasswordResetEmail = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  const value = {
    user,
    loading,
    role,
    signIn,
    signOut,
    updateUserProfile,
    signUp,
    sendPasswordResetEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};