import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronDown, Check, UtensilsCrossed, Heart, Star, Clock, LayoutDashboard } from "lucide-react";
import { dbService } from "../databaseService";
import { Dish } from "../types";

interface HomePageProps {
  addToCart: (d: Dish) => void;
  wishlist?: number[];
  toggleWishlist?: (id: number) => void;
}

const CATEGORIES = ["Pizza", "Burger", "Main", "Salad", "Drink", "Dessert"];
const PRICE_RANGES = [
  { label: "All Prices", value: "all" },
  { label: "Under 100k", value: "under100" },
  { label: "100k – 200k", value: "100to200" },
  { label: "Over 200k", value: "over200" },
];

const HomePage = ({
  addToCart,
  wishlist = [],
  toggleWishlist,
}: HomePageProps) => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [search, setSearch] = useState("");
  const [onlyBestSeller, setOnlyBestSeller] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    "popular" | "price_asc" | "price_desc" | "name_asc" | "name_desc"
  >("popular");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

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

  const toggleCat = (cat: string) =>
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const filtered = useMemo(
    () =>
      dishes
        .filter((dish) => {
          if (onlyBestSeller && !dish.isBestSeller) return false;
          if (priceRange === "under100" && dish.price >= 100000) return false;
          if (
            priceRange === "100to200" &&
            (dish.price < 100000 || dish.price > 200000)
          )
            return false;
          if (priceRange === "over200" && dish.price <= 200000) return false;
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
          return 0; // popular
        }),
    [dishes, onlyBestSeller, priceRange, selectedCats, search, sortBy],
  );

  const handleAdd = (dish: Dish) => {
    addToCart(dish);
    setAddedId(dish.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const fmt = (p: number) => `${p.toLocaleString("vi-VN")}đ`;

  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-background py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary font-bold rounded-full text-sm mb-6">
                🔥 20% OFF TODAY ONLY
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-textMain leading-tight mb-6">
                Taste The <span className="text-primary">Difference</span>
              </h1>
              <p className="text-textSec text-lg mb-10 max-w-lg">
                Explore a world of flavors with the freshest ingredients,
                carefully selected by our top chefs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/menu")}
                  className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primaryDark transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                >
                  <UtensilsCrossed size={20} /> Order Now
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("menu-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-8 py-4 border-2 border-gray-200 text-textMain font-bold rounded-2xl hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  View Menu
                </button>
              </div>
              {/* Stats */}
              <div className="mt-12 flex gap-8">
                {[
                  ["5K+", "Happy Customers"],
                  ["200+", "Dishes"],
                  ["4.9⭐", "Rating"],
                ].map(([val, label]) => (
                  <div key={label}>
                    <p className="text-2xl font-extrabold text-textMain">
                      {val}
                    </p>
                    <p className="text-xs text-textSec font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2 relative">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"
                alt="Delicious Food"
                className="w-full rounded-3xl object-cover aspect-square drop-shadow-2xl"
              />
              {/* Floating badges */}
              <div className="absolute top-6 right-4 bg-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
                <div className="bg-green-100 p-2 rounded-xl">
                  <Clock className="text-green-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-textSec font-bold uppercase">
                    Fast Delivery
                  </p>
                  <p className="font-extrabold text-sm">Under 20 mins</p>
                </div>
              </div>
              <div className="absolute bottom-6 left-4 bg-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl">
                  <Star className="text-primary w-4 h-4" fill="#FF5722" />
                </div>
                <div>
                  <p className="text-[10px] text-textSec font-bold uppercase">
                    Rating
                  </p>
                  <p className="font-extrabold text-sm">4.9 / 5.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MENU SECTION ── */}
      <section id="menu-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-textMain mb-3">
              Our Menu
            </h2>
            <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mb-4" />
            <p className="text-textSec">
              Search, filter and sort to find your favorite dishes
            </p>
          </div>

          {/* ── FILTER PANEL ── */}
          <div className="bg-background rounded-3xl p-5 mb-8 border border-gray-100 space-y-4">
            {/* Row 1: Search · Show · Price · Sort — all on one line */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[160px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search for food..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>

              {/* Radio: Show */}
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 h-10">
                {[
                  { val: false, label: "All" },
                  { val: true, label: "⭐ Best Seller" },
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

              {/* Price Range select */}
              <div className="relative">
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={14}
                />
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="h-10 pl-4 pr-9 rounded-xl bg-white border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                >
                  {PRICE_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
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
                      ? "Popular"
                      : sortBy === "price_asc"
                        ? "Low → High"
                        : sortBy === "price_desc"
                          ? "High → Low"
                          : sortBy === "name_asc"
                            ? "A → Z"
                            : "Z → A"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 top-11 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                    {[
                      { id: "popular", label: "Popular" },
                      { id: "price_asc", label: "Price: Low to High" },
                      { id: "price_desc", label: "Price: High to Low" },
                      { id: "name_asc", label: "Name: A to Z" },
                      { id: "name_desc", label: "Name: Z to A" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id as any);
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

            {/* Row 2: Category pills — same style as MenuPage category buttons */}
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
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Result count */}
          <p className="text-sm text-textSec mb-6">
            Found{" "}
            <span className="font-bold text-textMain">{filtered.length}</span>{" "}
            dishes
          </p>

          {/* ── DISH GRID ── */}
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🍽️</p>
              <p className="text-xl font-bold text-textMain mb-2">
                No dishes found
              </p>
              <p className="text-textSec">
                Try adjusting your filters or search keyword
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((dish) => (
                <div
                  key={dish.id}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image */}
                  <div
                    onClick={() => navigate(`/dish/${dish.id}`)}
                    className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer"
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {dish.isBestSeller && (
                      <div className="absolute top-3 left-3 bg-primary/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        ⭐ Best Seller
                      </div>
                    )}
                    <button
                      onClick={() => toggleWishlist?.(dish.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${wishlist.includes(dish.id)
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-gray-400 hover:text-red-500"
                        }`}
                    >
                      <Heart
                        size={14}
                        fill={
                          wishlist.includes(dish.id) ? "currentColor" : "none"
                        }
                      />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h3
                        onClick={() => navigate(`/dish/${dish.id}`)}
                        className="font-bold text-textMain text-base leading-tight cursor-pointer hover:text-primary transition-colors"
                      >
                        {dish.name}
                      </h3>
                      <span className="shrink-0 text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-lg">
                        {dish.category}
                      </span>
                    </div>
                    <p className="text-textSec text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
                      {dish.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-extrabold text-primary text-lg">
                        {fmt(dish.price)}
                      </span>
                      <button
                        onClick={() => handleAdd(dish)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${addedId === dish.id
                            ? "bg-green-500 text-white"
                            : "bg-primary text-white hover:bg-primaryDark shadow-md shadow-primary/20"
                          }`}
                      >
                        {addedId === dish.id ? (
                          <>
                            <Check size={16} strokeWidth={3} /> Added!
                          </>
                        ) : (
                          <>
                            <Plus size={16} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate("/menu")}
              className="px-8 py-3.5 border-2 border-primary text-primary font-bold rounded-2xl hover:bg-primary hover:text-white transition-all"
            >
              View Full Menu →
            </button>
          </div>
        </div>
      </section>

      {/* ── BOOKING SECTION ── */}
      <section className="py-20 bg-orange-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 p-10 lg:p-14 flex flex-col justify-center">
              <h2 className="text-4xl font-extrabold text-textMain mb-4">
                Book a Table
              </h2>
              <p className="text-textSec mb-8">
                Reserve your spot at Foodly and enjoy an unforgettable dining
                experience with your loved ones.
              </p>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate("/booking");
                }}
              >
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-bold h-12 rounded-xl hover:bg-primaryDark transition-all mt-4"
                >
                  Book Now
                </button>
              </form>
            </div>
            <div className="md:w-1/2 relative min-h-[300px]">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Restaurant interior"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
