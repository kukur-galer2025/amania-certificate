"use client";

import { useRef, useState } from "react";
import { Download, Loader2, User, Hash, Award } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default function CertificateGeneratorIndoCEISS() {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // State Dinamis
  const [participantName, setParticipantName] = useState("Prima Dzaky, S.Kom., M.Kom.");
  const [certNumber, setCertNumber] = useState("No: 05/INDO-WEB/V/2026");
  const [role, setRole] = useState("NARASUMBER");

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    try {
      setIsDownloading(true);
      const element = certificateRef.current;

      const imgData = await toPng(element, {
        pixelRatio: 3, 
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)', 
          transformOrigin: 'top left'
        }
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const safeFileName = participantName.replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`Sertifikat_${role}_${safeFileName}.pdf`);
      
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert("Terjadi kesalahan saat mengunduh sertifikat.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f1f5f9] flex flex-col items-center justify-center p-6 font-sans overflow-auto">
      
      {/* PANEL KENDALI */}
      <div className="w-full max-w-[1000px] bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-6 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-teal-500 to-purple-600"></div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-4 pl-2 mt-2">
          <div className="flex-[2]">
            <label className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-2">
              <User size={16} /> Nama Peserta & Gelar
            </label>
            <input 
              type="text" 
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-2">
              <Award size={16} /> Pilih Peran
            </label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer font-medium text-gray-800"
            >
              <option value="PESERTA">PESERTA</option>
              <option value="NARASUMBER">NARASUMBER</option>
              <option value="MODERATOR">MODERATOR</option>
              <option value="PANITIA">PANITIA</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-2">
              <Hash size={16} /> Nomor Sertifikat
            </label>
            <input 
              type="text" 
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100 pr-2">
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading || !participantName.trim()}
            className="flex items-center gap-2.5 px-8 py-3 bg-gradient-to-r from-orange-500 to-teal-600 text-white rounded-full font-extrabold shadow-lg hover:shadow-orange-200 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {isDownloading ? <Loader2 size={19} className="animate-spin" /> : <Download size={19} />}
            {isDownloading ? "Memproses PDF..." : "Unduh Sertifikat HD (A4)"}
          </button>
        </div>
      </div>

      {/* CANVAS SERTIFIKAT */}
      <div className="w-full max-w-[1000px] overflow-x-auto shadow-2xl flex justify-center bg-white rounded-3xl p-1 relative border-4 border-white">
        
        <div 
          ref={certificateRef}
          className="relative flex-shrink-0 overflow-hidden bg-white mx-auto rounded-3xl"
          style={{ width: "1000px", height: "707px" }} 
        >
          {/* ORNAMEN BACKGROUND */}
          <div className="absolute inset-0 z-0">
             <div className="absolute -top-32 -left-32 w-80 h-80 bg-teal-500 rounded-full opacity-10 filter blur-3xl"></div>
             <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-orange-400 rounded-full opacity-10 filter blur-3xl"></div>
             
             {/* PENGGANTI tech-grid.png MENGGUNAKAN CSS GRID (GRATIS & NO ASSET) */}
             <div 
                className="absolute inset-0 opacity-[0.06]" 
                style={{ 
                    backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
             ></div>
          </div>

          {/* FRAME SUDUT */}
          <div className="absolute inset-0 p-10 z-10 pointer-events-none">
            <div className="w-full h-full border border-gray-100 rounded-2xl p-2 relative">
                <div className="absolute -top-1 -left-1 w-12 h-12 border-l-4 border-t-4 border-purple-700 rounded-tl-xl"></div>
                <div className="absolute -top-1 -right-1 w-12 h-12 border-r-4 border-t-4 border-orange-500 rounded-tr-xl"></div>
                <div className="absolute -bottom-1 -left-1 w-12 h-12 border-l-4 border-b-4 border-orange-500 rounded-bl-xl"></div>
                <div className="absolute -bottom-1 -right-1 w-12 h-12 border-r-4 border-b-4 border-purple-700 rounded-br-xl"></div>
            </div>
          </div>

          {/* WATERMARK */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
             <img src="/indoceiss-logo.png" alt="Watermark" className="w-[350px] object-contain grayscale" />
          </div>

          {/* KONTEN UTAMA */}
          <div className="relative z-20 w-full h-full px-24 py-12 flex flex-col justify-between items-center">
            
            <div className="flex justify-center items-center gap-10 mt-3">
              <img src="/indoceiss-logo.png" alt="Logo IndoCEISS" className="h-16 object-contain" />
              <div className="h-10 w-[2px] bg-gray-300 rounded-full"></div>
              <img src="/amania.png" alt="Logo Amania" className="h-14 object-contain" />
            </div>

            <div className="text-center mt-6 flex flex-col items-center w-full">
              <h1 className="font-extrabold text-[42px] uppercase text-purple-950 tracking-tight mb-0.5 leading-none">
                Sertifikat Penghargaan
              </h1>
              <p className="text-[13px] tracking-[0.5em] text-orange-600 font-extrabold mb-6 uppercase">
                CERTIFICATE OF APPRECIATION
              </p>

              <div className="bg-slate-50 px-6 py-1.5 rounded-full border border-slate-200 mb-6 shadow-sm">
                <p className="text-slate-700 text-[13px] font-mono font-bold tracking-widest uppercase">
                  {certNumber}
                </p>
              </div>

              <p className="text-gray-500 text-[11px] mb-1 font-medium uppercase tracking-wider">
                Diberikan dengan penuh rasa bangga kepada:
              </p>
              
              <div className="flex flex-col items-center justify-center w-full mb-8">
                <h2 className="font-serif text-[34px] leading-snug text-gray-900 font-bold text-center w-full max-w-[850px] text-balance">
                  {participantName}
                </h2>
                <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent mt-2"></div>
              </div>

              <p className="text-teal-900 text-[13px] leading-relaxed max-w-2xl mx-auto mb-2 font-semibold">
                Atas dedikasi, partisipasi aktif, dan kontribusinya sebagai <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-bold uppercase text-[12px]">{role}</span> dalam Webinar Nasional:
              </p>
              
              <p className="text-[18px] font-extrabold text-purple-900 mt-0.5 mb-2.5 leading-snug uppercase tracking-tight max-w-[800px]">
                "WEBINAR INDOCEISS: KOLABORASI RISET MENUJU RISET UNGGUL BERDAMPAK"
              </p>
              
              <div className="flex items-center gap-3 bg-slate-50 px-5 py-1.5 rounded-full border border-slate-100">
                  <p className="text-slate-600 text-[11px] font-medium uppercase tracking-wide">Sabtu, 09 Mei 2026</p>
                  <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                  <p className="text-teal-800 text-[11px] font-semibold uppercase tracking-wide">Live Zoom Meeting</p>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="w-full flex justify-between items-end mt-auto relative px-10">
              
              {/* Kiri: Ketua Panitia (GRADASI + TTD, TANPA CAP) */}
              <div className="flex flex-col items-center w-64 relative text-center z-10">
                    <p className="text-[#0f172a] text-[12px] font-bold mb-1">Ketua Panitia,</p>
                    <div className="w-52 h-24 flex items-center justify-center relative my-0">
                        {/* Gradasi Merah-Ungu Dipertajam */}
                        <div className="absolute -inset-8 bg-gradient-to-tr from-red-300 via-white to-purple-300 rounded-full filter blur-xl opacity-60 z-0"></div>
                        <img src="/kusrini.png" alt="TTD Kusrini" className="object-contain w-full h-full absolute z-10 mix-blend-multiply" />
                    </div>
                    <p className="font-extrabold text-[#0f172a] text-[13px] border-b-2 border-[#0f172a] pb-0.5 w-full inline-block relative mt-1">
                        Prof. Dr. Kusrini, M.Kom.
                    </p>
              </div>

              {/* Kanan: Ketua Umum (GRADASI + TTD + CAP POSISI TEGAK) */}
              <div className="flex flex-col items-center w-64 relative text-center z-10">
                    <p className="text-[#0f172a] text-[12px] font-bold mb-1">Ketua Umum IndoCEISS,</p>
                    <div className="w-52 h-24 flex items-center justify-center relative my-0">
                        {/* Gradasi Merah-Ungu Dipertajam */}
                        <div className="absolute -inset-8 bg-gradient-to-tr from-red-300 via-white to-purple-300 rounded-full filter blur-xl opacity-60 z-0"></div>
                        
                        {/* 1. TANDA TANGAN (z-10) */}
                        <img src="/hartati.png" alt="TTD Hartati" className="object-contain w-full h-full absolute z-10 mix-blend-multiply" />
                        
                        {/* 2. CAP (z-20, Diatas TTD, Tegak -rotate-3) */}
                        <img 
                          src="/capindo.png" 
                          alt="Cap" 
                          className="absolute w-28 h-28 object-contain opacity-100 z-20 transform -rotate-3 mix-blend-multiply" 
                        />
                    </div>
                    <p className="font-extrabold text-[#0f172a] text-[13px] border-b-2 border-[#0f172a] pb-0.5 w-full inline-block relative mt-1 z-30">
                        Prof. Dra. Sri Hartati, M.Sc., Ph.D.
                    </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}