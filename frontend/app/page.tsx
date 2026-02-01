'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calculator, ShoppingCart, QrCode, MessageSquare, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import BackgroundAnimation from '@/components/BackgroundAnimation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f8f9fa] relative overflow-hidden">
      <BackgroundAnimation />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Bikin Website Warung Sendiri,
              <span className="text-[#ff6b6b]"> Sekarang!</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-8"
            >
              Platform kami mendukung kesuksesan bisnis warung Anda dengan fitur lengkap
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/calculator"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#ff6b6b] text-white font-semibold rounded-lg hover:bg-[#ff5252] transition-colors shadow-lg hover:shadow-xl"
              >
                Mulai Kalkulator HPP
                <Calculator className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-200 hover:border-[#ff6b6b]"
              >
                Lihat Menu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengembangkan bisnis warung
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: ShoppingCart,
                title: 'Kasir & POS',
                description: 'Sistem transaksi cepat tanpa gangguan',
                color: 'bg-[#ff6b6b]',
              },
              {
                icon: QrCode,
                title: 'QR Code Payment',
                description: 'Terima pembayaran dengan QRIS',
                color: 'bg-[#4ecdc4]',
              },
              {
                icon: MessageSquare,
                title: 'WhatsApp Order',
                description: 'Pesanan langsung ke WhatsApp',
                color: 'bg-[#ffe66d]',
              },
              {
                icon: Calculator,
                title: 'Kalkulator HPP',
                description: 'Hitung HPP produk dengan akurat',
                color: 'bg-[#95e1d3]',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pilih Paket yang Tepat
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Harga terjangkau untuk semua ukuran bisnis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Dasar',
                price: 'Rp 99.000',
                period: '/bulan',
                features: [
                  'Kalkulator HPP',
                  'Manajemen Menu',
                  'Laporan Dasar',
                  'Support Email',
                ],
                popular: false,
              },
              {
                name: 'Standar',
                price: 'Rp 199.000',
                period: '/bulan',
                features: [
                  'Semua fitur Dasar',
                  'POS & Kasir',
                  'QR Code Payment',
                  'WhatsApp Order',
                  'Laporan Lanjutan',
                  'Support Prioritas',
                ],
                popular: true,
              },
              {
                name: 'Bisnis',
                price: 'Rp 499.000',
                period: '/bulan',
                features: [
                  'Semua fitur Standar',
                  'Multi Cabang',
                  'API Integration',
                  'Custom Branding',
                  'Training Tim',
                  'Support 24/7',
                ],
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl p-8 shadow-lg ${
                  plan.popular
                    ? 'bg-gradient-to-br from-[#ff6b6b] to-[#ff5252] text-white scale-105'
                    : 'bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#ffe66d] text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                      Paling Populer
                    </span>
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-gray-600 ${plan.popular ? 'text-white/80' : ''}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle className={`h-5 w-5 mr-2 flex-shrink-0 ${
                        plan.popular ? 'text-white' : 'text-[#4ecdc4]'
                      }`} />
                      <span className={plan.popular ? 'text-white' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/calculator"
                  className={`block text-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-white text-[#ff6b6b] hover:bg-gray-100'
                      : 'bg-[#ff6b6b] text-white hover:bg-[#ff5252]'
                  }`}
                >
                  Mulai Sekarang
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-[#4ecdc4] to-[#95e1d3] rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Siap Mengembangkan Bisnis Warung Anda?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Bergabung dengan ribuan pemilik warung yang telah sukses meningkatkan omset
            </p>
            <Link
              href="/calculator"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#4ecdc4] font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
            >
              Mulai Gratis Sekarang
              <TrendingUp className="ml-2 h-5 w-5" />
            </Link>
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
