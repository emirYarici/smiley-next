import ShareActions, { PhotostripItem } from './ShareActions';

const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL || "https://lzrshencbuewpwnqktnn.supabase.co";
const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || "images";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PhotoDownloadingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawIdParam = resolvedSearchParams.id ?? resolvedSearchParams.photoUrl;

  if (!rawIdParam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-6 text-center font-sans antialiased">
        <div className="max-w-md w-full bg-[#0a0a0b] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          <svg className="w-12 h-12 text-[#faff69] mb-4" viewBox="0 0 100 100" fill="none">
            <path d="M50 15 L85 33 L85 67 L50 85 L15 67 L15 33 Z" stroke="#faff69" strokeWidth="6" strokeLinejoin="round" />
            <path d="M50 15 L50 85" stroke="#faff69" strokeWidth="6" />
            <path d="M15 33 L50 51 L85 33" stroke="#faff69" strokeWidth="6" strokeLinejoin="round" />
          </svg>
          <h1 className="text-xl font-extrabold uppercase tracking-tight text-[#faff69] mb-2">Fotoğraf Bulunamadı</h1>
          <p className="text-zinc-400 text-xs font-medium">Geçerli bir fotoğraf ID bulunamadı. Lütfen QR kodu tekrar taratın.</p>
        </div>
      </div>
    );
  }

  // Parse ID or photoUrl whether it arrives as a string ("a,b"), array (["a", "b"]), or repeated query params
  let photoIds: string[] = [];
  if (Array.isArray(rawIdParam)) {
    photoIds = rawIdParam.flatMap((item) => item.split(',')).map((id) => id.trim()).filter(Boolean);
  } else if (typeof rawIdParam === 'string') {
    photoIds = rawIdParam.split(',').map((id) => id.trim()).filter(Boolean);
  }

  // Fetch photos in parallel on the server side
  const items: PhotostripItem[] = (
    await Promise.all(
      photoIds.map(async (photoId) => {
        const supabaseUrl = photoId.startsWith('http')
          ? photoId
          : `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/${photoId}`;

        // Extract clean filename from URL or string
        let filename = photoId.split('/').pop() || photoId;
        if (!filename.includes('.')) filename = `${filename}.png`;

        try {
          const res = await fetch(supabaseUrl);
          if (res.ok) {
            const contentType = res.headers.get('content-type') || 'image/png';
            const arrayBuffer = await res.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            return {
              id: photoId,
              filename,
              imageDataUrl: `data:${contentType};base64,${base64}`,
            };
          }
        } catch (err) {
          console.error(`Error fetching photostrip ${photoId} from Supabase:`, err);
        }
        return null;
      })
    )
  ).filter((item): item is PhotostripItem => item !== null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-6 text-center font-sans antialiased">
        <div className="max-w-md w-full bg-[#0a0a0b] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          <h1 className="text-xl font-extrabold uppercase tracking-tight text-red-400 mb-2">Fotoğraf Yüklenemedi</h1>
          <p className="text-zinc-400 text-xs font-medium">Görseller sunucudan çekilirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-[#ffffff] font-sans antialiased selection:bg-[#faff69] selection:text-black">
      {/* 1. Header */}
      <header className="w-full border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <svg className="w-9 h-9 text-[#faff69] filter drop-shadow-[0_0_8px_rgba(250,255,105,0.4)]" viewBox="0 0 100 100" fill="none">
              <path d="M50 15 L85 33 L85 67 L50 85 L15 67 L15 33 Z" stroke="#faff69" strokeWidth="6" strokeLinejoin="round" />
              <path d="M50 15 L50 85" stroke="#faff69" strokeWidth="6" />
              <path d="M15 33 L50 51 L85 33" stroke="#faff69" strokeWidth="6" strokeLinejoin="round" />
            </svg>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight uppercase leading-none">
                SMILEY <span className="text-[#faff69] text-shadow-[0_0_12px_rgba(250,255,105,0.25)]">PHOTOBOOTH</span>
              </span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1 leading-none">
                Story Photostrip Paylaşım Servisi
              </span>
            </div>
          </div>
          
          <a 
            href="/" 
            className="text-xs border border-white/20 text-white font-bold uppercase px-4 py-2 rounded hover:bg-white/5 transition-colors"
          >
            ANA SAYFA
          </a>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 w-full px-6 py-12 flex items-center justify-center relative overflow-hidden">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#faff69] opacity-5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-md w-full bg-[#0a0a0b] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 flex flex-col items-center">
          
          {/* Card Top Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] text-[#faff69] font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#faff69] animate-pulse"></span>
            <span>SMILEY PHOTOBOOTH STORY STRIP</span>
          </div>

          {/* Web Share & Download Action Buttons with 9:16 Photostrips */}
          <ShareActions items={items} />

        </div>
      </main>

      {/* 3. Footer */}
      <footer className="w-full border-t border-white/10 bg-[#080809] py-6 px-6 text-center text-xs text-zinc-600 font-extrabold uppercase tracking-wider">
        SMILEY PHOTOBOOTH // PAYLAŞIM SERVİSİ 2026
      </footer>
    </div>
  );
}
