"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";

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

function PhotoEditorContent() {
  const searchParams = useSearchParams();
  const rawPhotoUrl = searchParams.get("photoUrl");
  const photoUrl = rawPhotoUrl || "/showcase_portrait.png";

  const [liveTime, setLiveTime] = useState("");
  const [watermarkStamp, setWatermarkStamp] = useState<"classic" | "retro" | "tech" | "none">("classic");
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [flashActive, setFlashActive] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tarih ve saat güncelleyici
  useEffect(() => {
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

  // Canvas Raporlama ve İndirme İşlemi
  const handleDownloadPolaroid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flaş efekti ve deklanşör sesi
    setFlashActive(true);
    playShutterSound();
    
    setTimeout(() => {
      setFlashActive(false);
    }, 200);

    // Canvas boyutlarını polaroid baskı boyutlarına ayarla (600x720)
    canvas.width = 600;
    canvas.height = 720;
    
    ctx.fillStyle = "#f3f4f6"; // Polaroid kırık beyaz arka planı
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imgX = 30;
    const imgY = 30;
    const imgW = 540;
    const imgH = 540;

    // Aydınlatma filtrelerini uygula
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    const img = new window.Image();
    // CORS sorunlarını önlemek için anonymous niteliği
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, imgX, imgY, imgW, imgH);
      ctx.filter = "none"; // Damga için filtreleri temizle

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
    img.onerror = (e) => {
      console.error("Görsel yüklenemedi:", e);
      alert("Hata: Belirtilen URL'den görsel yüklenemedi. CORS engellemesi olabilir.");
    };
    img.src = photoUrl;
  };

  const drawPolaroidTextAndDownload = (
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    blobURL: string | null
  ) => {
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "left";
    
    const label = watermarkStamp === "classic" ? "Qutu Klasik Baskı"
                : watermarkStamp === "retro" ? "Qutu Retro Baskı"
                : watermarkStamp === "tech" ? "Qutu Tekno Baskı"
                : "Qutu Temiz Baskı";

    ctx.fillText(label, 40, 620);
    
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px monospace";
    ctx.textAlign = "right";
    const nowStr = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    ctx.fillText(`Saat: ${nowStr} • 2026`, canvas.width - 40, 620);

    // İndirme işlemini tetikle
    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qutu-editor-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Resim indirme hatası:", err);
      alert("Güvenlik Sınırı (CORS): Tarayıcı, dış kaynaklı bu resmi indirmenizi engelledi.");
    }

    if (blobURL) {
      URL.revokeObjectURL(blobURL);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-[#ffffff] font-sans antialiased">
      {/* Başlık Çubuğu */}
      <header className="w-full border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <svg className="w-9 h-9 text-[#faff69]" viewBox="0 0 100 100" fill="none">
              <path d="M50 15 L85 33 L85 67 L50 85 L15 67 L15 33 Z" stroke="#faff69" strokeWidth="6" strokeLinejoin="round" />
              <path d="M50 15 L50 85" stroke="#faff69" strokeWidth="6" />
              <path d="M15 33 L50 51 L85 33" stroke="#faff69" strokeWidth="6" strokeLinejoin="round" />
            </svg>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight uppercase leading-none">
                QUTU <span className="text-[#faff69]">PHOTOBOOTH</span>
              </span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1 leading-none">
                Fotoğraf Düzenleyici & Baskı Servisi
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline bg-[#121212] px-3.5 py-1.5 rounded border border-white/5 font-mono text-xs text-zinc-400">
              {liveTime}
            </span>
            <a 
              href="/" 
              className="text-xs border border-white/20 text-white font-bold uppercase px-4 py-2 rounded hover:bg-white/5 transition-colors"
            >
              ANA SAYFA
            </a>
          </div>
        </div>
      </header>

      {/* Ana Çalışma Alanı */}
      <main className="flex-1 w-full px-6 py-12 max-w-7xl mx-auto flex flex-col justify-center">
        <div className="flex flex-col mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight">Fotoğraf Düzenleme İstasyonu</h1>
          <p className="text-zinc-400 text-sm mt-1">İlgili query parametresinden gelen fotoğrafı özelleştirip polaroid baskı formatında indirin.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* SOL: Canlı Düzenleme Önizleme Ekranı */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative aspect-[4/3] bg-[#0c0c0d] border border-white/10 rounded overflow-hidden flex items-center justify-center group shadow-2xl">
              {/* Scanline Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.3)_50%,rgba(0,0,0,0.3))] bg-[size:100%_4px] pointer-events-none z-10 opacity-30"></div>

              {/* Flaş Efekti */}
              <div className={`absolute inset-0 bg-white z-30 transition-opacity duration-350 pointer-events-none ${flashActive ? "opacity-100" : "opacity-0"}`} />

              {/* Düzenlenen Resim */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt="Düzenlenen Fotoğraf"
                className="w-full h-full object-cover transition-all duration-75 select-none"
                style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                draggable="false"
              />

              {/* Canlı Damga Önizlemesi */}
              {watermarkStamp !== "none" && (
                <div className="absolute bottom-5 right-5 w-[70px] h-[70px] z-10 pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none opacity-85"
                     dangerouslySetInnerHTML={{ __html: STAMPS[watermarkStamp] }} />
              )}

              {/* Durum Göstergesi */}
              <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#faff69] animate-pulse"></span>
                <span>ÖNİZLEME PANELDEN GÜNCELLENİR</span>
              </div>
            </div>
            
            {/* İndirme Aksiyon Butonu */}
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

          {/* SAĞ: Düzenleme Parametre Paneli */}
          <div className="lg:col-span-5 bg-[#0a0a0b] border border-white/10 rounded p-6 flex flex-col justify-between shadow-2xl">
            <div className="flex flex-col gap-6">
              <div className="border-b border-white/5 pb-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-300">editör parametreleri</h4>
                <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold mt-1">İnce Ayarlar & Markalama</p>
              </div>

              {/* Ayar 1: Filigran Damga Seçimi */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#faff69]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                  Baskı Damgası
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

              {/* Ayar 2: Sliders */}
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
                  Aydınlatma ve Tonlama
                </label>

                {/* Brightness */}
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

                {/* Contrast */}
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

            <div className="mt-8 border-t border-white/5 pt-4 text-xs text-zinc-500 uppercase font-bold tracking-wide">
              Aktif URL: <span className="text-zinc-300 font-mono text-[10px] lowercase normal-case block truncate mt-1">{photoUrl}</span>
            </div>
          </div>
        </div>

        {/* Polaroid Çıktı Canvası */}
        <canvas ref={canvasRef} width="640" height="480" className="hidden" />
      </main>

      <footer className="w-full border-t border-white/10 bg-[#080809] py-8 px-6 text-center text-xs text-zinc-600 font-extrabold uppercase tracking-wider">
        QUTU PHOTOBOOTH // EDİTÖR HİZMETİ 2026
      </footer>
    </div>
  );
}

export default function PhotoEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-bold uppercase tracking-widest text-xs">
        Editör Yükleniyor...
      </div>
    }>
      <PhotoEditorContent />
    </Suspense>
  );
}
