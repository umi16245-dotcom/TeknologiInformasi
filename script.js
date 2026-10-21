/* ==========================================================================
   BelajarYuk – Pusat Edukasi Alergi
   File: script.js
   Berisi seluruh interaksi website:
   - Navigasi HP/tablet, smooth scrolling, dan scroll-spy
   - Kartu jenis alergi (data → render otomatis) + pencarian + filter
   - Modal "Pelajari Selengkapnya"
   - Tab gejala berdasarkan sistem tubuh
   - Checklist pencegahan dengan progress bar (tersimpan di peramban)
   - Video edukasi (embed YouTube responsif, URL diisi pengguna)
   - Validasi formulir kontak
   - Tombol kembali ke atas, animasi muncul, dan tahun otomatis
   ========================================================================== */

/* ==========================================================================
   BAGIAN 0 – UTILITAS UMUM
   ========================================================================== */

/**
 * Menyimpan & membaca data kecil di peramban (localStorage).
 * Dibungkus try/catch agar website tetap berjalan meskipun penyimpanan
 * diblokir (misalnya saat dibuka dengan mode privat).
 */
const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.warn('Penyimpanan peramban tidak tersedia:', error);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Tidak dapat menyimpan data:', error);
    }
  }
};

/** Menulis teks ke elemen dengan aman (mencegah HTML disisipkan sembarangan). */
function setText(element, text) {
  if (element) element.textContent = text;
}

/* ==========================================================================
   BAGIAN 1 – DATA JENIS ALERGI
   --------------------------------------------------------------------------
   Semua konten kartu alergi diletakkan di sini agar mudah diubah.
   Untuk menambah jenis alergi baru, cukup tambahkan satu objek pada array
   di bawah ini (gambar diletakkan di folder images/).
   ========================================================================== */
