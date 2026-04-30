import { ChevronLeft } from "lucide-react";
import sskKioskPhoto from "@/assets/ssk-kiosk.jpg";
import apdPhoto from "@/assets/equip-apd.jpg";
import parcelLockersPhoto from "@/assets/equip-parcel-lockers.jpg";
import poBoxesPhoto from "@/assets/equip-po-boxes.jpg";
import signageZone2 from "@/assets/signage-zone-2.png";
import signageZone3 from "@/assets/signage-zone-3.png";
import signageZone4 from "@/assets/signage-zone-4.png";

interface WayfindingProps {
  service?: string;
  onFound?: () => void;
  onNotFound?: () => void;
  onBack?: () => void;
}

type Guidance = {
  equipment: string;
  zone: string;
  cue: string;
  photo: string;
  alt: string;
  signage?: string;
  signageAlt?: string;
};

const SERVICE_GUIDANCE: Record<string, Guidance> = {
  "Ship a Package": {
    equipment: "Self-Service Kiosk",
    zone: "Zone 2 · Purchase",
    cue: "On your right as you walk in",
    photo: sskKioskPhoto,
    alt: "USPS Self-Service Kiosk",
    signage: signageZone2,
    signageAlt: "Purchase It zone signage",
  },
  "Drop Off a Prepaid Package": {
    equipment: "Automated Parcel Drop",
    zone: "Zone 3 · Send It",
    cue: "Straight ahead, along the back wall",
    photo: apdPhoto,
    alt: "USPS Automated Parcel Drop",
    signage: signageZone3,
    signageAlt: "Send It zone signage",
  },
  "Buy Stamps": {
    equipment: "Self-Service Kiosk",
    zone: "Zone 2 · Purchase",
    cue: "On your right as you walk in",
    photo: sskKioskPhoto,
    alt: "USPS Self-Service Kiosk",
    signage: signageZone2,
    signageAlt: "Purchase It zone signage",
  },
  "Pick Up a Package": {
    equipment: "Parcel Lockers",
    zone: "Zone 4 · Pick Up",
    cue: "On your left, toward the back",
    photo: parcelLockersPhoto,
    alt: "USPS Parcel Lockers",
    signage: signageZone4,
    signageAlt: "Pick Up zone signage",
  },
  "Access PO Box": {
    equipment: "PO Box Wall",
    zone: "Zone 4 · Pick Up",
    cue: "On your left as you walk in",
    photo: poBoxesPhoto,
    alt: "USPS PO Boxes",
    signage: signageZone4,
    signageAlt: "Pick Up zone signage",
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
        <h1 className="text-xl font-bold text-aiva-navy mb-4">{g.equipment}</h1>

        {g.signage && (
          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
              Look for this sign
            </div>
            <div className="rounded-lg overflow-hidden border border-border shadow-sm">
              <img
                src={g.signage}
                alt={g.signageAlt || "Zone signage"}
                loading="lazy"
                className="w-full h-24 object-cover block"
              />
            </div>
          </div>
        )}

        <div>
          {g.signage && (
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
              Then find this equipment
            </div>
          )}
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
      </div>

      <div className="px-5 pb-5 pt-2 space-y-2 shrink-0 bg-aiva-page">
        <button
          onClick={onFound}
          className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
        >
          I found it
        </button>
      </div>
    </div>
  );
};
