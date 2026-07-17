"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// QUTU Geometrik Kutu Temalı SVG Damga Şablonları
const STAMPS = {
  classic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="38" fill="rgba(20, 20, 20, 0.9)" stroke="#faff69" stroke-width="4.5"/>
    <path d="M50 30 L70 40 L70 60 L50 70 L30 60 L30 40 Z" stroke="#faff69" stroke-width="3.5" stroke-linejoin="round" fill="none" />
    <path d="M50 30 L50 70" stroke="#faff69" stroke-width="3.5" />
    <path d="M30 40 L50 50 L70 40" stroke="#faff69" stroke-width="3.5" stroke-linejoin="round" />
  </svg>`,
  retro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <path id="retro-text-path-d" d="M 22 50 A 28 28 0 1 1 78 50 A 28 28 0 1 1 22 50"/>
    </defs>
    <circle cx="50" cy="50" r="48" fill="rgba(20, 20, 20, 0.9)" stroke="#faff69" stroke-width="3" stroke-dasharray="3 3"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#a0a0a0" stroke-width="1.5"/>
    <text font-family="system-ui, sans-serif" font-size="7.5" font-weight="800" fill="#ffffff" letter-spacing="1">
      <textPath href="#retro-text-path-d" startOffset="50%" text-anchor="middle">QUTU PHOTO KIOSK • EST. 2026 •</textPath>
    </text>
    <path d="M50 42 L60 47 L60 57 L50 62 L40 57 L40 47 Z" stroke="#faff69" stroke-width="2.5" stroke-linejoin="round" fill="none" />
    <path d="M50 42 L50 62" stroke="#faff69" stroke-width="2.5" />
    <path d="M40 47 L50 52 L60 47" stroke="#faff69" stroke-width="2.5" stroke-linejoin="round" />
  </svg>`,
  tech: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="10" y="10" width="80" height="80" rx="4" fill="rgba(20, 20, 20, 0.95)" stroke="#4f5100" stroke-width="2.5" />
    <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(65, 65, 65, 0.6)" stroke-width="1"/>
    <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(65, 65, 65, 0.6)" stroke-width="1"/>
    <text x="50" y="44" font-family="monospace" font-size="9" font-weight="900" fill="#faff69" text-anchor="middle" letter-spacing="0.5">QUTU</text>
    <text x="50" y="58" font-family="monospace" font-size="9" font-weight="900" fill="#faff69" text-anchor="middle" letter-spacing="0.5">TECH LAB</text>
  </svg>`
};

interface PolaroidPhoto {
  id: string;
  url: string;
  timestamp: string;
  stampLabel: string;
  rotation: number;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [liveTime, setLiveTime] = useState("");
  
  // Seçilen Kiosk Ayarları
  const [watermarkStamp, setWatermarkStamp] = useState<"classic" | "retro" | "tech" | "none">("classic");
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  
  // Flaş Efekti
  const [flashActive, setFlashActive] = useState(false);
  
  // Polaroid Fotoğraf Listesi (Tanıtım Amaçlı)
  const [photos, setPhotos] = useState<PolaroidPhoto[]>([]);

  // DOM Referansları
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tarih ve saat güncelleyici
  useEffect(() => {
    setMounted(true);
    
    // Varsayılan QUTU polaroid fotoğraflarını yükle
    setPhotos([
      {
        id: "demo-2",
        url: "/demo_polaroid_2.png",
        timestamp: "12:44:02",
        stampLabel: "Retro Qutu Baskı",
        rotation: -2.4,
      },
      {
        id: "demo-1",
        url: "/demo_polaroid_1.png",
        timestamp: "12:41:15",
        stampLabel: "Klasik Qutu Baskı",
        rotation: 1.8,
      }
    ]);

    const updateClock = () => {
      const today = new Date();
      setLiveTime(today.toLocaleDateString("tr-TR", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Retro Deklanşör Sesi Sentezleyici
  const playShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = audioCtx.sampleRate * 0.08;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1200;
      
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (e) {
      console.warn("Audio synthesis failed:", e);
    }
  };

  // Ayarlanmış resmi polaroid formatında renderlayıp indir
  const handleDownloadPolaroid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flaş efekti ve deklanşör sesi ile çıktıyı simüle et
    setFlashActive(true);
    playShutterSound();
    
    setTimeout(() => {
      setFlashActive(false);
    }, 200);

    // Canvas boyutlarını polaroid baskı boyutlarına ayarla (örn: 600x720)
    // 600x600 üst resim alanı, altta 120px polaroid etiket alanı
    canvas.width = 600;
    canvas.height = 720;
    
    ctx.fillStyle = "#f3f4f6"; // Polaroid kart rengi (kırık beyaz)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fotoğraf alanı sınırları
    const imgX = 30;
    const imgY = 30;
    const imgW = 540;
    const imgH = 540;

    // Görüntü filtrelerini uygula
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, imgX, imgY, imgW, imgH);
      
      // Filtreyi temizle
      ctx.filter = "none";

      // Filigran Damgayı Çiz
      if (watermarkStamp !== "none") {
        const svgText = STAMPS[watermarkStamp];
        const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
        const blobURL = URL.createObjectURL(svgBlob);
        
        const stampImg = new window.Image();
        stampImg.onload = () => {
          const stampSize = 75;
          const x = imgX + imgW - stampSize - 15;
          const y = imgY + imgH - stampSize - 15;
          
          ctx.drawImage(stampImg, x, y, stampSize, stampSize);
          drawPolaroidTextAndDownload(canvas, ctx, blobURL);
        };
        stampImg.onerror = () => {
          drawPolaroidTextAndDownload(canvas, ctx, blobURL);
        };
        stampImg.src = blobURL;
      } else {
        drawPolaroidTextAndDownload(canvas, ctx, null);
      }
    };
    img.src = "/showcase_portrait.png";
  };

  const drawPolaroidTextAndDownload = (
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    blobURL: string | null
  ) => {
    // Polaroid altındaki el yazısı tarzı etiketler
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "left";
    
    const label = watermarkStamp === "classic" ? "Qutu Klasik Baskı"
                : watermarkStamp === "retro" ? "Qutu Retro Baskı"
                : watermarkStamp === "tech" ? "Qutu Tekno Baskı"
                : "Qutu Temiz Baskı";

    ctx.fillText(label, 40, 620);
    
    // Sağ alta saat ekle
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px monospace";
    ctx.textAlign = "right";
    const nowStr = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    ctx.fillText(`Saat: ${nowStr} • 2026`, canvas.width - 40, 620);

    // Polaroid'u indir
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qutu-baski-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Geçici Blob URL'sini temizle
    if (blobURL) {
      URL.revokeObjectURL(blobURL);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-[#ffffff] font-sans antialiased selection:bg-[#faff69] selection:text-black">
      {/* 1. Navigasyon Başlığı */}
      <header className="w-full border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* QUTU İzometrik Kutu Logosu */}
            <svg className="w-9 h-9 text-[#faff69] filter drop-shadow-[0_0_8px_rgba(250,255,105,0.4)] animate-logo-pulse" viewBox="0 0 100 100" fill="none">
              <path d="M50 15 L85 33 L85 67 L50 85 L15 67 L15 33 Z" stroke="#faff69" strokeWidth="6" strokeLinejoin="round" />
              <path d="M50 15 L50 85" stroke="#faff69" strokeWidth="6" />
              <path d="M15 33 L50 51 L85 33" stroke="#faff69" strokeWidth="6" strokeLinejoin="round" />
            </svg>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight uppercase leading-none">
                QUTU <span className="text-[#faff69] text-shadow-[0_0_12px_rgba(250,255,105,0.25)]">PHOTOBOOTH</span>
              </span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1 leading-none">
                Self-Servis Fotoğraf Kabini // Tasarım Sistemi
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            {mounted && liveTime && (
              <div className="hidden sm:flex items-center gap-2 bg-[#121212] px-3.5 py-1.5 rounded border border-white/5 font-mono text-xs text-zinc-400 font-medium tracking-tight">
                <span className="w-1.5 h-1.5 bg-[#faff69] rounded-full animate-ping"></span>
                <span>{liveTime}</span>
              </div>
            )}
            <a 
              href="#live-kiosk" 
              className="text-xs bg-[#faff69] text-black font-extrabold uppercase px-4 py-2 rounded tracking-wide hover:bg-[#ebf058] transition-colors"
            >
              SİMÜLATÖRÜ DENE
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Tanıtım Bölümü */}
      <section className="relative overflow-hidden w-full px-6 py-20 lg:py-28 border-b border-white/5 bg-radial-[circle_at_top] from-zinc-900/40 to-transparent">
        {/* Arka Plan Kılavuz Çizgileri */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#faff69] opacity-5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-[#faff69] font-semibold uppercase tracking-wider mb-6">
            <span>⚡️ DİJİTAL SİMÜLASYON KABİNİ</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-6">
            ANIN ENERJİSİNİ SAF <br />
            <span className="text-[#faff69] filter drop-shadow-[0_0_15px_rgba(250,255,105,0.2)]">QUTU ESTETİĞİYLE</span> YAKALAYIN
          </h1>
          
          <p className="max-w-2xl text-base sm:text-lg text-zinc-400 font-medium leading-relaxed mb-10">
            Etkinlikleriniz için tasarlanmış, minimalist ve yüksek kontrastlı Qutu tasarım diline sahip profesyonel self-servis fotoğraf kabini. İstediğiniz filigranı seçin, ışık ayarlarını yapın ve anında polaroid çıktısı alın.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-sm sm:max-w-none">
            <a 
              href="#live-kiosk" 
              className="flex items-center justify-center gap-2 bg-[#faff69] text-black font-extrabold text-sm uppercase px-8 py-4 rounded shadow-[0_4px_20px_rgba(250,255,105,0.2)] hover:bg-[#ebf058] transition-all hover:-translate-y-0.5"
            >
              SİMÜLATÖRÜ BAŞLAT
            </a>
            <a 
              href="#features" 
              className="flex items-center justify-center gap-2 bg-transparent text-white border border-white/20 font-bold text-sm uppercase px-8 py-4 rounded hover:bg-white/5 transition-all hover:border-white/40"
            >
              TEKNİK ÖZELLİKLER
            </a>
          </div>
        </div>
      </section>

      {/* 3. Etkileşimli Kabin Arayüz Simülatörü Bölümü */}
      <section id="live-kiosk" className="w-full px-6 py-20 max-w-7xl mx-auto">
        <div className="flex flex-col mb-12">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2 h-2 bg-[#faff69] rounded-full animate-pulse"></span>
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#faff69]">ETKİLEŞİMLİ SİMÜLATÖR</h2>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight">Kabin Çalışma Alanı</h3>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">Aydınlatma filtrelerini ayarlayın, filigran yerleşimini seçin ve polaroid baskısını doğrudan bilgisayarınıza indirin.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* SOL: Simüle Canlı Önizleme Alanı */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative aspect-[4/3] bg-[#0c0c0d] border border-white/10 rounded overflow-hidden flex items-center justify-center group shadow-2xl">
              {/* Scanline Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.3)_50%,rgba(0,0,0,0.3))] bg-[size:100%_4px] pointer-events-none z-10 opacity-30"></div>

              {/* Deklanşör Flaş Efekt Katmanı */}
              <div className={`absolute inset-0 bg-white z-30 transition-opacity duration-350 pointer-events-none ${flashActive ? "opacity-100" : "opacity-0"}`} />

              {/* Simüle Önizleme Portresi */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/showcase_portrait.png"
                alt="Simüle Önizleme"
                className="w-full h-full object-cover transition-all duration-75 select-none"
                style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                draggable="false"
              />

              {/* Filigran damga canlı önizlemesi */}
              {watermarkStamp !== "none" && (
                <div className="absolute bottom-5 right-5 w-[70px] h-[70px] z-10 pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none opacity-85"
                     dangerouslySetInnerHTML={{ __html: STAMPS[watermarkStamp] }} />
              )}

              {/* Durum Göstergesi */}
              <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#faff69] animate-pulse"></span>
                <span>KABİN SİMÜLATÖRÜ</span>
              </div>
            </div>
            
            {/* Polaroid İndirme Butonu (Fotoğraf Çek Yerine) */}
            <button 
              onClick={handleDownloadPolaroid}
              className="mt-4 w-full bg-[#faff69] text-black font-black uppercase text-base tracking-wider py-4.5 rounded shadow-[0_4px_16px_rgba(250,255,105,0.15)] hover:bg-[#ebf058] active:translate-y-0.5 active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              POLAROİD BASKISINI İNDİR
            </button>
          </div>

          {/* SAĞ: Parametreler Kontrol Paneli */}
          <div className="lg:col-span-5 bg-[#0a0a0b] border border-white/10 rounded p-6 flex flex-col justify-between shadow-2xl relative">
            <div className="flex flex-col gap-6">
              <div className="border-b border-white/5 pb-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-300">kiosk ayarları</h4>
                <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold mt-1">Görsel İşleme Arayüzü</p>
              </div>

              {/* Ayar 1: Filigran Damgaları */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#faff69]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                  Filigran Damgası Seçimi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["classic", "retro", "tech", "none"] as const).map((stampType) => (
                    <button
                      key={stampType}
                      onClick={() => setWatermarkStamp(stampType)}
                      className={`flex flex-col items-center justify-center p-2 border rounded gap-2 transition-all select-none cursor-pointer ${
                        watermarkStamp === stampType 
                          ? "border-[#faff69] bg-[#faff69]/5 text-white" 
                          : "border-white/10 bg-transparent text-zinc-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        {stampType !== "none" ? (
                          <div 
                            className={`w-7 h-7 ${watermarkStamp === stampType ? "text-[#faff69]" : "text-zinc-400"}`}
                            dangerouslySetInnerHTML={{ __html: STAMPS[stampType] }} 
                          />
                        ) : (
                          <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        )}
                      </div>
                      <span className="text-[9px] uppercase font-bold text-center leading-tight truncate w-full">
                        {stampType === "classic" ? "Klasik" : stampType === "retro" ? "Retro" : stampType === "tech" ? "Tekno" : "Damgasız"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ayar 2: Aydınlatma Filtreleri */}
              <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#faff69]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                  </svg>
                  Aydınlatma Filtreleri ve Kontrast
                </label>

                {/* Parlaklık Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500">
                    <span>parlaklık</span>
                    <span className="text-[#faff69] font-mono">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(+e.target.value)}
                    className="w-full h-1 bg-[#151515] rounded-lg appearance-none cursor-pointer accent-[#faff69]"
                  />
                </div>

                {/* Kontrast Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500">
                    <span>kontrast</span>
                    <span className="text-[#faff69] font-mono">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(+e.target.value)}
                    className="w-full h-1 bg-[#151515] rounded-lg appearance-none cursor-pointer accent-[#faff69]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/5 pt-4 flex gap-4 items-center">
              <svg className="w-8 h-8 text-zinc-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M20.4 14.5L16 10 4 20" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase text-zinc-400">bileşik çıktı çözünürlüğü</span>
                <span className="text-zinc-600 text-[9px] uppercase font-bold mt-0.5 tracking-wider leading-none">640x480 CANVAS // KALİTE SEVİYESİ %95</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fotoğraf oluşturmak için arka planda çalışan Canvas */}
        <canvas ref={canvasRef} width="640" height="480" className="hidden" />
      </section>

      {/* 4. Polaroid Baskı Galerisi Bölümü */}
      <section className="w-full border-t border-white/5 bg-[#080809] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-2 h-2 bg-[#faff69] rounded-full"></span>
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#faff69]">FİLM ŞERİDİ ÖNİZLEMESİ</span>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight">Kabin Polaroid Çıktıları</h3>
              <p className="text-zinc-400 text-sm mt-1 max-w-md">Çekimlerden sonra elde edilen yüksek çözünürlüklü polaroid baskı örnekleri.</p>
            </div>
            
            <div className="bg-[#101012] border border-white/5 rounded px-4 py-2.5 font-mono text-xs text-zinc-400 flex items-center gap-2 max-w-fit">
              <span>ÖRNEK BASKI SAYISI:</span>
              <span className="text-[#faff69] font-bold font-sans text-sm">{photos.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="polaroid-card bg-zinc-50 text-black p-4 pb-6 rounded shadow-lg flex flex-col relative select-none"
                style={{ 
                  transform: `rotate(${photo.rotation}deg)`,
                  "--rotate-hover": `${photo.rotation > 0 ? photo.rotation + 1.5 : photo.rotation - 1.5}deg`
                } as React.CSSProperties}
              >
                {/* Polaroid içi resim alanı */}
                <div className="w-full aspect-square relative bg-zinc-950 overflow-hidden border border-black/5 mb-4.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt="Polaroid Fotoğrafı"
                    className="w-full h-full object-cover select-none"
                    draggable="false"
                  />
                </div>

                {/* Polaroid etiket alanı */}
                <div className="flex flex-col font-sans">
                  <span className="text-xs font-black uppercase tracking-tight text-zinc-800 leading-tight">
                    {photo.stampLabel}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 leading-none font-mono">
                    Örnek Çekim Saat: {photo.timestamp}
                  </span>
                </div>

                {/* Polaroid kart aksiyon katmanı */}
                <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-3.5 z-20">
                  {/* İndirme Butonu */}
                  <a
                    href={photo.url}
                    download={`qutu-polaroid-${photo.id}.png`}
                    className="w-11 h-11 bg-[#faff69] text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                    title="Görseli İndir"
                  >
                    <svg className="w-5 h-5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Teknik Özellikler Bölümü */}
      <section id="features" className="w-full border-t border-white/5 py-24 px-6 max-w-7xl mx-auto">
       

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Kart 1: DSLR & Web Kamerası Senkronizasyonu */}
          <div className="bg-[#0a0a0c] border border-white/5 hover:border-[#faff69]/30 rounded p-7 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 bg-[#faff69]/10 text-[#faff69] rounded flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <h4 className="font-extrabold text-base tracking-tight uppercase mb-2">DSLR & Kamera Senkronizasyonu</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Canon DSLR fotoğraf makineleriyle yerel IPC entegrasyonu (Canon SDK) üzerinden doğrudan haberleşerek yüksek çözünürlüklü stüdyo kareleri yakalar.
              </p>
            </div>
            <span className="text-[#faff69] font-mono text-[9px] uppercase font-bold mt-6">// DONANIM BAĞLANTISI AKTİF</span>
          </div>

          {/* Kart 2: QUTU Tasarım Kılavuzu */}
          <div className="bg-[#0a0a0c] border border-white/5 hover:border-[#faff69]/30 rounded p-7 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 bg-[#faff69]/10 text-[#faff69] rounded flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
              </div>
              <h4 className="font-extrabold text-base tracking-tight uppercase mb-2">QUTU Tasarım Dili</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                 Saf siyahlar, yüksek kontrastlı neon volt sarısı detaylar, keskin kart sınırları ve özel izometrik kutu sembolleri.
              </p>
            </div>
            <span className="text-[#faff69] font-mono text-[9px] uppercase font-bold mt-6">// TASARIM BÜTÜNLÜĞÜ</span>
          </div>

      

          {/* Kart 5: Polaroid Baskı Çıktısı */}
          <div className="bg-[#0a0a0c] border border-white/5 hover:border-[#faff69]/30 rounded p-7 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 bg-[#faff69]/10 text-[#faff69] rounded flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <h4 className="font-extrabold text-base tracking-tight uppercase mb-2">Polaroid Çıktı Rasterizasyonu</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Fotoğrafları retro beyaz polaroid çerçevesinde birleştirerek, alt bilgi etiketlerini ve zaman damgasını milisaniyeler içerisinde çizip indirmeye hazırlar.
              </p>
            </div>
            <span className="text-[#faff69] font-mono text-[9px] uppercase font-bold mt-6">// SAYISAL RASTERLEŞTİRME</span>
          </div>

          {/* Card 6: Çevrimdışı Çalışma Modu */}
          <div className="bg-[#0a0a0c] border border-white/5 hover:border-[#faff69]/30 rounded p-7 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 bg-[#faff69]/10 text-[#faff69] rounded flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h4 className="font-extrabold text-base tracking-tight uppercase mb-2">Çevrimdışı (Offline) Mimarisi</h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Etkinlik alanlarında internet kopması sorununa karşı tamamen bağımsız çalışır. Fotoğrafları doğrudan diskteki yerel klasör yollarına kaydeder.
              </p>
            </div>
            <span className="text-[#faff69] font-mono text-[9px] uppercase font-bold mt-6">// YEREL DEPOLAMA AKTİF</span>
          </div>
        </div>
      </section>

      {/* 6. Alt Bilgi Alanı */}
      <footer className="w-full border-t border-white/10 bg-[#080809] py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[#faff69] opacity-75" viewBox="0 0 100 100" fill="none">
              <path d="M50 15 L85 33 L85 67 L50 85 L15 67 L15 33 Z" stroke="#faff69" strokeWidth="6" strokeLinejoin="round" />
              <path d="M50 15 L50 85" stroke="#faff69" strokeWidth="6" />
              <path d="M15 33 L50 51 L85 33" stroke="#faff69" strokeWidth="6" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 leading-none">
              QUTU PHOTOBOOTH // YIL 2026
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-zinc-500 font-extrabold text-[10px] uppercase tracking-wider">
            <span className="hover:text-white transition-colors cursor-pointer">gizlilik politikası</span>
            <span className="hover:text-white transition-colors cursor-pointer">kullanım şartları</span>
            <span className="text-zinc-600">qutu tasarım sistemi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