const daftarAlergi = [
  {
    id: 'makanan',
    nama: 'Alergi Makanan',
    kategori: 'Makanan',
    gambar: 'images/alergi-makanan.svg',
    ringkas: 'Reaksi sistem kekebalan tubuh terhadap protein tertentu dalam makanan, seperti telur, kacang, atau bahan makanan lainnya.',
    pemicu: ['Telur dan produk olahannya', 'Kacang tanah dan kacang pohon', 'Gandum dan kedelai', 'Bahan tambahan atau pengawet tertentu'],
    gejala: ['Gatal atau kemerahan di mulut dan sekitar bibir', 'Biduran dan gatal pada kulit', 'Mual, muntah, atau diare', 'Sesak napas pada reaksi berat'],
    penjelasan: 'Alergi makanan muncul ketika sistem kekebalan tubuh menganggap protein pada makanan tertentu sebagai zat berbahaya. Reaksi biasanya muncul beberapa menit hingga dua jam setelah makanan dikonsumsi. Keparahan reaksi berbeda pada setiap orang dan dapat berubah seiring waktu. Beberapa orang juga perlu mewaspadai kontaminasi silang, misalnya alat masak yang dipakai bersama.',
    pencegahan: ['Baca label komposisi makanan dengan teliti', 'Beri tahu keluarga, teman, atau pelayan tentang alergi Anda', 'Waspadai risiko kontaminasi silang saat memasak atau makan di luar', 'Konsultasikan dengan dokter atau ahli gizi untuk rencana makan yang aman']
  },
  {
    id: 'susu',
    nama: 'Alergi Susu',
    kategori: 'Makanan',
    gambar: 'images/alergi-susu.svg',
    ringkas: 'Reaksi sistem kekebalan tubuh terhadap protein susu, umumnya protein susu sapi dan produk turunannya.',
    pemicu: ['Susu sapi dan susu hewan lainnya', 'Keju, mentega, dan yoghurt', 'Produk olahan yang mengandung susu (kue, cokelat, saus)', 'Makanan yang diproses di fasilitas yang juga mengolah susu'],
    gejala: ['Biduran atau ruam gatal setelah minum atau makan produk susu', 'Mual, muntah, atau diare', 'Kembung dan nyeri perut', 'Sesak napas atau mengi pada reaksi berat'],
    penjelasan: 'Alergi susu berbeda dengan intoleransi laktosa. Intoleransi laktosa berkaitan dengan pencernaan gula laktosa, sedangkan alergi susu melibatkan sistem kekebalan tubuh terhadap protein susu (misalnya kasein dan whey). Karena itu, penanganan keduanya berbeda dan perlu dipastikan melalui pemeriksaan tenaga kesehatan.',
    pencegahan: ['Periksa label untuk kata “susu”, “whey”, “kasein”, atau “laktosa”', 'Pilih alternatif sesuai anjuran tenaga kesehatan, bukan berdasarkan asumsi sendiri', 'Beri tahu pengasuh, guru, atau rekan kerja tentang alergi susu', 'Diskusikan kebutuhan kalsium pengganti dengan dokter atau ahli gizi']
  },
  {
    id: 'seafood',
    nama: 'Alergi Seafood',
    kategori: 'Makanan',
    gambar: 'images/alergi-seafood.svg',
    ringkas: 'Reaksi alergi terhadap makanan laut seperti udang, kepiting, kerang, cumi, dan ikan tertentu.',
    pemicu: ['Udang, kepiting, dan lobster', 'Kerang, tiram, dan cumi-cumi', 'Ikan tertentu', 'Kaldu, saus, atau bumbu berbahan dasar makanan laut'],
    gejala: ['Biduran dan gatal menyeluruh', 'Pembengkakan pada bibir, wajah, atau kelopak mata', 'Mual, kram perut, atau diare', 'Sesak napas atau mengi'],
    penjelasan: 'Alergi seafood umumnya disebabkan oleh protein pada hewan laut. Pada sebagian orang, reaksi juga dapat muncul karena histamin dalam jumlah tinggi pada ikan yang tidak segar (keracunan histamin), yang gejalanya mirip alergi. Karena itu, gejala yang muncul perlu dipastikan penyebabnya oleh tenaga kesehatan.',
    pencegahan: ['Hindari seluruh jenis makanan laut yang menjadi pemicu', 'Tanyakan bahan pada makanan olahan, saus, atau kaldu', 'Hati-hati saat makan di restoran seafood karena risiko kontaminasi silang tinggi', 'Siapkan rencana penanganan bila pernah mengalami reaksi berat']
  },
  {
    id: 'obat',
    nama: 'Alergi Obat',
    kategori: 'Obat',
    gambar: 'images/alergi-obat.svg',
    ringkas: 'Reaksi sistem kekebalan tubuh terhadap zat aktif atau bahan tambahan dalam obat tertentu.',
    pemicu: ['Golongan antibiotik tertentu (misalnya penisilin) sesuai riwayat masing-masing', 'Obat pereda nyeri tertentu', 'Obat antikejang tertentu', 'Bahan tambahan atau pewarna pada sediaan obat'],
    gejala: ['Ruam kulit yang muncul setelah minum obat', 'Biduran dan gatal', 'Pembengkakan pada wajah, bibir, atau lidah', 'Sesak napas, demam, atau kelainan darah pada reaksi berat'],
    penjelasan: 'Alergi obat dapat muncul pada pemakaian pertama atau setelah pemakaian berulang. Tidak semua ruam setelah minum obat berarti alergi, karena bisa juga reaksi efek samping biasa. Namun, riwayat alergi obat harus selalu dicatat dan diberitahukan kepada dokter maupun apoteker agar pilihan terapi tetap aman.',
    pencegahan: ['Catat nama obat yang pernah menimbulkan reaksi, termasuk tanggal dan gejalanya', 'Informasikan riwayat alergi kepada setiap dokter dan apoteker', 'Jangan mengulang pemakaian obat yang dicurigai memicu reaksi tanpa konsultasi', 'Minta penjelasan mengenai alternatif obat yang lebih aman dari tenaga kesehatan']
  },
  {
    id: 'debu',
    nama: 'Alergi Debu',
    kategori: 'Lingkungan',
    gambar: 'images/alergi-debu.svg',
    ringkas: 'Reaksi terhadap alergen yang terdapat pada debu rumah, terutama tungau debu, serpihan kulit, dan bulu hewan mikroskopis.',
    pemicu: ['Tungau debu pada kasur, bantal, dan selimut', 'Debu yang menumpuk pada karpet, gorden, atau rak', 'Sisa serpihan kulit manusia dan hewan', 'Kelembapan ruangan yang tinggi'],
    gejala: ['Bersin berulang dan hidung berair', 'Hidung tersumbat atau gatal', 'Mata merah, gatal, dan berair', 'Batuk atau mengi, terutama pada penderita asma'],
    penjelasan: 'Tungau debu adalah makhluk sangat kecil yang hidup pada debu rumah, terutama di tempat lembap dan hangat seperti kasur serta bantal. Kotoran tungau debu merupakan alergen yang sering memicu gejala mirip pilek berkepanjangan. Gejala biasanya memburuk di dalam ruangan atau saat bangun tidur.',
    pencegahan: ['Cuci seprai, sarung bantal, dan selimut secara rutin dengan air hangat', 'Jemur dan bersihkan kasur secara berkala', 'Gunakan sarung kasur dan bantal antipartikel bila memungkinkan', 'Kurangi barang yang mudah menumpuk debu dan jaga sirkulasi udara']
  },
  {
    id: 'hewan',
    nama: 'Alergi Hewan',
    kategori: 'Lingkungan',
    gambar: 'images/alergi-hewan.svg',
    ringkas: 'Reaksi terhadap alergen dari serpihan kulit, air liur, atau urine hewan berbulu seperti kucing dan anjing.',
    pemicu: ['Serpihan kulit (dander) kucing dan anjing', 'Air liur hewan yang menempel pada bulu', 'Urine hewan, terutama pada hewan pengerat', 'Bulu atau serat hewan pada perabot dan pakaian'],
    gejala: ['Bersin dan hidung berair setelah dekat hewan', 'Mata gatal dan berair', 'Ruam atau biduran pada kulit yang tersentuh', 'Sesak napas atau mengi pada orang dengan asma'],
    penjelasan: 'Alergen hewan berukuran sangat kecil sehingga dapat bertahan lama di udara dan menempel pada perabot, karpet, serta pakaian. Karena itu, gejala bisa muncul walaupun hewan peliharaan tidak berada di ruangan yang sama. Reaksi umumnya muncul cepat setelah kontak.',
    pencegahan: ['Batasi area hewan di rumah, terutama kamar tidur', 'Cuci tangan dan ganti pakaian setelah berinteraksi dengan hewan', 'Bersihkan perabot dan lantai secara rutin dengan lap basah', 'Diskusikan dengan dokter bila gejala tetap muncul meskipun paparan dikurangi']
  },
  {
    id: 'kosmetik',
    nama: 'Alergi Kosmetik',
    kategori: 'Produk',
    gambar: 'images/alergi-kosmetik.svg',
    ringkas: 'Reaksi terhadap bahan tertentu dalam produk kosmetik atau perawatan kulit, seperti pewangi, pengawet, atau pewarna.',
    pemicu: ['Parfum dan pewangi sintetis', 'Pengawet tertentu pada krim dan losion', 'Pewarna dan bahan aktif tertentu', 'Produk perawatan kuku atau rambut'],
    gejala: ['Kemerahan dan rasa terbakar pada area pemakaian', 'Gatal, kulit kering, atau bersisik', 'Bentol kecil atau ruam yang meluas', 'Kelopak mata bengkak bila produk terkena area mata'],
    penjelasan: 'Reaksi terhadap kosmetik bisa berupa alergi maupun iritasi. Iritasi umumnya muncul pada pemakaian pertama dan terbatas pada area yang dikenai produk, sedangkan alergi dapat muncul setelah pemakaian berulang dan bisa meluas. Tes tempel (patch test) oleh tenaga kesehatan dapat membantu menemukan bahan penyebabnya.',
    pencegahan: ['Uji produk baru pada area kecil kulit lebih dulu selama 1–2 hari', 'Hentikan pemakaian produk yang memicu kemerahan atau gatal', 'Pilih produk dengan komposisi lebih sederhana sesuai anjuran tenaga kesehatan', 'Catat bahan yang menimbulkan reaksi agar mudah dihindari']
  },
  {
    id: 'serangga',
    nama: 'Alergi Gigitan atau Sengatan Serangga',
    kategori: 'Serangga',
    gambar: 'images/alergi-serangga.svg',
    ringkas: 'Reaksi terhadap racun atau zat yang masuk ketika serangga menyengat atau menggigit, seperti lebah, tawon, dan semut api.',
    pemicu: ['Sengatan lebah, tawon, atau tabuhan', 'Gigitan semut api', 'Gigitan nyamuk pada orang dengan sensitivitas tertentu', 'Gigitan serangga lain yang meninggalkan zat tertentu di kulit'],
    gejala: ['Nyeri, kemerahan, dan bengkak pada lokasi sengatan', 'Biduran dan gatal yang menyebar', 'Pembengkakan pada wajah, bibir, atau tenggorokan', 'Sesak napas, pusing, atau pingsan pada reaksi berat'],
    penjelasan: 'Reaksi lokal seperti bengkak dan nyeri di sekitar sengatan adalah hal umum. Namun, pada sebagian orang dapat terjadi reaksi sistemik yang menyebar ke seluruh tubuh dan berpotensi berat. Reaksi berat setelah sengatan perlu ditangani segera sebagai keadaan darurat medis.',
    pencegahan: ['Gunakan pakaian pelindung dan hindari parfum menyengat saat berada di luar ruangan', 'Jauhi sarang serangga dan jangan mengganggu serangga', 'Bila disengat, jauhkan diri dari area tersebut dan bersihkan luka sesuai anjuran', 'Konsultasikan dengan dokter bila memiliki riwayat reaksi berat terhadap sengatan']
  }
];

