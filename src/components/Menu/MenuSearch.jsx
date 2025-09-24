import React, { useState, useEffect } from 'react';

const MenuSearch = ({ menu, selectedCategory, onSearchResults, onClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Advanced search function with typo tolerance
  const advancedSearch = (query, menuItems) => {
    if (!query.trim()) return menuItems;

    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);

    return menuItems.filter(item => {
      const itemName = item.name.toLowerCase();
      const itemCategory = item.category?.toLowerCase() || '';
      
      // Exact match (highest priority)
      if (itemName.includes(normalizedQuery)) return true;
      
      // Word-by-word matching with typo tolerance
      const itemWords = itemName.split(/\s+/);
      const categoryWords = itemCategory.split(/\s+/);
      
      // Check if all query words have matches in item name or category
      const hasAllWords = queryWords.every(queryWord => {
        // Exact word match
        if (itemWords.some(word => word.includes(queryWord))) return true;
        if (categoryWords.some(word => word.includes(queryWord))) return true;
        
        // Typo tolerance: check for similar words (simple implementation)
        const hasSimilarWord = itemWords.some(word => {
          if (Math.abs(word.length - queryWord.length) > 2) return false;
          
          // Simple Levenshtein distance approximation
          let differences = 0;
          const maxLength = Math.max(word.length, queryWord.length);
          const minLength = Math.min(word.length, queryWord.length);
          
          for (let i = 0; i < minLength; i++) {
            if (word[i] !== queryWord[i]) differences++;
          }
          differences += maxLength - minLength;
          
          // Allow up to 2 character differences for short words, 3 for longer words
          return differences <= (queryWord.length <= 4 ? 1 : 2);
        });
        
        return hasSimilarWord;
      });
      
      return hasAllWords;
    });
  };

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    
    if (!query.trim()) {
      setSearchResults([]);
      onClearSearch();
      setIsSearching(false);
      return;
    }

    // Filter menu based on selected category first
    let filteredMenu = menu;
    if (selectedCategory) {
      filteredMenu = menu.filter(item => item.category === selectedCategory);
    }

    // Apply advanced search
    const results = advancedSearch(query, filteredMenu);
    setSearchResults(results);
    onSearchResults(results);
    setIsSearching(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClearSearch();
  };

  // Update search when category changes
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  }, [selectedCategory]);

  return (
    <div className="mb-6">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-[#B3B3B3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={`Cari menu${selectedCategory ? ' dalam kategori ini' : ''}...`}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-[#1A1A1A] border-2 border-[#333333] rounded-2xl text-[#FFFFFF] placeholder-[#B3B3B3] focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300"
            style={{fontFamily: 'Inter, sans-serif'}}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#B3B3B3] hover:text-[#FFD700] transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Search Status */}
        {searchQuery && (
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {isSearching ? (
                <div className="flex items-center space-x-2 text-[#FFD700]">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFD700]"></div>
                  <span>Mencari...</span>
                </div>
              ) : (
                <div className="text-[#B3B3B3]">
                  {searchResults.length > 0 ? (
                    <span className="text-[#FFD700]">
                      Ditemukan {searchResults.length} menu
                    </span>
                  ) : (
                    <span className="text-[#FF6B6B]">
                      Tidak ditemukan menu yang sesuai
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <button
                onClick={clearSearch}
                className="text-[#FFD700] hover:text-[#FFA500] transition-colors"
              >
                Hapus pencarian
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search Suggestions (if no results) */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="mt-4 p-4 bg-[#1A1A1A] border border-[#333333] rounded-lg">
          <div className="text-sm text-[#B3B3B3] mb-2">
            Tips pencarian:
          </div>
          <ul className="text-xs text-[#B3B3B3] space-y-1">
            <li>• Coba kata kunci yang lebih umum</li>
            <li>• Periksa ejaan kata kunci</li>
            <li>• Gunakan kata kunci dalam bahasa Indonesia</li>
            <li>• Coba cari berdasarkan kategori</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MenuSearch;
