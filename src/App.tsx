import React, { useState, useEffect } from "react";
import { Concept, ActionStep } from "./types";
import PrefForm from "./components/PrefForm";
import ConceptsList from "./components/ConceptsList";
import LibraryView from "./components/LibraryView";
import AntiBuntuView from "./components/AntiBuntuView";
import { 
  Flame, 
  Bookmark, 
  Lightbulb, 
  Compass, 
  Sparkles,
  ArrowLeft,
  XCircle,
  GraduationCap,
  Award,
  ShieldAlert
} from "lucide-react";

/**
 * CreativeSpark Main App Entry Point
 * Transformed into a highly functional Academic & Research Assistant for University Students (PjBL, SKPI Claim, Anti-Bias AI)
 */
export default function App() {
  const [view, setView] = useState<"preference" | "concepts" | "library" | "anti_buntu">("preference");
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Saved bookmark list & Hydrate initial academic mock projects
  const [savedConcepts, setSavedConcepts] = useState<Concept[]>(() => {
    const local = localStorage.getItem("alexandria_saved_concepts");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    
    // Academic mockup data exactly as defined in solutions
    const defaultData: Concept[] = [
      {
        title: "Kajian Komparatif Arsitektur Grid: Esai Literatur Kognisi Visual",
        description: "Menyusun kajian kritis mengenai korelasi pembagian ruang bento-grid dalam antarmuka digital terhadap retensi fokus kognitif mahasiswa luar daerah.",
        fitPercentage: 96,
        estimatedDuration: "Est. 2-3 Minggu",
        status: "sedang_berjalan",
        actionSteps: [
          { stepNumber: 1, title: "Pra-Riset & Studi Pustaka", detail: "Kumpulkan 5 referensi jurnal ilmiah visual terindeks Scopus/Sinta.", completed: true },
          { stepNumber: 2, title: "Sintesis Outline Esai", detail: "Sederhanakan poin-poin penataan grid ke tiga klaim kognisi struktural.", completed: true },
          { stepNumber: 3, title: "Penulisan Draft IMRAD & Sitasi", detail: "Tulis bab pembahasan lengkap dengan sitasi standar APA Seventh Edition.", completed: false }
        ]
      },
      {
        title: "Poster Seminar Ilmiah: Korelasi Pola Tidur Versus IPK Mahasiswa",
        description: "Merancang presentasi poster ilmiah standar seminar nasional ukuran A0 demi menggambarkan korelasi durasi tidur malam dengan performa nalar mahasiswa.",
        fitPercentage: 94,
        estimatedDuration: "Est. 1 Minggu",
        status: "belum_mulai",
        actionSteps: [
          { stepNumber: 1, title: "Sintesis Data Statistik", detail: "Ubah angka tabel ANOVA relasi tidur ke bentuk visual diagram sebaran yang kontras.", completed: false },
          { stepNumber: 2, title: "Desain Grid Cetak A0", detail: "Atur grid kontras tinggi agar abstrak terbaca jelas dalam jarak 1.5 meter.", completed: false },
          { stepNumber: 3, title: "Finalisasi QR Code Referensi", detail: "Sematkan scan link ke file riset PDF lengkap Anda di pojok kanan bawah poster.", completed: false }
        ]
      },
      {
        title: "Alat Peraga Fisik Vokasional: Model Lipatan Origami Mekanika Tanah",
        description: "Konstruksi miniatur maket modular berskala 1:50 menguji ketahanan struktur geser simpul tanah liat dalam meredam efek getaran lereng.",
        fitPercentage: 91,
        estimatedDuration: "Est. 3 Minggu",
        status: "selesai",
        actionSteps: [
          { stepNumber: 1, title: "Kalkulasi Geometri Lereng", detail: "Hitung kesesuaian sudut menggunakan formula limit keseimbangan dinamis.", completed: true },
          { stepNumber: 2, title: "Pemotongan Rangka Kardus", detail: "Potong kertas dupleks tebal sesuai pola garis origami dalam sketsa CAD.", completed: true },
          { stepNumber: 3, title: "Uji Beban Tekanan Fisik", detail: "Letakkan beban gantung 2kg di atas struktur untuk mengevaluasi titik retak lipatan.", completed: true }
        ]
      }
    ];
    localStorage.setItem("alexandria_saved_concepts", JSON.stringify(defaultData));
    return defaultData;
  });

  const [activeAntiBuntuProject, setActiveAntiBuntuProject] = useState<{title: string, desc: string}>({
    title: "General Academic Block",
    desc: "Mengalami stres akademis tugas menumpuk dan bias kognitif harian."
  });

  // Save to LocalStorage whenever changes happen to kept items
  useEffect(() => {
    localStorage.setItem("alexandria_saved_concepts", JSON.stringify(savedConcepts));
  }, [savedConcepts]);

  const handleSparkConcepts = async (category: string, time: number, tools: string[]) => {
    setLoading(true);
    setError(null);
    setView("concepts");

    try {
      const response = await fetch("/api/generate-concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, time, tools }),
      });

      if (!response.ok) {
        throw new Error("Gagal menghubungi model AI. Memuat fallback kuratorial.");
      }

      const data = await response.json();
      if (data.concepts && Array.isArray(data.concepts)) {
        setConcepts(data.concepts);
      } else {
        throw new Error("Format respons tidak valid. Menggunakan fallback terkurasi.");
      }
    } catch (err: any) {
      console.warn(err);
      setError(err.message || "Eror tidak terduga terjadi.");
      setConcepts(getFallbackConceptsLocal(category, time, tools));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConcept = (concept: Concept) => {
    // Check if duplicate
    if (savedConcepts.some(c => c.title === concept.title)) return;
    
    const newSaved: Concept = {
      ...concept,
      id: "concept_" + Date.now(),
      status: "belum_mulai",
      actionSteps: concept.actionSteps.map(step => ({ ...step, completed: false }))
    };
    setSavedConcepts(prev => [newSaved, ...prev]);
  };

  const handleRemoveConcept = (title: string) => {
    setSavedConcepts(prev => prev.filter(c => c.title !== title));
  };

  const handleUpdateConcept = (updated: Concept) => {
    setSavedConcepts(prev => prev.map(c => c.title === updated.title ? updated : c));
  };

  const handleGoToAntiBuntu = (ideaTitle: string, description: string) => {
    setActiveAntiBuntuProject({ title: ideaTitle, desc: description });
    setView("anti_buntu");
  };

  // Local clientside fallback in case serverside is unavailable
  function getFallbackConceptsLocal(category: string, time: number, tools: string[]): Concept[] {
    const toolsStr = tools.length > 0 ? tools.join(", ") : "Laptop, Kertas & Referensi PDF";
    
    if (category === "menulis") {
      return [
        {
          title: "Kajian Komparatif Arsitektur Grid: Esai Literatur Kognisi Visual",
          description: `Analisis mendalam mengenai korelasi densitas visual bento grid terhadap letak fokus kognitif pembaca digital, memanfaatkan alat riset: ${toolsStr}.`,
          fitPercentage: 96,
          estimatedDuration: "Est. 2-3 Minggu",
          actionSteps: [
            { stepNumber: 1, title: "Pra-Riset & Studi Pustaka", detail: "Kumpulkan 5 referensi jurnal terindeks Scopus tentang beban kognitif visual." },
            { stepNumber: 2, title: "Formulasi Outline Pendekatan", detail: "Petakan perbandingan pola f-shape reading dengan pembagian grid bento." },
            { stepNumber: 3, title: "Penulisan draf IMRAD", detail: "Tulis draf literatur menggunakan model tulisan argumentatif deskriptif." }
          ]
        }
      ];
    } else {
      return [
        {
          title: "Poster Seminar Ilmiah: Hubungan Pola Tidur Versus IPK Mahasiswa",
          description: `Desain poster standar sidang akhir memaparkan regresi linear durasi tidur mahasiswa, menggunakan alat: ${toolsStr}.`,
          fitPercentage: 94,
          estimatedDuration: "Est. 1 Minggu",
          actionSteps: [
            { stepNumber: 1, title: "Sintesis Angka Korelasi", detail: "Ubah tabel anova statistik ke bentuk diagram pancar visual." },
            { stepNumber: 2, title: "Arsitektur Grid layout A0", detail: "Sesuaikan margin aman cetak standar seminar IEEE." },
            { stepNumber: 3, title: "Finalisasi QR Code Paper", detail: "Sematkan tautan digital paper penuh di bagian bawah poster." }
          ]
        }
      ];
    }
  }

  return (
    <div className="bg-[#faf9fa] text-[#1b1c1d] font-sans antialiased min-h-screen flex flex-col selection:bg-[#e7ebff] selection:text-[#094cb2]">
      {/* Top App Bar */}
      <header className="bg-white/95 backdrop-blur-md w-full sticky top-0 z-40 border-b border-[#c3c6d5]/15 transition-shadow">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-7xl mx-auto">
          {/* Logo Back trigger */}
          <div className="flex items-center gap-3">
            {view !== "preference" && (
              <button 
                type="button"
                onClick={() => setView("preference")}
                className="p-1 px-3 -ml-2 rounded-full hover:bg-[#efedee] text-[#1b1c1d] flex items-center gap-1.5 transition-colors text-xs font-label uppercase tracking-wider outline-none font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#1b1c1d]" />
                <span className="hidden sm:inline">Kembali</span>
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#094cb2]/10 flex items-center justify-center text-[#094cb2]">
                <GraduationCap className="w-5 h-5 text-[#094cb2]" />
              </div>
              <h1 
                onClick={() => setView("preference")}
                className="font-headline text-2xl font-semibold text-[#094cb2] tracking-tight cursor-pointer"
              >
                CreativeSpark
              </h1>
            </div>
          </div>

          {/* Core Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              type="button"
              onClick={() => setView("preference")}
              className={`font-label text-sm uppercase tracking-widest font-semibold transition-opacity outline-none cursor-pointer ${
                view === "preference" || view === "concepts" 
                  ? "text-[#094cb2] border-b-2 border-[#094cb2] pb-1" 
                  : "text-[#5a5f63] hover:text-[#1b1c1d]"
              }`}
            >
              Kompas Tugas
            </button>
            <button 
              type="button"
              onClick={() => setView("library")}
              className={`font-label text-sm uppercase tracking-widest font-semibold transition-opacity relative outline-none cursor-pointer ${
                view === "library"
                  ? "text-[#094cb2] border-b-2 border-[#094cb2] pb-1"
                  : "text-[#5a5f63] hover:text-[#1b1c1d]"
              }`}
            >
              <span>Portofolio SKPI</span>
              {savedConcepts.length > 0 && (
                <span className="absolute -top-1.5 -right-3.5 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {savedConcepts.length}
                </span>
              )}
            </button>
            <button 
              type="button"
              onClick={() => handleGoToAntiBuntu("General Academic Block", "Stres Tugas Kuliah & Prokrastinasi")}
              className={`font-label text-sm uppercase tracking-widest font-semibold transition-opacity outline-none cursor-pointer ${
                view === "anti_buntu"
                  ? "text-[#094cb2] border-b-2 border-[#094cb2] pb-1"
                  : "text-[#5a5f63] hover:text-[#1b1c1d]"
              }`}
            >
              Tips Anti-Stres
            </button>
          </nav>

          {/* User profile avatar decoration */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setView("library")}
              className="w-10 h-10 rounded-full overflow-hidden border border-[#c3c6d5]/15 cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
              title="Akses Portofolio SKPI"
            >
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" 
                alt="Profil Mahasiswa" 
                className="w-full h-full object-cover grayscale brightness-95"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex flex-col w-full max-w-7xl mx-auto px-6 py-12 md:py-16 relative">
        {/* Dynamic background circles */}
        <div className="absolute top-1/4 right-5 w-64 h-64 bg-[#094cb2]/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 left-5 w-48 h-48 bg-[#bfab49]/5 rounded-full blur-[60px] -z-10 pointer-events-none"></div>

        {/* Global Error Notice */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-sans text-xs flex justify-between items-center max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button 
              type="button"
              onClick={() => setError(null)}
              className="text-[#5a5f63] hover:text-[#1b1c1d] ml-4 font-bold outline-none cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* View Router */}
        {view === "preference" && (
          <section className="w-full max-w-3xl mx-auto flex flex-col gap-12">
            {/* Academic Curator Heading */}
            <header className="flex flex-col gap-4 text-center max-w-2xl mx-auto pt-4">
              <div className="w-fit mx-auto bg-[#094cb2]/10 text-[#094cb2] text-[10px] font-label font-bold tracking-widest uppercase px-3.5 py-1 rounded-full flex items-center gap-1.5">
                <GraduationCap className="w-4.5 h-4.5" />
                <span>Asisten Akademis Universitas</span>
              </div>
              <h2 className="font-headline text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-[#1b1c1d]">
                Penyusun Proyek<br />
                <span className="text-[#094cb2] italic">Riset & Kuliah</span> Anda
              </h2>
              <p className="font-sans text-base md:text-lg text-[#434653] leading-relaxed font-light mt-2">
                Pilih fokus tugas PjBL, tetapkan batasan waktu, dan biarkan Kurator AI menyusun 5 draf rancangan ilmiah siap guna yang melampaui standar orisinalitas kampus.
              </p>
            </header>

            <PrefForm onSpark={handleSparkConcepts} loading={loading} />
          </section>
        )}

        {view === "concepts" && (
          <section className="w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6 select-none max-w-xl mx-auto text-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-[#094cb2]/10 border-t-[#094cb2] rounded-full animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-[#094cb2] absolute animate-pulse" />
                </div>
                <div>
                  <h3 className="font-headline text-3xl italic mb-2">Mengkurasi Standard Ilmiah PjBL...</h3>
                  <p className="font-sans text-[#434653] font-light text-sm">
                    Kami sedang merangkai 5 draf metodologis berbobot penelitian murni dengan saringan bebas plagiarisme. Harap tunggu sejenak.
                  </p>
                </div>
              </div>
            ) : (
              <ConceptsList 
                concepts={concepts}
                savedIds={savedConcepts.map(c => c.title)}
                savedConcepts={savedConcepts}
                onSave={handleSaveConcept}
                onRemove={handleRemoveConcept}
                onUpdateConcept={handleUpdateConcept}
                onGoToLibrary={() => setView("library")}
                onGoToAntiBuntu={handleGoToAntiBuntu}
              />
            )}
          </section>
        )}

        {view === "library" && (
          <section className="w-full">
            <LibraryView 
              savedConcepts={savedConcepts}
              onUpdateConcept={handleUpdateConcept}
              onRemove={handleRemoveConcept}
              onGoToAntiBuntu={handleGoToAntiBuntu}
              onGoBackToGenerator={() => setView("preference")}
            />
          </section>
        )}

        {view === "anti_buntu" && (
          <section className="w-full">
            <AntiBuntuView 
              ideaTitle={activeAntiBuntuProject.title}
              description={activeAntiBuntuProject.desc}
              onGoBack={() => setView("library")}
            />
          </section>
        )}
      </main>

      {/* Bottom Nav Bar (Mobile Navigation Layout) */}
      <nav className="fixed bottom-0 w-full z-40 bg-white/90 backdrop-blur-md border-t border-[#c3c6d5]/20 shadow-lg md:hidden">
        <div className="w-full flex justify-around items-center px-4 py-3 pb-safe">
          {/* Compass / Generator trigger */}
          <button 
            type="button"
            onClick={() => setView(concepts.length > 0 ? "concepts" : "preference")}
            className={`flex flex-col items-center justify-center text-xs font-label uppercase tracking-widest transition-all outline-none cursor-pointer ${
              view === "preference" || view === "concepts" 
                ? "text-[#094cb2] font-semibold scale-105" 
                : "text-[#5a5f63]"
            }`}
          >
            <Compass className="w-6 h-6 mb-1" />
            <span>Kompas</span>
          </button>

          {/* Library trigger */}
          <button 
            type="button"
            onClick={() => setView("library")}
            className={`flex flex-col items-center justify-center text-xs font-label uppercase tracking-widest relative transition-all outline-none cursor-pointer ${
              view === "library" 
                ? "text-[#094cb2] font-semibold scale-105" 
                : "text-[#5a5f63]"
            }`}
          >
            <Award className="w-6 h-6 mb-1" />
            <span>SKPI Hub</span>
            {savedConcepts.length > 0 && (
              <span className="absolute top-0 right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {savedConcepts.length}
              </span>
            )}
          </button>

          {/* Tips / Block solver trigger */}
          <button 
            type="button"
            onClick={() => handleGoToAntiBuntu("General Academic Block", "Stres akademis tugas menumpuk")}
            className={`flex flex-col items-center justify-center text-xs font-label uppercase tracking-widest transition-all outline-none cursor-pointer ${
              view === "anti_buntu" 
                ? "text-[#094cb2] font-semibold scale-105" 
                : "text-[#5a5f63]"
            }`}
          >
            <ShieldAlert className="w-6 h-6 mb-1" />
            <span>Anti-Stres</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