/* ==========================================================================
   BAGIAN 2 –  KARTU ALERGI, PENCARIAN, DAN FILTER
   ========================================================================== */
const allergyGrid = document.getElementById('allergyGrid');
const allergySearch = document.getElementById('allergySearch');
const searchClear = document.getElementById('searchClear');
const filterChips = document.getElementById('filterChips');
const noResult = document.getElementById('noResult');
const resultCount = document.getElementById('resultCount');
const resetSearchBtn = document.getElementById('resetSearch');

// Menyimpan filter yang sedang aktif ('Semua' = tampil semua)
let kategoriAktif = 'Semua';
let kataKunci = '';

/** Membuat satu kartu alergi dalam bentuk HTML. */
function buatKartuAlergi(item) {
  return `
    <article class="allergy-card reveal" data-id="${item.id}">
      <div class="allergy-thumb">
        <img src="${item.gambar}" alt="Ilustrasi ${item.nama}" loading="lazy" width="480" height="300" />
        <span class="allergy-cat">${item.kategori}</span>
      </div>
      <div class="allergy-body">
        <h3>${item.nama}</h3>
        <p>${item.ringkas}</p>
        <div class="allergy-meta">
          <span class="tag">${item.pemicu.length} pemicu umum</span>
          <span class="tag">${item.gejala.length} contoh gejala</span>
        </div>
        <button class="btn btn-primary btn-sm" type="button" data-detail="${item.id}">
          Pelajari Selengkapnya
        </button>
      </div>
    </article>
  `;
}

