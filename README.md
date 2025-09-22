# 🍽️ MenuDigital POS - Menu Digital & POS Kasir Modern

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://menudigital-pos.vercel.app)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

## 🚀 Tentang MenuDigital POS

**MenuDigital POS** adalah solusi lengkap untuk restoran, cafe, dan toko yang membutuhkan sistem menu digital dan POS kasir modern. Aplikasi ini menyediakan fitur-fitur canggih untuk meningkatkan pengalaman pelanggan dan efisiensi operasional.

## ✨ Fitur Utama

### 🍽️ **Menu Digital Interaktif**
- Menu dengan gambar berkualitas tinggi
- Kategori menu yang terorganisir
- Variasi menu dengan harga tambahan
- Interface yang responsif dan modern

### 🛒 **Sistem Keranjang & Checkout**
- Keranjang belanja real-time
- Multiple payment methods
- Order notes dan customization
- Customer information management

### 📱 **Progressive Web App (PWA)**
- Installable di mobile dan desktop
- Offline capability
- Push notifications
- App-like experience

### 🔄 **Real-time Updates**
- Live order tracking
- Real-time inventory updates
- Instant notifications
- Synchronized data across devices

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 18.2.0, Vite 4.4.0
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Playfair Display, Inter)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Supabase account

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/menudigital-pos.git
   cd menudigital-pos
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Isi file `.env.local` dengan:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

5. **Open browser**
   ```
   http://localhost:5173
   ```

## 📊 Database Schema

### Tabel Utama
- **toko**: Informasi restoran/toko
- **kategori**: Kategori menu
- **menu**: Data menu dengan image support
- **menu_variasi**: Variasi menu (ukuran, rasa, dll)
- **pelanggan**: Data pelanggan
- **transaksi**: Transaksi penjualan
- **pesanan_online**: Pesanan online

### Image Schema
```sql
-- Menu table dengan image support
CREATE TABLE public.menu (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  harga integer NOT NULL,
  toko_id uuid NOT NULL,
  image_url text NULL,        -- URL external image
  image_path text NULL,       -- Path internal image
  image_updated_at timestamp with time zone DEFAULT now(),
  -- ... other fields
);
```

## 🎨 Design System

### Color Palette
- **Primary**: #FFD700 (Gold)
- **Background**: #0D0D0D (Dark)
- **Surface**: #1A1A1A (Card Background)
- **Text**: #FFFFFF (White)
- **Accent**: #B3B3B3 (Gray)

### Typography
- **Headings**: Playfair Display (Serif)
- **Body**: Inter (Sans-serif)

## 📱 PWA Features

- **Manifest**: Web app manifest untuk installability
- **Service Worker**: Offline capability
- **Responsive**: Mobile-first design
- **Performance**: Optimized loading dan caching

## 🔧 Configuration

### Vercel Deployment
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Cache-Control", "value": "public, max-age=31536000" }
      ]
    }
  ]
}
```

## 📈 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Core Web Vitals**: Optimized
- **Bundle Size**: Minimized dengan Vite
- **Caching**: Aggressive caching untuk static assets

## 🔒 Security

- **CSP Headers**: Content Security Policy
- **XSS Protection**: Cross-site scripting protection
- **HTTPS**: SSL/TLS encryption
- **Input Validation**: Client dan server-side validation

## 📊 Analytics & Monitoring

- **Google Analytics**: User behavior tracking
- **Performance Monitoring**: Core Web Vitals
- **Error Tracking**: Real-time error monitoring
- **User Analytics**: Conversion tracking

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-username/menudigital-pos/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/menudigital-pos/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/menudigital-pos/discussions)

## 🙏 Acknowledgments

- **Supabase** untuk backend services
- **Vercel** untuk hosting dan deployment
- **Tailwind CSS** untuk styling framework
- **React Community** untuk ecosystem yang luar biasa

---

**Made with ❤️ by MenuDigital POS Team**

[🌐 Live Demo](https://menudigital-pos.vercel.app) | [📖 Documentation](https://github.com/your-username/menudigital-pos/wiki) | [🐛 Report Bug](https://github.com/your-username/menudigital-pos/issues)