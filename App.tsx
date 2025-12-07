
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { ServiceDetail } from './pages/ServiceDetail';
import { Checkout } from './pages/Checkout';
import { Dashboard } from './pages/Dashboard';
import { Auth } from './pages/Auth';
import { supabase, getCurrentProfile } from './services/supabaseClient';
import { Profile } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getCurrentProfile().then(p => setProfile(p as Profile));
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getCurrentProfile().then(p => setProfile(p as Profile));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigate = (page: string, serviceId?: string) => {
    if (serviceId) setSelectedServiceId(serviceId);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'service':
        return <ServiceDetail serviceId={selectedServiceId} onNavigate={navigate} user={user} />;
      case 'checkout':
        return <Checkout serviceId={selectedServiceId} onNavigate={navigate} user={user} />;
      case 'dashboard':
        return user ? <Dashboard user={user} profile={profile} /> : <Auth onNavigate={navigate} />;
      case 'login':
        return <Auth onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header user={user} profile={profile} onNavigate={navigate} />
      <main>
        {renderPage()}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 Juniad Marketplace. Secure payments powered by Supabase.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