/** Menampilkan kartu sesuai kata kunci pencarian dan filter kategori. */
function tampilkanAlergi() {
  const kunci = kataKunci.trim().toLowerCase();

  // Menyaring data berdasarkan kategori kemudian kata kunci
  const hasil = daftarAlergi.filter((item) => {
    const cocokKategori = kategoriAktif === 'Semua' || item.kategori === kategoriAktif;
    const cocokKunci =
      kunci === '' ||
      item.nama.toLowerCase().includes(kunci) ||
      item.ringkas.toLowerCase().includes(kunci) ||
      item.kategori.toLowerCase().includes(kunci) ||
      item.pemicu.join(' ').toLowerCase().includes(kunci);
    return cocokKategori && cocokKunci;
  });

  allergyGrid.innerHTML = hasil.map(buatKartuAlergi).join('');

  // Pesan jumlah hasil
  if (hasil.length === 0) {
    setText(resultCount, '');
    noResult.hidden = false;
  } else {
    noResult.hidden = true;
    setText(resultCount, `Menampilkan ${hasil.length} dari ${daftarAlergi.length} jenis alergi.`);
  }

  // Tampilkan/sembunyikan tombol hapus pencarian
  searchClear.classList.toggle('is-visible', kunci !== '');

  // Aktifkan kembali animasi muncul untuk kartu yang baru dirender
  pasangAnimasiMuncul();
}

/** Membuat tombol filter kategori secara otomatis dari data. */
function buatFilterKategori() {
  const kategori = ['Semua', ...new Set(daftarAlergi.map((item) => item.kategori))];
  filterChips.innerHTML = kategori
    .map(
      (kat) =>
        `<button class="chip${kat === 'Semua' ? ' is-active' : ''}" type="button" data-kategori="${kat}">${kat}</button>`
    )
    .join('');
}

// Interaksi pencarian
allergySearch.addEventListener('input', (event) => {
  kataKunci = event.target.value;
  tampilkanAlergi();
});

searchClear.addEventListener('click', () => {
  allergySearch.value = '';
  kataKunci = '';
  allergySearch.focus();
  tampilkanAlergi();
});

// Interaksi filter kategori (event delegation agar hemat memori)
filterChips.addEventListener('click', (event) => {
  const tombol = event.target.closest('.chip');
  if (!tombol) return;

  kategoriAktif = tombol.dataset.kategori;

  // Perbarui tampilan tombol filter
  filterChips.querySelectorAll('.chip').forEach((chip) => chip.classList.remove('is-active'));
  tombol.classList.add('is-active');

  tampilkanAlergi();
});

// Tombol "Tampilkan semua" pada pesan hasil kosong
resetSearchBtn.addEventListener('click', () => {
  allergySearch.value = '';
  kataKunci = '';
  kategoriAktif = 'Semua';
  filterChips.querySelectorAll('.chip').forEach((chip) => {
    chip.classList.toggle('is-active', chip.dataset.kategori === 'Semua');
  });
  tampilkanAlergi();
});

/* ==========================================================================
   BAGIAN 3 – MODAL DETAIL ALERGI
   ========================================================================== */
const modal = document.getElementById('allergyModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
let elemenFokusSebelumnya = null;

/** Menampilkan modal berisi detail lengkap satu jenis alergi. */
function bukaModal(id) {
  const item = daftarAlergi.find((alergi) => alergi.id === id);
  if (!item) return;

  const keList = (arr) => arr.map((teks) => `<li>${teks}</li>`).join('');

  modalBody.innerHTML = `
    <div class="modal-hero">
      <img src="${item.gambar}" alt="Ilustrasi ${item.nama}" width="480" height="300" />
    </div>
    <div class="modal-content">
      <span class="allergy-cat" style="position:static;display:inline-block;margin-bottom:10px;">${item.kategori}</span>
      <h3 id="modalTitle">${item.nama}</h3>
      <p>${item.penjelasan}</p>

      <h4>🔎 Pemicu umum</h4>
      <ul>${keList(item.pemicu)}</ul>

      <h4>🩹 Contoh gejala</h4>
      <ul>${keList(item.gejala)}</ul>

      <h4>🛡️ Langkah pencegahan</h4>
      <ul>${keList(item.pencegahan)}</ul>

      <p class="modal-alert">
        ⚠️ Informasi ini bersifat edukatif dan tidak menggantikan pemeriksaan tenaga kesehatan.
        Bila muncul sesak napas, pembengkakan lidah atau tenggorokan, atau pingsan, segera cari
        pertolongan medis darurat.
      </p>
    </div>
  `;

  elemenFokusSebelumnya = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden'; // cegah halaman ikut menggulir
  modalClose.focus();
}

/** Menutup modal dan mengembalikan fokus ke tombol sebelumnya. */
function tutupModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  if (elemenFokusSebelumnya) elemenFokusSebelumnya.focus();
}

