import kioskPhoto from "@/assets/ssk-kiosk.jpg";

interface WayfindingProps {
  onFound?: () => void;
  onNotFound?: () => void;
}

export const Wayfinding = ({ onFound, onNotFound }: WayfindingProps) => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 scrollbar-hide">
        <h1 className="text-xl font-bold text-aiva-navy mb-4">Find the Kiosk</h1>

        <div className="mb-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
            Look for this
          </div>
          <div className="text-base font-bold text-foreground leading-tight">
            Self-Service Kiosk
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            On your right as you walk in
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-border">
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
