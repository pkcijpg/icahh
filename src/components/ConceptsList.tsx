import React, { useState } from "react";
import { Concept, ActionStep } from "../types";
import { 
  Bookmark, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ArrowRight, 
  Rocket, 
  BookOpen, 
  Award, 
  ShieldAlert, 
  GraduationCap
} from "lucide-react";

interface ConceptsListProps {
  concepts: Concept[];
  savedIds: string[];
  savedConcepts: Concept[];
  onSave: (concept: Concept) => void;
  onRemove: (title: string) => void;
  onUpdateConcept: (updated: Concept) => void;
  onGoToLibrary: () => void;
  onGoToAntiBuntu: (ideaTitle: string, description: string) => void;
}

export default function ConceptsList({ 
  concepts, 
  savedIds, 
  savedConcepts,
  onSave, 
  onRemove,
  onUpdateConcept,
  onGoToLibrary,
  onGoToAntiBuntu
}: ConceptsListProps) {
  // We can track which concept is fully locked as a project
  const [lockedProject, setLockedProject] = useState<string | null>(null);
  // Track active sub-tab for locked projects: "pbl" | "skpi" | "stress"
  const [activeSubTab, setActiveSubTab] = useState<Record<string, "pbl" | "skpi" | "stress">>({});

  const isSaved = (title: string) => {
    return savedIds.includes(title);
  };

  const getSavedConceptByTitle = (title: string): Concept | undefined => {
    return savedConcepts.find(c => c.title === title);
  };

  const handleBookmarkToggle = (concept: Concept) => {
    if (isSaved(concept.title)) {
      onRemove(concept.title);
      if (lockedProject === concept.title) {
        setLockedProject(null);
      }
    } else {
      onSave(concept);
    }
  };

  const handleLockProject = (concept: Concept) => {
    // If not saved, save it first
    if (!isSaved(concept.title)) {
      onSave(concept);
    }
    
    // Set this concept status to "sedang_berjalan" in library
    const saved = getSavedConceptByTitle(concept.title) || {
      ...concept,
      id: "concept_" + Date.now(),
      status: "sedang_berjalan" as const,
      actionSteps: concept.actionSteps.map(s => ({ ...s, completed: false }))
    };

    const updated: Concept = {
      ...saved,
      status: "sedang_berjalan"
    };
    onUpdateConcept(updated);

    // Set locked state and set active default sub-tab to "pbl"
    setLockedProject(concept.title);
    setActiveSubTab(prev => ({ ...prev, [concept.title]: "pbl" }));
  };

  const handleToggleStepLocal = (title: string, stepNumber: number) => {
    const saved = getSavedConceptByTitle(title);
    if (!saved) return;

    const updatedSteps = saved.actionSteps.map(step => 
      step.stepNumber === stepNumber ? { ...step, completed: !step.completed } : step
    );

    const completedCount = updatedSteps.filter(s => s.completed).length;
    const totalCount = updatedSteps.length;
    let newStatus: Concept["status"] = "sedang_berjalan";
    if (completedCount === 0) {
      newStatus = "belum_mulai";
    } else if (completedCount === totalCount) {
      newStatus = "selesai";
    }

    const updated: Concept = {
      ...saved,
      actionSteps: updatedSteps,
      status: newStatus
    };
    onUpdateConcept(updated);
  };

  // Generate customized academic & SKPI claim based on the concept and type
  const getSKPIMetadata = (concept: Concept) => {
    const category = concept.title.toLowerCase();
    let skpiCategory = "Karya Kreatif mandiri / Riset Ilmiah Mandiri";
    let certificateDetail = "Draf Jurnal Penelitian Terarah berstruktur IMRAD dengan model analisis regresi kontemporer.";
    
    if (category.includes("poster") || category.includes("desain") || category.includes("infografis")) {
      skpiCategory = "Pendidikan & Kompetensi Professional Desain";
      certificateDetail = "Dokumentasi Desain Infografis Seminar standard internasional dengan audit keterbacaan WCAG.";
    } else if (category.includes("video") || category.includes("kampanye") || category.includes("dokumenter")) {
      skpiCategory = "Pengabdian Masyarakat / Aplikasi Media Edukatif";
      certificateDetail = "Video Dokumenter Sosiologis Lapangan berdurasi 5-7 menit yang memotret inklusivitas sosial.";
    } else if (category.includes("maket") || category.includes("prototipe") || category.includes("origami") || category.includes("alat peraga")) {
      skpiCategory = "Rekayasa Teknologi / Inovasi Vokasional Terapan";
      certificateDetail = "Prototipe Alat Peraga Mekanis Lipat Presisi Tinggi untuk simulasi mekanika terapan.";
    }

    return { skpiCategory, certificateDetail };
  };

  return (
    <div className="w-full flex flex-col gap-12">
      {/* Editorial Header */}
      <div className="border-b border-[#c3c6d5]/20 pb-6">
        <p className="font-label text-xs text-[#063b8d] bg-[#094cb2]/10 px-3 py-1.5 rounded-full w-fit uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4" />
          <span>Rekomendasi Proyek Akademik Mahasiswa</span>
        </p>
        <h2 className="font-headline text-3xl md:text-5xl text-[#1b1c1d] font-semibold leading-tight tracking-tight">
          Top 5 Ide Tugas Kurator PjBL
        </h2>
        <p className="font-sans text-base text-[#434653] mt-3 leading-relaxed font-light">
          Kami telah menyaring parameter Anda ke dalam 5 draf rancangan yang berbobot penelitian murni. Klik tombol <strong className="font-medium text-[#094cb2]">Ide Ditemukan! 🚀</strong> untuk mengunci draf sebagai proyek aktif tugas kuliah Anda.
        </p>
      </div>

      {/* Styled Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {concepts.map((concept, index) => {
          const numStr = String(index + 1).padStart(2, "0");
          const saved = isSaved(concept.title);
          const savedObj = getSavedConceptByTitle(concept.title);
          
          const isCurrentLocked = lockedProject === concept.title;
          const currentTab = activeSubTab[concept.title] || "pbl";

          // Calculate progression if started
          const savedSteps = savedObj ? savedObj.actionSteps : concept.actionSteps;
          const completedCount = savedSteps.filter(s => s.completed).length;
          const totalCount = savedSteps.length;
          const progressPercent = Math.round((completedCount / totalCount) * 100) || 0;
          
          let cardSpan = "md:col-span-12";
          let bgClass = "bg-white";
          
          if (index === 0 && !isCurrentLocked) {
            bgClass = "bg-gradient-to-br from-[#ffffff] to-[#f4f6fc]";
          } else if (index === 1 && !isCurrentLocked) {
            cardSpan = "md:col-span-6";
          } else if (index === 2 && !isCurrentLocked) {
            cardSpan = "md:col-span-6";
          } else if (index === 3 && !isCurrentLocked) {
            cardSpan = "md:col-span-6";
          } else if (index === 4 && !isCurrentLocked) {
            cardSpan = "md:col-span-6";
          }

          if (isCurrentLocked) {
            cardSpan = "md:col-span-12";
            bgClass = "bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#e7ebff]/30 ring-2 ring-[#094cb2] shadow-md shadow-[#094cb2]/5";
          }

          const { skpiCategory, certificateDetail } = getSKPIMetadata(concept);

          return (
            <article 
              key={concept.title}
              id={`concept-card-${index}`}
              className={`${cardSpan} ${bgClass} rounded-2xl p-6 md:p-8 border border-[#c3c6d5]/30 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group`}
            >
              {/* Subtle accent line for locked active projects */}
              {isCurrentLocked && (
                <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#094cb2] to-[#bfab49]"></div>
              )}

              {/* Header Info */}
              <div className="flex justify-between items-start mb-6 z-10 w-full">
                <div className="flex items-center gap-2">
                  <span className="font-headline text-4xl text-[#c3c6d5]/70 font-light group-hover:text-[#094cb2]/50 transition-colors">
                    {numStr}
                  </span>
                  {isCurrentLocked && (
                    <span className="bg-green-600 text-white text-[10px] font-label font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      <span>Ide Ditemukan! Proyek Aktif</span>
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => handleBookmarkToggle(concept)}
                  aria-label={saved ? "Hapus dari Library" : "Bookmark Ide"}
                  className={`p-2 rounded-full transition-all outline-none active:scale-90 ${
                    saved 
                      ? "bg-[#094cb2]/10 text-[#094cb2]" 
                      : "text-[#737784] hover:text-[#094cb2] hover:bg-[#efedee]"
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Title & Description */}
              <div className="flex-grow z-10">
                <h3 className="font-headline text-2xl md:text-3xl text-[#1b1c1d] font-semibold leading-snug group-hover:text-[#094cb2] transition-colors mb-3">
                  {concept.title}
                </h3>
                <p className="font-sans text-[#434653] text-sm leading-relaxed mb-6 font-light">
                  {concept.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="flex items-center gap-1.5 text-[#524600] bg-[#bfab49]/10 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="font-label text-xs font-semibold uppercase tracking-wider">
                      {concept.fitPercentage}% Relevansi
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#434653] bg-[#f5f3f4] px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-label text-xs uppercase tracking-wider">
                      {concept.estimatedDuration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active / Locked Stages Controller */}
              {!isCurrentLocked ? (
                /* Primary Action Mode: Propose Ide Ditemukan */
                <div className="border-t border-[#c3c6d5]/15 pt-5 flex items-center justify-between gap-4 z-10 w-full mt-auto">
                  <button 
                    onClick={() => handleLockProject(concept)}
                    className="bg-[#094cb2] hover:bg-[#00419d] text-white font-label text-xs font-bold px-5 py-3 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-2 group-actions active:scale-95 transition-all outline-none cursor-pointer"
                  >
                    <Rocket className="w-4 h-4 text-yellow-300 animate-bounce" />
                    <span>Ide Ditemukan! 🚀</span>
                  </button>
                  
                  <button
                    onClick={() => onGoToAntiBuntu(concept.title, concept.description)}
                    className="text-xs font-label text-red-600 hover:text-red-800 font-semibold uppercase tracking-wider flex items-center gap-1 outline-none"
                  >
                    <span>Stres? Anti-Stres</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Beautiful 3-Stage Academic Dashboard conforming exactly to ADVANCED STAGE HANDLING guidelines */
                <div id="active-stages-panel" className="mt-8 pt-8 border-t-2 border-[#094cb2]/10 z-10 w-full">
                  <div className="bg-[#fcfdfe] border border-[#094cb2]/15 rounded-2xl p-6 md:p-8 space-y-8 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#094cb2]/10">
                      <div>
                        <h4 className="font-headline text-lg md:text-xl font-bold flex items-center gap-2 text-neutral-900">
                          <Rocket className="w-5 h-5 text-yellow-500 animate-bounce" />
                          <span>Asisten Akademis: 3 Tahapan Rencana Aksi</span>
                        </h4>
                        <p className="font-sans text-xs text-[#5b5f63] mt-1">
                          Rencana aksi yang dirancang khusus untuk memandu eksekusi proyek kuratorial Anda.
                        </p>
                      </div>
                      <div className="font-sans text-xs font-bold text-[#094cb2] bg-[#094cb2]/10 px-4 py-2 rounded-full flex items-center gap-2 self-start md:self-auto">
                        <span>Checklist Kemajuan Rencana:</span>
                        <span className="text-sm font-headline bg-[#094cb2] text-white px-2.5 py-0.5 rounded-full">
                          {progressPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* TAHAP 1 (Langkah Mulai) */}
                      <div className="bg-white p-5 rounded-xl border border-neutral-200/60 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="w-7 h-7 rounded-full bg-[#094cb2]/10 text-[#094cb2] font-label text-xs font-bold flex items-center justify-center">1</span>
                            <h5 className="font-headline font-semibold text-neutral-900 text-sm">TAHAP 1 (Langkah Mulai)</h5>
                          </div>
                          <p className="font-sans text-xs text-[#5b5f63] mb-4">
                            Langkah-langkah aksi nyata ilmiah dan metodologis untuk menyelesaikan tugas ini:
                          </p>
                          <div className="space-y-3">
                            {savedSteps.map((step) => {
                              const complete = step.completed;
                              return (
                                <div 
                                  key={step.stepNumber} 
                                  onClick={() => handleToggleStepLocal(concept.title, step.stepNumber)}
                                  className="flex gap-2.5 items-start bg-neutral-50/70 hover:bg-neutral-50 p-2.5 rounded-lg border border-[#c3c6d5]/15 transition-all cursor-pointer select-none text-left"
                                >
                                  <div className="flex flex-col items-center shrink-0 mt-0.5">
                                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                      complete ? "bg-[#094cb2] border-[#094cb2] text-white" : "border-[#c3c6d5] bg-white text-transparent"
                                    }`}>
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                  </div>
                                  <div>
                                    <p className={`font-sans text-[11px] font-semibold ${complete ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                                      {step.title}
                                    </p>
                                    <p className={`font-sans text-[10px] text-neutral-500 mt-0.5 leading-relaxed ${complete ? "opacity-50" : "opacity-95"}`}>
                                      {step.detail}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {progressPercent === 100 && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-[11px] font-sans text-left">
                            🎉 <strong>Riset Selesai!</strong> Karya Anda telah diarsipkan ke dalam draf Library kelulusan.
                          </div>
                        )}
                      </div>

                      {/* TAHAP 2 (Library & SKPI) */}
                      <div className="bg-white p-5 rounded-xl border border-neutral-200/60 shadow-xs flex flex-col justify-between text-left">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="w-7 h-7 rounded-full bg-[#bfab49]/10 text-[#bfab49] font-label text-xs font-bold flex items-center justify-center">2</span>
                            <h5 className="font-headline font-semibold text-neutral-900 text-sm">TAHAP 2 (Library & SKPI)</h5>
                          </div>
                          <p className="font-sans text-xs text-[#5b5f63] mb-4">
                            Proyek akademik ini dapat diarsipkan untuk portofolio atau sebagai syarat validasi kelulusan dokumen SKPI:
                          </p>
                          <div className="bg-[#fcfbfc] p-3.5 rounded-lg border border-dashed border-[#c3c6d5] space-y-3">
                            <div>
                              <span className="font-label text-[9px] uppercase font-bold text-[#bfab49] bg-yellow-50 px-1.5 py-0.5 rounded">
                                Bidang Kompetensi SKPI:
                              </span>
                              <p className="font-sans text-[11px] text-[#1b1c1d] font-semibold mt-1">
                                {skpiCategory}
                              </p>
                            </div>
                            <div>
                              <span className="font-label text-[9px] uppercase font-bold text-[#094cb2] bg-[#e7ebff] px-1.5 py-0.5 rounded">
                                Draf Klaim Portofolio:
                              </span>
                              <p className="font-sans text-[10px] text-[#434653] italic mt-1 leading-relaxed">
                                "{certificateDetail}"
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <button 
                            onClick={onGoToLibrary}
                            className="w-full bg-[#efedee] text-[#1b1c1d] hover:bg-neutral-200 font-label text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider transition-colors outline-none cursor-pointer"
                          >
                            Kelola Portofolio di Library Saya
                          </button>
                        </div>
                      </div>

                      {/* TAHAP 3 (Tips Anti-Stres) */}
                      <div className="bg-white p-5 rounded-xl border border-neutral-200/60 shadow-xs flex flex-col justify-between text-left">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="w-7 h-7 rounded-full bg-red-100 text-red-600 font-label text-xs font-bold flex items-center justify-center">3</span>
                            <h5 className="font-headline font-semibold text-neutral-900 text-sm">TAHAP 3 (Tips Anti-Stres & Bias AI)</h5>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="p-3 bg-red-50/50 rounded-lg border border-red-50 text-neutral-800">
                              <h6 className="font-sans text-[11px] font-bold text-red-700 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                <span>Tips Mengatasi Kebuntuan</span>
                              </h6>
                              <p className="font-sans text-[10px] text-neutral-600 leading-relaxed font-light mt-1">
                                Atasi academic block dengan teknik <strong>Pomodoro Decompression</strong>: matikan gawai Anda selama 15 menit, jalan kaki santai, dan diskusikan draf kasar Anda secara verbal dengan sejawat/mentor sebelum mulai mengetik.
                              </p>
                            </div>

                            <div className="p-3 bg-yellow-50/50 rounded-lg border border-yellow-50 text-neutral-800">
                              <h6 className="font-sans text-[11px] font-bold text-amber-700 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <span>Saring Bias Ketergantungan AI</span>
                              </h6>
                              <p className="font-sans text-[10px] text-neutral-600 leading-relaxed font-light mt-1">
                                Jangan lulut pada saduran mentah AI. Terapkan <strong>metode verifikasi 50/50</strong>: gunakan bantuan kecerdasan buatan hanya untuk memetakan referensi, namun tetap lakukan interpretasi kritis manual agar argumen Anda tetap orisinal.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <button 
                            onClick={() => onGoToAntiBuntu(concept.title, concept.description)}
                            className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-label text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider transition-colors outline-none cursor-pointer text-center flex items-center justify-center gap-1"
                          >
                            <span>Buka Dashboard Anti-Stres</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#c3c6d5]/15 flex justify-between items-center text-xs">
                      <span className="font-sans text-xs text-[#737784]">
                        Status Proyek: <strong className="font-medium text-[#1b1c1d]">{progressPercent === 100 ? "Valid / Selesai" : "Aktif Meneliti"}</strong>
                      </span>
                      <button
                        onClick={() => setLockedProject(null)}
                        className="text-[10px] font-label text-neutral-500 hover:text-neutral-800 uppercase tracking-widest font-bold outline-none cursor-pointer"
                      >
                        Batal Kunci / Pilih Lainnya
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Simulated Button at the end of the 5 ideas list as explicitly demanded: "[🚀 Ide Ditemukan! Klik di sini jika kamu sudah memilih]" */}
      <div className="flex flex-col items-center justify-center gap-3 mt-6 p-6 bg-[#f4f6fc] border border-[#c3c6d5]/40 rounded-3xl max-w-xl mx-auto text-center">
        <p className="font-sans text-xs text-[#5b5f63] font-light">
          Sudah membandingkan seluruh rancangan di atas dan menemukan draf terbaik untuk tugas semester Anda?
        </p>
        <button 
          onClick={() => {
            if (lockedProject) {
              const el = document.getElementById("active-stages-panel");
              el?.scrollIntoView({ behavior: "smooth" });
            } else if (concepts.length > 0) {
              handleLockProject(concepts[0]);
              setTimeout(() => {
                const el = document.getElementById("active-stages-panel");
                el?.scrollIntoView({ behavior: "smooth" });
              }, 150);
            }
          }}
          className="bg-gradient-to-r from-[#094cb2] to-[#2259bf] text-white font-headline text-xs font-bold px-6 py-3.5 rounded-full shadow-md shadow-[#094cb2]/10 hover:shadow-lg hover:scale-102 transition-all cursor-pointer outline-none active:scale-95"
        >
          [🚀 Ide Ditemukan! Klik di sini jika kamu sudah memilih]
        </button>
      </div>

      {/* Stuck trigger block */}
      <div className="mt-12 bg-[#efedee] p-8 md:p-12 rounded-3xl text-center max-w-2xl mx-auto border border-[#c3c6d5]/10 shadow-sm relative">
        <h3 className="font-headline text-2xl text-[#1b1c1d] font-medium mb-3">
          Mengalami Stres Akademik yang Berat?
        </h3>
        <p className="font-sans text-sm text-[#434653] mb-6 leading-relaxed font-light">
          Rasa lelah membaca literatur tebal, beban plagiarisme, dan tekanan lulus tepat waktu adalah beban riil mahasiswa. Manfaatkan instrumen penyegaran kami untuk memulihkan kapasitas kognitif Anda.
        </p>
        <button 
          onClick={() => onGoToAntiBuntu("General Creative Block", "Stres akademis tugas menumpuk dan bias kognitif harian.")}
          className="inline-flex items-center justify-center gap-3 bg-[#094cb2] text-white font-label text-xs font-semibold px-8 py-4 rounded-full uppercase tracking-widest shadow-[0_4px_14px_0_rgba(9,76,178,0.39)] hover:shadow-[0_6px_20px_rgba(9,76,178,0.23)] hover:opacity-90 transition-all outline-none cursor-pointer"
        >
          <Sparkles className="w-4.5 h-4.5 animate-pulse" />
          <span>Buka Dashboard Anti-Stres & Bias AI</span>
        </button>
      </div>
    </div>
  );
}