// Klik tombol "Pelajari Selengkapnya" (event delegation)
allergyGrid.addEventListener('click', (event) => {
  const tombol = event.target.closest('[data-detail]');
  if (tombol) bukaModal(tombol.dataset.detail);
});

// Menutup modal: tombol silang, klik latar gelap, dan tombol Escape
modalClose.addEventListener('click', tutupModal);
modal.addEventListener('click', (event) => {
  if (event.target.hasAttribute('data-close-modal')) tutupModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) tutupModal();
});

/* ==========================================================================
   BAGIAN 4 – TAB GEJALA BERDASARKAN SISTEM TUBUH
   ========================================================================== */
const tabButtons = document.querySelectorAll('.tab-btn');

tabButtons.forEach((tombol) => {
  tombol.addEventListener('click', () => {
    // Nonaktifkan semua tab
    tabButtons.forEach((btn) => btn.setAttribute('aria-selected', 'false'));
    document.querySelectorAll('.tab-panel').forEach((panel) => (panel.hidden = true));

    // Aktifkan tab yang diklik
    tombol.setAttribute('aria-selected', 'true');
    const panel = document.getElementById(tombol.getAttribute('aria-controls'));
    if (panel) panel.hidden = false;
  });
});

/* ==========================================================================
   BAGIAN 5 – CHECKLIST PENCEGAHAN + PROGRESS BAR
   ========================================================================== */
const langkahPencegahan = [
  'Mengenali dan menghindari pemicu alergi yang sudah diketahui.',
  'Membaca label komposisi makanan dan obat sebelum digunakan.',
  'Menjaga kebersihan kamar serta mengurangi paparan tungau debu.',
  'Menjaga kebersihan lingkungan dan rutin mencuci tangan.',
  'Menggunakan kosmetik dengan hati-hati dan menghentikan produk yang menimbulkan reaksi.',
  'Berkonsultasi dengan tenaga kesehatan mengenai alergi obat.',
  'Menghindari makanan pemicu yang telah diketahui menyebabkan alergi.',
  'Menyiapkan rencana penanganan alergi bersama tenaga kesehatan bila memiliki riwayat reaksi berat.'
];

const checklistEl = document.getElementById('preventionChecklist');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const resetChecklistBtn = document.getElementById('resetChecklist');

// Membaca status checklist yang tersimpan sebelumnya (default: kosong)
let statusChecklist = storage.get('belajaryuk-checklist', []);

/** Menggambar daftar checklist ke halaman. */
function renderChecklist() {
  checklistEl.innerHTML = langkahPencegahan
    .map(
      (teks, index) => `
      <li class="${statusChecklist.includes(index) ? 'is-checked' : ''}">
        <label for="langkah-${index}">
          <input type="checkbox" id="langkah-${index}" data-index="${index}"
                 ${statusChecklist.includes(index) ? 'checked' : ''} />
          <span>${teks}</span>
        </label>
      </li>`
    )
    .join('');

  perbaruiProgress();
}

/** Memperbarui progress bar sesuai jumlah langkah yang dicentang. */
function perbaruiProgress() {
  const total = langkahPencegahan.length;
  const selesai = statusChecklist.length;
  const persen = Math.round((selesai / total) * 100);

  progressFill.style.width = persen + '%';
  setText(progressText, `${selesai} dari ${total}`);
  progressBar.setAttribute('aria-valuenow', String(persen));

  if (selesai === total) {
    setText(progressText, `${selesai} dari ${total} — semua langkah sudah dicatat! 🎉`);
  }
}

// Menangani centang/lepas centang
checklistEl.addEventListener('change', (event) => {
  const input = event.target;
  if (!input.matches('input[type="checkbox"]')) return;

  const index = Number(input.dataset.index);
  if (input.checked) {
    if (!statusChecklist.includes(index)) statusChecklist.push(index);
  } else {
    statusChecklist = statusChecklist.filter((item) => item !== index);
  }

  input.closest('li').classList.toggle('is-checked', input.checked);
  storage.set('belajaryuk-checklist', statusChecklist);
  perbaruiProgress();
});

// Mengosongkan checklist
resetChecklistBtn.addEventListener('click', () => {
  statusChecklist = [];
  storage.set('belajaryuk-checklist', statusChecklist);
  renderChecklist();
});

