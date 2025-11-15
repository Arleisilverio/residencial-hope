
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
        // In a real app, you'd fetch the profile from the 'users' table
        // const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        // For this mock, we find the user in our mock data
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


  const value = {
    user,
    loading,
    role,
    signIn,
    signOut,
    updateUserProfile
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
