import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile, UserRole } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<any>;
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
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUser(profile as UserProfile | null);
        setRole((profile as UserProfile)?.role || 'tenant');
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signIn = async (email: string, pass: string) => {
    return supabase.auth.signInWithPassword({ email, password: pass });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (user) {
        setUser({ ...user, ...updates });
    }
  };

  const signUp = async (fullName: string, email: string, pass: string, apartmentNumber: number) => {
    return supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          apartment_number: apartmentNumber,
        }
      }
    });
  };

  const sendPasswordResetEmail = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
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