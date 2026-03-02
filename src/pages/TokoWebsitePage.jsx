import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { fetchMenuWithVariasiAndImages, getMenuImageUrl } from '../services/database';

/**
 * Halaman website toko by slug: menampilkan HTML toko di iframe (full document, isolasi penuh).
 *
 * Sumber data: toko_website_settings (filter by slug).
 * 1. Prioritas: jika kolom rendered_html terisi → pakai langsung (tanpa fetch template/menu).
 * 2. Fallback: jika rendered_html null/kosong → fetch settings + toko + template + menu,
 *    apply placeholders, lalu tampilkan (sama seperti dulu).
 *
 * Tidak ada link/CTA ke "Pesan" — pemesanan hanya lewat QR code dari aplikasi kasir.
 */

const fullscreenWrapper = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  background: '#fff',
};

const escapeHtml = (value) => {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const buildMenuGridHtml = (menuItems) => {
  if (!Array.isArray(menuItems) || menuItems.length === 0) {
    return '<p class="menu-empty">Menu belum tersedia.</p>';
  }

  const cards = menuItems.map((item) => {
    const name = escapeHtml(item.nama);
    const price = typeof item.harga === 'number' ? item.harga : 0;
    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

    const category = escapeHtml(item.kategori_nama || '');
    const available = item.available !== false;
    const imageUrl = escapeHtml(getMenuImageUrl(item));

    return `
      <article class="menu-card">
        <div class="menu-card-img-wrap">
          <img src="${imageUrl}" alt="${name}" class="menu-card-img" loading="lazy" />
        </div>
        <div class="menu-card-body">
          <h3 class="menu-card-title">${name}</h3>
          ${category ? `<p class="menu-card-category">${category}</p>` : ''}
          <p class="menu-card-price">${formattedPrice}</p>
          ${
            !available
              ? '<p class="menu-card-badge menu-card-badge-unavailable">Tidak tersedia</p>'
              : ''
          }
        </div>
      </article>
    `;
  });

  return `<div class="menu-grid">${cards.join('')}</div>`;
};

const applyPlaceholders = ({ code, toko, settings, template, menu }) => {
  if (!code || typeof code !== 'string') return '';

  let rendered = code;

  const placeholders = {
    nama_toko: toko?.nama_toko,
    whatsapp: toko?.whatsapp_number,
    link_gmaps: toko?.gmaps_link,
    social_media: toko?.social_media,
    slug: settings?.slug,
    logo_url: settings?.logo_url,
    template_name: template?.name,
  };

  // Turunan / default
  if (toko?.nama_toko) {
    placeholders.meta_title = `${toko.nama_toko} - Mitra Mibebi POS`;
    placeholders.meta_description =
      `Nikmati pengalaman pesan di ${toko.nama_toko}, mitra resmi Mibebi POS.`;
  }

  // Build menu grid HTML
  const menuGridHtml = buildMenuGridHtml(menu);
  placeholders.menu_grid = menuGridHtml;

  Object.entries(placeholders).forEach(([key, value]) => {
    const safeValue = value == null ? '' : String(value);
    const pattern = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(pattern, safeValue);
  });

  return rendered;
};

const TokoWebsitePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [htmlCode, setHtmlCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError('Slug tidak valid');
      return;
    }

    if (slug === 'default') {
      navigate('/default/pesan', { replace: true });
      return;
    }

    const loadWebsite = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Coba ambil rendered_html dulu (pre-rendered di belakang layar)
        const { data: settingsRow, error: settingsErr } = await supabase
          .from('toko_website_settings')
          .select('rendered_html, rendered_at')
          .eq('slug', slug)
          .maybeSingle();

        if (settingsErr) {
          console.error('Error fetching toko website:', settingsErr);
          throw settingsErr;
        }

        const hasRenderedHtml =
          settingsRow?.rendered_html != null && String(settingsRow.rendered_html).trim() !== '';

        if (hasRenderedHtml) {
          setHtmlCode(settingsRow.rendered_html);
          setLoading(false);
          return;
        }

        // 2. Fallback: fetch settings + toko + template + menu, lalu render (replace placeholder)
        const { data, error: err } = await supabase
          .from('toko_website_settings')
          .select(`
            slug,
            logo_url,
            toko (
              id,
              nama_toko,
              whatsapp_number,
              gmaps_link,
              social_media
            ),
            toko_website_templates (
              name,
              code
            )
          `)
          .eq('slug', slug)
          .maybeSingle();

        if (err) {
          console.error('Error fetching toko website:', err);
          throw err;
        }

        if (!data) {
          setError('Toko tidak ditemukan');
          setHtmlCode(null);
          return;
        }

        const template = data.toko_website_templates;
        const code = (Array.isArray(template) ? template[0]?.code : template?.code) ?? null;
        if (!code || typeof code !== 'string') {
          setError('Template tidak tersedia');
          setHtmlCode(null);
          return;
        }

        let menu = [];
        if (data.toko?.id) {
          try {
            menu = await fetchMenuWithVariasiAndImages(data.toko.id);
          } catch (menuError) {
            console.error('Error fetching menu for website template:', menuError);
          }
        }

        const rendered = applyPlaceholders({
          code,
          toko: data.toko,
          settings: data,
          template: Array.isArray(template) ? template[0] : template,
          menu,
        });

        setHtmlCode(rendered);
      } catch (e) {
        console.error(e);
        setError('Gagal memuat halaman toko');
        setHtmlCode(null);
      } finally {
        setLoading(false);
      }
    };

    loadWebsite();
  }, [slug, navigate]);

  if (slug === 'default') {
    return null;
  }

  if (loading) {
    return (
      <div style={{ ...fullscreenWrapper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>Memuat...</p>
      </div>
    );
  }

  if (error || !htmlCode) {
    return (
      <div style={{ ...fullscreenWrapper, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 500, color: '#111' }}>{error || 'Halaman tidak ditemukan'}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#D83028', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}
        >
          Kembali ke Direktori Mitra
        </button>
      </div>
    );
  }

  return (
    <div style={fullscreenWrapper}>
      <iframe
        title="Website toko"
        srcDoc={htmlCode}
        sandbox="allow-scripts allow-same-origin"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
        }}
      />
    </div>
  );
};

export default TokoWebsitePage;
