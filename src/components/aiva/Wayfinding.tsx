import sskKioskPhoto from "@/assets/ssk-kiosk.jpg";
import drumChutePhoto from "@/assets/equip-drum-chute.jpg";
import apdPhoto from "@/assets/equip-apd.jpg";
import parcelLockersPhoto from "@/assets/equip-parcel-lockers.jpg";
import mailChutePhoto from "@/assets/equip-mail-chute.jpg";

interface WayfindingProps {
  service?: string;
  onFound?: () => void;
  onNotFound?: () => void;
}

type Guidance = {
  equipment: string;
  zone: string;
  cue: string;
  photo: string;
  alt: string;
};

const SERVICE_GUIDANCE: Record<string, Guidance> = {
  "Ship a Package": {
    equipment: "Self-Service Kiosk",
    zone: "Zone 2 · Purchase",
    cue: "On your right as you walk in",
    photo: sskKioskPhoto,
    alt: "USPS Self-Service Kiosk",
  },
  "Drop Off a Prepaid Package": {
    equipment: "Automated Parcel Drop",
    zone: "Zone 3 · Send It",
    cue: "Straight ahead, along the back wall",
    photo: apdPhoto,
    alt: "USPS Automated Parcel Drop",
  },
  "Buy Stamps": {
    equipment: "Self-Service Kiosk",
    zone: "Zone 2 · Purchase",
    cue: "On your right as you walk in",
    photo: sskKioskPhoto,
    alt: "USPS Self-Service Kiosk",
  },
  "Pick Up a Package": {
    equipment: "Parcel Lockers",
    zone: "Zone 4 · Pick Up",
    cue: "On your left, toward the back",
    photo: parcelLockersPhoto,
    alt: "USPS Parcel Lockers",
  },
  "Access PO Box": {
    equipment: "PO Box Wall",
    zone: "Zone 4 · Pick Up",
    cue: "On your left as you walk in",
    photo: parcelLockersPhoto,
    alt: "USPS PO Boxes",
  },
};

export const Wayfinding = ({ service, onFound, onNotFound }: WayfindingProps) => {
  const g = (service && SERVICE_GUIDANCE[service]) || SERVICE_GUIDANCE["Ship a Package"];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 scrollbar-hide">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
          Use this equipment
        </div>
        <h1 className="text-xl font-bold text-aiva-navy mb-1">{g.equipment}</h1>
        <p className="text-sm text-muted-foreground mb-4">
          {g.zone} · {g.cue}
        </p>

        <div className="rounded-2xl overflow-hidden bg-white border border-border shadow-sm">
          <img
            src={g.photo}
            alt={g.alt}
            width={1024}
            height={768}
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
