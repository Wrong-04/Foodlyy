import { useState, useEffect } from "react";
import {
  Check,
  X,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { dbService } from "../../databaseService";
import { Booking, BookingStatus, Table } from "../../types";

const ITEMS_PER_PAGE = 8;

const STATUS_CONFIG = {
  pending: {
    label: "CHỜ XÁC NHẬN",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  confirmed: {
    label: "ĐÃ XÁC NHẬN",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  cancelled: {
    label: "ĐÃ HỦY",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  completed: {
    label: "ĐÃ HOÀN THÀNH",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

const AdminBookingPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [bookingsData, tablesData] = await Promise.all([
        dbService.getBookings(),
        dbService.getTables(),
      ]);
      setBookings(bookingsData);
      setTables(tablesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: BookingStatus,
    reason?: string,
  ) => {
    if (newStatus === "cancelled" && !reason) {
      setRejectingBookingId(id);
      setShowRejectModal(true);
      return;
    }

    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? { ...booking, status: newStatus, rejectReason: reason }
          : booking,
      ),
    );

    try {
      const updates: Partial<Booking> = { status: newStatus };
      if (reason) updates.rejectReason = reason;
      await dbService.updateBooking(id, updates);
    } catch (error) {
      console.error("Failed to update booking status:", error);
      loadData();
    }

    if (newStatus === "cancelled") {
      setShowRejectModal(false);
      setRejectingBookingId(null);
      setRejectReason("");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    const matchesTable =
      tableFilter === "all" || booking.tableId === tableFilter;
    return matchesSearch && matchesStatus && matchesTable;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, tableFilter]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-textMain mb-1">
            Quản lý đặt bàn
          </h2>
          <p className="text-textSec text-sm">
            {filteredBookings.length} / {bookings.length} đặt bàn
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search
            size={16}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm theo tên, sđt, hoặc ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-4 h-12 rounded-2xl bg-white border border-gray-100 text-sm outline-none focus:ring-4 focus:ring-primary/10 shadow-sm transition-all placeholder:text-gray-300 font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-11 shadow-sm">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm font-bold text-textMain outline-none min-w-[124px]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-11 shadow-sm">
            <Filter size={14} className="text-gray-400" />
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-textMain outline-none min-w-[124px]"
            >
              <option value="all">Tất cả các bàn</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Khách hàng</th>
                <th className="px-5 py-3 font-semibold">Thời gian</th>
                <th className="px-5 py-3 font-semibold text-center">
                  Bàn & Số khách
                </th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 uppercase text-[11px] tracking-tight">
              {filteredBookings.length > 0 ? (
                paginatedBookings.map((booking) => {
                  const statusConfig = STATUS_CONFIG[booking.status];
                  const tableName =
                    tables.find((t) => t.id === booking.tableId)?.name || "N/A";

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      <td className="px-5 py-5 font-black text-primary border-l-4 border-transparent group-hover:border-primary transition-all">
                        #{booking.id.split("-")[1]}
                      </td>
                      <td className="px-5 py-5">
                        <div className="font-bold text-textMain">
                          {booking.name}
                        </div>
                        <div className="text-textSec mt-1">{booking.phone}</div>
                        {booking.specialRequests && (
                          <div className="text-[10px] text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded mt-1 border border-orange-100">
                            NOTE: {booking.specialRequests}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-textMain font-bold">
                          <Calendar size={14} className="text-primary" />{" "}
                          {booking.date}
                        </div>
                        <div className="flex items-center gap-2 font-medium text-textSec mt-1">
                          <Clock size={14} className="text-primary" />{" "}
                          {booking.time}
                        </div>
                        {booking.status === "cancelled" &&
                          booking.rejectReason && (
                            <div className="text-[10px] text-red-600 bg-red-50 inline-block px-2 py-1 rounded mt-1 border border-red-100 italic">
                              Lý do hủy: {booking.rejectReason}
                            </div>
                          )}
                      </td>
                      <td className="px-5 py-5 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="inline-flex items-center justify-center gap-1.5 bg-gray-50 text-textSec border border-gray-100 px-3 py-1 rounded-lg font-bold">
                            <Users size={14} /> {booking.guests}
                          </div>
                          <div className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                            {tableName}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm border ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(booking.id, "confirmed")
                                }
                                className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white flex items-center justify-center transition-colors"
                                title="Confirm Booking"
                              >
                                <Check size={16} strokeWidth={3} />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(booking.id, "cancelled")
                                }
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                                title="Cancel Booking"
                              >
                                <X size={16} strokeWidth={3} />
                              </button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() =>
                                handleStatusChange(booking.id, "completed")
                              }
                              className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-colors"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-textSec"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Calendar size={48} className="text-gray-300 mb-4" />
                      <p className="text-[14px] font-bold text-textMain block mb-1 normal-case">
                        No reservations found
                      </p>
                      <p className="normal-case text-[12px] opacity-70">
                        Try adjusting your search criteria or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBookings.length > 0 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-textSec uppercase tracking-widest">
            Hiển thị{" "}
            <span className="text-primary">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            -{" "}
            <span className="text-primary">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)}
            </span>{" "}
            của <span className="text-primary">{filteredBookings.length}</span>{" "}
            đặt bàn
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Từ chối đặt bàn
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingBookingId(null);
                  setRejectReason("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Lý do từ chối
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="VD: Hết bàn trống, sai số điện thoại..."
                className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none text-sm"
              />
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingBookingId(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() =>
                  rejectingBookingId &&
                  handleStatusChange(
                    rejectingBookingId,
                    "cancelled",
                    rejectReason || "Không có lý do",
                  )
                }
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingPage;
