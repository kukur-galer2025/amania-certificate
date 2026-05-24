"use client";

import { useRef, useState } from "react";
import { Download, Loader2, User, Hash, Award } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export default function CertificateView() {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // State Dinamis
  const [participantName, setParticipantName] = useState("Dr. Darwanis, SE, MSi, Ak, CA, Asean CPA");
  const [certNumber, setCertNumber] = useState("ASASI-AMANIA");
  const [role, setRole] = useState("PESERTA"); // State baru untuk Peran

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
    <div className="min-h-screen w-full bg-[#e2e8f0] flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      
      {/* PANEL KENDALI */}
      <div className="w-full max-w-[1000px] bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#4a154b]"></div>
        
        {/* Input Form diubah menjadi 3 kolom */}
        <div className="flex flex-col md:flex-row gap-6 mb-2 pl-4">
          <div className="flex-[2]">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#4a154b] mb-2">
              <User size={16} /> Nama Peserta & Gelar
            </label>
            <input 
              type="text" 
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Masukkan nama lengkap..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a154b]/50 focus:border-[#4a154b] transition-all text-gray-800 font-medium"
            />
          </div>

          <div className="flex-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#4a154b] mb-2">
              <Award size={16} /> Peran
            </label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a154b]/50 focus:border-[#4a154b] transition-all text-gray-800 font-medium cursor-pointer appearance-none"
            >
              <option value="PESERTA">PESERTA</option>
              <option value="PEMBICARA">PEMBICARA</option>
              <option value="PANITIA">PANITIA</option>
            </select>
          </div>

          <div className="flex-[1.5]">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#4a154b] mb-2">
              <Hash size={16} /> Nomor Sertifikat
            </label>
            <input 
              type="text" 
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              placeholder="Contoh: ASASI/WEB/0526/001"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a154b]/50 focus:border-[#4a154b] transition-all text-gray-800 font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100 pr-2">
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading || !participantName.trim()}
            className="flex items-center gap-2 px-8 py-3 bg-[#4a154b] text-[#ffffff] rounded-full font-bold shadow-lg hover:bg-[#310e32] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isDownloading ? "Menyiapkan Dokumen..." : "Unduh Sertifikat HD"}
          </button>
        </div>
      </div>

      {/* WRAPPER SERTIFIKAT */}
      <div className="w-full max-w-[1000px] overflow-x-auto shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex justify-center bg-[#ffffff]">
        
        {/* AREA CANVAS */}
        <div 
          ref={certificateRef}
          className="relative flex-shrink-0 overflow-hidden bg-white mx-auto"
          style={{ width: "1000px", height: "707px" }} 
        >
          {/* BORDER DIPLOMA EKSKLUSIF */}
          <div className="absolute inset-0 p-8 z-10 pointer-events-none">
            <div className="w-full h-full border-[8px] border-[#4a154b] p-1.5 relative">
              <div className="w-full h-full border-[2px] border-[#d4af37] p-1 relative">
                 <div className="w-full h-full border-[1px] border-[#d4af37] relative">
                    <div className="absolute -top-[14px] -left-[14px] w-6 h-6 bg-[#4a154b] border-[2px] border-[#d4af37]"></div>
                    <div className="absolute -top-[14px] -right-[14px] w-6 h-6 bg-[#4a154b] border-[2px] border-[#d4af37]"></div>
                    <div className="absolute -bottom-[14px] -left-[14px] w-6 h-6 bg-[#4a154b] border-[2px] border-[#d4af37]"></div>
                    <div className="absolute -bottom-[14px] -right-[14px] w-6 h-6 bg-[#4a154b] border-[2px] border-[#d4af37]"></div>
                 </div>
              </div>
            </div>
          </div>

          {/* WATERMARK LOGO */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0 gap-8">
             <img src="/asasi.png" alt="Watermark ASASI" className="w-[300px] h-[300px] object-contain grayscale" />
          </div>

          {/* KONTEN UTAMA */}
          <div className="relative z-20 w-full h-full px-28 py-12 flex flex-col justify-between">
            
            {/* Header Instansi dengan 2 Logo */}
            <div className="flex flex-col items-center mt-2">
              <div className="flex justify-center items-center gap-8 mb-2">
                <img src="/asasi.png" alt="Logo ASASI" className="h-12 object-contain drop-shadow-sm" />
                <div className="h-8 w-[2px] bg-[#d4af37]/60 rounded-full"></div>
                <img src="/amania.png" alt="Logo Amania" className="h-12 object-contain drop-shadow-sm" />
              </div>
              
              <h2 className="text-[11px] font-bold text-[#4a154b] tracking-[0.25em] uppercase">
                Akademisi dan Saintis Indonesia (ASASI)
              </h2>
              <div className="h-[2px] w-56 bg-[#d4af37] mt-1.5 mb-1"></div>
            </div>

            {/* Area Judul & Penerima */}
            <div className="text-center mt-1">
              <h1 className="font-serif text-[46px] font-black text-[#4a154b] tracking-widest uppercase mb-1 drop-shadow-sm leading-none">
                Sertifikat
              </h1>
              <p className="text-[14px] tracking-[0.6em] text-[#d4af37] font-bold mb-3">
                PENGHARGAAN
              </p>

              <p className="text-[#4b5563] text-xs mb-1 font-medium uppercase tracking-wider">
                Diberikan Dengan Penuh Rasa Bangga Kepada:
              </p>
              
              {/* PERBAIKAN OVERFLOW NAMA */}
              <div className="flex flex-col items-center justify-center w-full mb-3 mt-1">
                <h2 className="font-serif text-[32px] leading-snug text-[#111827] font-bold text-center w-full max-w-[850px] text-balance">
                  {participantName || "Nama Peserta Kosong"}
                </h2>
                <div className="w-[85%] max-w-[700px] h-[2px] bg-[#4a154b] mt-1.5"></div>
              </div>

              <p className="text-[#4b5563] text-[13px] leading-relaxed max-w-2xl mx-auto mb-1">
                {/* STATE PERAN DITEMPATKAN DI SINI */}
                Atas partisipasi aktif dan dedikasinya sebagai <span className="font-bold text-[#4a154b] uppercase">{role}</span> dalam acara Nasional:
              </p>
              <p className="text-[18px] font-bold text-[#0f5132] mt-0.5 mb-1.5 leading-snug drop-shadow-sm">
                "Kupas Tuntas Perhitungan AK Dosen Terbaru: <br/> Mengacu Permendiktisaintek No. 52 Tahun 2025"
              </p>
              
              <p className="text-[#4b5563] text-[12px] leading-relaxed max-w-3xl mx-auto mb-2">
                Membahas mekanisme perhitungan angka kredit (AK) sesuai Permendiktisaintek No. 52 Tahun 2025, termasuk komponen penilaian tridharma. Insight praktis untuk mengoptimalkan perolehan AK dalam mendukung kenaikan jabatan akademik.
              </p>

              <p className="text-[#6b7280] text-[11px] font-medium italic">
                Diselenggarakan pada Sabtu, 02 Mei 2026.
              </p>
            </div>

            {/* Footer: Nomor Sertifikat & Tanda Tangan */}
            <div className="w-full flex justify-between items-end mt-auto relative">
              
              {/* Kiri: Nomor */}
              <div className="pb-3">
                <p className="text-[12px] text-[#4a154b] font-mono font-bold">
                  No: <span className="text-[#4b5563] font-medium">{certNumber || "____/___/____/___"}</span>
                </p>
              </div>

              {/* Kanan: Area Tanda Tangan Resmi */}
              <div className="flex flex-col items-center w-56 relative">
                <p className="text-[#4a154b] text-[12px] font-bold mb-0">Ketua Umum ASASI</p>
                
                <div className="h-20 w-44 relative flex items-center justify-center my-2 pb-6">
                {/* Cap/Stamp ASASI */}
                <img 
                  src="/capasasi.png" 
                  alt="Cap ASASI" 
                  className="absolute w-24 h-24 object-contain pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0" 
                  style={{ opacity: 0.35 }} 
                />
                {/* Tanda Tangan (Dipertebal maksimal lewat kontras ekstra tinggi dan penyesuaian kecerahan, ditambah shadow) */}
                <img 
                  src="/elfahmi.png" 
                  alt="Tanda Tangan" 
                  className="object-contain max-h-full max-w-full opacity-100 scale-110 relative z-10 filter contrast-200 brightness-75 drop-shadow-[0.5px_0.5px_0px_rgba(0,0,0,0.15)] drop-shadow-md" 
                />
              </div>
                
                <div className="text-center w-full z-10">
                  <p className="font-bold text-[#111827] text-[13px] border-b-[2px] border-[#111827] pb-0.5 w-full inline-block">
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