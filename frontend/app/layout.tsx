import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Warung HPP Calculator - Platform All-in-One untuk UMKM',
  description: 'Platform lengkap untuk pemilik warung: kalkulator HPP, manajemen menu, dan proyeksi bisnis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Header />
        <main className="pt-16 pb-8">
          <div className="container">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
