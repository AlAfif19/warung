'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Calculator, ShoppingCart, Plus } from 'lucide-react';
import MenuFilter from '@/components/MenuFilter';
import BackgroundAnimation from '@/components/BackgroundAnimation';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
}

const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Nasi Goreng Spesial',
    category: 'nasi',
    price: 15000,
    description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
    image: '/assets/images/menu/nasi-goreng.jpg',
  },
  {
    id: '2',
    name: 'Nasi Rames Komplit',
    category: 'nasi',
    price: 18000,
    description: 'Nasi dengan lauk pauk lengkap: ayam, tempe, tahu, sayur',
    image: '/assets/images/menu/nasi-rames.jpg',
  },
  {
    id: '3',
    name: 'Nasi Ayam Bakar',
    category: 'nasi',
    price: 20000,
    description: 'Nasi dengan ayam bakar bumbu spesial dan lalapan',
    image: '/assets/images/menu/nasi-ayam-bakar.jpg',
  },
  {
    id: '4',
    name: 'Mie Goreng Jawa',
    category: 'mie',
    price: 12000,
    description: 'Mie goreng gaya Jawa dengan telur dan sayuran',
    image: '/assets/images/menu/mie-goreng.jpg',
  },
  {
    id: '5',
    name: 'Mie Rebus Spesial',
    category: 'mie',
    price: 13000,
    description: 'Mie rebus dengan topping telur dan ayam suwir',
    image: '/assets/images/menu/mie-rebus.jpg',
  },
  {
    id: '6',
    name: 'Es Teh Manis',
    category: 'minuman',
    price: 5000,
    description: 'Teh manis dingin yang segar',
    image: '/assets/images/menu/es-teh.jpg',
  },
  {
    id: '7',
    name: 'Es Jeruk Peras',
    category: 'minuman',
    price: 7000,
    description: 'Jus jeruk segar dengan es batu',
    image: '/assets/images/menu/es-jeruk.jpg',
  },
  {
    id: '8',
    name: 'Kopi Susu Gula Aren',
    category: 'minuman',
    price: 12000,
    description: 'Kopi susu dengan gula aren asli',
    image: '/assets/images/menu/kopi-susu.jpg',
  },
  {
    id: '9',
    name: 'Pisang Goreng',
    category: 'snack',
    price: 8000,
    description: 'Pisang goreng renyah dengan topping coklat',
    image: '/assets/images/menu/pisang-goreng.jpg',
  },
  {
    id: '10',
    name: 'Tahu Crispy',
    category: 'snack',
    price: 10000,
    description: 'Tahu goreng renyah dengan saus spesial',
    image: '/assets/images/menu/tahu-crispy.jpg',
  },
];

export default function MenuPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    category: 'all',
    maxPrice: 100000,
    searchTerm: '',
  });

  const filteredItems = menuItems.filter((item) => {
    const matchCategory = filters.category === 'all' || item.category === filters.category;
    const matchPrice = item.price <= filters.maxPrice;
    const matchSearch = item.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
    return matchCategory && matchPrice && matchSearch;
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleCalculateHPP = (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (item) {
      router.push(`/calculator?item=${encodeURIComponent(item.name)}`);
    }
  };

  const handleAddToCart = (itemId: string) => {
    // Implement cart functionality
    console.log('Added to cart:', itemId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f8f9fa] relative overflow-hidden">
      <BackgroundAnimation />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Menu <span className="text-[#ff6b6b]">Warung</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Pilih menu favorit Anda dan hitung HPP dengan mudah
            </p>
          </motion.div>
        </section>

        {/* Filter Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <MenuFilter onFilterChange={handleFilterChange} />
        </section>

        {/* Menu Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-xl text-gray-600">Tidak ada menu yang sesuai dengan filter</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
                >
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-[#ff6b6b] to-[#4ecdc4] flex items-center justify-center relative overflow-hidden">
                    <span className="text-white text-6xl font-bold opacity-20 group-hover:scale-110 transition-transform duration-300">
                      {item.name.charAt(0)}
                    </span>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-[#ff6b6b] font-semibold">Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="text-xs text-[#ff6b6b] font-medium mb-1 uppercase">
                      {item.category}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCalculateHPP(item.id)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-[#ff6b6b] text-white rounded-lg hover:bg-[#ff5252] transition-colors"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        HPP
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(item.id)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-[#4ecdc4] text-white rounded-lg hover:bg-[#3dbdb5] transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600">
              Menampilkan {filteredItems.length} dari {menuItems.length} menu
            </p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              © 2024 Warung HPP Calculator. Dibuat dengan ❤️ untuk UMKM Indonesia.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
