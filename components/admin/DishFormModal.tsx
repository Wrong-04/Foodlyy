import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dish } from "../../types";

export interface DishFormData {
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isBestSeller: boolean;
}

interface DishFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DishFormData) => Promise<void>;
    initialData?: Dish;
    title: string;
}

const CATEGORIES = ["Main", "Appetizer", "Drink", "Dessert", "Pizza", "Burger", "Salad"];

const DishFormModal = ({ isOpen, onClose, onSubmit, initialData, title }: DishFormModalProps) => {
    const [formData, setFormData] = useState<DishFormData>({
        name: "",
        description: "",
        price: 0,
        image: "",
        category: "Main",
        isBestSeller: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                price: initialData.price,
                image: initialData.image,
                category: initialData.category,
                isBestSeller: initialData.isBestSeller || false,
            });
        } else {
            // Reset form on open for new dish
            setFormData({
                name: "",
                description: "",
                price: 0,
                image: "",
                category: "Main",
                isBestSeller: false,
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error("Lỗi khi lưu món ăn:", error);
            alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-extrabold text-textMain">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-textMain hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-textMain block">Tên món ăn</label>
                            <input
                                required
                                type="text"
                                placeholder="VD: Phở Bò Đặc Biệt"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-textMain block">Giá (VNĐ)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="1000"
                                placeholder="VD: 65000"
                                value={formData.price || ""}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium text-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-textMain block">Danh mục</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm bg-white cursor-pointer"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-textMain block">Ảnh (URL)</label>
                            <input
                                required
                                type="url"
                                placeholder="https://..."
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-textMain block">Mô tả chi tiết</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Mô tả về hương vị, thành phần..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <input
                            type="checkbox"
                            id="isBestSeller"
                            checked={formData.isBestSeller}
                            onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                            className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer accent-primary"
                        />
                        <label htmlFor="isBestSeller" className="text-sm font-bold text-orange-800 cursor-pointer select-none">
                            Đánh dấu là món Bán chạy (Best Seller)
                        </label>
                    </div>

                    {/* Image Preview */}
                    {formData.image && (
                        <div className="h-32 rounded-xl overflow-hidden border border-gray-200 relative bg-gray-50">
                            <img
                                src={formData.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                onLoad={(e) => (e.currentTarget.style.display = 'block')}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 -z-10">
                                URL không hợp lệ hoặc ảnh lỗi
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-textSec hover:bg-gray-100 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primaryDark transition-colors shadow-md shadow-primary/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "Lưu thay đổi"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DishFormModal;
