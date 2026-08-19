import React, { useState, useEffect } from "react";
import { Package, Calendar, DollarSign, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { Order, User as UserType } from "../types";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { dbService } from "../databaseService";

const OrderHistoryPage = ({ currentUser }: { currentUser: UserType | null }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    if (!currentUser) return <Navigate to="/login" replace />;

    useEffect(() => {
        if (!currentUser) return;

        setLoading(true);
        const loadOrders = async () => {
            try {
                // Load orders from database
                const allOrders = await dbService.getOrders();
                // Filter orders by current user
                const userOrders = allOrders.filter(
                    (order) => order.customer === currentUser.name
                );
                // Sort by ID (newest first)
                userOrders.sort((a, b) => b.id.localeCompare(a.id));
                setOrders(userOrders);
            } catch (error) {
                console.error("Failed to load orders:", error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [currentUser, location.pathname]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-700 border-green-200";
            case "Pending":
            case "Cooking":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "Cancelled":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Completed":
                return <CheckCircle2 size={16} className="mr-1" />;
            case "Pending":
            case "Cooking":
                return <Clock size={16} className="mr-1" />;
            default:
                return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "Completed": return "Hoàn thành";
            case "Pending": return "Chờ xử lý";
            case "Cooking": return "Đang nấu";
            case "Cancelled": return "Đã hủy";
            default: return status;
        }
    };

    return (
        <div className="min-h-[80vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-textMain tracking-tight">Lịch sử đơn hàng</h1>
                        <p className="text-textSec mt-2">Xem lại các món ăn bạn đã đặt gần đây</p>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-2xl">
                        <Package className="text-primary w-8 h-8" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/orders/${order.id}`)}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 md:items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                        <Package className="text-gray-400 group-hover:text-primary transition-colors" size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-textMain">{order.id}</h3>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                        <p className="text-textSec text-sm flex items-center gap-1">
                                            <span>Loại: {order.deliveryOption === 'delivery' ? 'Giao hàng' : 'Mang đi'}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                    <div className="text-left md:text-right">
                                        <p className="text-sm font-semibold text-textSec mb-1">Tổng tiền</p>
                                        <p className="text-xl font-bold text-primary">
                                            {order.total.toLocaleString("vi-VN")}đ
                                        </p>
                                    </div>
                                    <button className="flex items-center justify-center p-3 rounded-xl bg-gray-50 text-gray-500 border border-gray-100 hover:bg-primary hover:text-white hover:border-primary transition-colors">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="text-gray-300 w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-textMain mb-2">Chưa có đơn hàng nào</h3>
                        <p className="text-textSec mb-8 max-w-md mx-auto">Bạn chưa đặt món ăn nào. Hãy khám phá thực đơn của chúng tôi và đặt những món ăn tuyệt vời nhất.</p>
                        <button
                            onClick={() => navigate('/menu')}
                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primaryDark transition-all"
                        >
                            Khám phá thực đơn
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;
