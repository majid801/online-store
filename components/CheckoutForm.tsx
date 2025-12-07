import React, { useState, useCallback } from 'react';
import { Loader2, Wand2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { OrderFormData, Product, SupabaseOrder } from '../types';
import { submitOrderToSupabase } from '../services/supabaseClient';
import { generateAiGiftNote } from '../services/geminiService';

interface CheckoutFormProps {
  cartItems: Product[];
  cartTotal: number;
  onSuccess: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ cartItems, cartTotal, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: 'United States',
    giftNote: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAiNoteGeneration = useCallback(async () => {
    if (!formData.firstName) {
      setError("Please enter your name first for the AI to personalize the note.");
      return;
    }
    
    setAiLoading(true);
    setError(null);
    try {
      // Use the 'firstName' as the recipient for this demo flow, or add a specific recipient field
      const note = await generateAiGiftNote(cartItems, formData.firstName);
      setFormData(prev => ({ ...prev, giftNote: note }));
    } catch (e) {
      setError("Failed to generate AI note. Please try manually.");
    } finally {
      setAiLoading(false);
    }
  }, [cartItems, formData.firstName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Map form data to the flattened Supabase table structure
    const orderPayload: SupabaseOrder = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      street_address: formData.address,
      city: formData.city,
      zip_code: formData.zip,
      country: formData.country,
      items: cartItems, // Stores the product details including name
      total_amount: Number((cartTotal * 1.08).toFixed(2)),
      gift_note: formData.giftNote,
      order_date: new Date().toISOString()
    };

    try {
      await submitOrderToSupabase(orderPayload);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError("We encountered an issue connecting to the database. Please ensure the Supabase table 'orders' exists and policies allow insertion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First name</label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last name</label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
            />
          </div>
        </div>
      </div>

      {/* Shipping Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Shipping Address</h3>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Street address</label>
            <input
              type="text"
              name="address"
              id="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              id="city"
              required
              value={formData.city}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border bg-white"
            >
              <option>United States</option>
              <option>Canada</option>
              <option>Mexico</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">ZIP / Postal</label>
            <input
              type="text"
              name="zip"
              id="zip"
              required
              value={formData.zip}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
            />
          </div>
        </div>
      </div>

       {/* AI Gift Note Section */}
       <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-medium text-indigo-900 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-600" />
            Gift Note
            <span className="text-xs font-normal bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full ml-2">AI Powered</span>
           </h3>
        </div>
       
        <div className="space-y-4">
          <p className="text-sm text-indigo-700">Want to send this as a gift? Let our AI write a perfect note for you.</p>
          <div className="relative">
            <textarea
              name="giftNote"
              id="giftNote"
              rows={3}
              value={formData.giftNote}
              onChange={handleChange}
              className="block w-full rounded-md border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
              placeholder="Enter your message here..."
            />
             <button
              type="button"
              onClick={handleAiNoteGeneration}
              disabled={aiLoading}
              className="absolute bottom-2 right-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
            >
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
              {aiLoading ? 'Generating...' : 'Auto-Write'}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <span className="flex items-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing Order...
          </span>
        ) : (
          `Pay $${(cartTotal * 1.08).toFixed(2)}`
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
        <Lock className="w-3 h-3" />
        Encrypted and Secured via Supabase
      </div>
    </form>
  );
};