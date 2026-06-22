'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calculator, ShoppingCart, Plus, X, Star, Trash2, Minus, ChevronUp, ChevronDown } from 'lucide-react';
import MenuFilter from '@/components/MenuFilter';
import BackgroundAnimation from '@/components/BackgroundAnimation';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  rating: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Nasi Goreng Spesial',
    category: 'nasi',
    price: 15000,
    description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
    image: '/assets/images/menu/nasi-goreng.jpg',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Nasi Rames Komplit',
    category: 'nasi',
    price: 18000,
    description: 'Nasi dengan lauk pauk lengkap: ayam, tempe, tahu, sayur',
    image: '/assets/images/menu/nasi-rames.jpg',
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Nasi Ayam Bakar',
    category: 'nasi',
    price: 20000,
    description: 'Nasi dengan ayam bakar bumbu spesial dan lalapan',
    image: '/assets/images/menu/nasi-ayam-bakar.jpg',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Mie Goreng Jawa',
    category: 'mie',
    price: 12000,
    description: 'Mie goreng gaya Jawa dengan telur dan sayuran',
    image: '/assets/images/menu/mie-goreng.jpg',
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Mie Rebus Spesial',
    category: 'mie',
    price: 13000,
    description: 'Mie rebus dengan topping telur dan ayam suwir',
    image: '/assets/images/menu/mie-rebus.jpg',
    rating: 4.4,
  },
  {
    id: '6',
    name: 'Es Teh Manis',
    category: 'minuman',
    price: 5000,
    description: 'Teh manis dingin yang segar',
    image: '/assets/images/menu/es-teh.jpg',
    rating: 4.7,
  },
  {
    id: '7',
    name: 'Es Jeruk Peras',
    category: 'minuman',
    price: 7000,
    description: 'Jus jeruk segar dengan es batu',
    image: '/assets/images/menu/es-jeruk.jpg',
    rating: 4.8,
  },
  {
    id: '8',
    name: 'Kopi Susu Gula Aren',
    category: 'minuman',
    price: 12000,
    description: 'Kopi susu dengan gula aren asli',
    image: '/assets/images/menu/kopi-susu.jpg',
    rating: 4.9,
  },
  {
    id: '9',
    name: 'Pisang Goreng',
    category: 'snack',
    price: 8000,
    description: 'Pisang goreng renyah dengan topping coklat',
    image: '/assets/images/menu/pisang-goreng.jpg',
    rating: 4.5,
  },
  {
    id: '10',
    name: 'Tahu Crispy',
    category: 'snack',
    price: 10000,
    description: 'Tahu goreng renyah dengan saus spesial',
    image: '/assets/images/menu/tahu-crispy.jpg',
    rating: 4.6,
  },
];

function MenuPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    category: 'all',
    maxPrice: 100000,
    searchTerm: '',
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});
  const [editingQuantity, setEditingQuantity] = useState<{ [key: string]: boolean }>({});
  const [tempQuantity, setTempQuantity] = useState<{ [key: string]: string }>({});
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Handle adding item to cart from chatbot
  useEffect(() => {
    const addItemId = searchParams.get('add');
    if (addItemId) {
      const item = menuItems.find((i) => i.id === addItemId);
      if (item) {
        setCart((prevCart) => {
          const existingItem = prevCart.find((cartItem) => cartItem.id === addItemId);
          if (existingItem) {
            return prevCart.map((cartItem) =>
              cartItem.id === addItemId
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            );
          } else {
            return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
          }
        });
        // Open cart to show the added item
        setIsCartOpen(true);
        // Remove the query parameter
        router.replace('/menu', { scroll: false });
      }
    }
  }, [searchParams, router]);

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
    const item = menuItems.find((i) => i.id === itemId);
    const quantity = itemQuantities[itemId] || 1;
    if (item) {
      setCart((prevCart) => {
        const existingItem = prevCart.find((cartItem) => cartItem.id === itemId);
        if (existingItem) {
          return prevCart.map((cartItem) =>
            cartItem.id === itemId
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          );
        } else {
          return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity }];
        }
      });
      // Reset quantity to 1 after adding to cart
      setItemQuantities(prev => ({ ...prev, [itemId]: 1 }));
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setItemQuantities(prev => {
      const currentQuantity = prev[itemId] || 1;
      const newQuantity = Math.max(1, currentQuantity + delta);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const handleQuantityClick = (itemId: string) => {
    setEditingQuantity(prev => ({ ...prev, [itemId]: true }));
    setTempQuantity(prev => ({ ...prev, [itemId]: String(itemQuantities[itemId] || 1) }));
    setTimeout(() => {
      inputRefs.current[itemId]?.focus();
      inputRefs.current[itemId]?.select();
    }, 0);
  };

  const handleQuantityBlur = (itemId: string) => {
    const value = parseInt(tempQuantity[itemId]) || 1;
    setItemQuantities(prev => ({ ...prev, [itemId]: Math.max(1, value) }));
    setEditingQuantity(prev => ({ ...prev, [itemId]: false }));
  };

  const handleQuantityKeyDown = (itemId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuantityBlur(itemId);
      inputRefs.current[itemId]?.blur();
    } else if (e.key === 'Escape') {
      setEditingQuantity(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f8f9fa] relative overflow-hidden">
      <BackgroundAnimation />
      
      {/* Cart Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed top-24 right-6 z-50 bg-[#ff6b6b] text-white p-4 rounded-full shadow-lg hover:bg-[#ff5252] transition-colors"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#4ecdc4] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </div>
      </motion.button>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ff5252] p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Keranjang</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 flex-1">{item.name}</h3>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="w-8 h-8 bg-[#4ecdc4] text-white rounded-lg hover:bg-[#3dbdb5] transition-colors font-bold"
                          >
                            -
                          </motion.button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="w-8 h-8 bg-[#4ecdc4] text-white rounded-lg hover:bg-[#3dbdb5] transition-colors font-bold"
                          >
                            +
                          </motion.button>
                        </div>
                        <p className="font-bold text-[#ff6b6b]">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#ff6b6b]">
                    Rp {cartTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-[#ff6b6b] text-white rounded-lg font-semibold hover:bg-[#ff5252] transition-colors"
                >
                  Checkout
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Cart Overlay */}
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-12 mb-8">
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
        <section className="pb-8">
          <MenuFilter onFilterChange={handleFilterChange} />
        </section>

        {/* Menu Grid */}
        <section className="pb-20">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-xl text-gray-600">Tidak ada menu yang sesuai dengan filter</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow group flex flex-col"
                >
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-[#ff6b6b] to-[#4ecdc4] flex items-center justify-center relative overflow-hidden rounded-t-2xl">
                    <span className="text-white text-6xl font-bold opacity-20 group-hover:scale-110 transition-transform duration-300">
                      {item.name.charAt(0)}
                    </span>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-[#ff6b6b] font-semibold">Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 pb-6 flex-1 flex flex-col rounded-b-2xl">
                    <div className="text-xs text-[#ff6b6b] font-medium mb-1 uppercase">
                      {item.category}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(item.rating)}
                      <span className="text-sm text-gray-600 ml-2">{item.rating}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                    {/* Buttons - Card Footer */}
                    <div className="flex gap-2 mt-auto pt-2 pb-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCalculateHPP(item.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-[#ff6b6b] text-white rounded-lg hover:bg-[#ff5252] transition-colors text-sm"
                      >
                        <Calculator className="h-4 w-4 mr-1" />
                        HPP
                      </motion.button>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-8 h-10 flex items-center justify-center text-gray-600 hover:text-[#4ecdc4] transition-colors"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.button>
                        <div 
                          className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-200 rounded transition-colors"
                          onClick={() => handleQuantityClick(item.id)}
                        >
                          {editingQuantity[item.id] ? (
                            <input
                              ref={(el) => {
                                if (el) {
                                  inputRefs.current[item.id] = el;
                                }
                              }}
                              type="number"
                              min="1"
                              value={tempQuantity[item.id] || '1'}
                              onChange={(e) => setTempQuantity(prev => ({ ...prev, [item.id]: e.target.value }))}
                              onBlur={() => handleQuantityBlur(item.id)}
                              onKeyDown={(e) => handleQuantityKeyDown(item.id, e)}
                              className="w-full h-full text-center bg-transparent font-semibold text-gray-900 outline-none"
                            />
                          ) : (
                            <span className="font-semibold text-gray-900">
                              {itemQuantities[item.id] || 1}
                            </span>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-8 h-10 flex items-center justify-center text-gray-600 hover:text-[#4ecdc4] transition-colors"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </motion.button>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(item.id)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-[#4ecdc4] text-white rounded-lg hover:bg-[#3dbdb5] transition-colors text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
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
          <p className="text-center text-gray-500 text-sm">
            © 2024 Warung HPP Calculator. Dibuat dengan ❤️ untuk UMKM Indonesia.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <MenuPageContent />
    </Suspense>
  );
}
