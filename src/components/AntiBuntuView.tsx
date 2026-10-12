import React, { useState, useEffect } from "react";
import { AntiBuntuResponse } from "../types";
import { Brain, Footprints, Wrench, RefreshCw, Sparkles, ArrowLeft, Lightbulb, Check, GraduationCap } from "lucide-react";

interface AntiBuntuViewProps {
  ideaTitle: string;
  description: string;
  onGoBack: () => void;
}

export default function AntiBuntuView({ ideaTitle, description, onGoBack }: AntiBuntuViewProps) {
  const [loading, setLoading] = useState(false);
  const [curatedData, setCuratedData] = useState<AntiBuntuResponse | null>(null);
  const [customProblem, setCustomProblem] = useState("");
  const [successApply, setSuccessApply] = useState(false);

  // Load tailored strategy
  const fetchTailoredStrategy = async (title: string, desc: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-anti-buntu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaTitle: title, description: desc }),
      });
      if (res.ok) {
        const data = await res.json();
        setCuratedData(data);
      } else {
        throw new Error("Gagal memuat");
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setCuratedData(getFallbackStrategy(title));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTailoredStrategy(ideaTitle, description);
  }, [ideaTitle, description]);

  const handleApplyStrategy = () => {
    setSuccessApply(true);
    setTimeout(() => {
      setSuccessApply(false);
      onGoBack();
    }, 2000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProblem.trim()) return;
    fetchTailoredStrategy(ideaTitle || "Eksplorasi Akademik", customProblem);
    setCustomProblem("");
  };

  const getFallbackStrategy = (title: string): AntiBuntuResponse => {
    return {
      cognitive: {
        title: "Cognitive Alignment",
        subtitle: "RESTRUKTURISASI PIKIRAN & BIAS AI OVER-RELIANCE",
        methods: [
          {
            name: "Saringan Orisinalitas (Menyingkirkan Blank-Canvas AI Bias)",
            description: "Stres menulis tesis atau esai dipicu ketakutan draf Anda tidak se-sempurna jawaban generator AI. Matikan semua bantuan AI selama 20 menit ke depan. Tuliskan 5 kalimat jujur, kritis, dan berantakan versi pikiran mandiri Anda terlebih dahulu. Jauh lebih mudah mengoreksi pemikiran kasar yang buruk dibandingkan menatap lembar teks kosong dalam kecemasan."
          },
          {
            name: "Jarak Psikologis Metodologis (Mengubah Sudut Pandang Penguji)",
            description: `Bayangkan Anda adalah sekelompok dewan juri penguji skripsi yang cerdas, adil, dan berfokus pada logika ilmiah untuk proyek "${title}". Tantang arah metodologi Anda dari kacamata penguji luar tersebut untuk membongkar hambatan penulisan secara jernih tanpa beban ego.`
          }
        ]
      },
      somatic: {
        title: "Somatic Decompression",
        subtitle: "KONEKSI FISIK & REFLEKS FOKUS LELAH",
        methods: [
          {
            name: "Peregangan Pundak Bahu & Oksigenasi Trapezius",
            description: "Membaca puluhan makalah PDF tebal membuat otot leher dan pundak menegang keras, menjepit sirkulasi darah segar menuju korteks nalar. Berdirilah tegak, jalin jemari Anda di belakang punggung, tarik perlahan ke bawah sembari menghela napas diafragma dalam selama 1 menit penuh."
          },
          {
            name: "Audit Sinar Biru & Aturan Aksesibilitas Mata 20-20-20",
            description: "Setiap 20 menit menyelesaikan koding / draf perancangan visual di monitor, istirahatkan mata dengan berpaling menjauh sejauh 6 meter ke luar jendela selama 20 detik penuh untuk menyegarkan saraf visual."
          }
        ]
      },
      technical: {
        title: "Technical Process adjustment",
        subtitle: "MITIGASI PROKRASTINASI TUGAS KELOMPOK (PjBL)",
        methods: [
          {
            name: "Dekomposisi Butir Kerja Mikro (Work Breakdown Structure)",
            description: "Hindari memandang bab skripsi atau riset lapangan sebagai satu beban batu besar. Pecah menjadi butir mikro instan bertarget di bawah 10 menit (seperti 'Hanya menulis 3 referensi tinjauan pustaka' atau 'Hanya memposisikan tata letak judul poster')."
          },
          {
            name: "Penugasan Asimetris Tim Kelompok Kampus Pasif",
            description: "Jika Anda tertekan karena menanggung beban tugas kelompok sendirian sementara rekan lain pasif, bagikan tugas secara spesifik dan kunci dengan limit waktu tegas di hadapan forum mahasiswa (misal: 'Budi, tolong kumpulkan slide rujukan Bab 3 paling lambat besok jam 12 siang')."
          }
        ]
      }
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-8 flex justify-start">
        <button 
          type="button"
          onClick={onGoBack}
          className="flex items-center gap-2 text-[#434653] hover:text-[#094cb2] transition-colors group font-semibold outline-none"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Panel Portofolio</span>
        </button>
      </div>

      {/* Editor Header Section */}
      <article className="mb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-700 mb-6 shadow-sm border border-red-100">
          <GraduationCap className="w-4.5 h-4.5 text-red-600" />
          <span className="font-label text-xs uppercase tracking-widest font-semibold">Manajemen Stres Akademis & Bias Berpikir AI</span>
        </div>
        <h1 className="font-headline text-4xl md:text-6xl font-semibold leading-tight tracking-tight text-[#1b1c1d] mb-6">
          Anti-Stres:<br/>
          <span className="text-[#094cb2] font-light italic">Kembalikan Fokus Kritis.</span>
        </h1>
        <p className="font-sans text-lg text-[#434653] leading-relaxed max-w-2.5xl mx-auto font-light">
          Rasa mentok dan cemas akibat kejenuhan riset atau ketergantungan model AI generik adalah friksi normal. Gunakan dashboard ini untuk menyeimbangkan saraf kognitif, fisik, dan teknis pengerjaan Anda.
        </p>
        
        {ideaTitle && ideaTitle !== "General Creative Block" && (
          <div className="mt-6 p-4 rounded-xl bg-[#e7ebff]/30 border border-[#094cb2]/10 inline-block text-left text-sm text-[#094cb2] font-sans">
            Menyusun modul penanganan penyegar khusus draf: <strong className="font-semibold">{ideaTitle}</strong>
          </div>
        )}
      </article>

      {/* Custom stuck solver input form */}
      <div className="mb-12 max-w-2xl mx-auto bg-white border border-[#c3c6d5]/30 p-6 rounded-2xl shadow-sm">
        <h3 className="font-headline text-lg font-medium text-[#1b1c1d] mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#094cb2]" />
          <span>Keluhkan Rasa Mentok Spesifik Anda</span>
        </h3>
        <p className="font-sans text-xs text-[#434653] mb-4">
          Tuliskan kendala Anda saat ini (seperti menderita menulis paragraf pembuka tinjauan pustaka, kebingungan kalkulasi tabel regresi, atau kesulitan koordinasi kerja tim kelompok pasif).
        </p>
        
        <form onSubmit={handleCustomSubmit} className="flex gap-3">
          <input 
            type="text" 
            placeholder="Contoh: 'Saya stres menulis bab penutup riset kualitatif karena bias berpikir AI...'"
            value={customProblem}
            onChange={(e) => setCustomProblem(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-[#c3c6d5]/40 rounded-xl font-sans text-xs focus:ring-1 focus:ring-[#094cb2] focus:border-[#094cb2] outline-none disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={loading || !customProblem.trim()}
            className="bg-[#094cb2] hover:bg-[#00419d] text-white font-label text-xs font-semibold px-5 py-3 rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 inline-flex items-center gap-1 shrink-0 outline-none cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <span>Dapatkan Strategi</span>}
          </button>
        </form>
      </div>

      {loading ? (
        /* Loading Strategy screen */
        <div className="flex flex-col items-center justify-center py-20 gap-4 select-none">
          <div className="w-10 h-10 border-4 border-[#094cb2]/10 border-t-[#094cb2] rounded-full animate-spin"></div>
          <p className="font-headline text-xl text-[#1b1c1d] italic">
            Kurator AI sedang menganalisis beban kognitif & menyusun relaksasi stres Anda...
          </p>
        </div>
      ) : curatedData ? (
        /* Curated Strategies Bento Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-min mt-8">
          {/* Category 1: Cognitive (Large Feature - Spans 8 columns) */}
          <section className="md:col-span-12 lg:col-span-8 bg-white rounded-2xl p-8 border border-[#c3c6d5]/20 hover:border-[#c3c6d5]/40 transition-colors duration-300 relative overflow-hidden group">
            {/* Background ambient shade */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#094cb2]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#094cb2]/10 transition-colors"></div>
            
            <header className="flex items-start gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#094cb2]/10 flex items-center justify-center text-[#094cb2]">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-headline text-3xl font-semibold text-[#1b1c1d]">
                  {curatedData.cognitive.title}
                </h2>
                <p className="font-label text-xs text-[#524600] font-semibold uppercase tracking-widest mt-1">
                  {curatedData.cognitive.subtitle}
                </p>
              </div>
            </header>

            <div className="space-y-6 relative z-10">
              {curatedData.cognitive.methods.map((method, idx) => (
                <div 
                  key={idx} 
                  className="pl-4 border-l-[3px] border-[#c3c6d5]/40 hover:border-[#094cb2] transition-colors duration-300 py-1"
                >
                  <h3 className="font-headline text-lg font-semibold text-[#1b1c1d] mb-2">
                    {method.name}
                  </h3>
                  <p className="font-sans text-sm text-[#434653] leading-relaxed font-light">
                    {method.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Side Editorial Grayscale Image (Spans 4 columns) */}
          <div className="md:col-span-12 lg:col-span-4 rounded-2xl overflow-hidden min-h-[300px] relative border border-[#c3c6d5]/15">
            <img 
              alt="Minimalist study area"
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80"
              className="w-full h-full object-cover grayscale brightness-95 hover:grayscale-0 transition-all duration-700 pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <span className="font-headline text-[#faf9fa] text-xl italic font-light drop-shadow-sm block">
                "Karya ilmiah terbaik lahir dari pikiran yang seimbang."
              </span>
            </div>
          </div>

          {/* Category 2: Somatic (Spans 6 columns) */}
          <section className="md:col-span-6 bg-[#f5f3f4] rounded-2xl p-8 border border-[#c3c6d5]/10 hover:bg-[#efedee] transition-all">
            <header className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#efedee] border border-[#c3c6d5]/40 flex items-center justify-center text-[#434653]">
                <Footprints className="w-[22px] h-[22px]" />
              </div>
              <div>
                <h2 className="font-headline text-2xl font-semibold text-[#1b1c1d]">
                  {curatedData.somatic.title}
                </h2>
                <p className="font-label text-xs text-[#5a5f63]/80 font-semibold uppercase tracking-widest mt-1">
                  {curatedData.somatic.subtitle}
                </p>
              </div>
            </header>

            <ul className="space-y-6">
              {curatedData.somatic.methods.map((method, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#bfab49] mt-2 shrink-0"></div>
                  <div>
                    <h3 className="font-headline text-lg font-semibold text-[#1b1c1d] mb-1">
                      {method.name}
                    </h3>
                    <p className="font-sans text-xs text-[#434653] leading-relaxed font-light">
                      {method.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Category 3: Technical (Spans 6 columns) */}
          <section className="md:col-span-6 bg-[#efedee]/50 rounded-2xl p-8 border border-[#c3c6d5]/20 hover:bg-[#efedee]/80 transition-all">
            <header className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#efedee] border border-[#c3c6d5]/40 flex items-center justify-center text-[#434653]">
                <Wrench className="w-[20px] h-[20px]" />
              </div>
              <div>
                <h2 className="font-headline text-2xl font-semibold text-[#1b1c1d]">
                  {curatedData.technical.title}
                </h2>
                <p className="font-label text-xs text-[#5a5f63]/80 font-semibold uppercase tracking-widest mt-1">
                  {curatedData.technical.subtitle}
                </p>
              </div>
            </header>

            <ul className="space-y-6">
              {curatedData.technical.methods.map((method, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#094cb2] mt-2 shrink-0"></div>
                  <div>
                    <h3 className="font-headline text-lg font-semibold text-[#1b1c1d] mb-1">
                      {method.name}
                    </h3>
                    <p className="font-sans text-xs text-[#434653] leading-relaxed font-light">
                      {method.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {/* Hero Apply Button */}
      <div className="mt-16 flex justify-center">
        <button 
          onClick={handleApplyStrategy}
          disabled={successApply}
          className={`font-label px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-md ${
            successApply 
              ? "bg-green-600 text-white" 
              : "bg-[#094cb2] hover:bg-[#00419d] text-white hover:shadow-lg hover:-translate-y-0.5 outline-none cursor-pointer"
          }`}
        >
          {successApply ? (
            <>
              <Check className="w-5 h-5 animate-bounce stroke-[3px]" />
              <span className="font-medium">Saran Diterapkan! Kembali Relaks...</span>
            </>
          ) : (
            <>
              <span className="tracking-wide font-medium">Terapkan Reklamasi Pikiran</span>
              <ArrowLeft className="w-5 h-5 transform rotate-180" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
