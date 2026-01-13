export function renderFooter(rootPath = '.') {
    const pathPrefix = rootPath === '.' ? '' : (rootPath.endsWith('/') ? rootPath : rootPath + '/');

    return `
    <footer>
        <div class="footer-container">
            <div class="footer-brand">
                <img src="${pathPrefix}assets/images/ui/putih.png" alt="Logo" class="footer-logo" />
                <p>
                    Website promosi wisata resmi untuk memperkenalkan keindahan Lumajang
                    ke mata dunia. Dibuat dengan cinta oleh warga lokal.
                </p>
                <div class="footer-social">
                    <a href="https://instagram.com/explore_lumajang" target="_blank" aria-label="Instagram" class="social-link">
                        <i class="fa-brands fa-instagram"></i>
                    </a>
                    <a href="https://tiktok.com/@explorelumajang" target="_blank" aria-label="TikTok" class="social-link">
                        <i class="fa-brands fa-tiktok"></i>
                    </a>
                    <a href="https://youtube.com/@explorelumajang" target="_blank" aria-label="YouTube" class="social-link">
                        <i class="fa-brands fa-youtube"></i>
                    </a>
                    <a href="https://facebook.com/explorelumajang" target="_blank" aria-label="Facebook" class="social-link">
                        <i class="fa-brands fa-facebook"></i>
                    </a>
                </div>
            </div>

            <div class="footer-nav">
                <h4>Eksplorasi</h4>
                <a href="${pathPrefix}index.html">Beranda</a>
                <a href="${pathPrefix}destinasi.html">Destinasi</a>
                <a href="${pathPrefix}tips.html">Tips Perjalan</a>
                <a href="${pathPrefix}index.html#categories">Kategori</a>
            </div>

            <div class="footer-nav">
                <h4>Legal</h4>
                <a href="#" data-legal="privacy">Privasi</a>
                <a href="#" data-legal="terms">Syarat Ketentuan</a>
                <a href="#" data-legal="disclaimer">Disclaimer</a>
                <a href="#" data-legal="credits">Kredit</a>
            </div>

            <div class="footer-newsletter">
                <h4>Info Wisata Premium</h4>
                <p>
                    Dapatkan rekomendasi destinasi, spot foto, dan info akses terbaru
                    (tanpa spam).
                </p>

                <form id="newsletter-form" class="newsletter-input-wrapper">
                    <div class="interest-selection">
                        <span class="interest-label">Saya tertarik dengan:</span>
                        <div class="interest-tags">
                            <button type="button" class="interest-chip" data-value="waterfall">
                                Air Terjun
                            </button>
                            <button type="button" class="interest-chip" data-value="mountain">
                                Gunung
                            </button>
                            <button type="button" class="interest-chip" data-value="beach">
                                Pantai
                            </button>
                            <button type="button" class="interest-chip" data-value="culture">
                                Budaya
                            </button>
                            <button type="button" class="interest-chip" data-value="food">
                                Kuliner
                            </button>
                        </div>
                    </div>

                    <div class="newsletter-input">
                        <input type="email" id="newsletter-email" placeholder="Email kamu..." required />
                        <!-- Honeypot for Anti-Spam -->
                        <input type="text" id="website-url" name="website-url" tabindex="-1" autocomplete="off"
                            style="position: absolute; left: -9999px; opacity: 0" />
                        <button type="submit" id="newsletter-submit">
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                    <div id="newsletter-msg" class="newsletter-msg"></div>

                    <div id="trip-planner-cta" class="trip-planner-cta" style="display: none">
                        <a href="${pathPrefix}destinasi.html" class="btn btn-primary btn-sm full-width">Buat Rencana Perjalanan (2
                            mnt)</a>
                    </div>
                </form>
            </div>
        </div>
        <div class="footer-copyright">
            <p>&copy; 2024 Explore Lumajang. All Rights Reserved.</p>
        </div>
    </footer>

    <!-- LEGAL MODALS -->
    <div id="legal-modal-privacy" class="legal-modal">
        <div class="legal-content">
            <div class="legal-header">
                <h3>Kebijakan Privasi</h3>
                <button class="close-legal" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="legal-body">
                <h4>Data yang Kami Simpan</h4>
                <p>Kami hanya menyimpan alamat email dan minat wisata Anda jika Anda mendaftar newsletter. Data ini digunakan khusus untuk mengirimkan rekomendasi wisata yang relevan.</p>
                <h4>Penggunaan Data</h4>
                <p>Data Anda aman bersama kami. Kami tidak menjual atau membagikan data email Anda ke pihak ketiga manapun.</p>
                <h4>Hak Anda</h4>
                <p>Anda dapat meminta penghapusan data Anda kapan saja dengan menghubungi kami atau klik unsubscribe pada email yang diterima.</p>
            </div>
        </div>
    </div>

    <div id="legal-modal-terms" class="legal-modal">
        <div class="legal-content">
            <div class="legal-header">
                <h3>Syarat & Ketentuan</h3>
                <button class="close-legal" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="legal-body">
                <h4>Batasan Penggunaan</h4>
                <p>Informasi di website ini hanya untuk referensi pribadi. Dilarang keras mengunduh dan mengunggah ulang (re-upload) konten foto atau video tanpa izin tertulis dari pemilik hak cipta.</p>
                <h4>Perubahan Informasi</h4>
                <p>Harga tiket, jam buka, dan fasilitas tempat wisata dapat berubah sewaktu-waktu tanpa pemberitahuan. Kami berusaha menyajikan data terupdate namun tidak menjamin 100% akurasi realtime.</p>
            </div>
        </div>
    </div>

    <div id="legal-modal-disclaimer" class="legal-modal">
        <div class="legal-content">
            <div class="legal-header">
                <h3>Disclaimer</h3>
                <button class="close-legal" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="legal-body">
                <h4>Portal Independen</h4>
                <p>Explore Lumajang adalah portal informasi wisata independen dan bukan perwakilan resmi dari pemerintah atau pengelola tempat wisata manapun.</p>
                <h4>Tanggung Jawab Pengguna</h4>
                <p>Kondisi lapangan (cuaca, akses jalan) bisa berbeda dengan foto. Pengguna wajib memastikan keamanan dan kesiapan fisik pribadi sebelum berkunjung. Segala risiko perjalanan adalah tanggung jawab masing-masing.</p>
            </div>
        </div>
    </div>

    <div id="legal-modal-credits" class="legal-modal">
        <div class="legal-content">
            <div class="legal-header">
                <h3>Kredit</h3>
                <button class="close-legal" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="legal-body">
                <h4>Sumber Data Peta</h4>
                <p>&copy; OpenStreetMap Contributors, Leaflet JS.</p>
                <h4>Ikon & Aset</h4>
                <p>Kami menggunakan aset dari:</p>
                <ul>
                    <li>Font Awesome (Icons)</li>
                    <li>Feather Icons</li>
                    <li>Unsplash (Placeholder Photos)</li>
                </ul>
                <h4>Fotografi</h4>
                <p>Foto destinasi adalah karya dari kontributor lokal dan komunitas fotografi Lumajang.</p>
            </div>
        </div>
    </div>
    `;
}
