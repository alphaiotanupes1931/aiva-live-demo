import purchaseItSign from "@/assets/zone-purchase-it.png";
import kioskPhoto from "@/assets/ssk-kiosk.jpg";

interface WayfindingProps {
  onFound?: () => void;
  onNotFound?: () => void;
}

export const Wayfinding = ({ onFound, onNotFound }: WayfindingProps) => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 scrollbar-hide">
        <h1 className="text-xl font-bold text-aiva-navy mb-1">Find the Purchase Zone</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Look up — you'll see this sign above the Self-Service Kiosk.
        </p>

        <div className="mb-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
            Look for this sign
          </div>
          <div className="text-sm text-muted-foreground">
            Zone 2 · On your right as you walk in
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden bg-[#F5F1EA] border border-border shadow-sm aspect-[16/7] flex items-center justify-center p-3 mb-3">
          <img
            src={purchaseItSign}
            alt="Purchase It — Complete Transaction Here sign"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
          Then walk to this kiosk
        </div>
        <div className="rounded-2xl overflow-hidden bg-white border border-border shadow-sm">
          <img
            src={kioskPhoto}
            alt="USPS Self-Service Kiosk"
            width={768}
            height={1024}
            loading="lazy"
            className="w-full h-auto object-cover block"
          />
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 space-y-2 shrink-0 bg-aiva-page">
        <button
          onClick={onFound}
          className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
        >
          I found it
        </button>
        <button
          onClick={onNotFound}
          className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
        >
          I don't see it
        </button>
      </div>
    </div>
  );
};
