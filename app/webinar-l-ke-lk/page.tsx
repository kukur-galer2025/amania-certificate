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
        // Sesuai template: "Nama Lengkap & Gelar", "Peran / Jabatan", "Nomor Sertifikat"
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

      // Looping data satu per satu
      for (let i = 0; i < participants.length; i++) {
        setBulkProgress(`Memproses (${i + 1}/${participants.length}): ${participants[i].name}`);

        // Pindahkan index navigasi aktif agar UI sertifikat me-render data orang tersebut
        setCurrentIndex(i);

        // Beri jeda 350ms agar React selesai merender teks baru ke DOM sebelum di-snapshot
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
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-900 via-emerald-600 to-blue-900"></div>

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
              onClick={() => setCurrentIndex(prev => prev - 1 + 2 - 1)} // Mengamankan increment safely
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

      {/* WRAPPER CANVAS SERTIFIKAT (SAMA SEPERTI SEMULA - MENGIKUTI PREVIEW DATA AKTIF) */}
      <div className="w-full max-w-[1000px] overflow-x-auto shadow-[0_30px_60px_rgba(0,0,0,0.1)] flex justify-center bg-white rounded-sm">
        <div
          ref={certificateRef}
          className="relative flex-shrink-0 overflow-hidden bg-[#fafbfe] mx-auto"
          style={{ width: "1000px", height: "707px" }}
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] bg-emerald-600 rounded-full opacity-[0.06] blur-[120px]"></div>
            <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-blue-900 rounded-full opacity-[0.03] blur-[100px]"></div>
          </div>

          <div className="absolute top-0 right-0 w-[280px] h-[140px] bg-blue-950 z-10" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}></div>
          <div className="absolute bottom-0 left-0 w-2.5 h-[300px] bg-emerald-500 z-10"></div>

          <div className="absolute inset-0 z-10 p-10 pointer-events-none">
            <div className="w-full h-full border-4 border-blue-950"></div>
          </div>

          <div className="absolute top-6 right-8 z-20 text-right text-white">
            <p className="text-[7px] text-slate-300 font-black uppercase tracking-widest mb-0.5">Registry No.</p>
            <p className="font-mono font-bold text-[11px] tracking-wide text-emerald-400">{currentParticipant.number || "00/XYZ/2026"}</p>
          </div>

          <div className="relative z-20 w-full h-full p-16 flex flex-col justify-between">
            <div className="w-full flex gap-12 mt-10 items-start">
              <div className="w-[180px] flex items-center gap-4 border-r border-slate-200/80 pr-8 flex-shrink-0">
                <img src="/asasi.png" alt="Logo ASASI" className="h-9 object-contain object-left" />
                <div className="w-[1px] h-6 bg-emerald-500 flex-shrink-0"></div>
                <img src="/amania.png" alt="Logo Amania" className="h-6 object-contain object-left" />
              </div>

              <div className="flex-grow flex flex-col items-start text-left">
                <span className="text-[10px] font-black tracking-[0.35em] text-emerald-600 uppercase mb-2">Honorary Certificate of Recognition</span>
                <h1 className="font-sans font-black text-[46px] leading-[1.05] text-blue-950 tracking-wide uppercase mb-6">Sertifikat Penghargaan</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Diberikan Secara Khusus Kepada:</p>
                <div className="w-full max-w-[560px] mb-4">
                  <h2 className="font-sans font-black text-[34px] text-slate-900 tracking-wide leading-tight break-words">{currentParticipant.name || "Nama Peserta Kosong"}</h2>
                  <div className="w-1/4 h-1 bg-gradient-to-r from-emerald-500 to-transparent mt-2"></div>
                </div>
                <div className="w-full max-w-[560px]">
                  <p className="text-slate-600 text-[13px] font-medium leading-relaxed">Atas partisipasi aktif, sumbangsih, serta perannya sebagai <span className="font-black text-blue-950 tracking-wider uppercase underline decoration-emerald-500 decoration-2">{currentParticipant.role}</span> pada gelaran Webinar Nasional:</p>
                  <p className="text-[16px] font-sans font-black text-blue-950 tracking-wide leading-snug mt-2.5">&ldquo;Kupas Tuntas Perhitungan AK Dosen: Studi Kasus Kenaikan Jabatan L ke LK Berdasarkan Regulasi Terbaru&rdquo;</p>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-between items-end border-t border-slate-100 pt-6 px-2 pb-2">
              <div className="text-left w-[240px]">
                <div className="w-40 h-12 flex items-center justify-start relative my-1">
                  <img src="/elfahmi.png" alt="Tanda Tangan" className="object-contain w-full h-full absolute scale-125 origin-left" />
                </div>
                <p className="font-sans font-black text-base text-blue-950 tracking-wide leading-tight mt-1">Prof. Elfahmi, S.Si., M.Si.</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Ketua Umum ASASI</p>
              </div>
              <div className="text-right w-[240px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal Webinar</p>
                <p className="text-emerald-600 font-sans font-black text-sm tracking-wide">16 MEI 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}