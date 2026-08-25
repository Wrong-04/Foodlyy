import React, { useState, useEffect } from 'react';
import { Search, LayoutDashboard, Plus, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { dbService } from '../../lib/db';

import { useApp } from '../../context/AppContext';

const MenuPage = () => {
   const { addToCart } = useApp();
   const navigate = useNavigate();
   const initialDishes = dbService.getDishesSync();
   const initialMax = initialDishes.length > 0 ? Math.max(...initialDishes.map((d) => d.price)) : 300000;
   
   const [dishes, setDishes] = useState(initialDishes);
   const [onlyBestSeller, setOnlyBestSeller] = useState(false);
   const [minPrice, setMinPrice] = useState(0);
   const [maxPrice, setMaxPrice] = useState(initialMax);
   const [absoluteMax, setAbsoluteMax] = useState(initialMax);
   const [isPriceOpen, setIsPriceOpen] = useState(false);
   const [selectedCats, setSelectedCats] = useState([]);
   const [search, setSearch] = useState('');
   const [sortBy, setSortBy] = useState('popular');
   const [isSortOpen, setIsSortOpen] = useState(false);
   const [addedItems, setAddedItems] = useState({});
   const fmt = (p) => `${p.toLocaleString("vi-VN")}đ`;

   const CATEGORIES = ['Món chính', 'Bún & Phở', 'Cơm', 'Khai vị', 'Đồ uống', 'Tráng miệng'];

   useEffect(() => {
      window.scrollTo(0, 0);
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

   const toggleCat = (cat) =>
      setSelectedCats((prev) =>
         prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
      );

   const filteredDishes = React.useMemo(() => dishes
      .filter((dish) => {
         if (onlyBestSeller && !dish.isBestSeller) return false;
         if (dish.price < minPrice || dish.price > maxPrice) return false;
         if (selectedCats.length > 0 && !selectedCats.includes(dish.category))
            return false;
         if (search && !dish.name.toLowerCase().includes(search.toLowerCase()))
            return false;
         return true;
      })
      .sort((a, b) => {
         if (sortBy === "price_asc") return a.price - b.price;
         if (sortBy === "price_desc") return b.price - a.price;
         if (sortBy === "name_asc") return a.name.localeCompare(b.name);
         if (sortBy === "name_desc") return b.name.localeCompare(a.name);
         return 0;
      }), [dishes, onlyBestSeller, minPrice, maxPrice, selectedCats, search, sortBy]);

   const handleAddToCart = (dish) => {
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
         <div className="bg-background rounded-3xl p-5 mb-8 border border-gray-100 space-y-4">
            {/* Row 1: Search · Show · Price · Sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>

              {/* Radio: Show */}
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 h-10">
                {[
                  { val: false, label: "Tất cả" },
                  { val: true, label: "⭐ Bán chạy" },
                ].map((opt) => (
                  <button
                    key={String(opt.val)}
                    onClick={() => setOnlyBestSeller(opt.val)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium transition-all ${onlyBestSeller === opt.val
                        ? "bg-primary text-white"
                        : "text-textSec hover:text-textMain"
                      }`}
                  >
                    {onlyBestSeller === opt.val && (
                      <Check size={12} strokeWidth={3} />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Price Range */}
              <div className="relative z-20">
                <button
                  onClick={() => setIsPriceOpen(!isPriceOpen)}
                  className="flex items-center gap-2 px-4 h-10 bg-white rounded-xl border border-gray-200 text-sm font-medium text-textMain hover:border-primary/50 transition-all"
                >
                  <span className="font-bold">
                    {minPrice === 0 && maxPrice === absoluteMax
                      ? "Tất cả giá"
                      : `${fmt(minPrice)} - ${fmt(maxPrice)}`}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${isPriceOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isPriceOpen && (
                  <div className="absolute left-0 top-11 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-5 space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-textSec font-bold">
                        <span>Giá thấp nhất</span>
                        <span className="text-primary font-black">{fmt(minPrice)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={absoluteMax}
                        step="5000"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 5000))}
                        className="w-full accent-primary h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-textSec font-bold">
                        <span>Giá cao nhất</span>
                        <span className="text-primary font-black">{fmt(maxPrice)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={absoluteMax}
                        step="5000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 5000))}
                        className="w-full accent-primary h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setMinPrice(0);
                          setMaxPrice(absoluteMax);
                          setIsPriceOpen(false);
                        }}
                        className="flex-1 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Đặt lại
                      </button>
                      <button
                        onClick={() => setIsPriceOpen(false)}
                        className="flex-1 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primaryDark transition-colors shadow-md shadow-primary/10"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative z-20">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 px-4 h-10 bg-white rounded-xl border border-gray-200 text-sm font-medium text-textMain hover:border-primary/50 transition-all"
                >
                  <LayoutDashboard size={16} />
                  <span className="font-bold">
                    {sortBy === "popular"
                      ? "Phổ biến"
                      : sortBy === "price_asc"
                        ? "Giá thấp → cao"
                        : sortBy === "price_desc"
                          ? "Giá cao → thấp"
                          : sortBy === "name_asc"
                            ? "Tên A → Z"
                            : "Tên Z → A"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 top-11 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                    {[
                      { id: "popular", label: "Phổ biến" },
                      { id: "price_asc", label: "Giá: Thấp đến Cao" },
                      { id: "price_desc", label: "Giá: Cao đến Thấp" },
                      { id: "name_asc", label: "Tên: A đến Z" },
                      { id: "name_desc", label: "Tên: Z đến A" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-orange-50 text-sm font-medium transition-colors flex items-center justify-between ${sortBy === opt.id
                            ? "text-primary bg-orange-50/50"
                            : "text-textMain"
                          }`}
                      >
                        {opt.label}
                        {sortBy === opt.id && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Category pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => {
                const active = selectedCats.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCat(cat)}
                    className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-all border ${active
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-textMain border-gray-200 hover:border-primary/50"
                      }`}
                  >
                    {active && <Check size={13} strokeWidth={3} />}
                    {cat}
                  </button>
                );
              })}
              {selectedCats.length > 0 && (
                <button
                  onClick={() => setSelectedCats([])}
                  className="text-xs text-textSec hover:text-red-500 underline ml-1"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-textSec mb-6">
            Tìm thấy <span className="font-bold text-textMain">{filteredDishes.length}</span> món ăn
          </p>

          {/* Grid */}
          {filteredDishes.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-5xl mb-4">🍽️</p>
              <p className="text-xl font-bold text-textMain mb-2">
                Không tìm thấy món ăn nào
              </p>
              <p className="text-textSec">
                Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDishes.map(dish => (
               <div key={dish.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl hover:-translate-y-1 shadow-sm">
                  <div
                     onClick={() => navigate(`/dish/${dish.id}`)}
                     className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer"
                  >
                     <img src={dish.image} alt={dish.name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${dish.isAvailable === false ? 'grayscale' : ''}`} />
                     {dish.isBestSeller && <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-primary backdrop-blur-sm shadow-sm">Bán chạy</div>}
                     {dish.isAvailable === false && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                           <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg uppercase">Hết hàng</span>
                        </div>
                     )}
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
                           disabled={dish.isAvailable === false}
                           onClick={() => handleAddToCart(dish)}
                           className={`w-full h-11 flex items-center justify-center gap-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 active:scale-95 ${
                              dish.isAvailable === false
                                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                 : addedItems[dish.id]
                                    ? 'bg-green-500 text-white shadow-green-500/30'
                                    : 'bg-primary text-white shadow-primary/30 hover:bg-primary/90'
                              }`}
                        >
                           {dish.isAvailable === false ? (
                              <span>Hết hàng</span>
                           ) : addedItems[dish.id] ? (
                              <>
                                 <Check size={18} strokeWidth={3} className="animate-[bounce_0.5s_ease-in-out]" />
                                 <span>Đã thêm!</span>
                              </>
                           ) : (
                              <>
                                 <Plus size={18} />
                                 <span>Thêm vào giỏ</span>
                              </>
                           )}
                        </button>
                     </div>
                  </div>
               </div>
            ))}
                  </div>
         )}
      </div>
   );
};

export default MenuPage;