const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL || "https://lzrshencbuewpwnqktnn.supabase.co";
const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || "images";

interface PageProps {
  searchParams: Promise<{ id?: string; photoUrl?: string }>;
}

export default async function PhotoDownloadingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const photoId = resolvedSearchParams.id || resolvedSearchParams.photoUrl;

  if (!photoId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-slate-950 p-6 text-center">
        <h1 className="text-2xl font-bold text-amber-400 mb-2">Fotoğraf Bulunamadı</h1>
        <p className="text-slate-400">Lütfen QR kodu tekrar taratın.</p>
      </div>
    );
  }

  // Construct official Supabase URL on the server side
  const supabaseUrl = photoId.startsWith('http')
    ? photoId
    : `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/${photoId}`;

  let imageDataUrl = '';
  const filename = photoId.includes('.png') ? photoId : `${photoId}.png`;

  try {
    const res = await fetch(supabaseUrl);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || 'image/png';
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      imageDataUrl = `data:${contentType};base64,${base64}`;
    }
  } catch (err) {
    console.error("Error fetching photo from Supabase on server:", err);
  }

  if (!imageDataUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-slate-950 p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Fotoğraf Yüklenemedi</h1>
        <p className="text-slate-400">Görsel sunucudan alınırken bir sorun oluştu.</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl font-extrabold text-amber-300">☺</span>
          <span className="text-lg font-bold tracking-wider text-slate-100">SMILEY PHOTOBOOTH</span>
        </div>

        {/* Photo Display */}
        <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden mb-6 border border-slate-800 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUrl}
            alt="Smiley Photo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action Button */}
        <a
          href={imageDataUrl}
          download={filename}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Fotoğrafı İndir
        </a>
      </div>
    </main>
  );
}
