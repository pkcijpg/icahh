import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to call Gemini with robust error handling and fallback model due to high demand (503)
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  if (!ai) throw new Error("GoogleGenAI client not initialized");
  try {
    console.log("Attempting generation with gemini-3.5-flash...");
    return await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: params.contents,
      config: params.config,
    });
  } catch (error: any) {
    console.warn("gemini-3.5-flash failed, attempting fallback to gemini-3.1-flash-lite. Error:", error.message || error);
    try {
      console.log("Attempting fallback generation with gemini-3.1-flash-lite...");
      return await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: params.contents,
        config: params.config,
      });
    } catch (fallbackError: any) {
      console.error("Fallback gemini-3.1-flash-lite also failed:", fallbackError.message || fallbackError);
      throw error; // Throw original error to let the route trigger the high-quality mock fallbacks
    }
  }
}

// REST API endpoints
// 1. Generate Academic Concepts based on student preferences
app.post("/api/generate-concepts", async (req, res) => {
  try {
    const { category, time, tools } = req.body;

    if (!ai) {
      // Fallback response with beautiful academic curation in case API key is missing
      return res.json({
        concepts: getFallbackConcepts(category || "menulis", time || 30, tools || [])
      });
    }

    const focusMapping: Record<string, string> = {
      menulis: "Menulis Akademik (Esai ilmiah, tinjauan pustaka/literature review, manuskrip jurnal, proposal tugas akhir)",
      desain: "Desain Komunikasi Ilmiah (Poster akademik untuk seminar, infografis ringkasan data penelitian, slide presentasi sidang)",
      video: "Video Edukasi & Dokumenter (Video dokumenter etnografi lapangan, kampanye sosial proyek PjBL, presentasi multimedia kelompok)",
      kerajinan: "Prototipe & Alat Peraga (Maket fisik rancangan arsitektur, prototipe rekayasa teknik tingkat vokasi, alat peraga manipulatif pedagogi)"
    };

    const parsedFocus = focusMapping[category] || category;
    const toolsStr = Array.isArray(tools) && tools.length > 0 ? tools.join(", ") : "Laptop, Kertas & Pena, Referensi Jurnal";

    const prompt = `Anda adalah Asisten Proyek Akademik Mahasiswa & Kurator Kurikulum PjBL tingkat tinggi di CreativeSpark.
Susunlah tepat 5 Ide Proyek Akademik (Tugas Kuliah / Riset Mahasiswa) berbobot tinggi (High-Fidelity) dan berbasis penelitian/metode ilmiah yang relevan dengan parameter berikut:
Fokus Kategori: ${parsedFocus}
Alokasi Waktu Sesi Brainstorming Pertama: ${time} menit (Seberapa cepat mereka harus memulai draf riset/sketsa awal).
Alat Pendukung Riset yang Tersedia: ${toolsStr}

Berikan output secara ketat dalam Bahasa Indonesia dengan nada bicara yang cerdas, ilmiah, suportif, puitis namun akademis tinggi, dan bernuansa kurasi kelas tinggi (high-end academic editorial mood). Hindari templat AI generik.

Setiap tugas akademik harus memiliki:
1. Title (Judul fungsional dan akademis puitis, misal: "Sosio-Komparatif Bento Grid: Esai Kajian Kognisi Visual" atau "Model Origami Struktural: Alat Peraga Vokasi")
2. Description (Paragraf deskripsi kaya esensi riset, metodologi, dan mengajukan tantangan Project-Based Learning konkret bagi mahasiswa)
3. FitPercentage (Angka persentase kecocokan 70% s.d. 99%, misal: 95)
4. EstimatedDuration (Estimasi pengerjaan total proyek akademik, misal: "Est. 2-3 Minggu", "Est. 1 Bulan")
5. ActionSteps (Minimal 3 langkah tindakan konkret berurutan yang meniru tahapan penelitian riil: dari Pra-Riset, Sintesis Data, hingga Formulasi Portofolio SKPI)

Keluarkan dalam format JSON mentah sesuai skema schema response.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["concepts"],
          properties: {
            concepts: {
              type: Type.ARRAY,
              description: "Daftar 5 konsep tugas akademik terkurasi",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "fitPercentage", "estimatedDuration", "actionSteps"],
                properties: {
                  title: { type: Type.STRING, description: "Judul konsep tugas ilmiah/akademis puitis" },
                  description: { type: Type.STRING, description: "Analisis deskripsi riset dan tantangan PjBL" },
                  fitPercentage: { type: Type.INTEGER, description: "Kecocokan ide dengan minat user (70-99)" },
                  estimatedDuration: { type: Type.STRING, description: "Estimasi pengerjaan, contoh: 'Est. 2 Minggu'" },
                  actionSteps: {
                    type: Type.ARRAY,
                    description: "Daftar langkah aksi terperinci untuk blueprint riset",
                    items: {
                      type: Type.OBJECT,
                      required: ["stepNumber", "title", "detail"],
                      properties: {
                        stepNumber: { type: Type.INTEGER },
                        title: { type: Type.STRING, description: "Judul langkah aksi, misal: 'Audit & Studi Literatur'" },
                        detail: { type: Type.STRING, description: "Detail kegiatan akademik konkret" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({
      error: error.message,
      concepts: getFallbackConcepts(req.body.category || "menulis", req.body.time || 30, req.body.tools || [])
    });
  }
});

// 2. Generate customized anti-block strategy ("Anti-Buntu" / Academic Stress Management)
app.post("/api/generate-anti-buntu", async (req, res) => {
  try {
    const { ideaTitle, description } = req.body;

    if (!ai) {
      return res.json(getFallbackAntiBuntu(ideaTitle));
    }

    const prompt = `Seseorang sedang mengalami kemacetan berpikir akademik (creative & research block / stres akademik) saat mengerjakan tugas kuliah berikut:
Judul Tugas: ${ideaTitle}
Deskripsi/Konteks: ${description || "Proyek akademik mahasiswa"}

Tolong susun modul kurator taktis instan 'Anti-Buntu Akademik' yang cerdas, suportif, puitis, dan berjangka psikologi penanganan stres mahasiswa. Format output bertumpu pada 3 solusi utama dalam Bahasa Indonesia:
1. Cognitive Strategy (Restrukturisasi pikiran, mitigasi bias kognitif AI over-reliance agar tetap berpikir kritis dan cara menyimpulkan esensi jurnal)
2. Somatic Exercise (Peregangan tubuh akibat stres membaca referensi tebal di depan komputer, teknik pernapasan fokus)
3. Technical process adjustment (Metodologi menghindari prokrastinasi tugas kelompok, pembagian tugas dalam tim PjBL, Pomodoro terbalik)

Berikan respon JSON mentah sesuai skema schema response.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["cognitive", "somatic", "technical"],
          properties: {
            cognitive: {
              type: Type.OBJECT,
              required: ["title", "subtitle", "methods"],
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                methods: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["name", "description"],
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            somatic: {
              type: Type.OBJECT,
              required: ["title", "subtitle", "methods"],
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                methods: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["name", "description"],
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            technical: {
              type: Type.OBJECT,
              required: ["title", "subtitle", "methods"],
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                methods: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["name", "description"],
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Anti-Buntu Error:", error);
    res.status(500).json(getFallbackAntiBuntu(req.body.ideaTitle || "Eksplorasi Akademik"));
  }
});

// Fallback generator values to ensure 100% operation even if backend key is missing
function getFallbackConcepts(category: string, time: number, tools: string[]) {
  const toolsStr = tools.length > 0 ? tools.join(", ") : "Laptop, Kertas Catatan, PDF Jurnal";
  
  if (category === "menulis") {
    return [
      {
        title: "Kajian Komparatif Arsitektur Grid: Esai Literatur Kognisi Visual",
        description: `Tantangan literature review setebal 8-10 halaman mengenai korelasi spasial tata letak bento grid di situs-situs editorial modern dengan retensi memori mahasiswa, disusun menggunakan alat penunjang: ${toolsStr}.`,
        fitPercentage: 96,
        estimatedDuration: "Est. 2-3 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Pra-Riset & Studi Pustaka", detail: "Kumpulkan 5 jurnal ilmiah penataan visual digital berindeks Scopus/Sinta." },
          { stepNumber: 2, title: "Sintesis Data & Outline", detail: "Sederhanakan poin pemikiran menjadi 3 klaim kognitif tanpa ketumpangtindihan argumen." },
          { stepNumber: 3, title: "Penulisan Draft & Harvard Citation", detail: "Susun draf esai terstruktur IMRAD dengan sitasi baku untuk draf portofolio kelulusan." }
        ]
      },
      {
        title: "Sintaks Semantis HTML5: Proposal Eksperimen Keterbacaan Ramah Disleksia",
        description: "Merancang proposal penelitian kuantitatif guna membandingkan kecepatan membaca mahasiswa disleksia menggunakan tag semantik murni (<article>, <section>) versus div-layering.",
        fitPercentage: 92,
        estimatedDuration: "Est. 1 Bulan",
        actionSteps: [
          { stepNumber: 1, title: "Spesifikasi Hipotesis", detail: "Formulasi dugaan sementara berbasis teori penataan huruf psikologis." },
          { stepNumber: 2, title: "Desain Instrumen Uji", detail: "Rancang 2 variasi teks bacaan dengan draf teks bersih dan minimal." },
          { stepNumber: 3, title: "Review Pedoman Etika Riset", detail: "Susun informed consent tertulis untuk subjek uji coba mahasiswa." }
        ]
      },
      {
        title: "Kriptografi Komparatif: Esai Keamanan Data Algoritma Cipher Terdesentralisasi",
        description: "Menulis artikel ilmiah ulasan kritis yang membandingkan kompleksitas waktu enkripsi pada basis teks sandi puitis terhadap efisiensi komputasi perangkat mobile.",
        fitPercentage: 85,
        estimatedDuration: "Est. 3 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Pengumpulan Kunci Cipher", detail: "Pilih 3 algoritma sandi populer (AES, RSA, ChaCha20) untuk diuji coba." },
          { stepNumber: 2, title: "Eksperimen Kecepatan", detail: "Hitung waktu dekripsi dalam milidetik di laptop lokal Anda." },
          { stepNumber: 3, title: "Dokumentasi Tabel Statistik", detail: "Visualisasikan hasil anomali performa ke dalam tabel ANOVA terstruktur." }
        ]
      },
      {
        title: "Tinjauan Pustaka: Etika AI & Orisinalitas Penulisan Tugas Mahasiswa",
        description: "Menulis esai reflektif-akademis mengenai pergeseran definisi 'orisinalitas' di era automasi generasi teks dan dampaknya terhadap standar penilaian kampus.",
        fitPercentage: 90,
        estimatedDuration: "Est. 1 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Kurasi Regulasi Akademik", detail: "Ambil pedoman resmi dari 3 universitas rujukan internasional tentang AI." },
          { stepNumber: 2, title: "Studi Fenomenologi Mikro", detail: "Wawancara singkat 3 rekan mahasiswa tentang pola bergantung pada copilot." },
          { stepNumber: 3, title: "Rekonstruksi Strategi Etik", detail: "Formulasi model penulisan 50/50: 50% ide otonom, 50% rekonstruksi bahasa ilmiah." }
        ]
      },
      {
        title: "Esai Deskriptif: Pengaruh Musik Ambient Lo-Fi Terhadap Gelombang Alfa Mahasiswa",
        description: "Kajian ilmiah deskriptif mengenai korelasi akustik gelombang suara berulang terhadap fokus kognitif otak selama pengerjaan skripsi akhir.",
        fitPercentage: 88,
        estimatedDuration: "Est. 2 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Pengumpulan Data Akustik", detail: "Petakan frekuensi khas musik Lo-Fi (biasanya pada kisaran 60-70 bpm)." },
          { stepNumber: 2, title: "Kajian Neurologi", detail: "Kaji 4 literatur medis tentang stimulasi gelombang alfa otak." },
          { stepNumber: 3, title: "Formulasi Rekomendasi", detail: "Tulis lembar rekomendasi playlist ideal untuk mendukung fokus mahasiswa saat riset." }
        ]
      }
    ];
  } else if (category === "desain") {
    return [
      {
        title: "Poster Seminar Ilmiah: Visualisasi Pola Tidur Versus IPK Mahasiswa",
        description: `Rancang poster presentasi ilmiah berstandar internasional dengan struktur asimetris radikal yang menyajikan sebaran korelasi statistik kebiasaan tidur mahasiswa dengan IPK, menggunakan alat Anda: ${toolsStr}.`,
        fitPercentage: 94,
        estimatedDuration: "Est. 1 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Sintesis Data Statistik", detail: "Sederhanakan data ANOVA/regresi tidur menjadi 3 grafik utama yang kuat secara visual." },
          { stepNumber: 2, title: "Riset Standar Layout IEEE", detail: "Atur pembagian 3 kolom simetri dengan margin aman cetak ukuran A0." },
          { stepNumber: 3, title: "Optimalisasi Kontras Pencerahan", detail: "Gunakan latar belakang kontras tinggi (>4.5) untuk memastikan kejelasan pembacaan abstrak dari jarak 1.5 meter." }
        ]
      },
      {
        title: "Infografis Tugas Akhir: Pemetaan Ekologi Karbon Sektor Vokasional",
        description: "Rancang infografis ilmiah beresolusi tinggi yang mensintesis data rantai karbon industri konstruksi kayu untuk disajikan di depan dosen penguji.",
        fitPercentage: 89,
        estimatedDuration: "Est. 1X Pertemuan Sesi",
        actionSteps: [
          { stepNumber: 1, title: "Kurasi Data CO2", detail: "Ambil dataset emisi karbon resmi kementerian kehutanan nasional." },
          { stepNumber: 2, title: "Penyusunan Metafora Visual", detail: "Transformasikan statistik angka menjadi grafik visual berbentuk pohon atau relasi ekosistem." },
          { stepNumber: 3, title: "Eksplorasi Skala Komponen", detail: "Letakkan kesimpulan krusial di area bento tengah atas agar menjadi pusat fokal riset." }
        ]
      },
      {
        title: "Slide Presentasi Sidang Sempurna: Reduksi Beban Kognitif Penguji",
        description: "Mendesain template slide sidang skripsi yang revolusioner dengan menyingkirkan bullet-point padat, berfokus pada visualisasi proposisi kritis per slide.",
        fitPercentage: 99,
        estimatedDuration: "Est. 4 Hari",
        actionSteps: [
          { stepNumber: 1, title: "Dekomposisi Naskah Skripsi", detail: "Pilah 1 bab penuh draf skripsi menjadi tepat 3 kalimat penjelas krusial." },
          { stepNumber: 2, title: "Arsitektur Tipografi Sidang", detail: "Gunakan Serif kontras setara Noto Serif (32pt) berpasangan dengan label monospaced (12pt)." },
          { stepNumber: 3, title: "Sketsa Alur Navigasi Slide", detail: "Sediakan indikator progres bab pengerjaan di bagian pojok bawah agar penguji tahu posisi penyajian Anda." }
        ]
      },
      {
        title: "Desain Sistem UI Dashboard Pembelajaran Kampus Ramah Aksesibilitas Web",
        description: "Eksperimen desain antarmuka portal akademik universitas yang ramah bagi mahasiswa tunanetra (memenuhi pedoman WCAG 2.1 AA).",
        fitPercentage: 91,
        estimatedDuration: "Est. 2-3 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Analisis Desain Portal Kampus", detail: "Audit tata letak situs akademik kampus Anda sendiri untuk menemukan kelemahannya." },
          { stepNumber: 2, title: "Pembuatan Skema Kontras Warna", detail: "Konseptualisasikan palet warna hitam-putih-emas dengan kontras radikal." },
          { stepNumber: 3, title: "Uji Pembaca Layar (Screen-Reader Mockup)", detail: "Strukturkan tata letak bento dengan tag penomoran logika tab keyboard yang konsisten." }
        ]
      },
      {
        title: "Media Kampanye Sosial: Desain Leaflet Kampanye Kesehatan Mental di Kampus",
        description: "Rancang media edukasi lipat-tiga (trifold) menggunakan pendekatan warna psikologis menenangkan dan tipografi humanis.",
        fitPercentage: 83,
        estimatedDuration: "Est. 5 Hari",
        actionSteps: [
          { stepNumber: 1, title: "Kurasi Kontak Bantuan Konseling", detail: "Kumpulkan nomor darurat unit kesehatan mental kampus dan komunitas lokal." },
          { stepNumber: 2, title: "Penyusunan Kalimat Edukasi", detail: "Tulis 3 saran praktis meredakan stres akademis dengan frasa suportif yang minim jargon medis." },
          { stepNumber: 3, title: "Sketsa Layout Grid Kertas", detail: "Simulasikan pelipatan kertas fisik untuk menjamin transisi perpindahan teks lancar secara urutan baca." }
        ]
      }
    ];
  } else if (category === "video") {
    return [
      {
        title: "Video Dokumenter Etnografi: Dinamika Adaptasi Kuliah Mahasiswa Rantau",
        description: `Video investigasi dokumenter sosiologis berdurasi 5-7 menit yang memotret realitas kesulitan sosio-ekisistensial dan strategi bertahan mahasiswa luar pulau di lingkungan kampus, memanfaatkan alat Anda: ${toolsStr}.`,
        fitPercentage: 91,
        estimatedDuration: "Est. 3 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Penyusunan Panduan Wawancara", detail: "Tulis 5 pertanyaan semi-terstruktur mengenai kejutan budaya (culture shock) dan manajemen keuangan." },
          { stepNumber: 2, title: "Pengambilan Gambar & B-Roll", detail: "Rekam aktivitas harian subjek di kosan dan perjalanan pagi menuju kampus." },
          { stepNumber: 3, title: "Penyuntingan Narasi Linear", detail: "Edit klip wawancara berseling rekaman ambient dengan transisi lembut demi mengedepankan empati sosiologis." }
        ]
      },
      {
        title: "Video Kampanye Sosial: Edukasi Literasi Digital Mahasiswa Terhadap Pinjol Ilegal",
        description: "Proyek PjBL berupa video kampanye kreatif berdurasi 60 detik (format vertikal TikTok/Reels) yang menyajikan bahaya jeratan utang mikro di kalangan remaja.",
        fitPercentage: 95,
        estimatedDuration: "Est. 1-2 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Penyusunan Storyboard Kreatif", detail: "Rancang alur video yang berfokus pada satu skenario mahasiswa tergiur membeli gawai baru." },
          { stepNumber: 2, title: "Pembuatan Animasi Teks & Data", detail: "Masukkan overlay data statistik kasus pinjol mahasiswa sebagai bukti akademis tak terbantahkan." },
          { stepNumber: 3, title: "Uji Sebaran Media Kampus", detail: "Simulasikan penyebaran video di grup angkatan mahasiswa untuk mengukur jangkauan kesadaran." }
        ]
      },
      {
        title: "Video Presentasi Proyek Rekayasa: Solusi Sampah Plastik Kampus",
        description: "Mengembangkan video penjelasan fungsional (explainer video) berdurasi 3 menit yang memaparkan data kalkulasi teknik alat konversi plastik menjadi bahan bakar solar.",
        fitPercentage: 86,
        estimatedDuration: "Est. 2 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Sintesis Formula Kimia", detail: "Siapkan ringkasan proses pirolisis dalam skema bagan sederhana." },
          { stepNumber: 2, title: "Perekaman Demonstrasi Alat", detail: "Ambil klip detail cara kerja reaktor mini dalam 3 langkah berurutan." },
          { stepNumber: 3, title: "Pengisian Suara & Audio", detail: "Gunakan pengisian suara intonasi tenang, percaya diri, dan profesional dengan latar instrumen monokrom ambient." }
        ]
      },
      {
        title: "Video Esai Eksploratif: Komersialisasi Budaya Tradisional di Era Digital",
        description: "Meneliti dan memproduksi sebuah esai riset berbentuk video 5 menit guna menganalisis dampak eksploitasi visual kesenian daerah di kanal-kanal pariwisata algoritma populer.",
        fitPercentage: 88,
        estimatedDuration: "Est. 2 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Skrip Narasi Historis", detail: "Tulis naskah esai berbobot sosiologis yang menelusuri sejarah komodifikasi kebudayaan lokal." },
          { stepNumber: 2, title: "Kurasi Arsip Rekaman Audio Visual", detail: "Kumpulkan bahan B-roll cuplikan upacara adat dari perpustakaan digital resmi sekolah." },
          { stepNumber: 3, title: "Voice Over & Final-Mix", detail: "Rekam vokal narator bernada tegas, padukan transisi audio instrumen orisinal khas nusantara." }
        ]
      },
      {
        title: "Video Profil Komunitas Inklusif: Pemberdayaan Penyandang Disabilitas Rentan",
        description: "Riset lapangan dan produksi dokumenter pendek 4-6 menit meliput kisah asrama pengrajin kain batik difabel, memaparkan kesetaraan lapangan kerja profesional.",
        fitPercentage: 92,
        estimatedDuration: "Est. 2-3 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Wawancara Etis Terbuka", detail: "Rancang 4 baris pertanyaan empati tinggi, lakukan pendekatan personal ramah disabilitas." },
          { stepNumber: 2, title: "Shooting Detail Canting Tekstur", detail: "Ambil tangkapan macro-lens proses pengerjaan lilin malam batik yang menuntut presisi tinggi." },
          { stepNumber: 3, title: "Subtitling Inklusif & Aksesibilitas", detail: "Integrasikan teks tertulis (closed captions) baku demi pemenuhan aksesibilitas penonton tunarungu." }
        ]
      }
    ];
  } else {
    // kerajinan / any other values sorted to academic prototype
    return [
      {
        title: "Alat Peraga Fisik Vokasional: Model Lipatan Origami Mekanika Tanah",
        description: `Rancang sistem lipatan mekanis berbahan kertas tebal dupleks untuk menyimulasikan pergeseran sudut batuan penahan longsor pada mata kuliah Geoteknik Sipil, memanfaatkan alat Anda: ${toolsStr}.`,
        fitPercentage: 95,
        estimatedDuration: "Est. 2 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Kalkulasi Sudut Kemiringan Geometri", detail: "Hitung kesesuaian sudut pergeseran batuan fiktif menggunakan rumus limit keseimbangan lereng." },
          { stepNumber: 2, title: "Pemotongan & Garis Tekuk Kardus", detail: "Gunting kardus tebal sesuai pola jaring-jaring geometri terstruktur." },
          { stepNumber: 3, title: "Uji Simulasi Beban Manual", detail: "Simulasikan tekanan batuan menggunakan beban gantung untuk mengevaluasi titik patah alat peraga." }
        ]
      },
      {
        title: "Maket Arsitektur Modular Rendah Karbon: Prototipe Shelter Tanggap Darurat Bencana",
        description: "Penyusunan maket miniatur berskala 1:20 menggunakan bahan bambu rakit dan kertas daur ulang untuk diujikan di depan dewan juri sayembara desain arsitektur nasional.",
        fitPercentage: 91,
        estimatedDuration: "Est. 3-4 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Desain Cetak Biru (Blueprint AutoCAD)", detail: "Gambar tampak potongan shelter dengan pembagian ruang bento yang multifungsi." },
          { stepNumber: 2, title: "Perakitan Struktur Rangka Utama", detail: "Rakit batang bambu mikro dengan lem tahan air murni demi meniru relasi sambungan pasak tradisional." },
          { stepNumber: 3, title: "Uji Aerodinamika Miniatur", detail: "Paparkan prototipe maket keembusan kipas angin berkekuatan variabel untuk mengidentifikasi kelemahan sambungan." }
        ]
      },
      {
        title: "Media Pembelajaran Interaktif (Pedagogi): Blok Huruf Kayu untuk Pengenalan Geometri Paud",
        description: "Eksperimen kerajinan edukatif berupa cetakan blok kayu asimetris bersiku tumpul untuk menstimulasi visual anak dalam mengenal sudut-sudut bangun matematika dasar.",
        fitPercentage: 87,
        estimatedDuration: "Est. 1-2 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Riset Standar Keamanan Mainan", detail: "Pastikan bahan kayu tidak berserat kasar yang melukai kulit anak dan bebas cat kimia beracun." },
          { stepNumber: 2, title: "Pemotongan & Pengampelasan Manual", detail: "Potong kayu pinus menjadi 5 bentuk modular dasar dengan ampelas halus sudut melingkar." },
          { stepNumber: 3, title: "Uji Coba Lapangan (Pedagogi)", detail: "Bawa mainan ke TK mitra untuk mengamati spontanitas interaksi anak menyusun balok tersebut." }
        ]
      },
      {
        title: "Prototipe Pembangkit Mikrohidro Portable: Alat Peraga Fisika Terapan",
        description: "Konstruksi simulasi turbin air berskala mikro dengan bahan botol plastik bekas daur ulang dan generator dinamo 5V mini untuk mendemonstrasikan hukum kekekalan energi kinetik.",
        fitPercentage: 90,
        estimatedDuration: "Est. 3 Minggu",
        actionSteps: [
          { stepNumber: 1, title: "Desain Sudut Sudu Turbin", detail: "Riset geometri sudu melingkar ideal demi menangkap tekanan debit air keran rumah secara maksimal." },
          { stepNumber: 2, title: "Penyusunan Dudukan Akrilik", detail: "Potong dan lem lembaran akrilik bekas sebagai sasis penahan poros beban rotor dinamo." },
          { stepNumber: 3, title: "Kalkulasi Tegangan Voltmeter", detail: "Ukur output voltase listrik dinamo saat katup air dibuka penuh, catat efisiensi perubahannya." }
        ]
      },
      {
        title: "Maket Pemukiman Urban Pintar Tanggap Banjir: Model Drainase Berkelanjutan",
        description: "Membangun model miniatur topografi komplek perumahan 3D dengan pori-pori biopori imitasi dan tangki retensi mikro guna mendemonstrasikan sistem tata air zero run-off.",
        fitPercentage: 93,
        estimatedDuration: "Est. 1 Bulan",
        actionSteps: [
          { stepNumber: 1, title: "Pemetaan Saluran Air Maket", detail: "Gambar sistem pipa saluran drainase asimetris di bagian bawah tatakan kayu sasis." },
          { stepNumber: 2, title: "Instalasi Sensor Ketinggian Air", detail: "Pasang kabel sirkuit indikator LED air sederhana untuk menandai volume luapan air maket." },
          { stepNumber: 3, title: "Simulasi Curah Hujan Buatan", detail: "Gunakan penyemprot embun untuk membasahi maket, ukur durasi penyerapan saringan pori tanah." }
        ]
      }
    ];
  }
}

