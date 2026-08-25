import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mt-6 gap-4">
      <p className="text-[10px] font-black text-textSec uppercase tracking-widest text-center sm:text-left">
        Hiển thị{" "}
        <span className="text-primary">{startItem}</span> -{" "}
        <span className="text-primary">{endItem}</span> của{" "}
        <span className="text-primary">{totalItems}</span> mục
      </p>
      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-primary/30 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`w-10 h-10 shrink-0 rounded-xl text-xs font-black transition-all ${
                currentPage === i + 1
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                  : "bg-gray-50 text-textSec hover:bg-white hover:border-gray-200 border border-transparent"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-primary/30 group"
        >
          <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
