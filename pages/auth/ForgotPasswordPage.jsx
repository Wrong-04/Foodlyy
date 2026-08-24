import React, { useState } from "react";
import { UtensilsCrossed, ArrowLeft, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dbService } from "../../lib/db";

const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: Email check, 2: New Password, 3: Success
  const [targetUser, setTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const users = await dbService.getUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        setError("Email này chưa được đăng ký trong hệ thống!");
        setIsSubmitting(false);
        return;
      }
      setTargetUser(user);
      setStep(2);
    } catch (err) {
      setError("Đã xảy ra lỗi khi kiểm tra email. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu mới không khớp!");
      return;
    }
    setIsSubmitting(true);
    try {
      const hashedPassword = await hashPassword(newPassword);
      await dbService.updateUser(targetUser.id, { password: hashedPassword });
      setStep(3);
    } catch (err) {
      setError("Không thể cập nhật mật khẩu mới. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Side Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Nấu ăn"
        />
        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
          <h1 className="text-5xl font-bold mb-4">Đừng lo lắng!</h1>
          <p className="text-xl opacity-90 max-w-md">
            Chúng tôi sẽ giúp bạn lấy lại tài khoản và tiếp tục hành trình ẩm thực ngay lập tức.
          </p>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <button
            type="button"
            className="flex items-center gap-2 mb-8 justify-center lg:justify-start cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="bg-primary p-2 rounded-lg text-white">
              <UtensilsCrossed size={24} />
            </div>
            <span className="text-2xl font-bold text-textMain">Foodly</span>
          </button>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {step < 3 && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    if (step === 2) {
                      setStep(1);
                      setError("");
                    } else {
                      navigate("/login");
                    }
                  }}
                  className="flex items-center text-sm font-semibold text-gray-500 hover:text-primary mb-4 transition-colors"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  {step === 2 ? "Quay lại nhập email" : "Quay lại đăng nhập"}
                </button>
                <h2 className="text-2xl font-bold text-center">
                  {step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
                </h2>
                <p className="text-center text-gray-500 mt-2 text-sm">
                  {step === 1
                    ? "Nhập email tài khoản của bạn để tiến hành thiết lập lại mật khẩu."
                    : `Xin chào ${targetUser?.name || ""}, hãy nhập mật khẩu mới cho tài khoản của bạn.`}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {step === 1 && (
              <form className="space-y-4" onSubmit={handleEmailSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-1.5" htmlFor="email">
                    <Mail size={16} className="text-gray-400" /> Email tài khoản
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-xl border-gray-200 bg-background h-12 px-4 focus:ring-primary focus:border-primary outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white font-bold h-12 rounded-xl hover:bg-primaryDark transition-all mt-6 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang xác thực..." : "Tiếp tục"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-4" onSubmit={handleResetSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-1.5" htmlFor="newPassword">
                    <Lock size={16} className="text-gray-400" /> Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full rounded-xl border-gray-200 bg-background h-12 pl-4 pr-11 focus:ring-primary focus:border-primary outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-textMain"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-1.5" htmlFor="confirmPassword">
                    <Lock size={16} className="text-gray-400" /> Xác nhận mật khẩu mới
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full rounded-xl border-gray-200 bg-background h-12 px-4 focus:ring-primary focus:border-primary outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white font-bold h-12 rounded-xl hover:bg-primaryDark transition-all mt-6 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                </button>
              </form>
            )}

            {step === 3 && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thành công!</h3>
                <p className="text-gray-500 text-sm">
                  Mật khẩu của tài khoản <span className="font-semibold text-gray-800">{email}</span> đã được cập nhật thành công.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-primary text-white font-bold h-12 rounded-xl hover:bg-primaryDark transition-all mt-8"
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
