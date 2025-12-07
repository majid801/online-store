
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Profile, Order, Message, Service } from '../types';
import { MessageSquare, Package, Plus, Trash2, Send, X } from 'lucide-react';

interface DashboardProps {
  user: any;
  profile: Profile | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, profile }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'chat'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // New Service Form State
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [newServiceData, setNewServiceData] = useState({ title: '', description: '', price: 10, category: 'General' });

  const isFreelancer = profile?.role === 'freelancer';

  useEffect(() => {
    fetchOrders();
    if (isFreelancer) fetchServices();

    // Subscribe to new orders
    const orderSub = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        // Optimistic update or refetch
        fetchOrders();
      })
      .subscribe();

    return () => { orderSub.unsubscribe(); };
  }, [user, isFreelancer]);

  useEffect(() => {
    if (selectedOrder) {
      fetchMessages(selectedOrder.id);
      
      const channel = supabase
        .channel(`order-${selectedOrder.id}`)
        .on(
          'postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${selectedOrder.id}` }, 
          (payload) => {
             const newMsg = payload.new as Message;
             setMessages(prev => [...prev, newMsg]);
             // Scroll to bottom
             setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          }
        )
        .subscribe();

      return () => { channel.unsubscribe(); };
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
    const field = isFreelancer ? 'freelancer_id' : 'user_id';
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq(field, user.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
  };

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').eq('freelancer_id', user.id);
    setServices(data || []);
  };

  const fetchMessages = async (orderId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(full_name)')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newMessage.trim()) return;

    await supabase.from('messages').insert({
      order_id: selectedOrder.id,
      sender_id: user.id,
      message: newMessage
    });
    setNewMessage('');
  };

  const createService = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('services').insert({
      freelancer_id: user.id,
      ...newServiceData,
      image_url: 'https://picsum.photos/400/300' // Placeholder
    });
    
    if (!error) {
      setIsCreatingService(false);
      fetchServices();
      setNewServiceData({ title: '', description: '', price: 10, category: 'General' });
    }
  };

  const deleteService = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      await supabase.from('services').delete().eq('id', id);
      fetchServices();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8 h-[80vh]">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 bg-white border border-gray-200 rounded-xl p-4 h-fit">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {profile?.full_name?.charAt(0) || user.email.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 uppercase">{profile?.role}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <Package className="w-5 h-5" />
              Orders
            </button>
            {isFreelancer && (
              <button 
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'services' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <Plus className="w-5 h-5" />
                My Gigs
              </button>
            )}
          </nav>
        </div>

        {/* Main Area */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          
          {/* ORDERS LIST */}
          {activeTab === 'orders' && !selectedOrder && (
            <div className="p-6 overflow-y-auto h-full">
              <h2 className="text-xl font-bold mb-6">Active Orders</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500">No active orders found.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors flex justify-between items-center group">
                      <div>
                        <h3 className="font-bold text-gray-900">{order.product_name}</h3>
                        <p className="text-sm text-gray-500">
                          {isFreelancer ? `Buyer: ${order.first_name}` : `Order #${order.id.slice(0,8)}`}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 capitalize ${
                          order.order_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.order_status.replace('_', ' ')}
                        </span>
                      </div>
                      <button 
                        onClick={() => { setSelectedOrder(order); setActiveTab('chat'); }}
                        className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
                      >
                        Chat & Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CHAT / ORDER DETAIL */}
          {activeTab === 'chat' && selectedOrder && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="font-bold">{selectedOrder.product_name}</h3>
                  <span className="text-xs text-gray-500">${selectedOrder.total_amount} • {selectedOrder.order_status}</span>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                 {messages.map(msg => {
                   const isMe = msg.sender_id === user.id;
                   return (
                     <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${isMe ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
                         <p>{msg.message}</p>
                         <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                           {new Date(msg.created_at).toLocaleTimeString()}
                         </p>
                       </div>
                     </div>
                   );
                 })}
                 <div ref={chatBottomRef} />
              </div>

              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input 
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="bg-indigo-600 p-2 rounded-md text-white hover:bg-indigo-700">
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SERVICES MANAGEMENT */}
          {activeTab === 'services' && isFreelancer && (
             <div className="p-6 overflow-y-auto h-full">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold">My Gigs</h2>
                 <button 
                   onClick={() => setIsCreatingService(!isCreatingService)}
                   className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                 >
                   {isCreatingService ? 'Cancel' : 'Create Gig'}
                 </button>
               </div>

               {isCreatingService && (
                 <form onSubmit={createService} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gig Title</label>
                      <input className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required value={newServiceData.title} onChange={e => setNewServiceData({...newServiceData, title: e.target.value})} placeholder="I will..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3} required value={newServiceData.description} onChange={e => setNewServiceData({...newServiceData, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input type="number" min="5" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required value={newServiceData.price} onChange={e => setNewServiceData({...newServiceData, price: parseInt(e.target.value)})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={newServiceData.category} onChange={e => setNewServiceData({...newServiceData, category: e.target.value})}>
                          <option>General</option>
                          <option>Design</option>
                          <option>Development</option>
                          <option>Writing</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-2 rounded-md font-medium">Publish Gig</button>
                 </form>
               )}

               <div className="space-y-4">
                 {services.map(svc => (
                   <div key={svc.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <img src={svc.image_url} className="w-16 h-12 object-cover rounded bg-gray-100" />
                        <div>
                          <h4 className="font-bold text-gray-900">{svc.title}</h4>
                          <p className="text-sm text-gray-500">${svc.price}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteService(svc.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                 ))}
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};
