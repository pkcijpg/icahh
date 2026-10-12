import React, { useState } from "react";
import { 
  FileText, 
  Palette, 
  Video, 
  Scissors, 
  Laptop, 
  Camera, 
  Tablet, 
  Mic, 
  Plus, 
  Flame, 
  PlusCircle,
  HelpCircle,
  Check
} from "lucide-react";

interface PrefFormProps {
  onSpark: (category: string, time: number, tools: string[]) => void;
  loading: boolean;
}

export default function PrefForm({ onSpark, loading }: PrefFormProps) {
  const [category, setCategory] = useState<string>("menulis");
  const [time, setTime] = useState<number>(30);
  
  // Available tools states
  const [availableTools, setAvailableTools] = useState<Array<{ id: string; label: string; icon: any; checked: boolean }>>([
    { id: "laptop", label: "Laptop", icon: Laptop, checked: true },
    { id: "kertas", label: "Kertas & Pena", icon: FileText, checked: true },
    { id: "kamera", label: "Kamera", icon: Camera, checked: false },
    { id: "tablet", label: "Tablet Gambar", icon: Tablet, checked: false },
    { id: "audio", label: "Perekam Suara", icon: Mic, checked: false },
  ]);
  
  const [newTool, setNewTool] = useState("");

  const handleToggleTool = (id: string) => {
    setAvailableTools(prev => prev.map(tool => 
      tool.id === id ? { ...tool, checked: !tool.checked } : tool
    ));
  };

  const handleAddCustomTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTool.trim()) return;
    
    const id = "custom_" + Date.now();
    setAvailableTools(prev => [
      ...prev,
      { id, label: newTool.trim(), icon: Laptop, checked: true }
    ]);
    setNewTool("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeTools = availableTools
      .filter(t => t.checked)
      .map(t => t.label);
    onSpark(category, time, activeTools);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-12 w-full mt-4">
      {/* 1. Category Selection */}
      <fieldset className="flex flex-col gap-6">
        <legend className="font-label text-sm uppercase tracking-widest text-[#5a5f63] font-semibold mb-2">
          1. Pilih Fokus Tugas Akademik
        </legend>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Writing */}
          <label className="relative cursor-pointer group">
            <input 
              type="radio" 
              name="category" 
              value="menulis" 
              checked={category === "menulis"}
              onChange={() => setCategory("menulis")}
              className="peer sr-only"
            />
            <div className="h-32 flex flex-col items-center justify-center p-3 text-center gap-2 bg-[#f5f3f4] border border-[#c3c6d5]/15 rounded-xl transition-all duration-300 peer-checked:bg-[#094cb2] peer-checked:border-[#094cb2] peer-checked:shadow-[0_8px_24px_-8px_rgba(9,76,178,0.4)] hover:bg-[#e9e8e9]">
              <FileText className="w-8 h-8 text-[#434653] peer-checked:text-white group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="font-sans font-semibold text-sm text-[#1b1c1d] peer-checked:text-white transition-colors duration-300">
                  Menulis
                </span>
                <span className="font-sans text-[10px] text-[#5b5f63]/90 peer-checked:text-white/80 transition-colors mt-0.5">
                  Esai, Jurnal, Riviu Pustaka
                </span>
              </div>
            </div>
          </label>

          {/* Design */}
          <label className="relative cursor-pointer group">
            <input 
              type="radio" 
              name="category" 
              value="desain" 
              checked={category === "desain"}
              onChange={() => setCategory("desain")}
              className="peer sr-only"
            />
            <div className="h-32 flex flex-col items-center justify-center p-3 text-center gap-2 bg-[#f5f3f4] border border-[#c3c6d5]/15 rounded-xl transition-all duration-300 peer-checked:bg-[#094cb2] peer-checked:border-[#094cb2] peer-checked:shadow-[0_8px_24px_-8px_rgba(9,76,178,0.4)] hover:bg-[#e9e8e9]">
              <Palette className="w-8 h-8 text-[#434653] peer-checked:text-white group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="font-sans font-semibold text-sm text-[#1b1c1d] peer-checked:text-white transition-colors duration-300">
                  Desain Visual
                </span>
                <span className="font-sans text-[10px] text-[#5b5f63]/90 peer-checked:text-white/80 transition-colors mt-0.5">
                  Poster Ilmiah, PowerPoint, Infografis
                </span>
              </div>
            </div>
          </label>

          {/* Video */}
          <label className="relative cursor-pointer group">
            <input 
              type="radio" 
              name="category" 
              value="video" 
              checked={category === "video"}
              onChange={() => setCategory("video")}
              className="peer sr-only"
            />
            <div className="h-32 flex flex-col items-center justify-center p-3 text-center gap-2 bg-[#f5f3f4] border border-[#c3c6d5]/15 rounded-xl transition-all duration-300 peer-checked:bg-[#094cb2] peer-checked:border-[#094cb2] peer-checked:shadow-[0_8px_24px_-8px_rgba(9,76,178,0.4)] hover:bg-[#e9e8e9]">
              <Video className="w-8 h-8 text-[#434653] peer-checked:text-white group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="font-sans font-semibold text-sm text-[#1b1c1d] peer-checked:text-white transition-colors duration-300">
                  Media & Video
                </span>
                <span className="font-sans text-[10px] text-[#5b5f63]/90 peer-checked:text-white/80 transition-colors mt-0.5">
                  Klip Kelompok, Dokumenter Kampus
                </span>
              </div>
            </div>
          </label>

          {/* Craft */}
          <label className="relative cursor-pointer group">
            <input 
              type="radio" 
              name="category" 
              value="kerajinan" 
              checked={category === "kerajinan"}
              onChange={() => setCategory("kerajinan")}
              className="peer sr-only"
            />
            <div className="h-32 flex flex-col items-center justify-center p-3 text-center gap-2 bg-[#f5f3f4] border border-[#c3c6d5]/15 rounded-xl transition-all duration-300 peer-checked:bg-[#094cb2] peer-checked:border-[#094cb2] peer-checked:shadow-[0_8px_24px_-8px_rgba(9,76,178,0.4)] hover:bg-[#e9e8e9]">
              <Scissors className="w-8 h-8 text-[#434653] peer-checked:text-white group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="font-sans font-semibold text-sm text-[#1b1c1d] peer-checked:text-white transition-colors duration-300">
                  Maket & Prototipe
                </span>
                <span className="font-sans text-[10px] text-[#5b5f63]/90 peer-checked:text-white/80 transition-colors mt-0.5">
                  Alat Peraga, Model Vokasi Fisik
                </span>
              </div>
            </div>
          </label>
        </div>
      </fieldset>

      {/* 2. Time Slider */}
      <fieldset className="flex flex-col gap-6 bg-white p-8 rounded-2xl border border-[#c3c6d5]/15 shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <legend className="font-label text-sm uppercase tracking-widest text-[#5a5f63] font-semibold">
            2. Alokasi Waktu
          </legend>
          <div className="font-headline text-3xl font-medium text-[#094cb2] flex items-baseline gap-1">
            <span>{time}</span> 
            <span className="text-lg text-[#434653] font-sans font-normal">menit</span>
          </div>
        </div>
        
        <div className="relative w-full pt-4 pb-2">
          <input 
            type="range"
            id="time-slider"
            min="5"
            max="120"
            step="5"
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className="w-full appearance-none bg-transparent cursor-pointer"
          />
          <div className="flex justify-between w-full text-xs font-label text-[#434653] mt-4 px-1">
            <span>5m</span>
            <span>30m</span>
            <span>60m</span>
            <span>120m</span>
          </div>
        </div>
      </fieldset>

      {/* 3. Tools Chips */}
      <fieldset className="flex flex-col gap-4">
        <legend className="font-label text-sm uppercase tracking-widest text-[#5a5f63] font-semibold mb-2">
          3. Alat yang Tersedia
        </legend>
        
        <div className="flex flex-wrap gap-3" id="tools-container">
          {availableTools.map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <label key={tool.id} className="relative cursor-pointer">
                <input 
                  type="checkbox"
                  checked={tool.checked}
                  onChange={() => handleToggleTool(tool.id)}
                  className="peer sr-only"
                />
                <div className="px-5 py-2.5 rounded-full bg-[#efedee] border border-[#c3c6d5]/30 text-[#434653] font-sans text-sm font-medium transition-all duration-200 peer-checked:bg-[#e7ebff] peer-checked:text-[#094cb2] peer-checked:border-[#094cb2]/50 hover:bg-[#e3e2e3] flex items-center gap-2">
                  <ToolIcon className="w-[18px] h-[18px]" />
                  <span>{tool.label}</span>
                </div>
              </label>
            );
          })}

          {/* Add Custom Tool Input */}
          <div className="relative flex items-center">
            <input 
              type="text"
              placeholder="Tambah alat..."
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomTool(e);
                }
              }}
              className="px-5 py-2.5 w-44 rounded-full bg-[#faf9fa] border border-[#c3c6d5]/30 text-[#1b1c1d] font-sans text-sm focus:outline-none focus:border-[#094cb2] focus:ring-1 focus:ring-[#094cb2] transition-all placeholder:text-[#434653]/50 pr-10"
            />
            <button 
              type="button"
              onClick={handleAddCustomTool}
              className="absolute right-2 p-1 text-[#094cb2] hover:text-[#00419d] transition-colors rounded-full flex items-center justify-center outline-none"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </fieldset>

      {/* Spacer for Sticky Bottom Element */}
      <div className="h-20"></div>

      {/* Sticky Action Button Banner */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-white/80 backdrop-blur-md border-t border-[#c3c6d5]/20 py-4 px-6 shadow-md shadow-gray-200">
        <div className="max-w-3xl mx-auto flex justify-center">
          <button 
            type="submit"
            disabled={loading}
            className="w-full md:w-auto min-w-[280px] bg-gradient-to-r from-[#094cb2] to-[#2259bf] text-white font-headline text-xl font-medium px-8 py-4 rounded-full shadow-[0_8px_32px_-8px_rgba(9,76,178,0.5)] hover:shadow-[0_12px_40px_-8px_rgba(9,76,178,0.6)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed group active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Menyusun Keajaiban...</span>
              </div>
            ) : (
              <>
                <span>Nyalakan Kreativitas!</span>
                <Flame className="w-6 h-6 text-yellow-300 animate-pulse group-hover:scale-110 transition-transform fill-yellow-300" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
