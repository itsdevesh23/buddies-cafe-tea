import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async (userId) => {
      if (!userId) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      setIsAdmin(data?.is_admin || false);
    };

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        loadProfile(session?.user?.id).then(() => setLoading(false));
      })
      .catch((err) => {
        console.error("Supabase auth error:", err);
        setLoading(false);
      });

    // Listen for changes on auth state (log in, log out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).then(() => setLoading(false));
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    let { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
        try {
          const autoConfirmRes = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/auto-confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const autoConfirmData = await autoConfirmRes.json();
          if (autoConfirmData.success) {
            const retry = await supabase.auth.signInWithPassword({ email, password });
            if (!retry.error) {
              return { success: true, message: 'Welcome back!' };
            }
            error = retry.error;
          }
        } catch (confirmErr) {
          console.error("Auto-confirm fallback error:", confirmErr);
        }
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Welcome back!' };
  };

  const signup = async (name, email, password, phone) => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        return { success: false, message: data.error || data.message || 'Registration failed' };
      }
      
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: 'Could not connect to the server. Please try again later.' };
    }
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Password reset email sent!' };
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Password updated successfully!' };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error(error);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAuthenticated: !!user, 
      isAdmin,
      login, 
      signup, 
      logout, 
      resetPassword,
      updatePassword,
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
