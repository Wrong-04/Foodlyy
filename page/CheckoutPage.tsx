import React, { useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Bell,
  DollarSign,
  Info,
  Package,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartItem, User, Order } from "../types";
import { dbService } from "../databaseService";

interface CheckoutPageProps {
  cart: CartItem[];
  currentUser: User | null;
  onCheckoutSuccess?: () => void;
}

const CheckoutPage = ({
  cart,
  currentUser,
  onCheckoutSuccess,
}: CheckoutPageProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<"takeaway" | "delivery">(
    "delivery"
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryOption === "delivery" ? 30000 : 0;
  const finalTotal = total + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      navigate("/cart");
      return;
    }

    if (deliveryOption === "delivery") {
      const trimmedPhone = phone.trim();
      const trimmedAddress = address.trim();
      const phoneRegex = /^(0\d{9,10})$/;

      if (!phoneRegex.test(trimmedPhone)) {
        alert("Vui lòng nhập số điện thoại hợp lệ (10-11 số và bắt đầu bằng 0).");
        return;
      }

      if (trimmedAddress.length < 5) {
        alert("Vui lòng nhập địa chỉ giao hàng chi tiết hơn.");
        return;
      }
    }

    setIsProcessing(true);

    // Create new order
    const orderId = `ORD-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      userId: currentUser.id,
      customer: currentUser.name,
      items: cart,
      address: deliveryOption === "delivery" ? address : "Tại cửa hàng",
      phone: phone || null,
      paymentMethod,
      deliveryOption,
      total: finalTotal,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    try {
      await dbService.addOrder(newOrder);

      // Clear cart
      if (onCheckoutSuccess) {
        onCheckoutSuccess();
      }

      // Success animation delay
      setTimeout(() => {
        setIsProcessing(false);
        navigate(`/orders/${orderId}`);
      }, 1500);
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại.");
      setIsProcessing(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-primary/10 text-center max-w-md w-full border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <Bell className="text-primary w-12 h-12 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-textMain mb-3 uppercase tracking-tight">Yêu cầu đăng nhập</h2>
          <p className="text-textSec mb-10 font-medium px-4">Vui lòng đăng nhập để có thể tiếp tục quá trình đặt hàng và nhận ưu đãi từ Foodly.</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-5 bg-primary text-white font-black rounded-2xl hover:bg-primaryDark transition-all shadow-xl shadow-primary/30 active:scale-95 uppercase tracking-widest text-sm"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/cart")}
              className="p-4 bg-white hover:bg-primary hover:text-white text-gray-400 rounded-2xl shadow-sm border border-gray-100 transition-all group flex items-center justify-center"
            >
              <ArrowLeft size={24} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Thanh toán an toàn</span>
              </div>
              <h1 className="text-5xl font-black text-textMain tracking-tighter uppercase italic">Xác nhận đơn</h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-green-500" size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black text-green-600 uppercase tracking-widest">SSL Encrypted</div>
              <div className="text-sm font-black text-textMain">Bảo mật thông tin 100%</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Main Form Area */}
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">

            {/* Delivery Option Selection */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />

              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
                  <Truck className="text-primary" size={24} />
                </div>
                <h2 className="text-2xl font-black text-textMain uppercase tracking-tighter">Cách bạn nhận món</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                <button
                  onClick={() => setDeliveryOption("delivery")}
                  className={`relative p-8 rounded-[2rem] border-4 transition-all flex flex-col items-center text-center gap-4 ${deliveryOption === "delivery"
                    ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.02]"
                    : "border-gray-50 bg-gray-50/30 hover:border-primary/20 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                    }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${deliveryOption === 'delivery' ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}>
                    <Truck size={32} />
                  </div>
                  <div>
                    <div className="font-black text-textMain text-xl uppercase tracking-tighter">Giao hàng</div>
                    <div className="text-xs text-textSec font-bold mt-1">Đến địa chỉ của bạn</div>
                  </div>
                  {deliveryOption === 'delivery' && (
                    <div className="absolute top-4 right-4 text-primary">
                      <CheckCircle2 size={24} />
                    </div>
                  )}
                  <div className="mt-2 text-primary font-black text-sm">+30.000đ</div>
                </button>

                <button
                  onClick={() => setDeliveryOption("takeaway")}
                  className={`relative p-8 rounded-[2rem] border-4 transition-all flex flex-col items-center text-center gap-4 ${deliveryOption === "takeaway"
                    ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.02]"
                    : "border-gray-50 bg-gray-50/30 hover:border-primary/20 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                    }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${deliveryOption === 'takeaway' ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}>
                    <ShoppingBag size={32} />
                  </div>
                  <div>
                    <div className="font-black text-textMain text-xl uppercase tracking-tighter">Tự lấy món</div>
                    <div className="text-xs text-textSec font-bold mt-1">Tại cửa hàng</div>
                  </div>
                  {deliveryOption === 'takeaway' && (
                    <div className="absolute top-4 right-4 text-primary">
                      <CheckCircle2 size={24} />
                    </div>
                  )}
                  <div className="mt-2 text-green-500 font-black text-sm italic">MIỄN PHÍ</div>
                </button>
              </div>

              {/* Delivery Inputs */}
              <div className={`space-y-6 transition-all duration-500 ${deliveryOption === 'delivery' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-textSec uppercase tracking-[0.2em] ml-2">Số điện thoại</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-focus-within:text-primary transition-colors">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="09xx xxx xxx"
                        className="w-full pl-20 pr-6 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-textMain placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-textSec uppercase tracking-[0.2em] ml-2">Địa chỉ nhận món</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-focus-within:text-primary transition-colors">
                        <MapPin size={18} />
                      </div>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Số nhà, tên đường..."
                        className="w-full pl-20 pr-6 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-textMain placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {deliveryOption === 'takeaway' && (
                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4 animate-in fade-in duration-500">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                    <Info className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <div className="font-black text-blue-800 text-sm uppercase tracking-tight">Thông báo tự lấy món</div>
                    <p className="text-xs text-blue-600 font-bold mt-1 leading-relaxed">Vui lòng đến địa chỉ cửa hàng để nhận món sau 20phút kể từ khi xác nhận đơn.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment & Note */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Payment */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner">
                    <CreditCard className="text-primary" size={20} />
                  </div>
                  <h2 className="text-xl font-black text-textMain uppercase tracking-tighter">Thanh toán</h2>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`w-full p-5 rounded-2xl border-4 flex items-center gap-4 transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-gray-50 bg-gray-50/30'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${paymentMethod === 'cash' ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}>
                      <DollarSign size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-black text-textMain uppercase text-xs tracking-tight">Tiền mặt</div>
                      <div className="text-[10px] text-textSec font-bold">Trả khi nhận món</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`w-full p-5 rounded-2xl border-4 flex items-center gap-4 transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-50 bg-gray-50/30'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${paymentMethod === 'card' ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}>
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-black text-textMain uppercase text-xs tracking-tight">Thẻ / Ví</div>
                      <div className="text-[10px] text-textSec font-bold italic">Sắp ra mắt</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Note */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner">
                    <ClipboardList className="text-primary" size={20} />
                  </div>
                  <h2 className="text-xl font-black text-textMain uppercase tracking-tighter">Lời nhắn</h2>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú cho bếp hoặc shipper..."
                  className="flex-1 w-full p-6 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary outline-none transition-all font-bold text-textMain placeholder:text-gray-300 resize-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Receipt-style Summary */}
          <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-primary/10 border border-gray-100 overflow-hidden relative">
              {/* Receipt Top Pattern */}
              <div className="h-4 bg-primary flex overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="flex-1 h-5 bg-background rounded-full -mt-3 shadow-inner" />
                ))}
              </div>

              <div className="p-10 pt-12">
                <div className="text-center mb-10 pb-10 border-b-2 border-dashed border-gray-100 relative">
                  <div className="absolute -bottom-[1px] left-0 translate-y-1/2 w-8 h-8 bg-background rounded-full -ml-14 border-r border-gray-100" />
                  <div className="absolute -bottom-[1px] right-0 translate-y-1/2 w-8 h-8 bg-background rounded-full -mr-14 border-l border-gray-100" />
                  <h3 className="text-3xl font-black text-textMain tracking-tighter uppercase italic mb-2">Hóa đơn tạm</h3>
                  <div className="text-[10px] font-black text-textSec uppercase tracking-[0.4em]">Foodly Restaurant</div>
                </div>

                {/* Product List */}
                <div className="space-y-6 mb-10 max-h-[320px] overflow-y-auto pr-4 no-scrollbar">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                        </div>
                        <div>
                          <div className="font-black text-textMain text-sm line-clamp-1">{item.name}</div>
                          <div className="text-[10px] font-black text-textSec flex items-center gap-2 mt-1">
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full">{item.quantity}x</span>
                            <span>{item.price.toLocaleString("vi-VN")}đ</span>
                          </div>
                        </div>
                      </div>
                      <div className="font-black text-textMain text-sm tracking-tight">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</div>
                    </div>
                  ))}
                  {cart.length === 0 && (
                    <div className="text-center py-10">
                      <Package className="mx-auto text-gray-200 mb-2" size={40} />
                      <p className="text-xs font-black text-textSec uppercase tracking-widest">Giỏ hàng trống</p>
                    </div>
                  )}
                </div>

                {/* Calculations */}
                <div className="space-y-4 mb-10 pt-8 border-t-2 border-dashed border-gray-100 relative">
                  <div className="absolute -top-[1px] left-0 -translate-y-1/2 w-8 h-8 bg-background rounded-full -ml-14 border-r border-gray-100" />
                  <div className="absolute -top-[1px] right-0 -translate-y-1/2 w-8 h-8 bg-background rounded-full -mr-14 border-l border-gray-100" />

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-textSec uppercase tracking-widest">Tạm tính</span>
                    <span className="font-black text-textMain">{total.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-textSec uppercase tracking-widest">Phí vận chuyển</span>
                    <span className={`font-black ${deliveryFee === 0 ? 'text-green-500' : 'text-textMain'}`}>
                      {deliveryFee > 0 ? `+${deliveryFee.toLocaleString("vi-VN")}đ` : "FREE"}
                    </span>
                  </div>

                  <div className="pt-6 mt-6 border-t-4 border-primary/10">
                    <div className="flex justify-between items-end">
                      <div className="text-[10px] font-black text-orange-950 uppercase tracking-widest mb-1">Tổng thanh toán</div>
                      <div className="text-4xl font-black text-primary tracking-tighter italic">{finalTotal.toLocaleString("vi-VN")}đ</div>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="space-y-4">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || (deliveryOption === "delivery" && (!address || !phone)) || cart.length === 0}
                    className="w-full relative group bg-primary hover:bg-primaryDark disabled:bg-gray-100 disabled:cursor-not-allowed py-6 rounded-[1.5rem] shadow-2xl shadow-primary/30 transition-all active:scale-95 overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                          <span className="text-white font-black uppercase tracking-widest text-sm">Đang bảo mật đơn...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-white font-black uppercase tracking-widest text-sm">Đặt món ngay</span>
                          <ChevronRight className="text-white group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>

                  {deliveryOption === "delivery" && (!address || !phone) && (
                    <div className="flex items-center gap-3 justify-center bg-red-50 p-4 rounded-2xl border border-red-100 animate-pulse">
                      <AlertCircle className="text-red-500 shrink-0" size={16} />
                      <p className="text-[9px] text-red-600 font-black uppercase tracking-widest">
                        Vui lòng nhập SĐT và địa chỉ giao hàng
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-6 pt-4 opacity-40">
                    <div className="px-3 py-1 border-2 border-gray-200 rounded-lg text-[8px] font-black uppercase tracking-widest">Visa</div>
                    <div className="px-3 py-1 border-2 border-gray-200 rounded-lg text-[8px] font-black uppercase tracking-widest">Momo</div>
                    <div className="px-3 py-1 border-2 border-gray-200 rounded-lg text-[8px] font-black uppercase tracking-widest">Cash</div>
                  </div>
                </div>
              </div>

              {/* Receipt Bottom Pattern */}
              <div className="h-4 flex overflow-hidden -mt-2">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="flex-1 h-5 bg-background rounded-full mt-2 shadow-inner" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Footer */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
              <Truck className="text-primary" size={24} />
            </div>
            <div>
              <div className="font-black text-textMain text-xs uppercase tracking-tight">Giao hàng cực nhanh</div>
              <div className="text-[10px] text-textSec font-bold mt-0.5">Thời gian trung bình 30 phút</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="text-green-500" size={24} />
            </div>
            <div>
              <div className="font-black text-textMain text-xs uppercase tracking-tight">Kinh doanh uy tín</div>
              <div className="text-[10px] text-textSec font-bold mt-0.5">Đảm bảo an toàn vệ sinh</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
              <Package className="text-blue-500" size={24} />
            </div>
            <div>
              <div className="font-black text-textMain text-xs uppercase tracking-tight">Đóng gói cẩn thận</div>
              <div className="text-[10px] text-textSec font-bold mt-0.5">Giữ nhiệt và độ tươi ngon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
