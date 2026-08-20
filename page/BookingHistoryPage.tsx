import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  Calendar,
  Clock,
  Users,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
} from "lucide-react";
import { Booking } from "../types";
import { Navigate, useNavigate } from "react-router-dom";
import { dbService } from "../databaseService";
import { useApp } from "../context/AppContext";

const STATUS_INFO: Record<
  string,
  { label: string; color: string; icon: ReactNode }
> = {
  completed: {
    label: "Hoàn thành",
    color: "text-green-600 bg-green-50 border-green-100",
    icon: <CheckCircle2 size={16} />,
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "text-blue-600 bg-blue-50 border-blue-100",
    icon: <CheckCircle2 size={16} />,
  },
  cancelled: {
    label: "Đã hủy",
    color: "text-red-600 bg-red-50 border-red-100",
    icon: <XCircle size={16} />,
  },
  pending: {
    label: "Chờ xác nhận",
    color: "text-amber-600 bg-amber-50 border-amber-100",
    icon: <Clock3 size={16} />,
  },
};
const getStatusInfo = (status: string) =>
  STATUS_INFO[status.toLowerCase()] ?? STATUS_INFO.pending;

const BookingHistoryPage = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  if (!currentUser) return <Navigate to="/login" replace />;

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const allBookings = await dbService.getBookings();
        setBookings(allBookings.filter((b) => b.userId === currentUser.id));
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [currentUser]);

  return (
    <div className="min-h-[80vh] bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-textMain tracking-tight uppercase">
              Lịch sử đặt bàn
            </h1>
            <p className="text-textSec mt-2 font-medium">
              Theo dõi các yêu cầu đặt chỗ của bạn tại Foodly
            </p>
          </div>
          <div className="bg-primary/10 p-4 rounded-2xl shadow-sm border border-primary/5">
            <Calendar className="text-primary w-8 h-8" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-sm" />
            <p className="text-textSec font-bold animate-pulse">
              Đang tải lịch sử...
            </p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid gap-4">
            {bookings.map((booking) => {
              const status = getStatusInfo(booking.status);
              return (
                <div
                  key={booking.id}
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col md:flex-row gap-6 md:items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-start gap-5 flex-1">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                      <div className="text-2xl">🪑</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-black text-lg text-textMain">
                          {booking.id}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${status.color}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {[
                          {
                            icon: (
                              <Calendar size={14} className="text-primary" />
                            ),
                            text: booking.date,
                          },
                          {
                            icon: <Clock size={14} className="text-primary" />,
                            text: booking.time,
                          },
                          {
                            icon: <Users size={14} className="text-primary" />,
                            text: `${booking.guests} người`,
                          },
                        ].map(({ icon, text }) => (
                          <p
                            key={text}
                            className="text-textSec text-sm flex items-center gap-1.5 font-bold"
                          >
                            {icon}
                            {text}
                          </p>
                        ))}
                      </div>
                      {booking.status === "cancelled" &&
                        booking.rejectReason && (
                          <div className="mt-3 bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2 max-w-md">
                            <AlertCircle
                              className="text-red-500 shrink-0 mt-0.5"
                              size={14}
                            />
                            <div className="text-red-600 text-[11px] leading-tight">
                              <span className="font-bold">Lý do hủy:</span>{" "}
                              {booking.rejectReason}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-textSec uppercase tracking-widest mb-1">
                        Bàn số
                      </p>
                      <p className="font-black text-primary text-lg">
                        {booking.tableId}
                      </p>
                    </div>
                    <button className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 border border-gray-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
                      <ChevronRight size={20} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-16 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Calendar className="text-gray-300 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-textMain mb-3 uppercase tracking-tight">
              Chưa có lịch đặt bàn
            </h3>
            <p className="text-textSec mb-10 max-w-sm mx-auto font-medium">
              Bạn chưa thực hiện bất kỳ yêu cầu đặt bàn nào. Hãy đặt ngay để có
              chỗ ngồi tốt nhất!
            </p>
            <button
              onClick={() => navigate("/book-table")}
              className="px-10 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primaryDark transition-all shadow-lg shadow-primary/25 active:scale-95 uppercase tracking-widest text-sm"
            >
              Đặt bàn ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistoryPage;
