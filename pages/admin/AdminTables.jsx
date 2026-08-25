import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Check, X, Users, Compass, Filter } from "lucide-react";
import { dbService } from "../../lib/db";
import Pagination from "../../components/admin/Pagination";

const STATUS_CONFIG = {
  available: {
    label: "🟢 Trống",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
  },
  occupied: {
    label: "🔴 Đang có khách",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
  },
  maintenance: {
    label: "🔧 Bảo trì",
    bg: "bg-gray-100",
    border: "border-gray-300",
    text: "text-gray-600",
  },
};

const STATUS_FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "available", label: "Trống" },
  { key: "occupied", label: "Đang có khách" },
  { key: "maintenance", label: "Bảo trì" },
];

const ITEMS_PER_PAGE = 8;

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    capacity: 4,
    status: "available",
  });
  const [error, setError] = useState("");

  const [bookings, setBookings] = useState([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tablesData, bookingsData] = await Promise.all([
        dbService.getTables(),
        dbService.getBookings()
      ]);
      setTables(tablesData);
      setBookings(bookingsData);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setFormData({
      id: "",
      name: "",
      capacity: 4,
      status: "available",
    });
    setError("");
    setIsEditMode(false);
    setIsOpen(true);
  };

  const openEditModal = (table) => {
    setFormData({
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      status: table.status || "available",
    });
    setEditingId(table.id);
    setError("");
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.id.trim()) {
      setError("Mã số bàn không được để trống.");
      return;
    }
    if (!formData.name.trim()) {
      setError("Tên hiển thị không được để trống.");
      return;
    }
    if (formData.capacity <= 0) {
      setError("Sức chứa bàn phải lớn hơn 0.");
      return;
    }

    try {
      if (isEditMode) {
        await dbService.updateTable(editingId, {
          name: formData.name.trim(),
          capacity: Number(formData.capacity),
          status: formData.status,
        });
        setTables((prev) =>
          prev.map((t) =>
            t.id === editingId
              ? { ...t, name: formData.name.trim(), capacity: Number(formData.capacity), status: formData.status }
              : t
          )
        );
      } else {
        const idExists = tables.some((t) => t.id.toLowerCase() === formData.id.trim().toLowerCase());
        if (idExists) {
          setError("Mã số bàn này đã tồn tại!");
          return;
        }
        const newTable = {
          id: formData.id.trim(),
          name: formData.name.trim(),
          capacity: Number(formData.capacity),
          status: formData.status,
        };
        await dbService.addTable(newTable);
        setTables((prev) => [...prev, newTable]);
      }
      setIsOpen(false);
    } catch (err) {
      console.error("Lỗi khi lưu bàn:", err);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bàn ${tableId} không? Lịch sử đặt bàn liên quan có thể bị ảnh hưởng.`)) {
      return;
    }
    try {
      await dbService.deleteTable(tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId));
    } catch (err) {
      console.error("Lỗi khi xóa bàn:", err);
      alert("Không thể xóa bàn. Vui lòng thử lại.");
    }
  };

  const handleQuickStatusChange = async (tableId, newStatus) => {
    try {
      await dbService.updateTable(tableId, { status: newStatus });
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  // Map tables to include their computed real-time status based on bookings
  const tablesWithStatus = tables.map(t => {
    let computedStatus = t.status;
    if (computedStatus !== "maintenance") {
      // Find if this table has any booking currently "arrived" today
      const today = new Date().toISOString().split('T')[0]; // Simple YYYY-MM-DD
      const hasArrivedBooking = bookings.some(b => 
        b.tableId === t.id && 
        b.status === "arrived" && 
        b.date === today
      );
      computedStatus = hasArrivedBooking ? "occupied" : "available";
    }
    return { ...t, computedStatus };
  });

  const filteredTables = tablesWithStatus.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.computedStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filteredTables.length / ITEMS_PER_PAGE);
  const paginatedTables = filteredTables.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-textMain mb-1">
            Quản lý Bàn ăn
          </h2>
          <p className="text-textSec text-sm">Tổng cộng {tables.length} bàn trong hệ thống</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-primary text-white font-bold h-11 px-6 rounded-xl hover:bg-primaryDark transition-all shadow-md shadow-primary/20 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={18} /> Thêm bàn mới
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên bàn hoặc mã bàn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 h-12 rounded-2xl bg-white border border-gray-100 text-sm outline-none focus:ring-4 focus:ring-primary/10 shadow-sm transition-all placeholder:text-gray-300 font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-12 shadow-sm">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-textMain outline-none min-w-[140px] cursor-pointer"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.key} value={filter.key}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedTables.map((table) => {
            const statusInfo = STATUS_CONFIG[table.computedStatus] || STATUS_CONFIG.available;
            return (
              <div
                key={table.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Status Banner */}
                <div className={`px-5 py-2.5 ${statusInfo.bg} ${statusInfo.border} border-b`}>
                  <span className={`text-xs font-extrabold tracking-wide ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Table Info */}
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Compass size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-textMain">{table.name}</h3>
                      <p className="text-xs text-textSec font-semibold">Mã bàn: {table.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm font-bold text-textSec">
                    <Users size={16} />
                    <span>Sức chứa: {table.capacity} người</span>
                  </div>
                </div>

                {/* Quick Status Change & Actions */}
                <div className="px-6 pb-6 space-y-3">
                  {/* Quick Status Dropdown */}
                  <select
                    value={table.status === "maintenance" ? "maintenance" : "available"}
                    onChange={(e) => handleQuickStatusChange(table.id, e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs font-bold text-textSec bg-gray-50 cursor-pointer outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="available">Sẵn sàng (Tự động cập nhật)</option>
                    <option value="maintenance">🔧 Đang bảo trì</option>
                  </select>

                  {/* Edit / Delete Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => openEditModal(table)}
                      className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-orange-200 text-primary font-bold hover:bg-orange-50 transition-colors text-xs"
                    >
                      <Edit2 size={12} /> Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="flex items-center justify-center gap-1.5 h-10 rounded-xl border border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors text-xs"
                    >
                      <Trash2 size={12} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredTables.length === 0 && (
            <div className="col-span-full py-16 text-center text-textSec font-medium bg-white rounded-3xl border border-gray-100 shadow-sm">
              Không tìm thấy bàn nào phù hợp.
            </div>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTables.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
        </>
      )}

      {/* Add / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-textMain">
                {isEditMode ? "Chỉnh sửa bàn ăn" : "Thêm bàn ăn mới"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-textMain hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMain block">Mã số bàn (Không sửa sau khi tạo)</label>
                <input
                  required
                  type="text"
                  placeholder="VD: T06"
                  value={formData.id}
                  disabled={isEditMode}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-400 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMain block">Tên hiển thị</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Bàn 06"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMain block">Sức chứa (Người)</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="30"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMain block">Trạng thái hiện tại</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm bg-white cursor-pointer font-bold"
                >
                  <option value="available">Sẵn sàng phục vụ (Tự động cập nhật)</option>
                  <option value="maintenance">Bảo trì (Tạm khóa)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 h-11 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 h-11 rounded-xl bg-primary text-white font-bold hover:bg-primaryDark transition-all shadow-md shadow-primary/10 text-sm"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTables;
