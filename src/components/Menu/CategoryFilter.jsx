import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div className="mb-8">
      <div className="flex gap-3 overflow-x-auto pb-6 pt-2 scrollbar-hide">
        <button
          onClick={() => onCategorySelect(null)}
          className={`group relative px-8 py-4 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
            selectedCategory === null
              ? 'bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] shadow-xl hover:shadow-2xl'
              : 'bg-[#1A1A1A] text-[#FFFFFF] border-2 border-[#333333] hover:border-[#FFD700] hover:text-[#FFD700] hover:shadow-md hover:-translate-y-0.5 hover:bg-[#FFD700]/5'
          }`}
        >
          <span className="relative z-10">Semua</span>
          {selectedCategory === null && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full"></div>
          )}
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`group relative px-8 py-4 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 whitespace-nowrap flex-shrink-0 ${
              selectedCategory === category.id
                ? 'bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] shadow-xl hover:shadow-2xl'
                : 'bg-[#1A1A1A] text-[#FFFFFF] border-2 border-[#333333] hover:border-[#FFD700] hover:text-[#FFD700] hover:shadow-md hover:-translate-y-0.5 hover:bg-[#FFD700]/5'
            }`}
          >
            <span className="text-lg relative z-10">{category.icon}</span>
            <span className="relative z-10">{category.name}</span>
            {selectedCategory === category.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
