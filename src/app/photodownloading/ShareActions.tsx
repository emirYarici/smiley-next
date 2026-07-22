'use client';

import { useState } from 'react';

export interface PhotostripItem {
  id: string;
  filename: string;
  imageDataUrl: string;
}

interface ShareActionsProps {
  items: PhotostripItem[];
}

export default function ShareActions({ items }: ShareActionsProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleShareItem = async (item: PhotostripItem, idx: number) => {
    try {
      const res = await fetch(item.imageDataUrl);
      const blob = await res.blob();
      const file = new File([blob], item.filename, { type: blob.type || 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Smiley Photobooth',
          text: 'Smiley Photobooth Story Photostrip!',
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Smiley Photobooth',
          text: 'Smiley Photobooth Story Photostrip!',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2500);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share error:', err);
      }
    }
  };

  const handleDownloadItem = (item: PhotostripItem) => {
    const a = document.createElement('a');
    a.href = item.imageDataUrl;
    a.download = item.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    items.forEach((item, index) => {
      setTimeout(() => {
        handleDownloadItem(item);
      }, index * 400);
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Photostrip Gallery */}
      {items.map((item, idx) => (
        <div 
          key={item.id + idx} 
          className="flex flex-col items-center bg-[#0c0c0d] p-4 rounded-xl border border-white/10 shadow-2xl relative group"
        >
          {/* Header Label */}
          <span className="text-[10px] text-[#faff69] font-mono font-bold uppercase tracking-widest mb-3">
            {items.length > 1 ? `INSTAGRAM STORY STRIP #${idx + 1}` : 'INSTAGRAM STORY STRIP'}
          </span>

          {/* 9:16 Photostrip Preview Frame */}
          <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden mb-4 border border-white/5 shadow-inner">
            {/* Scanline Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.3)_50%,rgba(0,0,0,0.3))] bg-[size:100%_4px] pointer-events-none z-10 opacity-30"></div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageDataUrl}
              alt={`Photostrip ${idx + 1}`}
              className="w-full h-full object-contain select-none"
            />
          </div>

          {/* Buttons for each Photostrip */}
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={() => handleShareItem(item, idx)}
              className="w-full bg-[#faff69] text-black font-black uppercase text-xs tracking-wider py-3 rounded-lg shadow-[0_4px_16px_rgba(250,255,105,0.15)] hover:bg-[#ebf058] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {copiedIdx === idx ? 'BAĞLANTI KOPYALANDI!' : 'FOTOĞRAFI PAYLAŞ'}
            </button>

            <button
              onClick={() => handleDownloadItem(item)}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase text-[11px] tracking-wider py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              İndir (Cihaza Kaydet)
            </button>
          </div>
        </div>
      ))}

      {/* Batch Action Button if Multiple Photostrips Exist */}
      {items.length > 1 && (
        <button
          onClick={handleDownloadAll}
          className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black uppercase text-sm tracking-wider py-4 rounded-xl shadow-[0_4px_20px_rgba(250,255,105,0.25)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <svg className="w-5 h-5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          TÜM STRİPLERİ İNDİR ({items.length})
        </button>
      )}
    </div>
  );
}
