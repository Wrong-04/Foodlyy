import React from "react";
import { User, Mail, Shield, Clock } from "lucide-react";
import { User as UserType } from "../types";
import { Navigate } from "react-router-dom";

const ProfilePage = ({ currentUser }: { currentUser: UserType | null }) => {
    if (!currentUser) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-[80vh] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Profile Section */}
                    <div className="bg-primary/10 px-8 py-10 flex flex-col items-center border-b border-primary/10">
                        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white text-primary border-4 border-white shadow-md mb-4">
                            <User size={48} className="fill-current" />
                        </div>
                        <h1 className="text-2xl font-bold text-textMain">{currentUser.name}</h1>
                        <span className="px-3 py-1 mt-2 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
                            {currentUser.role}
                        </span>
                    </div>

                    {/* User Details */}
                    <div className="p-8">
                        <h2 className="text-xl font-bold text-textMain mb-6">Thông tin tài khoản</h2>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="bg-white p-3 rounded-lg shadow-sm text-primary">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-textSec">Họ và tên</p>
                                    <p className="text-lg font-bold text-textMain">{currentUser.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="bg-white p-3 rounded-lg shadow-sm text-primary">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-textSec">Địa chỉ Email</p>
                                    <p className="text-lg font-bold text-textMain">{currentUser.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="bg-white p-3 rounded-lg shadow-sm text-primary">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-textSec">Vai trò truy cập</p>
                                    <p className="text-lg font-bold text-textMain capitalize">{currentUser.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
