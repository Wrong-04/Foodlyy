import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Info,
  Phone,
  Mail,
  User,
  Table as TableIcon,
  AlertCircle,
  ArrowRight,
  Clock3,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Booking, User as UserType } from "../types";
import { dbService } from "../databaseService";

const STATUS_INFO: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: ReactNode;
    desc: string;
  }
> = {
  completed: {
    label: "Đã hoàn thành",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-100",
    icon: <CheckCircle2 size={24} />,
    desc: "Cảm ơn bạn đã ghé thăm Foodly. Hy vọng bạn đã có một bữa ăn ngon miệng!",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    icon: <CheckCircle2 size={24} />,
    desc: "Lịch hẹn của bạn đã được xác nhận. Chúng tôi rất mong được đón tiếp bạn!",
  },
  cancelled: {
    label: "Đã hủy",
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-100",
    icon: <XCircle size={24} />,
    desc: "Yêu cầu đặt bàn này đã bị hủy.",
  },
  pending: {
    label: "Chờ xác nhận",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
    icon: <Clock3 size={24} className="animate-pulse" />,
    desc: "Nhà hàng đang kiểm tra và sẽ sớm xác nhận lịch hẹn của bạn.",
  },
};
const getStatusInfo = (status: string) =>
  STATUS_INFO[status.toLowerCase()] ?? STATUS_INFO.pending;

const DetailItem = ({
  icon,
  label,
  value,
  valueClass = "font-black text-textMain text-lg",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueClass?: string;
}) => (
  <div className="flex gap-5 group">
    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all text-textSec">
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-black text-textSec uppercase tracking-widest mb-1.5 opacity-60">
        {label}
      </div>
      <div className={valueClass}>{value}</div>
    </div>
  </div>
);

const BookingDetailPage = ({
  currentUser,
}: {
  currentUser: UserType | null;
}) => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) return;
      try {
        const allBookings = await dbService.getBookings();
        const found = allBookings.find((b) => b.id === bookingId);
        if (found) setBooking(found);
      } catch (error) {
        console.error("Failed to load booking:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [bookingId]);

  const handleCancelBooking = async () => {
    if (!booking || booking.status !== "pending") return;
    if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu đặt bàn này không?"))
      return;
    setIsCancelling(true);
    try {
      await dbService.updateBooking(booking.id, { status: "cancelled" });
      setBooking({ ...booking, status: "cancelled" });
      alert("Yêu cầu đặt bàn đã được hủy thành công.");
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Có lỗi xảy ra khi hủy. Vui lòng thử lại.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-sm" />
          <p className="text-textSec font-black animate-pulse">
            Đang tải chi tiết đặt bàn...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md w-full border border-gray-100 flex flex-col items-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertCircle className="text-red-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-textMain mb-3 uppercase tracking-tight">
            Không tìm thấy dữ liệu
          </h2>
          <p className="text-textSec mb-10 font-medium">
            Xin lỗi, chúng tôi không tìm thấy thông tin cho mã đặt bàn này.
          </p>
          <button
            onClick={() => navigate("/bookings")}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primaryDark transition-all shadow-lg shadow-primary/20 active:scale-95 uppercase tracking-widest text-sm"
          >
            Quay lại lịch sử
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-textSec hover:text-primary font-black transition-all group"
          >
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
              <ArrowLeft size={20} strokeWidth={3} />
            </div>
            <span className="uppercase tracking-widest text-xs">Quay lại</span>
          </button>
          <div className="text-right">
            <span className="text-[10px] font-black text-textSec uppercase tracking-widest block mb-1 opacity-60">
              Mã đặt bàn
            </span>
            <span className="text-xl font-black text-textMain tracking-tighter">
              {booking.id}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div
              className={`p-10 rounded-[2.5rem] border shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
            >
              <div
                className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-md bg-white shrink-0 ${statusInfo.color}`}
              >
                {statusInfo.icon}
              </div>
              <div className="flex-1">
                <div
                  className={`text-2xl font-black uppercase tracking-wider mb-2 ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </div>
                <p className="text-textMain/80 font-bold leading-relaxed">
                  {statusInfo.desc}
                </p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
                  <TableIcon className="text-primary" size={24} />
                </div>
                <h2 className="text-2xl font-black text-textMain uppercase tracking-tighter">
                  Chi tiết đặt chỗ
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-10">
                  <DetailItem
                    icon={<Calendar size={22} />}
                    label="Ngày đặt"
                    value={booking.date}
                  />
                  <DetailItem
                    icon={<Users size={22} />}
                    label="Số khách"
                    value={`${booking.guests} người`}
                  />
                </div>
                <div className="space-y-10">
                  <DetailItem
                    icon={<Clock size={22} />}
                    label="Giờ đặt"
                    value={booking.time}
                  />
                  <DetailItem
                    icon={<TableIcon size={22} />}
                    label="Bàn số"
                    value={booking.tableId}
                    valueClass="font-black text-primary text-xl"
                  />
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-12 pt-10 border-t border-gray-50">
                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 font-black text-primary">
                      !
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-textSec uppercase tracking-widest mb-2 opacity-60">
                        Yêu cầu đặc biệt
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 italic text-textSec font-medium leading-relaxed">
                        "{booking.specialRequests}"
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12 pt-8 text-center border-t-2 border-dashed border-gray-100">
                <p className="text-[10px] font-black text-textSec uppercase tracking-widest mb-1">
                  Thời gian tạo
                </p>
                <p className="text-sm font-bold text-textMain/60">
                  {booking.createdAt
                    ? new Date(booking.createdAt).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-sm font-black text-textMain uppercase tracking-widest mb-8 flex items-center gap-3 border-b border-gray-50 pb-5">
                <User size={18} className="text-primary" /> Người đặt
              </h3>
              <div className="space-y-6">
                {[
                  {
                    icon: <User size={18} />,
                    label: "Họ tên",
                    value: booking.name,
                  },
                  {
                    icon: <Phone size={18} />,
                    label: "Điện thoại",
                    value: booking.phone,
                  },
                  ...(booking.email
                    ? [
                        {
                          icon: <Mail size={18} />,
                          label: "Email",
                          value: booking.email,
                        },
                      ]
                    : []),
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-textSec shrink-0">
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-black text-textSec uppercase tracking-widest mb-0.5 opacity-60">
                        {label}
                      </div>
                      <div className="font-black text-textMain text-sm truncate">
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {booking.status === "pending" && (
                <button
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="w-full bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 hover:border-red-200 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
                >
                  {isCancelling ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent" />
                  ) : (
                    <XCircle size={18} />
                  )}
                  {isCancelling ? "Đang xử lý..." : "Hủy đặt bàn"}
                </button>
              )}
              <button
                onClick={() => navigate("/menu")}
                className="w-full bg-primary hover:bg-primaryDark text-white py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group active:scale-95"
              >
                Đặt món ăn ngay
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-3">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700/80 font-bold leading-relaxed">
                  Lịch hẹn chỉ có thể hủy khi đang ở trạng thái{" "}
                  <span className="text-amber-600 underline">Chờ xác nhận</span>
                  . Sau khi xác nhận, vui lòng liên hệ hotline để được hỗ trợ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
