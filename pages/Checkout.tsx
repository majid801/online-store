
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Service, OrderFormData } from '../types';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

interface CheckoutProps {
  serviceId: string | null;
  onNavigate: (page: string) => void;
  user: any;
}

export const Checkout: React.FC<CheckoutProps> = ({ serviceId, onNavigate, user }) => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    address: '',
    city: '',
    zip: '',
    country: 'United States',
  });

  useEffect(() => {
    if (serviceId) fetchService(serviceId);
  }, [serviceId]);

  const fetchService = async (id: string) => {
    const { data } = await supabase.from('services').select('*').eq('id', id).single();
    setService(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !user) return;
    
    setLoading(true);
    setError(null);

    const totalAmount = service.price; // Add tax logic if needed
    
    const orderPayload = {
      user_id: user.id,
      freelancer_id: service.freelancer_id, // Important for RLS
      service_id: service.id,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      street_address: formData.address,
      city: formData.city,
      zip_code: formData.zip,
      product_name: service.title,
      total_amount: totalAmount,
      payment_status: 'paid', // Simulated
      order_status: 'placed'
    };

    try {
      // 1. Attempt to call serverless function (Simulated)
      // In a real app: await fetch('/api/payment', { method: 'POST', body: JSON.stringify(orderPayload) });
      
      // 2. Direct Supabase Insert (Client-side fallback for demo)
      // This works because we added "Authenticated users can create orders" policy
      const { error: dbError } = await supabase
        .from('orders')
        .insert([orderPayload]);

      if (dbError) throw dbError;

      onNavigate('dashboard');
    } catch (err: any) {
      console.error(err);
      setError("Payment processing failed. Please try again. " + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!service) return <div className="p-20"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Secure Checkout</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex gap-4">
          <img src={service.image_url} alt="" className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
          <div>
            <h3 className="font-bold text-gray-900">{service.title}</h3>
            <p className="text-gray-500 text-sm mt-1">{service.category}</p>
          </div>
          <div className="ml-auto font-bold text-lg">${service.price}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-semibold text-lg">Billing Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} className="border p-3 rounded-md w-full" />
            <input required placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} className="border p-3 rounded-md w-full" />
          </div>
          <input required placeholder="Email" type="email" name="email" value={formData.email} onChange={handleChange} className="border p-3 rounded-md w-full" />
          <input required placeholder="Address" name="address" value={formData.address} onChange={handleChange} className="border p-3 rounded-md w-full" />
          <div className="grid grid-cols-3 gap-4">
            <input required placeholder="City" name="city" value={formData.city} onChange={handleChange} className="border p-3 rounded-md w-full" />
            <input required placeholder="State" className="border p-3 rounded-md w-full" />
            <input required placeholder="ZIP" name="zip" value={formData.zip} onChange={handleChange} className="border p-3 rounded-md w-full" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
           <h2 className="font-semibold text-lg">Payment Method</h2>
           <div className="border border-indigo-500 bg-indigo-50 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-4 border-indigo-600"></div>
                <span className="font-medium text-indigo-900">Credit Card (Simulated)</span>
              </div>
              <Lock className="w-4 h-4 text-indigo-400" />
           </div>
           <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500">
             This is a demo. No real charge will be made.
           </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : `Confirm & Pay $${service.price}`}
        </button>
      </form>
    </div>
  );
};
