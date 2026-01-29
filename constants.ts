
import { NewsItem, Rank } from './types';

export const INITIAL_NEWS: NewsItem[] = [
  // --- KESEHATAN ---
  {
    id: 'h1',
    headline: 'Ilmuwan Temukan Tanaman Liar di Hutan Kalimantan yang Sembuhkan Diabetes Total',
    source: 'Info Sehat Nusantara',
    url: 'www.herbal-ajaib-kalimantan.blogspot.com/temuan-heboh',
    content: 'Seorang peneliti independen mengklaim akar tanaman "Sakar" bisa menurunkan gula darah ke nol dalam semalam tanpa efek samping.',
    type: 'HOAX',
    imageUrl: 'https://picsum.photos/600/400?random=11',
    explanation: 'Klaim medis berlebihan tanpa uji klinis. Menggunakan domain blogspot gratisan untuk informasi kesehatan yang sangat krusial.',
    indicators: ['Domain Gratisan', 'Klaim Medis Instan', 'Peneliti Tidak Teridentifikasi']
  },
  {
    id: 'h2',
    headline: 'Kemenkes Luncurkan Vaksinasi Booster Kedua Untuk Lansia Gratis',
    source: 'Sehat Negeriku (Kemenkes)',
    url: 'www.kemkes.go.id/article/booster-lansia-gratis',
    content: 'Mulai minggu depan, warga di atas 60 tahun dapat mendatangi puskesmas terdekat untuk mendapatkan dosis penguat tanpa biaya.',
    type: 'FACT',
    imageUrl: 'https://picsum.photos/600/400?random=22',
    explanation: 'Informasi berasal dari domain resmi pemerintah (.go.id) dan mencantumkan lokasi layanan publik yang jelas.',
    indicators: ['Domain .go.id', 'Instansi Resmi', 'Informasi Layanan Publik']
  },
  
  // --- TEKNOLOGI & EKONOMI ---
  {
    id: 't1',
    headline: 'Peringatan: Chip HP Bisa Meledak Jika Dicharge Lebih dari 5 Jam',
    source: 'Viral Tekno News',
    url: 'www.berita-cek-fakta.com/hp-meledak-global',
    content: 'Laporan terbaru menunjukkan adanya kerentanan pada baterai lithium yang menyebabkan HP meledak jika dibiarkan tercolok semalaman.',
    type: 'HOAX',
    imageUrl: 'https://picsum.photos/600/400?random=33',
    explanation: 'Gaya bahasa provokatif ("Peringatan", "Meledak"). Ponsel modern memiliki sistem auto-cut off yang mencegah overcharge.',
    indicators: ['Bahasa Provokatif', 'Tidak Sesuai Fakta Teknis', 'Sumber Anonim']
  },
  {
    id: 't2',
    headline: 'Eksportir Kopi Indonesia Tembus Pasar Eropa dengan Nilai Kontrak Rp 50 Miliar',
    source: 'Warta Ekonomi RI',
    url: 'www.ekonews.id/ekspor-kopi-eropa',
    content: 'Koperasi petani Gayo berhasil menandatangani kontrak jangka panjang untuk menyuplai biji kopi ke jaringan kafe di Jerman dan Belanda.',
    type: 'FACT',
    imageUrl: 'https://picsum.photos/600/400?random=44',
    explanation: 'Berita ekonomi positif dengan angka yang realistis dan menyebutkan entitas bisnis yang spesifik.',
    indicators: ['Angka Realistis', 'Entitas Spesifik', 'Bahasa Netral']
  },

  // --- LINGKUNGAN ---
  {
    id: 'l1',
    headline: 'Suhu di Jakarta Akan Mencapai 50 Derajat Celsius Besok Siang',
    source: 'Cuaca Ekstrim Alert',
    url: 'www.bmkg-palsu.info/jakarta-panas-mendidih',
    content: 'BMKG memperingatkan warga untuk tidak keluar rumah karena gelombang panas ekstrim yang akan melanda ibukota besok.',
    type: 'HOAX',
    imageUrl: 'https://picsum.photos/600/400?random=55',
    explanation: 'Menggunakan nama lembaga resmi dalam URL palsu (.info). Angka suhu tidak masuk akal untuk wilayah tropis Indonesia.',
    indicators: ['URL Meniru BMKG', 'Angka Tidak Logis', 'Menimbulkan Kepanikan']
  },
  {
    id: 'l2',
    headline: 'BMKG Prediksi Musim Hujan Akan Datang Lebih Awal di Wilayah Selatan',
    source: 'BMKG Indonesia',
    url: 'www.bmkg.go.id/berita/prediksi-musim-hujan',
    content: 'Berdasarkan pengamatan anomali suhu muka laut, curah hujan tinggi diprediksi mulai melanda Jawa dan Bali pada awal Oktober.',
    type: 'FACT',
    imageUrl: 'https://picsum.photos/600/400?random=66',
    explanation: 'Informasi resmi dari institusi pemantau cuaca nasional dengan domain pemerintah yang sah.',
    indicators: ['Domain .go.id', 'Data Ilmiah BMKG', 'Pernyataan Resmi']
  },

  // --- SOSIAL & MODUS PENIPUAN ---
  {
    id: 's1',
    headline: 'Bantuan Bansos Rp 5 Juta Per KK, Cek Nama Anda di Link Berikut',
    source: 'Portal Bantuan Sosial',
    url: 'www.bansos-pemerintah-2024.xyz/klik-disini',
    content: 'Pemerintah membagikan bantuan tunai dalam rangka hari kemerdekaan. Segera isi data diri dan nomor rekening Anda.',
    type: 'HOAX',
    imageUrl: 'https://picsum.photos/600/400?random=77',
    explanation: 'Modus phishing menggunakan domain .xyz. Meminta data sensitif dan nomor rekening dengan iming-iming uang.',
    indicators: ['Domain .xyz', 'Modus Phishing', 'Iming-iming Uang']
  },
  {
    id: 's2',
    headline: 'Syarat Terbaru Pembuatan Paspor: Kini Berlaku Hingga 10 Tahun',
    source: 'Ditjen Imigrasi',
    url: 'www.imigrasi.go.id/siaran-pers/paspor-10-tahun',
    content: 'Peraturan Menteri Hukum dan HAM menetapkan masa berlaku paspor RI kini menjadi 10 tahun bagi warga negara berusia di atas 17 tahun.',
    type: 'FACT',
    imageUrl: 'https://picsum.photos/600/400?random=88',
    explanation: 'Kebijakan publik yang telah diumumkan secara luas melalui kanal berita resmi kementerian.',
    indicators: ['Domain Resmi', 'Kebijakan Sah', 'Sumber Kredibel']
  }
];

export const RANK_THRESHOLDS = [
  { rank: Rank.NOVICE, score: 0 },
  { rank: Rank.JUNIOR, score: 500 },
  { rank: Rank.SENIOR, score: 1500 },
  { rank: Rank.EXPERT, score: 3500 },
  { rank: Rank.MASTER, score: 6000 }
];
