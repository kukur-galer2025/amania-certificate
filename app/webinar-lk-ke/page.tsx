"use client";

import { useRef, useState } from "react";
import { Download, Loader2, User, Hash, Award, FileSpreadsheet, Files, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ParticipantData {
  name: string;
  role: string;
  number: string;
}

export default function CertificateWebinarAKPremium() {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");

  // State untuk menampung daftar peserta hasil import Excel
  const [participants, setParticipants] = useState<ParticipantData[]>([
    { name: "Prima Dzaky, S.Kom., M.Kom.", role: "PESERTA", number: "08/ASASI-AK/V/2026" }
  ]);
  
  // State Navigasi untuk melihat pratinjau (preview) data yang sedang aktif di sertifikat
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ambil data aktif berdasarkan index navigasi
  const currentParticipant = participants[currentIndex] || { name: "", role: "PESERTA", number: "" };

  // --- FUNGSI UPDATE DATA MANUAL ---
  const updateCurrentParticipant = (field: keyof ParticipantData, value: string) => {
    const updated = [...participants];
    if (updated[currentIndex]) {
      updated[currentIndex][field] = value;
      setParticipants(updated);
    }
  };

  // --- FUNGSI 1: IMPORT EXCEL TO JSON ---
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        
        // Ambil isi dari sheet pertama
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Konversi baris tabel Excel menjadi Array of Object JSON
        const rawData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (rawData.length === 0) {
          alert("File Excel kosong atau format tidak sesuai!");
          return;
        }

        // Petakan kolom Excel ke properti state aplikasi
        const formattedData: ParticipantData[] = rawData.map((row) => ({
          name: row["Nama Lengkap & Gelar"] || row["Nama"] || "Tanpa Nama",
          role: (row["Peran / Jabatan"] || row["Peran"] || "PESERTA").toUpperCase().trim(),
          number: row["Nomor Sertifikat"] || row["Nomor"] || "00/XYZ/2026",
        }));

        setParticipants(formattedData);
        setCurrentIndex(0); // Reset pratinjau ke data pertama
        alert(`Berhasil mengimpor ${formattedData.length} data peserta!`);
      } catch (err) {
        console.error(err);
        alert("Gagal membaca file Excel. Pastikan format kolom sesuai template.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- FUNGSI 2: EXPORT TO EXCEL TEMPLATE ---
  const handleExportTemplate = () => {
    const templateData = [
      { "Nama Lengkap & Gelar": "Contoh Nama, S.T., M.T.", "Peran / Jabatan": "PESERTA", "Nomor Sertifikat": "01/ASASI-AK/V/2026" },
      { "Nama Lengkap & Gelar": "Prof. Budi Utomo", "Peran / Jabatan": "PEMBICARA", "Nomor Sertifikat": "02/ASASI-AK/V/2026" }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Template_Sertifikat.xlsx");
  };

  // --- FUNGSI 3: DOWNLOAD SINGLE PDF ---
  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      setIsDownloading(true);
      const imgData = await toPng(certificateRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
      pdf.save(`Sertifikat_${currentParticipant.role}_${currentParticipant.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Gagal mengunduh sertifikat.");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- FUNGSI 4: BULK DOWNLOAD ZIP MASSAL ---
  const handleBulkDownloadZIP = async () => {
    if (!certificateRef.current || participants.length === 0) return;

    try {
      setIsDownloading(true);
      const zip = new JSZip();

      for (let i = 0; i < participants.length; i++) {
        setBulkProgress(`Memproses (${i + 1}/${participants.length}): ${participants[i].name}`);

        setCurrentIndex(i);

        // Jeda untuk render DOM ulang secara asinkronus sebelum snapshot
        await new Promise((resolve) => setTimeout(resolve, 350));

        const imgData = await toPng(certificateRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
        const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
        
        const pdfBlob = pdf.output("blob");
        const safeName = participants[i].name.replace(/[^a-zA-Z0-9]/g, "_");
        zip.file(`Sertifikat_${participants[i].role}_${safeName}.pdf`, pdfBlob);
      }

      setBulkProgress("Mengompres file menjadi ZIP...");
      const zipContent = await zip.generateAsync({ type: "blob" });
      saveAs(zipContent, "Bundel_Sertifikat_Massal.zip");

    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mencetak massal.");
    } finally {
      setIsDownloading(false);
      setBulkProgress("");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-center p-6 font-sans overflow-auto">

      {/* PANEL UTAMA KENDALI */}
      <div className="w-full max-w-[1000px] bg-white p-6 rounded-3xl shadow-xl border border-slate-200 mb-8 relative flex-shrink-0">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-900 via-amber-500 to-blue-900"></div>

        {/* BARIS ATAS: IMPORT EXCEL */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 mt-2">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Fitur Impor Data Massal</h3>
            <p className="text-xs text-slate-500">Unduh template, isi data, lalu upload kembali ke sini.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleExportTemplate}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
            >
              <FileSpreadsheet size={14} /> Download Template
            </button>
            <label className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm">
              <Upload size={14} /> Upload Excel
              <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
            </label>
          </div>
        </div>

        {/* BARIS TENGAH: FORM INPUT EDIT & NAVIGASI PREVIEW */}
        <div className="flex flex-col md:flex-row gap-6 mb-4">
          <div className="flex-[2]">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
              <User size={14} className="text-blue-900" /> Nama Peserta & Gelar
            </label>
            <input
              type="text"
              value={currentParticipant.name}
              onChange={(e) => updateCurrentParticipant("name", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold text-slate-800"
              disabled={participants.length === 0}
            />
          </div>

          <div className="flex-1">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
              <Award size={14} className="text-blue-900" /> Pilih Peran
            </label>
            <select
              value={currentParticipant.role}
              onChange={(e) => updateCurrentParticipant("role", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer font-bold text-slate-800"
              disabled={participants.length === 0}
            >
              <option value="PESERTA">PESERTA</option>
              <option value="PEMBICARA">PEMBICARA</option>
              <option value="PANITIA">PANITIA</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
              <Hash size={14} className="text-blue-900" /> Nomor Seri
            </label>
            <input
              type="text"
              value={currentParticipant.number}
              onChange={(e) => updateCurrentParticipant("number", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-900 font-bold"
              disabled={participants.length === 0}
            />
          </div>
        </div>

        {/* KENDALI NAVIGASI DATA */}
        {participants.length > 1 && (
          <div className="flex items-center justify-center gap-4 bg-slate-50 py-2 rounded-xl mb-4 border border-slate-100">
            <button 
              disabled={currentIndex === 0 || isDownloading} 
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="p-1 text-slate-600 hover:text-blue-900 disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-bold text-slate-700">
              Data Ke: {currentIndex + 1} dari {participants.length} Peserta
            </span>
            <button 
              disabled={currentIndex === participants.length - 1 || isDownloading} 
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="p-1 text-slate-600 hover:text-blue-900 disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* PROGRESS BOX */}
        {bulkProgress && (
          <div className="mb-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-900 animate-pulse">
            {bulkProgress}
          </div>
        )}

        {/* BARIS BAWAH: TOMBOL DOWNLOAD */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 gap-3">
          <button
            onClick={handleBulkDownloadZIP}
            disabled={isDownloading || participants.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            <Files size={16} /> Download Semua ({participants.length} ZIP)
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || !currentParticipant.name.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-[#001f3f] hover:bg-blue-950 text-white rounded-full font-black shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isDownloading && !bulkProgress ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isDownloading && !bulkProgress ? "Menyusun..." : "Download Preview PDF"}
          </button>
        </div>
      </div>

      {/* WRAPPER CANVAS SERTIFIKAT */}
      <div className="w-full max-w-[1000px] overflow-x-auto shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex justify-center bg-white rounded-sm">
        <div
          ref={certificateRef}
          className="relative flex-shrink-0 overflow-hidden bg-[#fafafa] mx-auto flex flex-col items-center justify-between p-12 select-none"
          style={{ width: "1000px", height: "707px" }}
        >
          {/* Efek Tekstur Halus Background (Dot Pattern) */}
          <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Efek Gradasi Gradual Pusat Cerah (Background Effect) */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_65%)]"></div>

          {/* EFEK BINGKAI GARIS GANDA PREMIUM */}
          <div className="absolute inset-6 z-10 pointer-events-none border border-[#d4af37]/30 rounded-xs"></div>
          <div className="absolute inset-[28px] z-10 pointer-events-none border-2 border-[#d4af37]/15 rounded-xs"></div>

          {/* ORNAMEN SUDUT */}
          <div className="absolute top-0 left-0 w-[420px] h-[300px] z-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0H410 C340 70, 260 190, 0 160 V0Z" fill="#d4af37" />
              <path d="M0 0H380 C310 60, 230 170, 0 140 V0Z" fill="#001f3f" />
              <path d="M120 0C180 30, 250 80, 290 120" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.3"/>
            </svg>
          </div>

          <div className="absolute bottom-0 right-0 w-[420px] h-[300px] z-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M420 300H10 C80 230, 160 110, 420 140 V300Z" fill="#d4af37" />
              <path d="M420 300H40 C110 240, 190 130, 420 160 V300Z" fill="#001f3f" />
              <path d="M300 300C240 270, 170 220, 130 180" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.3"/>
            </svg>
          </div>

          {/* LOGO BLOCK */}
          <div className="absolute top-10 right-10 z-20 pointer-events-none">
            <div className="flex items-center gap-4 flex-shrink-0 bg-white/40 p-2 rounded-xl backdrop-blur-sm">
                <img src="/asasi.png" alt="Logo ASASI" className="h-9 object-contain object-left" />
                <div className="w-[1px] h-6 bg-emerald-500 flex-shrink-0"></div>
                <img src="/amania.png" alt="Logo Amania" className="h-6 object-contain object-left" />
            </div>
          </div>

          {/* KONTEN TENGAH */}
          <div className="relative z-20 w-full h-full flex flex-col justify-between items-center py-6 text-center">
            
            <div className="flex flex-col items-center mt-12">
              <h1 className="text-[#001f3f] font-sans tracking-[0.25em] text-[46px] font-bold uppercase leading-none">
                Sertifikat
              </h1>
              <h2 className="text-[#001f3f] font-sans tracking-[0.35em] text-[18px] font-medium uppercase mt-2">
                Penghargaan
              </h2>
            </div>

            <div className="w-full flex flex-col items-center my-4">
              <p className="font-serif italic text-slate-500 text-[15px] mb-4">
                Diberikan kepada:
              </p>
              <h3 className="font-serif italic text-[42px] text-[#001f3f] px-12 font-medium leading-snug tracking-wide max-w-[800px] min-h-[64px] flex items-center justify-center">
                {currentParticipant.name || "Nama Lengkap Peserta"}
              </h3>
              <div className="w-[500px] h-[1px] bg-slate-300 mt-4"></div>
            </div>

            <div className="max-w-[760px] text-slate-700 text-[13px] leading-relaxed px-4 flex flex-col items-center gap-1.5">
              <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                No: {currentParticipant.number || "00/XYZ/2026"}
              </p>
              <p>
                Telah menjadi <span className="font-bold text-[#001f3f] tracking-wide uppercase underline decoration-amber-500 decoration-2 underline-offset-4">{currentParticipant.role}</span> dalam acara Nasional:
              </p>
              <p className="font-sans font-black text-[#001f3f] text-[15px] max-w-[700px] my-1 leading-snug">
                &ldquo;Kupas Tuntas Perhitungan AK Dosen: Studi Kasus Kenaikan Jabatan LK ke Guru Besar Berdasarkan Regulasi Terbaru&rdquo;
              </p>
              <p>
                yang diselenggarakan pada tanggal <span className="font-bold text-amber-600">23 Mei 2026</span>
              </p>
            </div>

            {/* Bagian Tanda Tangan Tunggal Terpusat */}
            <div className="flex flex-col items-center mt-4 mb-2">
              <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Ketua Umum ASASI</p>
              
              {/* Container Tanda Tangan (Ditambah tinggi ke h-20 & padding pb-6 agar berjarak aman dari garis) */}
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
              
              <div className="w-52 h-[1px] bg-slate-400 my-1"></div>
              
              <p className="text-[13px] font-bold text-[#001f3f] tracking-wide">
                Prof. Elfahmi, S.Si., M.Si.
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}