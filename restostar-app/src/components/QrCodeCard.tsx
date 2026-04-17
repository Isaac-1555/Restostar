import { useCallback, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QrCodeCardProps {
  publicId: string;
  slug: string;
  restaurantName: string;
}

export function QrCodeCard({ publicId, slug, restaurantName }: QrCodeCardProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const qrUrl = `${window.location.origin}/r/${publicId}/${slug}`;

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${slug}-qr-code.png`;
    link.href = dataUrl;
    link.click();
  }, [slug]);

  return (
    <div className="rounded-lg border border-emerald-950/10 bg-white p-2 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          ref={canvasRef}
          className="rounded-lg border border-emerald-950/5 bg-white p-2 flex-shrink-0"
        >
          <QRCodeCanvas
            value={qrUrl}
            size={100}
            bgColor="#ffffff"
            fgColor="#022c22"
            level="M"
            marginSize={1}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-emerald-900/60 truncate">
            Scan to leave a review for
          </p>
          <p className="text-sm font-medium text-emerald-950 truncate">{restaurantName}</p>
          <p className="text-xs text-emerald-900/60 truncate mt-1">{qrUrl}</p>
          <button
            type="button"
            onClick={handleDownload}
            className="mt-2 h-7 rounded-md bg-emerald-950 px-3 text-xs font-semibold text-white hover:bg-emerald-900 transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
