'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';

interface MenuFilterProps {
  onFilterChange: (filters: { category: string; maxPrice: number; searchTerm: string }) => void;
}

export default function MenuFilter({ onFilterChange }: MenuFilterProps) {
  const [category, setCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'nasi', label: 'Nasi' },
    { id: 'mie', label: 'Mie' },
    { id: 'minuman', label: 'Minuman' },
    { id: 'snack', label: 'Snack' },
  ];

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    onFilterChange({ category: newCategory, maxPrice, searchTerm });
  };

  const handlePriceChange = (newPrice: number) => {
    setMaxPrice(newPrice);
    onFilterChange({ category, maxPrice: newPrice, searchTerm });
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    onFilterChange({ category, maxPrice, searchTerm: newSearchTerm });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center mb-6">
        <Filter className="h-6 w-6 text-[#ff6b6b] mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">Filter Menu</h3>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#ff6b6b] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Kategori</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                category === cat.id
                  ? 'bg-[#ff6b6b] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Harga Maksimum: Rp {maxPrice.toLocaleString('id-ID')}
        </label>
        <input
          type="range"
          min="0"
          max="100000"
          step="5000"
          value={maxPrice}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff6b6b]"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>Rp 0</span>
          <span>Rp 100.000+</span>
        </div>
      </div>
    </div>
  );
}