function getFallbackAntiBuntu(ideaTitle: string) {
  return {
    cognitive: {
      title: "Cognitive Alignment",
      subtitle: "RESTRUKTURISASI PIKIRAN & BIAS AI",
      methods: [
        {
          name: "Saringan Orisinalitas (Menghindari Bias AI)",
          description: "Stres menulis biasanya dipicu ketakutan gagal menyamai standar AI yang tampak sempurna. Matikan draf otomatis AI Anda selama 20 menit ke depan. Tulis draf esai Anda dengan 5 kalimat murni Bahasa Indonesia yang sederhana, jujur, dan berantakan. Mengedit paragraf buruk jauh lebih mudah daripada menatap layar kosong."
        },
        {
          name: "Jarak Psikologis Creswell",
          description: `Bayangkan Anda adalah dewan penguji skripsi cerdas yang objektif untuk proyek "${ideaTitle}" milik orang lain. Jarak mental sebagai penilai luar ini merontokkan ketegangan internal dan ketakutan subjektif Anda, memicu keluarnya pemecahan masalah metodologi yang jernih.`
        }
      ]
    },
    somatic: {
      title: "Somatic Decompression",
      subtitle: "KONEKSI FISIK & REFLEKS FOKUS LELAH",
      methods: [
        {
          name: "Peregangan Bilateral Bahu & Leher",
          description: "Membaca puluhan jurnal PDF membuat otot trapezius pada pundak Anda menegang keras, mereduksi aliran darah kaya oksigen menuju otak. Berdirilah, jalin jemari Anda di belakang punggung, tarik perlahan ke belakang dan arahkan sirkulasi napas dalam selama 1 menit penuh."
        },
        {
          name: "Fokus Visual 20-20-20 akademik",
          description: "Setiap 20 menit menatap layar draf laporan/laporan tugas kuliah, alihkan pandangan mata Anda sejauh 20 kaki (sekitar 6 meter) ke luar jendela selama 20 detik untuk mengendurkan lensa mata yang tertekan cahaya biru monitor lokal."
        }
      ]
    },
    technical: {
      title: "Technical Restructuring",
      subtitle: "MITIGASI PROKRASTINASI TUGAS KELOMPOK",
      methods: [
        {
          name: "Dekomposisi Tugas Mikro (WBS PjBL)",
          description: "Jangan memandang bab skripsi atau proyek presentasi kelompok sebagai monster raksasa. Pecah tugas menjadi butir mikro yang bisa diselesaikan kurang dari 10 menit (seperti: 'Hanya merapikan 3 baris sitasi' atau 'Hanya mendesain 1 slide judul')."
        },
        {
          name: "Delegasi Asimetris Tim Kelompok Pasif",
          description: "Menderita karena anggota kelompok kuliah pasif? Alih-alih menyuruh tanpa struktur, bagikan tugas spesifik tertulis yang dikunci limit waktu (misal: 'Budi, tolong kumpulkan slide riset bab 2 paling lambat besok jam 12 siang')."
        }
      ]
    }
  };
}

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
