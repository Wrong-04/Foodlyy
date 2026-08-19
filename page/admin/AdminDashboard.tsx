import { useState, useEffect } from "react";
import { ClipboardList, DollarSign, Users, TrendingUp } from "lucide-react";
import { dbService } from "../../databaseService";
import { OrderStatus, Order, Dish, User } from "../../types";

const fmt = (p: number) => `${p.toLocaleString("vi-VN")}đ`;

const STATUS_COLORS: Record<OrderStatus, string> = {
  Completed: "bg-green-100 text-green-700",
  Cooking: "bg-orange-100 text-orange-700",
  Pending: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedOrders, loadedDishes, loadedUsers] = await Promise.all([
          dbService.getOrders(),
          dbService.getDishes(),
          dbService.getUsers(),
        ]);
        setOrders(loadedOrders);
        setDishes(loadedDishes);
        setUsers(loadedUsers);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = [
    {
      label: "Tổng đơn hàng",
      val: orders.length,
      icon: ClipboardList,
      color: "text-primary",
      bg: "bg-primary/10",
      change: "+12.5%",
    },
    {
      label: "Doanh thu",
      val: fmt(orders.reduce((s, o) => s + o.total, 0)),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
      change: "+8.2%",
    },
    {
      label: "Số món ăn",
      val: dishes.length,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-100",
      change: "",
    },
    {
      label: "Khách hàng",
      val: users.filter((u) => u.role === "customer").length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      change: "+15.3%",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-textMain mb-1">Dashboard</h2>
        <p className="text-textSec text-sm">Tổng quan hoạt động nhà hàng hôm nay</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                <s.icon size={22} />
              </div>
              {s.change && (
                <span className={`${s.color} text-xs font-bold bg-white border border-gray-100 px-2 py-1 rounded-lg`}>
                  {s.change}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            <p className="text-2xl font-extrabold text-textMain mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-textMain">Đơn hàng gần đây</h3>
          <TrendingUp size={18} className="text-primary" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {["ID", "Khách hàng", "Loại", "Tổng tiền", "Trạng thái"].map((h) => (
                  <th key={h} className="px-6 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{order.id}</td>
                  <td className="px-6 py-4 font-medium">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-500 uppercase text-xs">
                    {order.deliveryOption === 'takeaway' ? 'Mang đi' : 'Giao hàng'}
                  </td>
                  <td className="px-6 py-4 font-bold">{fmt(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
