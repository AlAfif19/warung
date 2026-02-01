'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, X, Utensils, ShoppingCart, ArrowRight } from 'lucide-react';
import { apiClient, MenuRecommendation, SectionNavigation } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  recommendations?: MenuRecommendation[];
  navigation_suggestions?: SectionNavigation[];
  timestamp: Date;
}

export default function Chatbot() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Halo! 👋 Saya asisten virtual warung Anda. Saya bisa membantu dengan rekomendasi menu, perhitungan HPP, dan informasi tentang fitur kami. Ada yang bisa saya bantu?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiClient.sendChatMessage({ message: inputValue });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        recommendations: response.recommendations,
        navigation_suggestions: response.navigation_suggestions,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (productId: number) => {
    // Navigate to menu page with product ID for adding to cart
    router.push(`/menu?add=${productId}`);
  };

  const handleNavigateToSection = (path: string) => {
    router.push(path);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    'Apa itu HPP?',
    'Rekomendasi menu murah',
    'Cara mulai menggunakan platform',
    'Fitur apa saja yang tersedia?',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ff5252] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Asisten Virtual Warung</h3>
              <p className="text-white/80 text-sm">Tanya apa saja tentang menu & HPP</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.type === 'user'
                        ? 'bg-[#ff6b6b] text-white'
                        : 'bg-gradient-to-br from-[#4ecdc4] to-[#95e1d3] text-white'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-[#ff6b6b] text-white'
                        : 'bg-white shadow-md border border-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      {message.content}
                    </p>
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Utensils className="h-4 w-4 text-[#ff6b6b]" />
                          <span className="font-semibold text-sm">Rekomendasi Menu:</span>
                        </div>
                        <div className="space-y-2">
                          {message.recommendations.map((rec) => (
                            <div
                              key={rec.id}
                              className="bg-gradient-to-r from-[#f8f9fa] to-white rounded-lg p-3 border border-gray-100"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{rec.name}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    HPP: Rp {rec.hpp_per_unit.toLocaleString('id-ID')}
                                  </p>
                                </div>
                                <Sparkles className="h-4 w-4 text-[#ff6b6b] flex-shrink-0" />
                              </div>
                              <button
                                onClick={() => handleAddToCart(rec.id)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#4ecdc4] text-white rounded-lg hover:bg-[#3dbdb5] transition-colors text-sm font-medium"
                              >
                                <ShoppingCart className="h-4 w-4" />
                                Add to Cart
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.navigation_suggestions && message.navigation_suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowRight className="h-4 w-4 text-[#ff6b6b]" />
                          <span className="font-semibold text-sm">Navigasi:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {message.navigation_suggestions.map((nav, index) => (
                            <button
                              key={index}
                              onClick={() => handleNavigateToSection(nav.section_path)}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#ff6b6b] to-[#ff5252] text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
                            >
                              {nav.button_text}
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#4ecdc4] to-[#95e1d3] text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-white shadow-md border border-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputValue(question)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-[#ff6b6b] hover:text-[#ff6b6b] transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pertanyaan Anda..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent transition-all text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-[#ff6b6b] to-[#ff5252] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
