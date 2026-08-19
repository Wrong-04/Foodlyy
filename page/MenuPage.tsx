import React, { useState, useEffect } from 'react';
import { Search, LayoutDashboard, Plus, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../databaseService';
import { Dish } from '../types';

interface MenuPageProps {
   addToCart: (d: Dish) => void;
}

const MenuPage = ({ addToCart }: MenuPageProps) => {
   const navigate = useNavigate();
   const [dishes, setDishes] = useState<Dish[]>([]);
   const [filter, setFilter] = useState('All');
   const [search, setSearch] = useState('');
   const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');
   const [isSortOpen, setIsSortOpen] = useState(false);
   const [addedItems, setAddedItems] = useState<{ [key: number]: boolean }>({});
   const fmt = (p: number) => `${p.toLocaleString("vi-VN")}đ`;

   const categories = ['All', 'Pizza', 'Burger', 'Main', 'Salad', 'Drink', 'Dessert'];

   useEffect(() => {
      const loadDishes = async () => {
         try {
            const loadedDishes = await dbService.getDishes();
            setDishes(loadedDishes);
         } catch (error) {
            console.error("Failed to load dishes:", error);
         }
      };
      loadDishes();
   }, []);

   const filteredDishes = dishes.filter(dish => {
      const matchesCategory = filter === 'All' || dish.category === filter;
      const matchesSearch = dish.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
   }).sort((a, b) => {
      if (sortBy === 'price_asc') {
         return a.price - b.price;
      } else if (sortBy === 'price_desc') {
         return b.price - a.price;
      }
      return 0; // 'popular' - default order
   });

   const handleAddToCart = (dish: Dish) => {
      addToCart(dish);
      setAddedItems(prev => ({ ...prev, [dish.id]: true }));

      // Clear the "Added" state after 1 second
      setTimeout(() => {
         setAddedItems(prev => ({ ...prev, [dish.id]: false }));
      }, 1000);
   };

   return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         {/* Filters */}
         <div className="flex flex-col gap-6 mb-10">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
               {categories.map(cat => (
                  <button
                     key={cat}
                     onClick={() => setFilter(cat)}
                     className={`flex h-10 shrink-0 items-center justify-center rounded-full px-6 font-semibold transition-all shadow-sm border ${filter === cat ? 'bg-primary text-white border-primary' : 'bg-white text-textMain border-gray-100 hover:border-primary/50'}`}
                  >
                     {cat}
                  </button>
               ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
               <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                     type="text"
                     placeholder="Search for food..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                  />
               </div>

               {/* Sort Dropdown */}
               <div className="relative z-20 w-full sm:w-auto">
                  <button
                     onClick={() => setIsSortOpen(!isSortOpen)}
                     className="w-full sm:w-auto flex items-center justify-between gap-4 px-4 h-12 bg-white rounded-2xl border border-gray-100 text-sm font-medium text-textMain shadow-sm cursor-pointer hover:border-primary/50 transition-all"
                  >
                     <div className="flex items-center gap-2">
                        <LayoutDashboard size={18} />
                        <span>Sort by: <span className="font-bold">
                           {sortBy === 'popular' ? 'Popular' : sortBy === 'price_asc' ? 'Price: Low to High' : 'Price: High to Low'}
                        </span></span>
                     </div>
                     <ChevronDown size={16} className={`text-gray-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortOpen && (
                     <div className="absolute right-0 top-14 w-full sm:w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {[
                           { id: 'popular', label: 'Popular' },
                           { id: 'price_asc', label: 'Price: Low to High' },
                           { id: 'price_desc', label: 'Price: High to Low' }
                        ].map((option) => (
                           <button
                              key={option.id}
                              onClick={() => { setSortBy(option.id as any); setIsSortOpen(false); }}
                              className={`w-full text-left px-4 py-3 hover:bg-orange-50 text-sm font-medium transition-colors flex items-center justify-between group
                             ${sortBy === option.id ? 'text-primary bg-orange-50/50' : 'text-textMain'}`}
                           >
                              {option.label}
                              {sortBy === option.id && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                           </button>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDishes.map(dish => (
               <div key={dish.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl hover:-translate-y-1 shadow-sm">
                  <div
                     onClick={() => navigate(`/dish/${dish.id}`)}
                     className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer"
                  >
                     <img src={dish.image} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     {dish.isBestSeller && <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-primary backdrop-blur-sm shadow-sm">Popular</div>}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                     <div className="flex justify-between items-start mb-2 gap-2">
                        <h3
                           onClick={() => navigate(`/dish/${dish.id}`)}
                           className="text-textMain text-lg font-bold leading-tight cursor-pointer hover:text-primary transition-colors"
                        >
                           {dish.name}
                        </h3>
                        <span className="text-primary font-bold text-lg whitespace-nowrap">{fmt(dish.price)}</span>
                     </div>
                     <p className="text-textSec text-sm font-normal leading-relaxed mb-6 line-clamp-2">{dish.description}</p>
                     <div className="mt-auto">
                        <button
                           onClick={() => handleAddToCart(dish)}
                           className={`w-full h-11 flex items-center justify-center gap-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 active:scale-95 ${addedItems[dish.id]
                              ? 'bg-green-500 text-white shadow-green-500/30'
                              : 'bg-primary text-white shadow-primary/30 hover:bg-primary/90'
                              }`}
                        >
                           {addedItems[dish.id] ? (
                              <>
                                 <Check size={18} strokeWidth={3} className="animate-[bounce_0.5s_ease-in-out]" />
                                 <span>Added!</span>
                              </>
                           ) : (
                              <>
                                 <Plus size={18} />
                                 <span>Add to Cart</span>
                              </>
                           )}
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default MenuPage;