/* ==========================================================================
   BAGIAN 6 – VIDEO EDUKASI (EMBED YOUTUBE RESPONSIF)
   --------------------------------------------------------------------------
   Tautan video dibiarkan kosong terlebih dahulu (tidak membuat tautan palsu).
   Pengguna dapat menempelkan URL YouTube pada tiap kartu dan tautan akan
   tersimpan di peramban.
   ========================================================================== */
const daftarVideo = [
  {
    id: 'video-1',
    judul: 'Apa Itu Alergi?',
    deskripsi: 'Penjelasan dasar mengenai alergi, cara kerja sistem kekebalan tubuh, dan mengapa reaksi alergi bisa muncul.',
    rekomendasi: 'Cari kanal resmi Kementerian Kesehatan RI atau fasilitas kesehatan terverifikasi.'
  },
  {
    id: 'video-2',
    judul: 'Mengenali Gejala Alergi Sejak Dini',
    deskripsi: 'Mengenal tanda dan gejala alergi pada kulit, saluran pernapasan, mata, dan pencernaan, serta kapan harus waspada.',
    rekomendasi: 'Pilih video dari dokter atau institusi kesehatan yang kredibel.'
  },
  {
    id: 'video-3',
    judul: 'Macam-Macam Alergi dan Pemicu Umumnya',
    deskripsi: 'Ulasan pemicu alergi sehari-hari: makanan, debu, hewan, obat, kosmetik, hingga sengatan serangga.',
    rekomendasi: 'Gunakan video edukasi dari kanal rumah sakit atau lembaga kesehatan.'
  },
  {
    id: 'video-4',
    judul: 'Cara Mencegah dan Mengurangi Paparan Alergen',
    deskripsi: 'Langkah praktis di rumah dan di luar rumah untuk mengurangi paparan alergen dan mencegah reaksi berulang.',
    rekomendasi: 'Cari video dengan narasumber tenaga kesehatan.'
  },
  {
    id: 'video-5',
    judul: 'Mengenal Golongan Obat Alergi',
    deskripsi: 'Gambaran umum golongan obat alergi: antihistamin, kortikosteroid, dekongestan, dan obat untuk reaksi berat.',
    rekomendasi: 'Utamakan video dari apoteker, dokter, atau institusi resmi.'
  }
];

const videoGrid = document.getElementById('videoGrid');

