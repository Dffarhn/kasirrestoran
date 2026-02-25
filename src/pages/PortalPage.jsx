import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PortalPage = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('toko_website_settings')
          .select(`
            id,
            slug,
            logo_url,
            toko (
              id,
              nama_toko,
              gmaps_link,
              whatsapp_number
            )
          `)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching website settings for portal:', error);
          throw error;
        }

        setWebsites(data || []);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat daftar mitra. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return websites;
    return websites.filter((setting) =>
      setting.toko?.nama_toko?.toLowerCase().includes(term)
    );
  }, [websites, searchTerm]);

  const handleViewProfile = (websiteSetting) => {
    const slug = websiteSetting.slug;

    if (slug) {
      navigate(`/${slug}`);
      return;
    }

    // Fallback: langsung ke halaman pesan default dengan toko_id
    const params = new URLSearchParams();
    if (websiteSetting.toko?.id) {
      params.set('toko_id', websiteSetting.toko.id);
    }
    params.set('table', '1');
    navigate(`/default/pesan?${params.toString()}`);
  };

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden animate-pulse"
        >
          <div className="h-40 bg-[#E5E7EB]" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-[#E5E7EB] rounded w-24" />
            <div className="h-5 bg-[#E5E7EB] rounded w-3/4" />
            <div className="h-4 bg-[#E5E7EB] rounded w-1/2" />
            <div className="h-9 bg-[#E5E7EB] rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-[#FAFAFA] text-[#111111] min-h-screen">
      {/* Navbar - Brand: Primary #D83028, Secondary #F8C028 */}
      <nav className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/LogoMibebiTransparan.png"
              alt="Mibebi POS"
              className="h-8 w-8 rounded-xl object-contain bg-white shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-[#111111]">
                Mibebi POS
              </span>
              <span className="text-xs text-[#6B7280]">
                Direktori Mitra Resmi
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm">
            <button className="text-[#111111] hover:text-[#D83028] transition-colors">
              Home
            </button>
            <button className="text-[#111111] hover:text-[#D83028] transition-colors">
              Jelajahi Mitra
            </button>
            <button className="text-[#111111] hover:text-[#D83028] transition-colors">
              Tentang Mibebi
            </button>
            <button className="text-[#111111] hover:text-[#D83028] transition-colors">
              Daftar Jadi Mitra
            </button>
          </div>

          <div className="flex items-center">
            <a
              href="#"
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[#D83028] text-white hover:bg-[#C52A23] transition-colors"
            >
              Gunakan Mibebi
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-[#E5E7EB] bg-gradient-to-br from-white via-[#FFF7E6] to-[#FFE4DF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: copy & search */}
            <div className="space-y-6 max-w-xl">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F8C028]/20 text-[11px] font-medium text-[#D83028]">
                Direktori Mitra Resmi
              </span>
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#111111]">
                  Direktori Resmi Mitra Mibebi POS
                </h1>
                <p className="text-[#6B7280] text-sm sm:text-base max-w-2xl">
                  Temukan toko-toko yang menggunakan sistem kasir Mibebi untuk
                  operasional yang lebih profesional dan modern.
                </p>
              </div>

              {/* Search + Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#6B7280] text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama toko atau kota…"
                    className="w-full rounded-2xl border border-[#E5E7EB] bg-white pl-10 pr-4 py-3.5 text-sm sm:text-base text-[#111111] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D83028] focus:border-[#D83028] placeholder:text-[#6B7280]"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <span className="text-xs text-[#6B7280]">
                      {filteredRestaurants.length} mitra
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-[#6B7280]">
                  <button className="inline-flex items-center rounded-full border border-[#E5E7EB] px-3 py-1.5 bg-white hover:bg-[#FAFAFA] hover:border-[#D83028] hover:text-[#D83028] transition-colors">
                    Semua Kota
                  </button>
                  <button className="inline-flex items-center rounded-full border border-[#E5E7EB] px-3 py-1.5 bg-white hover:bg-[#FAFAFA] hover:border-[#D83028] hover:text-[#D83028] transition-colors">
                    Semua Kategori
                  </button>
                </div>
              </div>
            </div>

            {/* Right: mock preview card */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 space-y-4 max-w-sm ml-auto">
                <div className="relative overflow-hidden rounded-xl">
                  <div className="h-40 bg-gradient-to-tr from-[#D83028] via-[#F8C028] to-white" />
                  <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-[#F8C028] text-[#111111] text-[10px] font-medium px-2.5 py-1 shadow">
                    Mitra Mibebi
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                    Contoh Mitra
                  </p>
                  <h3 className="text-base font-semibold text-[#111111]">
                    Kedai Kopi Senja
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Bandung
                  </p>
                </div>
                <button className="w-full inline-flex items-center justify-center rounded-lg bg-[#D83028] text-white text-xs font-medium py-2.5 hover:bg-[#C52A23] transition-colors">
                  Lihat Profil
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daftar Mitra */}
      <section className="py-10 sm:py-14" id="mitra">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#111111]">
              Semua Mitra Mibebi
            </h2>
          </div>

          {error && (
            <div className="text-sm text-[#D83028] mb-4">{error}</div>
          )}

          {loading
            ? renderLoadingSkeleton()
            : filteredRestaurants.length === 0
            ? (
              <div className="text-sm text-[#6B7280] mt-4">
                Tidak ditemukan mitra yang cocok dengan pencarian.
              </div>
              )
            : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                {filteredRestaurants.map((websiteSetting) => {
                  const { toko, logo_url } = websiteSetting;

                  return (
                    <article
                      key={websiteSetting.id}
                      className="group bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="relative overflow-hidden">
                        <div className="h-40 bg-[#E5E7EB]">
                          {logo_url ? (
                            <img
                              src={logo_url}
                              alt={toko?.nama_toko}
                              className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-[#6B7280]">
                              Foto toko
                            </div>
                          )}
                        </div>
                        <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-[#F8C028] text-[#111111] text-[10px] font-medium px-2.5 py-1 shadow">
                          Mitra Mibebi
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="text-sm sm:text-base font-semibold text-[#111111] line-clamp-1">
                          {toko?.nama_toko || 'Nama Toko'}
                        </h3>
                        <p className="text-xs text-[#6B7280] line-clamp-1">
                          Lokasi: Tidak tersedia
                        </p>
                        <button
                          type="button"
                          onClick={() => handleViewProfile(websiteSetting)}
                          className="mt-3 w-full inline-flex items-center justify-center rounded-lg bg-[#D83028] text-white text-xs sm:text-sm font-medium py-2.5 hover:bg-[#C52A23] transition-colors"
                        >
                          Lihat Profil
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </div>
      </section>

      {/* CTA Bawah */}
      <section className="bg-white border-t border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#111111]">
              Ingin Toko Anda Tampil di Sini?
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280]">
              Bergabung bersama ratusan bisnis lain yang telah menggunakan
              sistem kasir Mibebi untuk operasional yang lebih efisien.
            </p>
            <button className="mt-2 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#D83028] text-white text-sm font-medium hover:bg-[#C52A23] transition-colors">
              Daftar Jadi Mitra
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs sm:text-sm text-[#6B7280] flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex space-x-4">
            <button className="hover:text-[#D83028] transition-colors">Tentang Mibebi</button>
            <button className="hover:text-[#D83028] transition-colors">Kontak</button>
            <button className="hover:text-[#D83028] transition-colors">Kebijakan Privasi</button>
          </div>
          <div className="text-[#6B7280]">
            © 2026 Mibebi POS
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortalPage;

