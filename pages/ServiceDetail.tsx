
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Service } from '../types';
import { Loader2, Check, Clock, RefreshCw, Star } from 'lucide-react';

interface ServiceDetailProps {
  serviceId: string | null;
  onNavigate: (page: string, id?: string) => void;
  user: any;
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({ serviceId, onNavigate, user }) => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serviceId) fetchService(serviceId);
  }, [serviceId]);

  const fetchService = async (id: string) => {
    const { data, error } = await supabase
      .from('services')
      .select('*, profiles(*)')
      .eq('id', id)
      .single();
    
    if (!error && data) setService(data);
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;
  if (!service) return <div className="p-20 text-center">Service not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="lg:grid lg:grid-cols-3 lg:gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                {service.profiles?.avatar_url && <img src={service.profiles.avatar_url} className="w-full h-full object-cover" />}
             </div>
             <div>
               <p className="font-semibold text-gray-900">{service.profiles?.full_name}</p>
               <div className="flex items-center text-sm text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-bold text-gray-900">5.0</span>
                  <span className="ml-1 text-gray-500">(102 Reviews)</span>
               </div>
             </div>
          </div>
          
          <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
            <img 
              src={service.image_url || `https://picsum.photos/seed/${service.id}/800/600`} 
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-indigo max-w-none">
            <h3 className="text-xl font-bold text-gray-900">About This Gig</h3>
            <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">{service.description}</p>
          </div>
        </div>

        {/* Sidebar Checkout */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg sticky top-24 p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-900 font-bold text-lg">Standard Package</span>
              <span className="text-2xl font-bold text-gray-900">${service.price}</span>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              A comprehensive package including all standard features described in the gig.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm text-gray-600 font-semibold">
                <Clock className="w-4 h-4 mr-2" />
                3 Days Delivery
              </div>
              <div className="flex items-center text-sm text-gray-600 font-semibold">
                <RefreshCw className="w-4 h-4 mr-2" />
                2 Revisions
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Source File
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                High Resolution
              </div>
            </div>

            <button
              onClick={() => user ? onNavigate('checkout', service.id) : onNavigate('login')}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Continue (${service.price})
            </button>
            
            {!user && (
              <p className="text-xs text-center text-gray-500 mt-4">
                You need to sign in to continue.
              </p>
            )}
            
            <button 
              onClick={() => onNavigate('home')}
              className="w-full mt-4 text-center text-sm text-gray-500 hover:text-indigo-600"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