/** Mengubah tautan YouTube menjadi ID video (mendukung beberapa format URL). */
function ambilIdYoutube(url) {
  if (!url) return null;
  const pola = [
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /[?&]v=([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/
  ];
  for (const p of pola) {
    const hasil = url.match(p);
    if (hasil) return hasil[1];
  }
  return null;
}

/** Merender seluruh kartu video. */
function renderVideo(https://youtu.be/1OFeha6hqdo?si=gpDlnHyrZbyquCCp) {
  const simpanan = storage.get('belajaryuk-video', {});

  videoGrid.innerHTML = daftarVideo
    .map((video, index) => {
      const url = simpanan[video.id] || '';
      return `
      <article class="video-card reveal">
        <div class="video-frame" id="frame-${video.id}">
          ${buatIsiFrame(url, video.judul)}
        </div>
        <div class="video-body">
          <span class="video-num">Video ${index + 1}</span>
          <h3>${video.judul}</h3>
          <p>${video.deskripsi}</p>

          <details class="video-setup">
            <summary>Atur tautan video</summary>
            <div class="video-setup-form">
              <label class="sr-only" for="input-${video.id}">URL YouTube untuk ${video.judul}</label>
              <input type="url" id="input-${video.id}" data-video-input="${video.id}"
                     placeholder="https://www.youtube.com/watch?v=..." value="${url}" />
              <div class="video-setup-actions">
                <button class="btn btn-primary btn-sm" type="button" data-video-save="${video.id}">Muat Video</button>
                <button class="btn btn-ghost btn-sm" type="button" data-video-reset="${video.id}">Kosongkan</button>
              </div>
              <p class="video-hint">${video.rekomendasi}</p>
            </div>
          </details>
        </div>
      </article>`;
    })
    .join('');
}

/** Membuat isi area pemutar video: iframe bila URL valid, atau poster bila kosong. */
function buatIsiFrame(url, judul) {
  const videoId = ambilIdYoutube(url);

  if (videoId) {
    return `
      <iframe
        src="https://www.youtube-nocookie.com/embed/${videoId}"
        title="${judul}"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>`;
  }

  return `
    <div class="video-poster">
      <img src="images/video-poster.svg" alt="Gambar pratinjau untuk video ${judul}" loading="lazy" width="640" height="360" />
      <span>Belum ada tautan video — isi melalui “Atur tautan video” di bawah.</span>
    </div>`;
}

eo', {});
    simpanan[id] = url;
    storage.set('belajaryuk-video', simpanan);// Menyimpan URL video yang dimasukkan pengguna
videoGrid.addEventListener('click', (event) => {
  const tombolSimpan = event.target.closest('[data-video-save]');
  const tombolReset = event.target.closest('[data-video-reset]');

  if (tombolSimpan) {
    const id = tombolSimpan.dataset.videoSave;
    const input = document.getElementById(`input-${id}`);
    const url = input.value.trim();
    const video = daftarVideo.find((item) => item.id === id);

    if (url && !ambilIdYoutube(url)) {
      alert('Tautan belum dikenali. Gunakan tautan YouTube, contoh: https://www.youtube.com/watch?v=XXXXXXXXXXX');
      return;
    }

    const simpanan = storage.get('belajaryuk-vid

    document.getElementById(`frame-${id}`).innerHTML = buatIsiFrame(url, video.judul);
  }

  if (tombolReset) {
    const id = tombolReset.dataset.videoReset;
    const video = daftarVideo.find((item) => item.id === id);
    const simpanan = storage.get('belajaryuk-video', {});
    delete simpanan[id];
    storage.set('belajaryuk-video', simpanan);

    document.getElementById(`input-${id}`).value = '';
    document.getElementById(`frame-${id}`).innerHTML = buatIsiFrame('', video.judul);
  }
});

/* ==========================================================================
   BAGIAN 7 – VALIDASI FORMULIR KONTAK
   --------------------------------------------------------------------------
   Formulir ini hanya berjalan di sisi peramban (front-end).
   Untuk benar-benar mengirim pesan, isi variabel FORM_ENDPOINT di bawah
   dengan alamat layanan formulir (misalnya Formspree/Getform) atau API kampus.
   ========================================================================== */
const FORM_ENDPOINT = ''; // contoh: 'https://formspree.io/f/xxxxxxx'

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

// Aturan validasi sederhana: [id elemen, id pesan error, fungsi pemeriksa, teks error]
const aturanValidasi = [
  {
    input: 'nama',
    error: 'errorNama',
    cek: (nilai) => nilai.trim().length >= 3,
    pesan: 'Nama minimal 3 karakter.'
  },
  {
    input: 'email',
    error: 'errorEmail',
    cek: (nilai) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(nilai.trim()),
    pesan: 'Masukkan alamat email yang valid, contoh: nama@email.com.'
  },
  {
    input: 'subjek',
    error: 'errorSubjek',
    cek: (nilai) => nilai.trim().length >= 4,
    pesan: 'Subjek minimal 4 karakter.'
  },
  {
    input: 'pesan',
    error: 'errorPesan',
    cek: (nilai) => nilai.trim().length >= 15,
    pesan: 'Pesan minimal 15 karakter agar dapat dipahami dengan jelas.'
  }
];

/** Memeriksa satu kolom dan menampilkan pesan kesalahan bila perlu. */
function periksaKolom(aturan) {
  const input = document.getElementById(aturan.input);
  const pesanEl = document.getElementById(aturan.error);
  const row = input.closest('.form-row');
  const valid = aturan.cek(input.value);

  row.classList.toggle('has-error', !valid);
  row.classList.toggle('is-valid', valid && input.value.trim() !== '');
  setText(pesanEl, valid ? '' : aturan.pesan);

  return valid;
}

// Validasi saat pengguna selesai mengisi kolom
aturanValidasi.forEach((aturan) => {
  const input = document.getElementById(aturan.input);
  input.addEventListener('blur', () => periksaKolom(aturan));
  input.addEventListener('input', () => {
    // Pesan kesalahan langsung hilang saat pengguna memperbaiki isian
    if (input.closest('.form-row').classList.contains('has-error')) periksaKolom(aturan);
  });
});

// Proses kirim formulir
contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Validasi seluruh kolom
  const hasil = aturanValidasi.map(periksaKolom);
  const semuaValid = hasil.every(Boolean);

  if (!semuaValid) {
    formStatus.innerHTML = '<div class="status-err">Mohon periksa kembali kolom yang ditandai merah.</div>';
    const kolomPertamaBermasalah = contactForm.querySelector('.form-row.has-error input, .form-row.has-error textarea');
    if (kolomPertamaBermasalah) kolomPertamaBermasalah.focus();
    return;
  }

  const data = {
    nama: document.getElementById('nama').value.trim(),
    email: document.getElementById('email').value.trim(),
    subjek: document.getElementById('subjek').value.trim(),
    pesan: document.getElementById('pesan').value.trim()
  };

  // Contoh 1: belum ada endpoint → tampilkan keterangan edukatif (tanpa berpura-pura mengirim)
  if (!FORM_ENDPOINT) {
    formStatus.innerHTML = `
      <div class="status-ok">
        ✅ Terima kasih, <strong>${data.nama}</strong>! Data formulir sudah lolos validasi di peramban.
        <br /><span class="muted">Catatan: formulir ini adalah contoh front-end, jadi pesan belum benar-benar
        terkirim ke server. Hubungkan ke layanan formulir atau API pada variabel
        <code>FORM_ENDPOINT</code> di <code>script.js</code> bila ingin mengaktifkan pengiriman.</span>
      </div>`;
    contactForm.reset();
    bersihkanTandaValidasi();
    return;
  }

  // Contoh 2: endpoint tersedia → kirim data memakai fetch
  submitBtn.disabled = true;
  submitBtn.textContent = 'Mengirim…';

  try {
    const respons = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    });

    if (!respons.ok) throw new Error('Gagal mengirim');

    formStatus.innerHTML = '<div class="status-ok">✅ Pesan berhasil dikirim. Terima kasih atas masukannya!</div>';
    contactForm.reset();
    bersihkanTandaValidasi();
  } catch (error) {
    formStatus.innerHTML = `
      <div class="status-err">❌ Maaf, pesan gagal dikirim. Silakan coba lagi atau hubungi
      pengelola melalui email yang tertera.</div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Kirim Pesan';
  }
});

/** Menghapus tanda valid/kuning setelah formulir direset. */
function bersihkanTandaValidasi() {
  contactForm.querySelectorAll('.form-row').forEach((row) => row.classList.remove('is-valid', 'has-error'));
  aturanValidasi.forEach((aturan) => setText(document.getElementById(aturan.error), ''));
}

/* ==========================================================================
   BAGIAN 8 – NAVIGASI: MENU HP, SCROLL-SPY, HEADER, SMOOTH SCROLL
   ========================================================================== */
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');
const siteHeader = document.getElementById('siteHeader');
const navLinks = document.querySelectorAll('.nav-link');

// Buka/tutup menu pada layar kecil
navToggle.addEventListener('click', () => {
  const terbuka = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!terbuka));
  navToggle.setAttribute('aria-label', terbuka ? 'Buka menu navigasi' : 'Tutup menu navigasi');
  primaryNav.classList.toggle('is-open', !terbuka);
});

// Tutup menu otomatis setelah salah satu tautan diklik
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    primaryNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Tutup menu bila area di luar menu diklik
document.addEventListener('click', (event) => {
  if (!primaryNav.classList.contains('is-open')) return;
  if (primaryNav.contains(event.target) || navToggle.contains(event.target)) return;
  primaryNav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
});

/** Smooth scrolling untuk semua tautan yang menuju bagian dalam halaman. */
document.querySelectorAll('a[href^="#"]').forEach((tautan) => {
  tautan.addEventListener('click', (event) => {
    const id = tautan.getAttribute('href');
    if (id === '#' || id.length < 2) return;

    const tujuan = document.querySelector(id);
    if (!tujuan) return;

    event.preventDefault();
    tujuan.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Perbarui URL tanpa lompatan halaman
    history.replaceState(null, '', id);
  });
});

/** Scroll-spy: menandai menu yang sesuai dengan bagian yang sedang dilihat. */
const semuaSection = document.querySelectorAll('main section[id]');

function tandaiMenuAktif() {
  const posisi = window.scrollY + 140;
  let idAktif = '';

  semuaSection.forEach((section) => {
    if (section.offsetTop <= posisi) idAktif = section.id;
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${idAktif}`);
  });
}

