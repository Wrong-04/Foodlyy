import React, { useState, useEffect } from "react";
import { Trash2, Search, Filter, ChevronLeft, ChevronRight, User as UserIcon, Mail, Shield, ShieldAlert, Pencil, Check, X } from "lucide-react";
import { dbService } from "../../databaseService";
import { User, UserRole } from "../../types";

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [editRole, setEditRole] = useState<UserRole>("customer");
    const ITEMS_PER_PAGE = 8;

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const data = await dbService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách người dùng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "All" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.")) {
            return;
        }

        try {
            await dbService.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            alert("Không thể xóa người dùng. Vui lòng thử lại.");
        }
    };

    const handleSaveRole = async (userId: number) => {
        try {
            await dbService.updateUser(userId, { role: editRole });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: editRole } : u));
            setEditingUserId(null);
        } catch (error) {
            console.error("Lỗi khi cập nhật vai trò:", error);
            alert("Không thể cập nhật vai trò. Vui lòng thử lại.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-extrabold text-textMain mb-1">
                        Quản lý tài khoản
                    </h2>
                    <p className="text-textSec text-sm">Tổng cộng {users.length} người dùng</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-2xl">
                    <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email người dùng..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-4 h-12 rounded-2xl bg-white border border-gray-100 text-sm outline-none focus:ring-4 focus:ring-primary/10 shadow-sm transition-all placeholder:text-gray-300 font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-11 shadow-sm">
                    <Filter size={14} className="text-gray-400" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-transparent border-none text-sm font-bold text-textMain outline-none min-w-[124px] cursor-pointer"
                    >
                        <option value="All">Tất cả vai trò</option>
                        <option value="admin">Quản trị viên (Admin)</option>
                        <option value="customer">Khách hàng (Customer)</option>
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Người dùng</th>
                                    <th className="px-6 py-4 font-semibold">Email</th>
                                    <th className="px-6 py-4 font-semibold">Vai trò</th>
                                    <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 tracking-tight">
                                {paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-orange-100 text-primary' : 'bg-blue-100 text-blue-600'}`}>
                                                    <UserIcon size={20} />
                                                </div>
                                                <span className="font-bold text-textMain">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-textSec font-medium">
                                                <Mail size={14} />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {editingUserId === user.id ? (
                                                <select
                                                    value={editRole}
                                                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                                                    className="text-xs rounded-lg border border-gray-200 px-2 py-1 outline-none focus:ring-2 focus:ring-primary bg-white font-bold"
                                                >
                                                    <option value="customer">Khách hàng</option>
                                                    <option value="admin">Quản trị viên</option>
                                                </select>
                                            ) : (
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${user.role === 'admin'
                                                    ? 'bg-orange-100 text-orange-700 border-orange-200'
                                                    : 'bg-blue-100 text-blue-700 border-blue-200'
                                                    }`}>
                                                    {user.role === 'admin' ? <ShieldAlert size={12} /> : <Shield size={12} />}
                                                    {user.role === 'admin' ? "Quản trị viên" : "Khách hàng"}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                {editingUserId === user.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveRole(user.id)}
                                                            className="text-green-600 hover:text-green-700 p-2 rounded-xl hover:bg-green-50 transition-all"
                                                            title="Lưu thay đổi"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUserId(null)}
                                                            className="text-gray-400 hover:text-gray-500 p-2 rounded-xl hover:bg-gray-100 transition-all"
                                                            title="Hủy"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingUserId(user.id);
                                                                setEditRole(user.role);
                                                            }}
                                                            className="text-blue-500 hover:text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition-all"
                                                            title="Đổi vai trò"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-red-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all"
                                                            title="Xóa người dùng"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-textSec font-medium">
                                            Không tìm thấy người dùng nào phù hợp.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-textSec uppercase tracking-widest">
                        Hiển thị <span className="text-primary">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> -{" "}
                        <span className="text-primary">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> của{" "}
                        <span className="text-primary">{filteredUsers.length}</span> người dùng
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-primary/30 group"
                        >
                            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div className="flex gap-1.5">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                        : "bg-gray-50 text-textSec hover:bg-white hover:border-gray-200 border border-transparent"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-primary/30 group"
                        >
                            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
