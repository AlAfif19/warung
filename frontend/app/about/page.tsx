'use client';

import { motion } from 'framer-motion';
import { Users, Award, Target, Heart, Quote } from 'lucide-react';
import BackgroundAnimation from '@/components/BackgroundAnimation';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Andi Pratama',
      role: 'Founder & CEO',
      image: '/assets/images/team/andi.jpg',
      description: 'Berpengalaman 10+ tahun di industri F&B',
    },
    {
      name: 'Siti Rahayu',
      role: 'Head of Product',
      image: '/assets/images/team/siti.jpg',
      description: 'Ahli dalam UX/UI dan pengembangan produk',
    },
    {
      name: 'Budi Santoso',
      role: 'Head of Technology',
      image: '/assets/images/team/budi.jpg',
      description: 'Full-stack developer dengan passion untuk edukasi',
    },
    {
      name: 'Dewi Lestari',
      role: 'Head of Operations',
      image: '/assets/images/team/dewi.jpg',
      description: 'Mengelola operasional dan layanan pelanggan',
    },
  ];

  const testimonials = [
    {
      name: 'Rina',
      role: 'Pemilik Warung Kopi Asik',
      image: '/assets/images/testimonials/rina.jpg',
      quote: 'Sistem ini mengubah bisnis warung saya dari omset Rp5 juta ke Rp25 juta/bulan! Sangat mudah digunakan dan fitur kalkulator HPP-nya sangat membantu.',
    },
    {
      name: 'Agus',
      role: 'Pemilik Warung Nasi Goreng Spesial',
      image: '/assets/images/testimonials/agus.jpg',
      quote: 'Sejak menggunakan platform ini, saya bisa mengatur menu dan harga jual dengan lebih akurat. Omset meningkat 40% dalam 3 bulan!',
    },
    {
      name: 'Maya',
      role: 'Pemilik Cafe Senja',
      image: '/assets/images/testimonials/maya.jpg',
      quote: 'Fitur QR payment dan WhatsApp order sangat memudahkan pelanggan. Layanan support-nya juga sangat responsif!',
    },
  ];

  const blogPosts = [
    {
      title: '5 Tips Menghitung HPP Makanan yang Akurat',
      excerpt: 'Pelajari cara menghitung Harga Pokok Produksi dengan tepat untuk menentukan harga jual yang optimal...',
      image: '/assets/images/blog/hpp-tips.jpg',
      date: '15 Januari 2024',
    },
    {
      title: 'Cara Meningkatkan Omset Warung dengan Digital Marketing',
      excerpt: 'Strategi digital marketing yang terbukti efektif untuk menarik lebih banyak pelanggan ke warung Anda...',
      image: '/assets/images/blog/digital-marketing.jpg',
      date: '10 Januari 2024',
    },
    {
      title: 'Manajemen Stok yang Efisien untuk Warung',
      excerpt: 'Tips dan trik mengelola stok bahan baku agar tidak ada pemborosan dan selalu tersedia...',
      image: '/assets/images/blog/stock-management.jpg',
      date: '5 Januari 2024',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f8f9fa] relative overflow-hidden">
      <BackgroundAnimation />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Tentang <span className="text-[#ff6b6b]">Warung Digital</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Kami hadir sejak 2020 untuk membantu warung tradisional bertransformasi digital
            </p>
          </motion.div>
        </section>

        {/* About Section */}
        <section className="py-20 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Sejarah Kami
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Warung Digital didirikan pada tahun 2020 dengan visi sederhana: membantu pemilik warung tradisional di Indonesia untuk bertransformasi ke era digital.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Kami memulai dengan sebuah kalkulator HPP sederhana yang membantu pemilik warung menghitung harga pokok produksi dengan akurat. Seiring berjalannya waktu, kami berkembang menjadi platform all-in-one yang mencakup manajemen menu, sistem POS, pembayaran QR, dan banyak lagi.
              </p>
              <p className="text-lg text-gray-600">
                Hingga saat ini, kami telah membantu lebih dari 10.000 warung di seluruh Indonesia untuk meningkatkan omset dan efisiensi operasional mereka.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Users, value: '10,000+', label: 'Warung Terbantu' },
                { icon: Award, value: '95%', label: 'Kepuasan Pelanggan' },
                { icon: Target, value: '40%', label: 'Rata-rata Kenaikan Omset' },
                { icon: Heart, value: '24/7', label: 'Dukungan Pelanggan' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg text-center"
                >
                  <stat.icon className="h-8 w-8 text-[#ff6b6b] mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Team Section */}
        <section className="py-20 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tim Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Orang-orang yang berdedikasi untuk membantu bisnis Anda berkembang
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-[#ff6b6b] to-[#4ecdc4] flex items-center justify-center">
                  <Users className="h-20 w-20 text-white" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-[#ff6b6b] font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Pemilik Warung
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Testimoni nyata dari pelanggan yang telah merasakan manfaatnya
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg relative"
              >
                <Quote className="h-8 w-8 text-[#ff6b6b] mb-4" />
                <p className="text-gray-600 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff6b6b] to-[#4ecdc4] rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-20 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Artikel Terkini
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tips dan wawasan untuk mengembangkan bisnis warung Anda
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-[#ff6b6b] to-[#4ecdc4] flex items-center justify-center">
                  <span className="text-white text-6xl font-bold opacity-20">{index + 1}</span>
                </div>
                <div className="p-6">
                  <div className="text-sm text-[#ff6b6b] mb-2">{post.date}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <button className="text-[#ff6b6b] font-semibold hover:text-[#ff5252] transition-colors">
                    Baca Selengkapnya →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
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
