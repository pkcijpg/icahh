import React, { useState } from "react";
import { Concept, ActionStep } from "../types";
import { 
  CheckCircle, 
  Circle, 
  MoreHorizontal, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Archive, 
  Award, 
  BookOpen,
  ClipboardCopy,
  Calendar
} from "lucide-react";

interface LibraryViewProps {
  savedConcepts: Concept[];
  onUpdateConcept: (updated: Concept) => void;
  onRemove: (title: string) => void;
  onGoToAntiBuntu: (ideaTitle: string, description: string) => void;
  onGoBackToGenerator: () => void;
}

export default function LibraryView({ 
  savedConcepts, 
  onUpdateConcept, 
  onRemove,
  onGoToAntiBuntu,
  onGoBackToGenerator
}: LibraryViewProps) {
  const [filter, setFilter] = useState<"semua" | "sedang_berjalan" | "belum_mulai" | "selesai">("semua");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Toggle checklist step completion
  const handleToggleStep = (concept: Concept, stepNumber: number) => {
    // Clone action steps
    const updatedSteps = concept.actionSteps.map(step => 
      step.stepNumber === stepNumber ? { ...step, completed: !step.completed } : step
    );

    // Calculate progression percentage
    const completedCount = updatedSteps.filter(s => s.completed).length;
    const totalCount = updatedSteps.length;
    
    let updatedStatus: Concept["status"] = "sedang_berjalan";
    if (completedCount === 0) {
      updatedStatus = "belum_mulai";
    } else if (completedCount === totalCount) {
      updatedStatus = "selesai";
    }

    const updatedConcept: Concept = {
      ...concept,
      actionSteps: updatedSteps,
      status: updatedStatus
    };

    onUpdateConcept(updatedConcept);
  };

  const handleForceStatus = (concept: Concept, newStatus: Concept["status"]) => {
    let updatedSteps = [...concept.actionSteps];
    if (newStatus === "selesai") {
      updatedSteps = updatedSteps.map(s => ({ ...s, completed: true }));
    } else if (newStatus === "belum_mulai") {
      updatedSteps = updatedSteps.map(s => ({ ...s, completed: false }));
    }

    const updatedConcept: Concept = {
      ...concept,
      actionSteps: updatedSteps,
      status: newStatus
    };
    onUpdateConcept(updatedConcept);
    setActiveMenu(null);
  };

  // Filtered concepts
  const filteredConcepts = savedConcepts.filter(c => {
    if (filter === "semua") return true;
    return (c.status || "belum_mulai") === filter;
  });

  const getSKPIMetadata = (concept: Concept) => {
    const category = concept.title.toLowerCase();
    let skpiCategory = "Karya Kreatif mandiri / Riset Ilmiah Mandiri";
    let certificateDetail = "Draf Jurnal Penelitian Terarah berstruktur IMRAD dengan model analisis regresi kontemporer.";
    
    if (category.includes("poster") || category.includes("desain") || category.includes("infografis") || category.includes("identitas")) {
      skpiCategory = "Pendidikan & Kompetensi Professional Desain";
      certificateDetail = "Dokumentasi Desain Infografis Seminar standard internasional dengan audit keterbacaan WCAG.";
    } else if (category.includes("video") || category.includes("kampanye") || category.includes("dokumenter")) {
      skpiCategory = "Pengabdian Masyarakat / Aplikasi Media Edukatif";
      certificateDetail = "Video Dokumenter Sosiologis Lapangan berdurasi 5-7 menit yang memotret inklusivitas sosial.";
    } else if (category.includes("maket") || category.includes("prototipe") || category.includes("origami") || category.includes("alat peraga") || category.includes("pilar")) {
      skpiCategory = "Rekayasa Teknologi / Inovasi Vokasional Terapan";
      certificateDetail = "Prototipe Alat Peraga Mekanis Lipat Presisi Tinggi untuk simulasi mekanika terapan.";
    }

    return { skpiCategory, certificateDetail };
  };

  const handleCopySKPICapacity = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="w-full">
      {/* Header & Description */}
      <div className="mb-10">
        <h2 className="font-headline text-3xl md:text-5xl text-[#1b1c1d] mb-4">
          Hub Portofolio Akademik & SKPI
        </h2>
        <p className="font-sans text-base text-[#434653] leading-relaxed max-w-2xl font-light">
          Kelola kemajuan riset, kerjakan laras langkah PjBL, dan dapatkan draf pengisian klaim transkrip non-akademik **SKPI (Surat Keterangan Pendamping Ijazah)** secara instan pasca penyelesaian tugas.
        </p>

        {/* Filter Tabs Styled via Surface Layering */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 mt-8">
          <button 
            type="button"
            onClick={() => setFilter("semua")}
            className={`font-label text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer outline-none ${
              filter === "semua"
                ? "bg-[#094cb2] text-white shadow-sm"
                : "bg-[#efedee] text-[#1b1c1d] hover:bg-[#e3e2e3]"
            }`}
          >
            Semua Tugas ({savedConcepts.length})
          </button>
          
          <button 
            type="button"
            onClick={() => setFilter("sedang_berjalan")}
            className={`font-label text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer flex items-center gap-2 outline-none ${
              filter === "sedang_berjalan"
                ? "bg-[#094cb2] text-white shadow-sm"
                : "bg-[#efedee] text-[#1b1c1d] hover:bg-[#e3e2e3]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#bfab49] animate-pulse"></span>
            <span>Riset Berjalan ({savedConcepts.filter(c => c.status === "sedang_berjalan").length})</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setFilter("belum_mulai")}
            className={`font-label text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer outline-none ${
              filter === "belum_mulai"
                ? "bg-[#094cb2] text-white shadow-sm"
                : "bg-[#efedee] text-[#1b1c1d] hover:bg-[#e3e2e3]"
            }`}
          >
            Draf Mentah ({savedConcepts.filter(c => (c.status || "belum_mulai") === "belum_mulai").length})
          </button>
          
          <button 
            type="button"
            onClick={() => setFilter("selesai")}
            className={`font-label text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer outline-none ${
              filter === "selesai"
                ? "bg-[#094cb2] text-white shadow-sm"
                : "bg-[#efedee] text-[#1b1c1d] hover:bg-[#e3e2e3]"
            }`}
          >
            Selesai/SKPI Clamed ({savedConcepts.filter(c => c.status === "selesai").length})
          </button>
        </div>
      </div>

      {savedConcepts.length === 0 ? (
        /* Empty State */
        <div className="bg-[#efedee]/50 border border-dashed border-[#c3c6d5] select-none p-12 rounded-3xl text-center max-w-lg mx-auto my-8">
          <Archive className="w-12 h-12 text-[#737784] mx-auto mb-4" />
          <h3 className="font-headline text-xl text-[#1b1c1d] mb-2">Belum ada Tugas yang disimpan</h3>
          <p className="font-sans text-sm text-[#434653] leading-relaxed mb-6 font-light">
            Silakan telusuri draf generator akademik kami, tentukan target mata kuliah, lalu kunci draf tugas pertama Anda di sini.
          </p>
          <button 
            type="button"
            onClick={onGoBackToGenerator}
            className="bg-[#094cb2] text-white font-label text-xs font-semibold px-6 py-3 rounded-full uppercase tracking-wider hover:opacity-90 outline-none"
          >
            Susun Tugas Pertama
          </button>
        </div>
      ) : filteredConcepts.length === 0 ? (
        /* Filter Empty State */
        <div className="bg-[#efedee]/30 p-12 rounded-3xl text-center max-w-lg mx-auto my-8 select-none">
          <p className="font-sans text-sm text-[#434653] font-light">
            Tidak ada tugas terdaftar dengan status ini. Centang ceklis kegiatan draf PjBL Anda untuk mengupdate progresnya secara dinamis!
          </p>
        </div>
      ) : (
        /* Concepts Bento Grid list */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredConcepts.map((concept) => {
            const steps = concept.actionSteps;
            const completedCount = steps.filter(s => s.completed).length;
            const totalCount = steps.length;
            const percent = Math.round((completedCount / totalCount) * 100) || 0;
            const isCompleted = concept.status === "selesai";
            const isInProgress = concept.status === "sedang_berjalan";
            
            const { skpiCategory, certificateDetail } = getSKPIMetadata(concept);
            const rawSKPIText = `Kategori SKPI: ${skpiCategory}\nDeskripsi Capaian: ${certificateDetail}\nStatus Verifikasi: Selesai Terverifikasi melalui CreativeSpark Portofolio`;

            return (
              <article 
                key={concept.title}
                className="bg-white rounded-[1.5rem] p-6 flex flex-col justify-between border border-[#c3c6d5]/20 hover:border-[#c3c6d5]/50 hover:shadow-sm transition-all duration-300 relative group"
              >
                {/* Decorative gold top-border for completed items ready for SKPI */}
                {isCompleted && (
                  <div className="absolute top-0 left-0 w-full h-[5px] bg-[#bfab49] opacity-90 rounded-t-[1.5rem]"></div>
                )}

                <div>
                  {/* Card Title & Status Badge row */}
                  <div className="flex justify-between items-start mb-6">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#bfab49]/10 text-[#605204] font-label text-xs tracking-wide uppercase font-semibold">
                        <Award className="w-3.5 h-3.5" />
                        <span>Selesai & SKPI Ready</span>
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7ebff] text-[#00419d] font-label text-xs tracking-wide uppercase font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#bfab49] animate-pulse"></span>
                        <span>Riset Aktif</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efedee] text-[#434653] font-label text-xs tracking-wide uppercase font-semibold">
                        <span>Draf Riset</span>
                      </span>
                    )}

                    {/* Actions dropdown */}
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => setActiveMenu(activeMenu === concept.title ? null : concept.title)}
                        className="text-[#434653] hover:text-[#094cb2] p-1.5 rounded-full hover:bg-[#efedee] transition-colors outline-none"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {activeMenu === concept.title && (
                        <div className="absolute right-0 top-8 bg-white border border-[#c3c6d5]/40 shadow-lg rounded-xl py-2 w-48 z-20 text-left">
                          <button 
                            type="button"
                            onClick={() => handleForceStatus(concept, "sedang_berjalan")}
                            className="w-full text-left px-4 py-2 hover:bg-[#efedee] font-sans text-xs text-[#1b1c1d]"
                          >
                            Set Sedang Berjalan
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleForceStatus(concept, "selesai")}
                            className="w-full text-left px-4 py-2 hover:bg-[#efedee] font-sans text-xs text-[#1b1c1d]"
                          >
                            Set Selesai (100% Selesai)
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleForceStatus(concept, "belum_mulai")}
                            className="w-full text-left px-4 py-2 hover:bg-[#efedee] font-sans text-xs text-[#1b1c1d]"
                          >
                            Reset Progres Ke Awal
                          </button>
                          <hr className="my-1 border-[#c3c6d5]/20" />
                          <button 
                            type="button"
                            onClick={() => {
                              onRemove(concept.title);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 font-sans text-xs text-red-600 flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Permanen</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-headline text-xl font-medium text-[#1b1c1d] group-hover:text-[#094cb2] transition-colors mb-2">
                    {concept.title}
                  </h3>
                  <p className="font-sans text-[#434653] text-[13px] leading-relaxed mb-6 font-light">
                    {concept.description}
                  </p>
                </div>

                {/* Progress bar section */}
                <div className="mt-auto bg-[#faf9fa] border border-[#c3c6d5]/10 p-4 rounded-2xl space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-label text-xs text-[#434653]/80 uppercase tracking-wide">
                        Progres Timeline
                      </span>
                      <span className={`font-headline text-sm font-semibold ${isCompleted ? "text-[#bfab49]" : "text-[#094cb2]"}`}>
                        {percent}%
                      </span>
                    </div>
                    
                    {/* Base dynamic progression meter */}
                    <div className="h-1.5 w-full bg-[#efedee] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-[#bfab49]" : "bg-[#094cb2]"}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Checklist Elements */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label text-[10px] text-[#434653]/90 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#094cb2]" />
                        <span>Langkah Riset PjBL:</span>
                      </span>
                      <span className="font-sans text-xs font-semibold text-[#1b1c1d]">
                        {completedCount}/{totalCount}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {steps.map((step) => {
                        const complete = step.completed;
                        return (
                          <li 
                            key={step.stepNumber}
                            onClick={() => handleToggleStep(concept, step.stepNumber)}
                            className="flex items-start gap-2 cursor-pointer select-none"
                          >
                            <button 
                              type="button" 
                              className={`flex-shrink-0 mt-0.5 outline-none focus:text-[#094cb2] rounded-full ${
                                complete ? "text-[#094cb2]" : "text-[#737784]"
                              }`}
                            >
                              {complete ? (
                                <CheckCircle className="w-4 h-4 fill-[#094cb2]/10" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                            
                            <div className="text-left">
                              <span className={`font-sans text-xs ${
                                complete ? "text-neutral-400 line-through opacity-60" : "text-neutral-800 font-medium"
                              }`}>
                                {step.title}
                              </span>
                              <p className={`font-sans text-[10px] text-neutral-500 leading-normal ${
                                complete ? "opacity-35" : "opacity-85"
                              }`}>
                                {step.detail}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Portfolio claim formatting mode standard for SKPI */}
                  {isCompleted && (
                    <div className="mt-4 pt-4 border-t border-[#c3c6d5]/20 bg-yellow-50/40 p-3 rounded-lg border border-yellow-100 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-label font-bold uppercase text-[#bfab49] flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 fill-yellow-200" />
                          <span>Draf Isian SKPI Siap Salin</span>
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleCopySKPICapacity(concept.title, rawSKPIText)}
                          className="text-[#bfab49] hover:text-amber-700 outline-none transition-colors"
                          title="Salin ke Clipboard"
                        >
                          <ClipboardCopy className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] font-sans leading-relaxed text-[#524600] space-y-1">
                        <p><strong>Kategori:</strong> {skpiCategory}</p>
                        <p><strong>Capaian:</strong> "{certificateDetail}"</p>
                      </div>

                      {copiedId === concept.title && (
                        <span className="text-[9px] text-green-700 font-semibold self-end animate-pulse mt-1">
                          ✓ Berhasil Disalin ke Clipboard!
                        </span>
                      )}
                    </div>
                  )}

                  {/* Anti buntu quick helper triggers inside card */}
                  <div className="mt-4 pt-3 border-t border-[#c3c6d5]/10 flex justify-between items-center">
                    <span className="font-sans text-[10px] text-[#737784] font-light flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{concept.estimatedDuration}</span>
                    </span>
                    <button 
                      type="button"
                      onClick={() => onGoToAntiBuntu(concept.title, concept.description)}
                      className="font-label text-[10px] text-red-600 hover:text-red-800 uppercase tracking-widest font-bold flex items-center gap-1 outline-none"
                    >
                      <span>Mentok? Cari Tips</span>
                      <ArrowRight className="w-3 h-3 animate-pulse" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
