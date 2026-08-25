import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Bell, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { dbService } from '../../lib/db';
import Pagination from '../../components/admin/Pagination';

import DishFormModal from '../../components/admin/DishFormModal';

const CATEGORIES = ["Tất cả", "Món chính", "Bún & Phở", "Cơm", "Khai vị", "Đồ uống", "Tráng miệng"];
const ITEMS_PER_PAGE = 8;

const AdminMenu = () => {
    const [dishes, setDishes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState("Tất cả");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDish, setEditingDish] = useState(undefined);

    const fetchDishes = async () => {
        try {
            setIsLoading(true);
            const data = await dbService.getDishes();
            setDishes(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách món ăn:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDishes();
    }, []);

    // Logic xử lý lọc và tìm kiếm
    const filteredDishes = useMemo(() => {
        return dishes.filter(dish => {
            const matchCategory = activeCategory === "Tất cả" || dish.category === activeCategory;
            const matchSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCategory && matchSearch;
        });
    }, [dishes, activeCategory, searchQuery]);

    const totalPages = Math.ceil(filteredDishes.length / ITEMS_PER_PAGE);
    const paginatedDishes = filteredDishes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset trang khi đổi bộ lọc
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery]);

    // Các hàm tương tác Database
    const handleAddDish = async (formData) => {
        const newId = dishes.length > 0 ? Math.max(...dishes.map(d => d.id)) + 1 : 1;
        const newDish = { id: newId, ...formData };

        try {
            await dbService.addDish(newDish);
            setDishes(prev => [...prev, newDish]);
        } catch (e) {
            console.error("Lưu db thất bại:", e);
        }
    };

    const handleEditDish = async (formData) => {
        if (!editingDish) return;
        const updatedDish = { ...editingDish, ...formData };

        try {
            await dbService.updateDish(editingDish.id, formData);
            setDishes(prev => prev.map(d => d.id === editingDish.id ? updatedDish : d));
        } catch (e) {
            console.error("Sửa db thất bại:", e);
        }
    };

    const handleDeleteDish = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa món ăn này không? Hành động này không thể hoàn tác.")) {
            return;
        }

        try {
            await dbService.deleteDish(id);
            setDishes(prev => prev.filter(d => d.id !== id));
        } catch (e) {
            console.error("Xóa db thất bại:", e);
        }
    };

    const openEditModal = (dish) => {
        setEditingDish(dish);
        setIsEditModalOpen(true);
    };

    const fmt = (p) => `${(p / 1000).toString()}k`; // Format 65.000 -> 65k theo design

    return (
        <div className="flex flex-col h-full bg-background rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-textMain mb-1">
                        Quản lý thực đơn
                    </h2>
                    <p className="text-textSec text-sm">Tổng cộng {dishes.length} món ăn</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-primary text-white font-bold h-11 px-6 rounded-xl hover:bg-primaryDark transition-all shadow-md shadow-primary/20 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                    <Plus size={18} /> Thêm món mới
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-[#FFF8F5] rounded-3xl p-6 shadow-inner overflow-y-auto min-h-0 relative">
                
                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-2xl">
                        <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm món ăn..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-4 h-12 rounded-2xl bg-white border border-gray-100 text-sm outline-none focus:ring-4 focus:ring-primary/10 shadow-sm transition-all placeholder:text-gray-300 font-medium"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-12 shadow-sm">
                            <Filter size={14} className="text-gray-400" />
                            <select
                                value={activeCategory}
                                onChange={(e) => setActiveCategory(e.target.value)}
                                className="bg-transparent border-none text-sm font-bold text-textMain outline-none min-w-[140px] cursor-pointer"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat} {cat === "Tất cả" ? `(${dishes.length})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {paginatedDishes.map((dish) => (
                            <div key={dish.id} className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100">
                                    <img
                                        src={dish.image}
                                        alt={dish.name}
                                        className={`w-full h-full object-cover transition-transform duration-500 hover:scale-110 ${dish.isAvailable === false ? 'grayscale opacity-70' : ''}`}
                                    />
                                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                                        {dish.isBestSeller && (
                                            <span className="bg-yellow-400 text-black px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                                Bán chạy
                                            </span>
                                        )}
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${dish.isAvailable !== false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {dish.isAvailable !== false ? 'Còn hàng' : 'Hết hàng'}
                                        </span>
                                    </div>
                                    {/* isAvailable overlay mock if needed */}
                                    {dish.isAvailable === false && (
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                            <span className="bg-white/90 text-textMain px-4 py-1.5 rounded-full text-xs font-black shadow-lg">HẾT HÀNG</span>
                                        </div>
                                    )}
                                </div>

                                <div className="px-2 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <h3 className="font-extrabold text-textMain text-base flex-1 line-clamp-1 leading-snug">{dish.name}</h3>
                                        <span className="font-black text-primary text-base shrink-0">{fmt(dish.price)}</span>
                                    </div>
                                    <p className="text-xs text-textSec mb-5 truncate font-medium">
                                        {dish.category} • {dish.description.substring(0, 20)}...
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <button
                                            onClick={() => openEditModal(dish)}
                                            className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-orange-200 text-primary font-bold hover:bg-orange-50 transition-colors text-sm"
                                        >
                                            <Edit2 size={14} /> Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDish(dish.id)}
                                            className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors text-sm"
                                        >
                                            <Trash2 size={14} /> Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card Slot */}
                        {currentPage === totalPages && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-orange-50/50 rounded-[24px] p-6 border-2 border-dashed border-primary/30 hover:border-primary hover:bg-orange-50 transition-all duration-300 flex flex-col items-center justify-center min-h-[320px] group"
                            >
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4">
                                    <Plus size={32} strokeWidth={2.5} />
                                </div>
                                <h3 className="font-extrabold text-primary text-lg mb-1">Thêm món mới</h3>
                                <p className="text-textSec text-sm">Mở rộng thực đơn của bạn</p>
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredDishes.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
            />

            {/* Modals */}
            <DishFormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddDish}
                title="Thêm món ăn mới"
            />
            <DishFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditDish}
                initialData={editingDish}
                title="Chỉnh sửa món ăn"
            />
        </div>
    );
};

export default AdminMenu;
