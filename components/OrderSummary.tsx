import React from 'react';
import { Product } from '../types';

interface OrderSummaryProps {
  items: Product[];
  total: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items, total }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit sticky top-24">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
      
      <div className="flow-root">
        <ul className="-my-6 divide-y divide-gray-200">
          {items.map((product) => (
            <li key={product.id} className="py-6 flex">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3>{product.name}</h3>
                    <p className="ml-4">${product.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <p className="text-gray-500">Qty {product.quantity}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-200 mt-6 pt-6 space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>Subtotal</p>
          <p>${total.toFixed(2)}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>Shipping</p>
          <p className="text-green-600 font-medium">Free</p>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>Taxes</p>
          <p>${(total * 0.08).toFixed(2)}</p>
        </div>
        <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
          <p className="text-base font-medium text-gray-900">Total</p>
          <p className="text-2xl font-bold text-indigo-600">${(total * 1.08).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
