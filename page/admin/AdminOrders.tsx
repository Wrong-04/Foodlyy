import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  Download,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dbService } from "../../databaseService";
import { Order, OrderStatus } from "../../types";

const fmt = (p: number) => `${p.toLocaleString("vi-VN")}đ`;

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  Pending: {
    label: "Chờ xác nhận",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Cooking: {
    label: "Đang chế biến",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  Completed: {
    label: "Đã hoàn thành",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  Cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700 border-red-200",
  },
};

const ITEMS_PER_PAGE = 8;

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>("Pending");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter]);

  const loadOrders = async () => {
    try {
      setOrders(await dbService.getOrders());
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    const matchesType =
      typeFilter === "All" ||
      (typeFilter === "Takeaway" && o.deliveryOption === "takeaway") ||
      (typeFilter === "Delivery" && o.deliveryOption === "delivery");
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xóa đơn hàng này?")) return;
    try {
      await dbService.deleteOrder(id);
      loadOrders();
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Không thể xóa đơn hàng. Vui lòng thử lại.");
    }
  };

  const handleSaveStatus = async (id: string) => {
    try {
      await dbService.updateOrder(id, { status: editStatus });
      loadOrders();
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("Không thể cập nhật đơn hàng. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-textMain mb-1">
            Quản lý đơn hàng
          </h2>
          <p className="text-textSec text-sm">
            {filtered.length} / {orders.length} đơn hàng
          </p>
        </div>
        <button
          onClick={() => dbService.export()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-textMain font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
        >
          <Download size={16} /> Export DB
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search
            size={16}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 h-12 rounded-2xl bg-white border border-gray-100 text-sm outline-none focus:ring-4 focus:ring-primary/10 shadow-sm transition-all placeholder:text-gray-300 font-medium"
          />
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {[
            {
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                ["All", "Tất cả trạng thái"],
                ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label]),
              ],
            },
            {
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                ["All", "Tất cả hình thức"],
                ["Takeaway", "Mang đi"],
                ["Delivery", "Giao hàng"],
              ],
            },
          ].map(({ value, onChange, options }, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-11 shadow-sm"
            >
              <Filter size={14} className="text-gray-400" />
              <select
                value={value as string}
                onChange={(e) =>
                  (onChange as (v: string) => void)(e.target.value)
                }
                className="bg-transparent border-none text-sm font-bold text-textMain outline-none min-w-[124px]"
              >
                {(options as string[][]).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {[
                  "ID",
                  "Khách hàng",
                  "Loại",
                  "Tổng tiền",
                  "Trạng thái",
                  "Hành động",
                ].map((h) => (
                  <th key={h} className="px-5 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 uppercase text-[11px] tracking-tight">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    <td className="px-5 py-5 font-black text-primary border-l-4 border-transparent group-hover:border-primary transition-all">
                      {o.id}
                    </td>
                    <td className="px-5 py-5 font-bold text-textMain">
                      {o.customer}
                    </td>
                    <td className="px-5 py-5 font-bold text-textSec">
                      {o.deliveryOption === "takeaway"
                        ? "MANG ĐI"
                        : "GIAO HÀNG"}
                    </td>
                    <td className="px-5 py-5 font-black text-textMain">
                      {fmt(o.total)}
                    </td>
                    <td className="px-5 py-4">
                      {editingId === o.id ? (
                        <select
                          value={editStatus}
                          onChange={(e) =>
                            setEditStatus(e.target.value as OrderStatus)
                          }
                          className="text-xs rounded-lg border border-gray-200 px-2 py-1 outline-none focus:ring-2 focus:ring-primary bg-white font-bold"
                        >
                          {Object.entries(STATUS_CONFIG).map(
                            ([key, { label }]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                      ) : (
                        <span
                          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm border ${STATUS_CONFIG[o.status].color}`}
                        >
                          {STATUS_CONFIG[o.status].label}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {editingId === o.id ? (
                          <>
                            <button
                              onClick={() => handleSaveStatus(o.id)}
                              className="text-green-600 hover:text-green-700 p-1.5 rounded-lg hover:bg-green-50 transition-all"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-400 hover:text-gray-500 p-1.5 rounded-lg hover:bg-gray-100 transition-all"
                            >
                              <X size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => navigate(`/orders/${o.id}`)}
                              className="text-primary hover:text-primaryDark p-1.5 rounded-lg hover:bg-orange-50 transition-all"
                              title="Xem chi tiết"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(o.id);
                                setEditStatus(o.status);
                              }}
                              className="text-blue-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-all"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(o.id)}
                              className="text-red-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-textSec"
                  >
                    Không tìm thấy đơn hàng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-textSec uppercase tracking-widest">
            Hiển thị{" "}
            <span className="text-primary">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            -{" "}
            <span className="text-primary">
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
            </span>{" "}
            của <span className="text-primary">{filtered.length}</span> đơn hàng
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-primary/30 group"
            >
              <ChevronLeft
                size={18}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </button>
            <div className="flex gap-1.5">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "bg-gray-50 text-textSec hover:bg-white hover:border-gray-200 border border-transparent"}`}
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
              <ChevronRight
                size={18}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
