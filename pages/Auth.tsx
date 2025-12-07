
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Mail, Lock, Briefcase } from 'lucide-react';

interface AuthProps {
  onNavigate: (page: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'client' as 'client' | 'freelancer'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
        // Navigation handled by onAuthStateChange in App.tsx
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: formData.role
            }
          }
        });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Welcome back to the marketplace' : 'Start buying or selling today'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-3">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    name="fullName"
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'client'})}
                    className={`flex flex-col items-center p-3 border rounded-lg ${formData.role === 'client' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-xs font-bold">I want to Buy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'freelancer'})}
                    className={`flex flex-col items-center p-3 border rounded-lg ${formData.role === 'freelancer' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    <Briefcase className="w-5 h-5 mb-1" />
                    <span className="text-xs font-bold">I want to Sell</span>
                  </button>
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}