import React from "react";
import {
  ShoppingCart,
  ArrowRight,
  Trash2,
  Minus,
  Plus,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartItem, User } from "../types";

interface CartPageProps {
  cart: CartItem[];
  updateQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  currentUser: User | null;
}

const CartPage = ({ cart, updateQuantity, removeFromCart, currentUser }: CartPageProps) => {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const fmt = (p: number) => `${p.toLocaleString("vi-VN")}đ`;

  const handleCheckout = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (cart.length === 0) return;

    // Navigate to checkout page
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingCart size={64} className="text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-textMain mb-2">Your cart is empty</h2>
        <p className="text-textSec mb-8">Looks like you haven't added any items yet.</p>
        <button
          onClick={() => navigate("/menu")}
          className="px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primaryDark"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/menu")}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowRight className="rotate-180" />
        </button>
        <h1 className="text-3xl font-black text-textMain">Your Cart</h1>
        <span className="text-textSec font-medium ml-auto">
          {cart.length} items
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart List */}
        <div className="flex-1 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/20 transition-all">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-textMain">{item.name}</h3>
                <p className="text-textSec text-sm line-clamp-1">{item.description}</p>
                <p className="text-primary font-bold mt-1">{fmt(item.price)}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                <div className="flex items-center gap-3 bg-background p-1.5 rounded-xl border border-gray-200">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-primary disabled:opacity-50" disabled={item.quantity <= 1}><Minus size={14} /></button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-primary text-white rounded-lg shadow-sm"><Plus size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
            <h2 className="text-xl font-extrabold mb-6">Order Summary</h2>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Promo Code</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Enter code..." className="flex-1 rounded-xl border-gray-200 focus:border-primary focus:ring-primary bg-background text-sm px-4 h-10" />
                <button className="bg-primary/10 text-primary font-bold px-4 rounded-xl text-sm hover:bg-primary/20">Apply</button>
              </div>
            </div>

            <div className="space-y-3 border-b border-dashed border-gray-200 pb-6 mb-6">
              <div className="flex justify-between text-textSec"><span>Subtotal</span> <span className="text-textMain font-bold">{fmt(total)}</span></div>
              <div className="flex justify-between text-textSec"><span>Delivery</span> <span className="text-green-600 font-bold">Free</span></div>
              <div className="flex justify-between text-textSec"><span>Discount</span> <span className="text-red-500 font-bold">-{fmt(0)}</span></div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-extrabold uppercase tracking-wider">Total</span>
              <span className="text-3xl font-black text-primary">{fmt(total)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!currentUser}
              className="w-full bg-primary hover:bg-primaryDark disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              <ClipboardList size={20} />
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