/* ==========================================================================
   BAGIAN 9 – TOMBOL KE ATAS, ANIMASI MUNCUL, DAN TAHUN OTOMATIS
   ========================================================================== */
const backToTop = document.getElementById('backToTop');

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/** Efek bayangan header + tombol ke atas + menu aktif saat menggulir. */
function tanganiGulir() {
  const sudahDigulir = window.scrollY > 20;
  siteHeader.classList.toggle('is-scrolled', sudahDigulir);
  backToTop.classList.toggle('is-visible', window.scrollY > 420);
  tandaiMenuAktif();
}

// Menghindari pemanggilan berlebihan dengan requestAnimationFrame
let menungguGulir = false;
window.addEventListener('scroll', () => {
  if (menungguGulir) return;
  menungguGulir = true;
  requestAnimationFrame(() => {
    tanganiGulir();
    menungguGulir = false;
  });
});

/** Animasi ringan saat elemen dengan kelas .reveal masuk ke layar. */
let pengamat = null;

function pasangAnimasiMuncul() {
  const elemen = document.querySelectorAll('.reveal:not(.is-visible)');

  // Bila IntersectionObserver tidak didukung, langsung tampilkan semua elemen
  if (!('IntersectionObserver' in window)) {
    elemen.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  if (!pengamat) {
    pengamat = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            pengamat.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
  }

  elemen.forEach((el) => pengamat.observe(el));
}

// Tahun pada footer diperbarui otomatis
setText(document.getElementById('year'), new Date().getFullYear());

/* ==========================================================================
   BAGIAN 10 – MENJALANKAN SEMUA SAAT HALAMAN SIAP
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  buatFilterKategori();  // tombol filter kategori
  tampilkanAlergi();     // kartu jenis alergi
  renderVideo();         // kartu video
  renderChecklist();     // checklist pencegahan + progress
  tanganiGulir();        // status awal header & tombol ke atas
  pasangAnimasiMuncul(); // animasi elemen saat muncul di layar
});