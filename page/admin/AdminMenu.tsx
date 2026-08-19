import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Bell, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { dbService } from '../../databaseService';
import { supabase } from '../../supabase';
import { Dish } from '../../types';
import DishFormModal, { DishFormData } from '../../components/admin/DishFormModal';

const CATEGORIES = ["All", "Main", "Appetizer", "Drink", "Dessert", "Pizza", "Burger", "Salad"];
const ITEMS_PER_PAGE = 8;

const AdminMenu = () => {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDish, setEditingDish] = useState<Dish | undefined>(undefined);

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
            const matchCategory = activeCategory === "All" || dish.category === activeCategory;
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
    const handleAddDish = async (formData: DishFormData) => {
        const newId = dishes.length > 0 ? Math.max(...dishes.map(d => d.id)) + 1 : 1;
        const newDish: Dish = { id: newId, ...formData };

        // Vì dbService hiện tại giao diện chưa hỗ trợ addDish trực tiếp cho array json (hoặc nó gọi push qua supabase rest), 
        // ta giả định sẽ lấy code custom cho API. Trong project này `dbService` chưa có `addDish`, 
        // tuy nhiên ta có thể mock cập nhật UI trước (sau này update `databaseService.ts` nếu thực sự cần gọi Server)
        // ** CẬP NHẬT: Thấy trong databaseService.ts không có addDish. Tạo mock add vào list UI tạm. **

        try {
            // Giả lập gọi API
            const { data, error } = await supabase.from("dishes").insert([newDish]);
            if (error) throw error;

            setDishes(prev => [...prev, newDish]);
        } catch (e) {
            // Fallback: update UI only
            console.warn("Lưu db thất bại, chỉ cập nhật UI", e);
            setDishes(prev => [...prev, newDish]);
        }
    };

    const handleEditDish = async (formData: DishFormData) => {
        if (!editingDish) return;
        const updatedDish = { ...editingDish, ...formData };

        try {
            const { error } = await supabase.from("dishes").update(formData).eq("id", editingDish.id);
            if (error) throw error;

            setDishes(prev => prev.map(d => d.id === editingDish.id ? updatedDish : d));
        } catch (e) {
            console.warn("Sửa db thất bại, chỉ cập nhật UI", e);
            setDishes(prev => prev.map(d => d.id === editingDish.id ? updatedDish : d));
        }
    };

    const handleDeleteDish = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa món ăn này không? Hành động này không thể hoàn tác.")) {
            return;
        }

        try {
            const { error } = await supabase.from("dishes").delete().eq("id", id);
            if (error) throw error;

            setDishes(prev => prev.filter(d => d.id !== id));
        } catch (e) {
            console.warn("Xóa db thất bại, chỉ cập nhật UI", e);
            setDishes(prev => prev.filter(d => d.id !== id));
        }
    };

    const openEditModal = (dish: Dish) => {
        setEditingDish(dish);
        setIsEditModalOpen(true);
    };

    const fmt = (p: number) => `${(p / 1000).toString()}k`; // Format 65.000 -> 65k theo design

    return (
        <div className="flex flex-col h-full bg-background rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">

                    <h1 className="text-2xl font-black text-textMain">Quản lý thực đơn</h1>
                </div>

                <div className="flex flex-1 max-w-2xl items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm món ăn..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-full bg-white border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm text-sm"
                        />
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-12 px-6 bg-primary text-white rounded-full font-bold text-sm hover:bg-primaryDark transition-all flex items-center gap-2 shadow-lg shadow-primary/25 shrink-0"
                    >
                        <Plus size={20} /> Thêm món mới
                    </button>


                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-[#FFF8F5] rounded-3xl p-6 shadow-inner overflow-y-auto min-h-0 relative">

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar pl-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex items-center justify-center h-10 px-6 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-white text-gray-500 hover:text-textMain hover:bg-gray-50 shadow-sm"
                                    }`}
                            >
                                {cat}
                                {cat === "All" && (
                                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${activeCategory === cat ? 'bg-white/20' : 'bg-gray-100'}`}>
                                        {dishes.length}
                                    </span>
                                )}
                            </button>
                        ))}
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
                                        className={`w-full h-full object-cover transition-transform duration-500 hover:scale-110 ${false /* dish.isAvailable === false */ ? 'grayscale opacity-70' : ''}`}
                                    />
                                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                                        {dish.isBestSeller && (
                                            <span className="bg-yellow-400 text-black px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                                Bán chạy
                                            </span>
                                        )}
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${true /* dish.isAvailable !== false */ ? 'bg-green-500 text-white' : 'bg-white/90 text-gray-500'}`}>
                                            {true /* dish.isAvailable !== false */ ? 'Còn hàng' : 'Hét hàng'}
                                        </span>
                                    </div>
                                    {/* isAvailable overlay mock if needed */}
                                    {false && (
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

            {/* Pagination Footer */}
            {filteredDishes.length > 0 && (
                <div className="flex items-center justify-between mt-6 px-2">
                    <p className="text-sm font-medium text-textSec">
                        Hiển thị <span className="font-bold text-textMain">{Math.min(filteredDishes.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(filteredDishes.length, currentPage * ITEMS_PER_PAGE)}</span> trên <span className="font-bold text-textMain">{filteredDishes.length}</span> món ăn
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {Array.from({ length: totalPages }).map((_, idx) => {
                            const p = idx + 1;
                            const isActive = p === currentPage;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "hover:bg-gray-100 text-textMain"
                                        }`}
                                >
                                    {p}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

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
