"use client";

import { useRef, useState } from "react";
import { Download, Loader2, User, Hash, Award } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default function CertificateWebinarAKPremium() {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // State Dinamis
  const [participantName, setParticipantName] = useState("Prima Dzaky, S.Kom., M.Kom.");
  const [certNumber, setCertNumber] = useState("08/ASASI-AK/V/2026");
  const [role, setRole] = useState("PESERTA"); 

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
    <div className="min-h-screen w-full bg-[#f4f6f8] flex flex-col items-center justify-center p-6 font-sans overflow-auto">
      
      {/* PANEL KENDALI (WHITE ELEGANT MODE) */}
      <div className="w-full max-w-[1000px] bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 mb-8 relative overflow-hidden flex-shrink-0">
        {/* Border atas disesuaikan jadi Biru Tua */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#1e3a8a]"></div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-4 pl-2 mt-2">
          <div className="flex-[2]">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              {/* Icon warna ungu */}
              <User size={16} className="text-[#8b5cf6]" /> Nama Peserta & Gelar
            </label>
            <input 
              type="text" 
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              // Focus ring warna ungu
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] transition-all text-slate-900 font-bold"
            />
          </div>

          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              {/* Icon warna ungu */}
              <Award size={16} className="text-[#8b5cf6]" /> Pilih Peran
            </label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              // Focus ring warna ungu
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] cursor-pointer font-black text-[#1e293b] transition-all"
            >
              <option value="PESERTA">PESERTA</option>
              <option value="PEMBICARA">PEMBICARA</option>
              <option value="PANITIA">PANITIA</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              {/* Icon warna ungu */}
              <Hash size={16} className="text-[#8b5cf6]" /> Nomor Seri
            </label>
            <input 
              type="text" 
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              // Focus ring warna ungu
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] font-mono text-sm text-slate-900 font-bold transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-slate-100 pr-2">
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading || !participantName.trim()}
            // Tombol warna biru
            className="flex items-center gap-2.5 px-8 py-3 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-full font-black shadow-lg shadow-blue-200 transition-all duration-300 disabled:opacity-70 transform hover:-translate-y-0.5"
          >
            {isDownloading ? <Loader2 size={19} className="animate-spin" /> : <Download size={19} />}
            {isDownloading ? "Menyusun PDF..." : "Unduh Sertifikat"}
          </button>
        </div>
      </div>

      {/* WRAPPER SERTIFIKAT */}
      <div className="w-full max-w-[1000px] overflow-x-auto shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex justify-center bg-white rounded-sm relative">
        
        {/* AREA CANVAS */}
        <div 
          ref={certificateRef}
          className="relative flex-shrink-0 overflow-hidden bg-[#ffffff] mx-auto"
          style={{ width: "1000px", height: "707px" }} 
        >
          {/* 1. BACKGROUND TEXTURE (SUBTLE BLUE/PURPLE & GRID) */}
          <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Subtle Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px]"></div>
             
             {/* Subtle Blue Glow at Center */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3b82f6] rounded-full opacity-[0.04] blur-[120px]"></div>
          </div>

          {/* 2. BINGKAI KOMPLEKS MULTI-LAYER (BIRU & UNGU) */}
          <div className="absolute inset-0 p-8 z-10 pointer-events-none">
            {/* Outer Thick Border (Biru Tua) */}
            <div className="w-full h-full border-[4px] border-[#1e3a8a] relative p-1.5 opacity-90">
               {/* Inner Thin Border (Ungu) */}
               <div className="w-full h-full border-[1px] border-[#8b5cf6]/50 relative">
                  
                  {/* Corner Ornaments (Top Left) - Ungu */}
                  <div className="absolute -top-[7px] -left-[7px] w-6 h-6 border-t-[4px] border-l-[4px] border-[#8b5cf6]"></div>
                  <div className="absolute -top-[3px] -left-[3px] w-2 h-2 bg-[#1e3a8a]"></div>
                  
                  {/* Corner Ornaments (Top Right) - Ungu */}
                  <div className="absolute -top-[7px] -right-[7px] w-6 h-6 border-t-[4px] border-r-[4px] border-[#8b5cf6]"></div>
                  <div className="absolute -top-[3px] -right-[3px] w-2 h-2 bg-[#1e3a8a]"></div>
                  
                  {/* Corner Ornaments (Bottom Left) - Ungu */}
                  <div className="absolute -bottom-[7px] -left-[7px] w-6 h-6 border-b-[4px] border-l-[4px] border-[#8b5cf6]"></div>
                  <div className="absolute -bottom-[3px] -left-[3px] w-2 h-2 bg-[#1e3a8a]"></div>
                  
                  {/* Corner Ornaments (Bottom Right) - Ungu */}
                  <div className="absolute -bottom-[7px] -right-[7px] w-6 h-6 border-b-[4px] border-r-[4px] border-[#8b5cf6]"></div>
                  <div className="absolute -bottom-[3px] -right-[3px] w-2 h-2 bg-[#1e3a8a]"></div>
               </div>
            </div>
          </div>

          {/* 3. WATERMARK ASASI (Opacity dikurangi agar subtle) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none z-0">
             <img src="/asasi.png" alt="Watermark" className="w-[500px] object-contain grayscale" />
          </div>

          {/* 4. KONTEN UTAMA */}
          <div className="relative z-20 w-full h-full px-20 py-12 flex flex-col justify-between items-center">
            
            {/* Header: Logo Horizontal */}
            <div className="flex flex-col items-center mt-2">
              <div className="flex justify-center items-center gap-10 bg-white shadow-sm py-3 px-12 rounded-xl border border-slate-100">
                <img src="/asasi.png" alt="Logo ASASI" className="h-12 object-contain" />
                <div className="h-10 w-[1px] bg-slate-300"></div>
                <img src="/amania.png" alt="Logo Amania" className="h-10 object-contain" />
              </div>
            </div>

            {/* Area Judul & Penerima */}
            <div className="text-center mt-6 flex flex-col items-center w-full">
              
              {/* Teks warna ungu */}
              <p className="text-[12px] tracking-[0.4em] text-[#8b5cf6] font-extrabold mb-2 uppercase">
                Official Document of Participation
              </p>
              
              {/* Judul warna biru tua */}
              <h1 className="font-serif font-black text-[48px] uppercase tracking-wide mb-6 leading-none text-[#1e3a8a] drop-shadow-sm">
                Sertifikat Penghargaan
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-[1px] bg-slate-200"></div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em]">
                  Diberikan dengan hormat kepada
                </p>
                <div className="w-16 h-[1px] bg-slate-200"></div>
              </div>
              
              {/* NAMA PESERTA */}
              <div className="flex flex-col items-center justify-center w-full mb-6">
                {/* Nama warna biru sangat tua */}
                <h2 className="font-serif text-[42px] leading-tight text-[#111827] font-black text-center w-full max-w-[850px] text-balance tracking-wide">
                  {participantName || "Nama Peserta Kosong"}
                </h2>
                {/* Garis bawah gradient biru-ungu */}
                <div className="w-3/4 h-[2px] bg-gradient-to-r from-transparent via-[#4f46e5] to-transparent mt-2 opacity-30"></div>
              </div>

              {/* BAGIAN PERAN */}
              <div className="flex items-center gap-2 mb-4">
                <p className="text-slate-600 text-[13px] font-medium">
                  Atas dedikasi dan perannya sebagai
                </p>
                
                {/* Teks Peran - Warna Ungu Tua */}
                <span className="font-extrabold uppercase text-[16px] tracking-widest text-[#6d28d9]">
                  {role}
                </span>

                <p className="text-slate-600 text-[13px] font-medium">
                  dalam rangkaian acara Webinar Nasional:
                </p>
              </div>
              
              {/* JUDUL WEBINAR - Biru Tua */}
              <p className="text-[20px] font-black text-[#1e3a8a] mt-0 mb-2 leading-snug tracking-tight max-w-[850px]">
                "Kupas Tuntas Perhitungan AK Dosen: Studi Kasus Kenaikan Jabatan AA ke Lektor Berdasarkan Regulasi Terbaru"
              </p>
              
              {/* SUB-JUDUL KECIL */}
              <p className="text-[11px] font-bold text-slate-500 italic mb-0">
                *Mengacu pada Permendiktisaintek No. 52 Tahun 2025 dan Kepmendiktisaintek No. 39/M/Kep/2026
              </p>
              
            </div>

            {/* 5. FOOTER (INFO & TANDA TANGAN) */}
            <div className="w-full flex justify-between items-end mt-auto relative px-10">
              
              {/* KIRI: INFO SERI & ACARA */}
              <div className="flex flex-col gap-2 pb-1 items-start">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nomor Seri Sertifikat</p>
                  <div className="bg-slate-50 px-5 py-2 rounded-lg border border-slate-200">
                      {/* Teks warna biru */}
                      <p className="text-[#1e3a8a] text-[13px] font-mono font-bold tracking-widest">
                        {certNumber || "NO: .../..."}
                      </p>
                  </div>
                  {/* Bagian tanggal - "Virtual Zoom" DIHAPUS */}
                  <div className="flex items-center gap-3 mt-1.5 bg-white border border-slate-100 p-1.5 px-3 rounded-full shadow-inner">
                      <p className="text-slate-700 text-[11px] font-bold">09 MEI 2026</p>
                      {/* Titik pemisah dan tulisan virtual zoom dihapus di sini */}
                  </div>
              </div>

              {/* KANAN: TANDA TANGAN KETUA ASASI */}
              <div className="flex flex-col items-center w-64 relative text-center">
                  {/* Teks warna biru tua */}
                  <p className="text-[#1e3a8a] text-[12px] font-bold mb-1 uppercase tracking-widest">Ketua Umum ASASI</p>
                  <div className="w-48 h-16 flex items-center justify-center relative my-1 z-10">
                      <img src="/elfahmi.png" alt="Tanda Tangan Elfahmi" className="object-contain w-full h-full absolute" />
                  </div>
                  {/* Garis warna biru */}
                  <div className="w-full border-b border-[#1e3a8a]/30 pb-1">
                    <p className="font-black text-[#1e3a8a] text-[14px]">
                        Prof. Elfahmi, S.Si., M.Si.
                    </p>
                  </div>
              </div>

            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}