
import React from 'react';
import { ShoppingBag, Menu, User, LogOut } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface HeaderProps {
  user: any;
  profile: any;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, profile, onNavigate }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate('home')}
        >
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Juniad<span className="text-indigo-600">Market</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                {profile?.role === 'freelancer' ? 'Seller Dashboard' : 'My Orders'}
              </button>
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {profile?.full_name || user.email}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
