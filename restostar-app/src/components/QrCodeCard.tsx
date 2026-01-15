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
    <div className="rounded-lg border border-sage-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-sage-700 mb-3">QR Code</h2>

      <div className="flex flex-col items-center gap-4">
        <div
          ref={canvasRef}
          className="rounded-lg border border-sage-100 bg-white p-3"
        >
          <QRCodeCanvas
            value={qrUrl}
            size={180}
            bgColor="#ffffff"
            fgColor="#4a5d4a"
            level="M"
            marginSize={2}
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-xs text-sage-500">
            Scan to leave a review for
          </p>
          <p className="text-sm font-medium text-sage-700">{restaurantName}</p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="h-9 rounded-md bg-sage px-4 text-sm font-semibold text-white hover:bg-sage-500 transition-colors"
        >
          Download PNG
        </button>

        <p className="text-xs text-sage-500 text-center break-all max-w-[220px]">
          {qrUrl}
        </p>
      </div>
    </div>
  );
}
