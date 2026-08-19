import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    Star,
    Clock,
    Flame,
    Heart,
    Plus,
    Minus,
    Check,
    Share2,
    Info
} from "lucide-react";
import { dbService } from "../databaseService";
import { Dish } from "../types";

interface FoodDetailPageProps {
    addToCart: (dish: Dish, quantity: number) => void;
    wishlist?: number[];
    toggleWishlist?: (id: number) => void;
}

const FoodDetailPage = ({
    addToCart,
    wishlist = [],
    toggleWishlist
}: FoodDetailPageProps) => {
    const { dishId } = useParams<{ dishId: string }>();
    const navigate = useNavigate();
    const [dish, setDish] = useState<Dish | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addedAnimating, setAddedAnimating] = useState(false);

    useEffect(() => {
        const fetchDish = async () => {
            try {
                setLoading(true);
                const dishes = await dbService.getDishes();
                const found = dishes.find(d => d.id === Number(dishId));
                if (found) {
                    setDish(found);
                }
            } catch (error) {
                console.error("Failed to fetch dish:", error);
            } finally {
                setLoading(false);
            }
        };

        if (dishId) {
            fetchDish();
        }
    }, [dishId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!dish) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <h2 className="text-2xl font-bold text-textMain mb-4">Món ăn không tồn tại</h2>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-primary text-white rounded-xl font-bold"
                >
                    Quay lại trang chủ
                </button>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart(dish, quantity);

        setAddedAnimating(true);
        setTimeout(() => setAddedAnimating(false), 1500);
    };

    const fmt = (p: number) => `${p.toLocaleString("vi-VN")}đ`;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Top Navbar Blur */}
            <div className="sticky top-0 z-30 lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="font-bold text-textMain truncate max-w-[200px]">{dish.name}</span>
                <button
                    onClick={() => toggleWishlist?.(dish.id)}
                    className={`p-2 rounded-full transition-colors ${wishlist.includes(dish.id) ? 'text-red-500' : 'text-gray-400'}`}
                >
                    <Heart size={24} fill={wishlist.includes(dish.id) ? "currentColor" : "none"} />
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* Left: Image Section */}
                    <div className="space-y-6">
                        <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl group">
                            <img
                                src={dish.image}
                                alt={dish.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {dish.isBestSeller && (
                                <div className="absolute top-6 left-6 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg">
                                    <Star size={14} fill="white" /> Best Seller
                                </div>
                            )}

                            <button
                                onClick={() => toggleWishlist?.(dish.id)}
                                className={`absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all hidden lg:flex ${wishlist.includes(dish.id)
                                    ? "bg-red-500 text-white"
                                    : "bg-white text-gray-400 hover:text-red-500"
                                    }`}
                            >
                                <Heart size={20} fill={wishlist.includes(dish.id) ? "currentColor" : "none"} />
                            </button>
                        </div>

                        {/* Nutrition/Quick Info tags */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-1 shadow-sm">
                                <Flame className="text-orange-500" size={20} />
                                <span className="text-xs text-textSec font-medium">Calo</span>
                                <span className="text-sm font-bold">~450 kcal</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-1 shadow-sm">
                                <Clock className="text-blue-500" size={20} />
                                <span className="text-xs text-textSec font-medium">Giao hàng</span>
                                <span className="text-sm font-bold">15-20 m</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-1 shadow-sm">
                                <Star className="text-yellow-500" size={20} fill="#f59e0b" />
                                <span className="text-xs text-textSec font-medium">Đánh giá</span>
                                <span className="text-sm font-bold">4.8 (120+)</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info Section */}
                    <div className="flex flex-col h-full lg:pt-4">
                        <div className="hidden lg:flex items-center gap-2 text-textSec text-sm mb-6">
                            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
                            <span>/</span>
                            <button onClick={() => navigate('/menu')} className="hover:text-primary transition-colors">Menu</button>
                            <span>/</span>
                            <span className="text-textMain font-medium">{dish.category}</span>
                        </div>

                        <div className="flex flex-col gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg">
                                    {dish.category}
                                </span>
                                <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> In Stock
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-textMain tracking-tight">
                                {dish.name}
                            </h1>
                            <p className="text-textSec text-lg leading-relaxed max-w-xl">
                                {dish.description}
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-sm mb-auto">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div>
                                    <span className="text-textSec text-sm font-medium mb-1 block">Giá hiện tại</span>
                                    <p className="text-4xl font-black text-primary">{fmt(dish.price)}</p>
                                </div>

                                <div className="flex items-center gap-4 bg-background p-2 rounded-2xl border border-gray-100">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-textMain hover:bg-white hover:text-primary transition-all shadow-sm disabled:opacity-50"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-textMain hover:bg-white hover:text-primary transition-all shadow-sm"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addedAnimating}
                                    className={`relative overflow-hidden h-14 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] ${addedAnimating
                                        ? "bg-green-500 text-white"
                                        : "bg-primary text-white hover:bg-primaryDark shadow-xl shadow-primary/20"
                                        }`}
                                >
                                    {addedAnimating ? (
                                        <span className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                            <Check size={24} strokeWidth={3} /> Đã thêm!
                                        </span>
                                    ) : (
                                        <>
                                            <Plus size={24} /> Thêm vào giỏ
                                        </>
                                    )}
                                </button>


                            </div>
                        </div>

                        {/* Extra Info */}
                        <div className="mt-8 flex items-start gap-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                            <Info className="text-primary mt-0.5 shrink-0" size={18} />
                            <p className="text-xs text-textSec leading-normal">
                                Món ăn này được chế biến từ nguyên liệu tươi sống trong ngày. Vui lòng ghi chú nếu bạn có bất kỳ dị ứng nào với thành phần của món ăn.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Similar Items - This could be added later if needed */}
                {/* <section className="mt-20">...</section> */}
            </div>
        </div>
    );
};

export default FoodDetailPage;
