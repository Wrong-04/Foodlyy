import React from 'react';
import { UtensilsCrossed, Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-primary p-2 rounded-lg">
            <UtensilsCrossed className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white uppercase">Foodly</span>
        </div>
        <p className="mb-6 leading-relaxed">Món ăn thơm ngon giao tận nơi. Nguyên liệu tươi mới, đầu bếp tài ba.</p>
        <div className="flex space-x-4">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary text-white transition-colors cursor-pointer"><Facebook size={18} /></div>
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary text-white transition-colors cursor-pointer"><Instagram size={18} /></div>
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary text-white transition-colors cursor-pointer"><Twitter size={18} /></div>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-bold text-white mb-6">Liên kết nhanh</h4>
        <ul className="space-y-4">
          <li><a href="#" className="hover:text-primary transition-colors">Về chúng tôi</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">Thực đơn</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">Đầu bếp</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-lg font-bold text-white mb-6">Liên hệ</h4>
        <ul className="space-y-4">
          <li className="flex items-start gap-3"><MapPin className="text-primary shrink-0" /> 123 Đường Ẩm Thực, TP. Hà Nội</li>
          <li className="flex items-center gap-3"><Phone className="text-primary shrink-0" /> +84 966 666 666</li>
          <li className="flex items-center gap-3"><Mail className="text-primary shrink-0" /> order@foodly.com</li>
        </ul>
      </div>
      <div>
        <h4 className="text-lg font-bold text-white mb-6">Giờ mở cửa</h4>
        <ul className="space-y-4">
          <li className="flex justify-between"><span>Thứ 2 - Thứ 6:</span> <span className="text-white">09:00 - 22:00</span></li>
          <li className="flex justify-between"><span>Thứ 7 - CN:</span> <span className="text-white">08:00 - 23:00</span></li>
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer;
