
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Service } from '../types';
import { Search, Star, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, id?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*, profiles(full_name, avatar_url)')
      .order('featured', { ascending: false });
    
    if (error) console.error('Error fetching services:', error);
    else setServices(data || []);
    setLoading(false);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-indigo-700 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Find the perfect freelance services for your business
          </h1>
          <div className="max-w-2xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Search for 'Logo Design', 'SEO', 'React Developer'..." 
              className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500 shadow-xl text-lg"
            />
            <button className="absolute right-2 top-2 bg-indigo-600 p-2 rounded-full hover:bg-indigo-500 transition-colors">
              <Search className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="mt-6 flex justify-center gap-4 text-indigo-200 text-sm font-medium">
            <span>Popular:</span>
            <button className="hover:text-white border border-transparent hover:border-white rounded-full px-3 py-1 transition-all">Website Design</button>
            <button className="hover:text-white border border-transparent hover:border-white rounded-full px-3 py-1 transition-all">WordPress</button>
            <button className="hover:text-white border border-transparent hover:border-white rounded-full px-3 py-1 transition-all">Logo Design</button>
            <button className="hover:text-white border border-transparent hover:border-white rounded-full px-3 py-1 transition-all">AI Services</button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Popular Professional Services</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {[1,2,3,4].map(i => (
               <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-xl"></div>
             ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No services found yet. Be the first to post a gig!</p>
            <button 
              onClick={() => onNavigate('login')} 
              className="mt-4 text-indigo-600 font-medium hover:underline"
            >
              Join as a Freelancer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate('service', service.id)}
              >
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  <img 
                    src={service.image_url || `https://picsum.photos/seed/${service.id}/400/300`} 
                    alt={service.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {service.featured && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                      FEATURED
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                       {service.profiles?.avatar_url && <img src={service.profiles.avatar_url} className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{service.profiles?.full_name || 'Anonymous'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-indigo-600 transition-colors">
                    {service.title}
                  </h3>
                  <div className="flex items-center text-sm text-yellow-500 mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 font-bold text-gray-900">5.0</span>
                    <span className="ml-1 text-gray-500">(24)</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-500 uppercase font-semibold">Starting at</span>
                    <span className="text-lg font-bold text-gray-900">${service.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
