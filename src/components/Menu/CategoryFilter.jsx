import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div className="mb-8">
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden">
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
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => onCategorySelect(null)}
            className={`group relative px-6 py-3 rounded-2xl text-base font-semibold transition-all duration-300 ${
              selectedCategory === null
                ? 'bg-[#FFD700] text-[#0D0D0D] shadow-xl hover:shadow-2xl transform scale-105'
                : 'bg-[#1A1A1A] text-[#FFFFFF] border-2 border-[#333333] hover:border-[#FFD700] hover:text-[#FFD700] hover:shadow-lg hover:-translate-y-1 hover:bg-[#FFD700]/10'
            }`}
          >
            <span className="relative z-10">Semua Menu</span>
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`group relative px-6 py-3 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center space-x-3 ${
                selectedCategory === category.id
                  ? 'bg-[#FFD700] text-[#0D0D0D] shadow-xl hover:shadow-2xl transform scale-105'
                  : 'bg-[#1A1A1A] text-[#FFFFFF] border-2 border-[#333333] hover:border-[#FFD700] hover:text-[#FFD700] hover:shadow-lg hover:-translate-y-1 hover:bg-[#FFD700]/10'
              }`}
            >
              <span className="text-xl relative z-10">{category.icon}</span>
              <span className="relative z-10">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
