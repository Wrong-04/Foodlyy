import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    MapPin,
    Phone,
    CreditCard,
    ShoppingBag,
    ChevronRight,
    AlertCircle,
    Truck,
    ArrowRight,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Order, User } from "../types";
import { dbService } from "../databaseService";

const OrderDetailPage = ({ currentUser }: { currentUser: User | null }) => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        const loadOrder = async () => {
            if (!orderId) return;
            try {
                const allOrders = await dbService.getOrders();
                const found = allOrders.find((o) => o.id === orderId);
                if (found) {
                    setOrder(found);
                }
            } catch (error) {
                console.error("Failed to load order:", error);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [orderId]);

    const handleCancelOrder = async () => {
        if (!order || order.status !== "Pending") return;

        const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?");
        if (!confirmCancel) return;

        setIsCancelling(true);
        try {
            await dbService.updateOrder(order.id, { status: "Cancelled" });
            setOrder({ ...order, status: "Cancelled" });
            alert("Đơn hàng đã được hủy thành công.");
            navigate("/");
        } catch (error) {
            console.error("Failed to cancel order:", error);
            alert("Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại.");
        } finally {
            setIsCancelling(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "Completed":
                return {
                    label: "Đã hoàn thành",
                    color: "text-green-500",
                    bgColor: "bg-green-50",
                    borderColor: "border-green-100",
                    icon: <CheckCircle2 size={20} />,
                    desc: "Đơn hàng đã được giao thành công. Chúc bạn ngon miệng!",
                };
            case "Cooking":
                return {
                    label: "Đang chế biến",
                    color: "text-blue-500",
                    bgColor: "bg-blue-50",
                    borderColor: "border-blue-100",
                    icon: <ShoppingBag size={20} className="animate-pulse" />,
                    desc: "Đầu bếp đang chuẩn bị món ăn của bạn với tất cả tâm huyết.",
                };
            case "Cancelled":
                return {
                    label: "Đã hủy",
                    color: "text-red-500",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-100",
                    icon: <XCircle size={20} />,
                    desc: "Đơn hàng này đã bị hủy.",
                };
            default:
                return {
                    label: "Chờ xác nhận",
                    color: "text-amber-500",
                    bgColor: "bg-amber-50",
                    borderColor: "border-amber-100",
                    icon: <Clock size={20} className="animate-spin-slow" />,
                    desc: "Hệ thống đang tiếp nhận và xác thực đơn hàng của bạn.",
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                    <p className="text-textSec font-bold animate-pulse">Đang tải chi tiết đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="text-red-500 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-textMain mb-2">Không tìm thấy đơn hàng</h2>
                    <p className="text-textSec mb-8">Xin lỗi, chúng tôi không tìm thấy thông tin cho mã đơn hàng này.</p>
                    <button
                        onClick={() => navigate("/orders")}
                        className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primaryDark transition-all"
                    >
                        QUAY LẠI LỊCH SỬ
                    </button>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-textSec hover:text-primary font-bold transition-colors group"
                    >
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all">
                            <ArrowLeft size={18} />
                        </div>
                        <span>Quay lại</span>
                    </button>
                    <div className="text-right">
                        <span className="text-xs font-black text-textSec uppercase tracking-widest block mb-1">Mã đơn hàng</span>
                        <span className="text-lg font-black text-textMain">{order.id}</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Status Card */}
                        <div className={`p-8 rounded-[2rem] border-2 shadow-sm ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-white ${statusInfo.color}`}>
                                    {statusInfo.icon}
                                </div>
                                <div className="flex-1">
                                    <div className={`text-xl font-black uppercase tracking-wider ${statusInfo.color}`}>{statusInfo.label}</div>
                                    <p className="text-textSec font-medium mt-1">{statusInfo.desc}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Package className="text-primary" size={20} />
                                </div>
                                <h2 className="text-xl font-black text-textMain uppercase tracking-wider">Chi tiết món ăn</h2>
                            </div>

                            <div className="space-y-6">
                                {(order.items || []).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-5 group">
                                        <div className="relative">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                                            />
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-textMain text-lg leading-tight">{item.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-bold text-textSec px-2 py-0.5 bg-gray-100 rounded-md">x{item.quantity}</span>
                                                <span className="text-sm font-bold text-textSec italic">{(item.price).toLocaleString("vi-VN")}đ / món</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-textMain">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t-4 border-gray-50 border-dashed">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-textSec font-bold">Tạm tính</span>
                                    <span className="font-black text-textMain">{(order.total - (order.deliveryOption === 'delivery' ? 30000 : 0)).toLocaleString("vi-VN")}đ</span>
                                </div>
                                {order.deliveryOption === 'delivery' && (
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-textSec font-bold">Phí giao hàng</span>
                                        <span className="font-black text-textMain">30.000đ</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end">
                                    <span className="text-textSec font-black uppercase text-xs tracking-widest">Tổng cộng</span>
                                    <span className="text-3xl font-black text-primary tracking-tighter">{(order.total).toLocaleString("vi-VN")}đ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Delivery Info */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6" />
                            <h3 className="text-base font-black text-textMain uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                                <Truck size={16} className="text-primary" />
                                Giao đến
                            </h3>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-primary/10 transition-colors">
                                        <Phone size={18} className="text-textSec" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-textSec uppercase tracking-widest mb-0.5">Số điện thoại</div>
                                        <div className="font-bold text-textMain">{order.phone || 'Chưa cung cấp'}</div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-primary/10 transition-colors">
                                        <MapPin size={18} className="text-textSec" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-textSec uppercase tracking-widest mb-0.5">Địa chỉ</div>
                                        <div className="font-bold text-textMain leading-snug">{order.address}</div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-primary/10 transition-colors">
                                        <CreditCard size={18} className="text-textSec" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-textSec uppercase tracking-widest mb-0.5">Thanh toán</div>
                                        <div className="font-bold text-textMain">
                                            {order.paymentMethod === 'card' ? 'Thẻ tín dụng' : 'Tiền mặt'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            {order.status === "Pending" && (
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={isCancelling}
                                    className="w-full bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 hover:border-red-200 py-4 rounded-22px font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isCancelling ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent" />
                                    ) : (
                                        <XCircle size={16} />
                                    )}
                                    {isCancelling ? "Đang xử lý..." : "Hủy đơn hàng"}
                                </button>
                            )}

                            {currentUser?.role === "customer" && (
                                <button
                                    onClick={() => navigate("/menu")}
                                    className="w-full bg-primary hover:bg-primaryDark text-white py-4 rounded-22px font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                                >
                                    Tiếp tục mua sắm
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>

                        {/* Support Box */}
                        <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 flex flex-col items-center text-center">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mb-3 shadow-lg shadow-primary/20">
                                <Phone size={16} />
                            </div>
                            <h4 className="font-black text-textMain text-sm mb-1 uppercase tracking-tight">Cần hỗ trợ?</h4>
                            <p className="text-xs text-textSec font-semibold mb-3">Liên hệ ngay nếu bạn gặp vấn đề với đơn hàng</p>
                            <span className="text-primary font-black text-lg tracking-tighter">1900 8888</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
