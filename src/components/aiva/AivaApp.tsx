import { useEffect, useRef, useState } from "react";
import { PhoneFrame } from "./PhoneFrame";
import { Header } from "./Header";
import { BotBubble, UserBubble, Typing, ChoiceButton, Card } from "./ChatBits";
import { Wayfinding } from "./Wayfinding";
import { VoiceTextInput } from "./VoiceTextInput";
import { ChatbotModal } from "./ChatbotModal";
import { InlineChat } from "./InlineChat";
import {
  ShipIntro, ShipStep1, ShipStep2, ShipStep3, ShipServiceCompare,
  ShipStep4, ShipStep5, ShipDrumChuteWhere, ShipDone,
} from "./ShippingWalkthrough";
import {
  DropIntro, DropFindAPD, DropStep1, DropStep2, DropStep3, DropDone, DropTooBigRedirect, DropReceiptIssue,
  StampsIntro, StampsFindSSK, StampsStep1, StampsStep2, StampsStep3, StampsDone,
  PickupTriage, PkgFindLockers, PkgEnterCode, PkgDone,
  POBoxFind, POBoxDone, HeldMailRedirect,
} from "./ServiceWalkthroughs";
import { QuickCheck, StaffedPORedirect } from "./QuickCheck";

import { Onboarding } from "./Onboarding";
import { NewOrReturning } from "./NewOrReturning";
import { StateCityPicker } from "./StateCityPicker";
import {
  ensureMicPermission, hasSeenMicExplainer, markMicExplainerSeen, MicPermissionExplainer,
} from "./micPermission";

import {
  MapPin, CheckCircle2, AlertCircle, Mic, Send, Smartphone,
  ThumbsUp, ThumbsDown, Loader2, Square, MessageSquare, MessageCircle, Map as MapIcon, ArrowRight,
  Lock, Navigation, ChevronLeft, X,
} from "lucide-react";
import uspsLogo from "@/assets/usps-logo.png";
import sskKioskPhoto from "@/assets/ssk-kiosk.jpg";
import apdPhoto from "@/assets/equip-apd.jpg";
import parcelLockersPhoto from "@/assets/parcel-lockers.png";
import photoUnavailableImg from "@/assets/photo-unavailable.png";

const EQUIPMENT_PHOTOS: Record<string, { photo: string; alt: string }> = {
  "Self-Service Kiosk (SSK)": { photo: sskKioskPhoto, alt: "USPS Self-Service Kiosk" },
  "Self-Service Kiosk": { photo: sskKioskPhoto, alt: "USPS Self-Service Kiosk" },
  "Automated Parcel Drop (APD)": { photo: apdPhoto, alt: "USPS Automated Parcel Drop" },
  "Automated Parcel Drop": { photo: apdPhoto, alt: "USPS Automated Parcel Drop" },
  "Parcel Lockers": { photo: parcelLockersPhoto, alt: "USPS Parcel Lockers" },
};

type Screen =
  | "disclaimer"
  | "consent"
  | "qr"
  | "newOrReturning"
  | "onboarding"
  | "locationPermission"
  | "confirmInitialLocation"
  | "addressEntry"
  | "greeting"
  | "findIntent"
  | "wayfinding"
  | "arrived"
  | "confirmLocation"
  | "thanks"
  | "status"
  | "services"
  | "problemType"
  | "drumChute"
  | "submitting"
  | "submitted"
  | "notify"
  | "sms"
  | "smsSent"
  | "directions"
  | "nearest"
  | "anythingElse"
  | "csat"
  | "voiceListen"
  | "voiceConfirm"
  | "voiceUnclear"
  | "voiceProblem"
  | "pickupChoice"
  | "shipIntro"
  | "shipStep1"
  | "shipStep2"
  | "shipStep3"
  | "shipServiceCompare"
  | "shipStep4"
  | "shipStep5"
  | "shipDrumChuteWhere"
  | "shipDone"
  | "dropIntro"
  | "dropFindAPD"
  | "dropStep1"
  | "dropStep2"
  | "dropStep3"
  | "dropDone"
  | "dropTooBig"
  | "dropReceiptIssue"
  | "quickCheck"
  | "quickCheckRedirect"
  | "stampsIntro"
  | "stampsFindSSK"
  | "stampsStep1"
  | "stampsStep2"
  | "stampsStep3"
  | "stampsDone"
  | "pickupTriage"
  | "pkgFindLockers"
  | "pkgEnterCode"
  | "pkgDone"
  | "poBoxFind"
  | "poBoxDone"
  | "heldMailRedirect";

interface ChatMsg {
  who: "bot" | "user";
  text: string;
}

export const AivaApp = () => {
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window === "undefined") return "disclaimer";
    if (localStorage.getItem("aiva-disclaimer") !== "1") return "disclaimer";
    const consented = localStorage.getItem("aiva-consent") === "1";
    return consented ? "qr" : "consent";
  });
  const [history, setHistory] = useState<Screen[]>([]);
  const [problem, setProblem] = useState<string>("");
  const [problemDetail, setProblemDetail] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceConf, setVoiceConf] = useState(0);
  const [userLocation, setUserLocation] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("aiva-location") || "";
  });

  const [serviceIntent, setServiceIntent] = useState<string>("");
  const [chatOpen, setChatOpen] = useState(false);
  const [quickCheckReason, setQuickCheckReason] = useState<"hazmat" | "oversized" | "international" | "multiple">("hazmat");
  const [pendingFlow, setPendingFlow] = useState<"ship" | "drop" | null>(null);

  const persistLocation = (loc: string) => {
    setUserLocation(loc);
    try { localStorage.setItem("aiva-location", loc); } catch {}
  };


  const goto = (s: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(s);
  };
  const back = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setScreen(prev);
      return h.slice(0, -1);
    });
  };
  const restart = () => {
    setHistory([]);
    setScreen("qr");
    setProblem("");
    setProblemDetail("");
    setPhone("");
    setFeedback(null);
    setComment("");
    setVoiceTranscript("");
    setVoiceConf(0);
  };

  const showHeader =
    screen !== "qr" &&
    screen !== "disclaimer" &&
    screen !== "consent" &&
    screen !== "newOrReturning" &&
    screen !== "onboarding" &&
    screen !== "locationPermission" &&
    screen !== "confirmInitialLocation" &&
    screen !== "addressEntry";

  // Hide the floating chat button on screens where it would interfere
  // (onboarding/consent/QR) or where the inline chat is already on screen (greeting).
  const showChatFab =
    showHeader && screen !== "greeting" && !chatOpen;

  // Screens that need a floating back button (because their layout doesn't include one inline).
  const SCREENS_WITH_GLOBAL_BACK: Screen[] = [
    "arrived", "thanks", "status", "voiceProblem",
    "services", "problemType", "drumChute", "voiceListen", "voiceConfirm",
    "voiceUnclear", "confirmLocation", "nearest",
    "submitted", "anythingElse", "csat", "notify", "sms", "smsSent", "directions",
  ];
  const showGlobalBack =
    showHeader && history.length > 0 && SCREENS_WITH_GLOBAL_BACK.includes(screen);

  const ctx = getPageContext(screen, serviceIntent);

  return (
    <PhoneFrame>
      {showHeader && (
        <Header
          onHome={screen !== "greeting" ? () => { setHistory([]); setScreen("greeting"); } : undefined}
          onChat={() => setChatOpen(true)}
          showHome={screen !== "greeting"}
        />
      )}
      <div className="relative flex-1 overflow-hidden flex flex-col bg-white">
        {screen === "disclaimer" && (
          <DisclaimerScreen
            onContinue={() => {
              try { localStorage.setItem("aiva-disclaimer", "1"); } catch {}
              const consented = localStorage.getItem("aiva-consent") === "1";
              setScreen(consented ? "qr" : "consent");
              setHistory([]);
            }}
          />
        )}
        {screen === "consent" && (
          <ConsentScreen
            onAgree={() => {
              try { localStorage.setItem("aiva-consent", "1"); } catch {}
              setScreen("qr");
              setHistory([]);
            }}
          />
        )}
        {screen === "qr" && (
          <QrLanding
            onScan={() => {
              goto("newOrReturning");
            }}
          />
        )}
        {screen === "newOrReturning" && (
          <NewOrReturning
            onNew={() => goto("onboarding")}
            onReturning={() => goto("locationPermission")}
          />
        )}
        {screen === "onboarding" && (
          <Onboarding
            onDone={() => {
              setScreen("locationPermission");
              setHistory([]);
            }}
            onSkip={() => {
              setScreen("locationPermission");
              setHistory([]);
            }}
          />
        )}
        {screen === "locationPermission" && (
          <LocationPermission
            onGranted={(addr) => {
              persistLocation(addr);
              setScreen("greeting");
              setHistory([]);
            }}
            onDenied={() => {
              setScreen("addressEntry");
              setHistory([]);
            }}
          />
        )}
        {screen === "confirmInitialLocation" && (
          <ConfirmInitialLocation
            address={userLocation}
            onConfirm={() => {
              setScreen("greeting");
              setHistory([]);
            }}
            onChange={() => {
              setScreen("addressEntry");
              setHistory([]);
            }}
          />
        )}
        {screen === "addressEntry" && (
          <StateCityPicker
            onSubmit={(addr) => {
              persistLocation(addr);
              setScreen("greeting");
              setHistory([]);
            }}
          />
        )}
        {screen === "greeting" && (
          <Greeting
            onWayfinding={() => goto("findIntent")}
            onReport={() => goto("thanks")}
            onVoice={() => goto("voiceListen")}
            location={userLocation}
          />
        )}
        {screen === "findIntent" && (
          <FindIntent
            onSelect={(intent) => {
              if (intent === "Drop Off a Prepaid Package") {
                setServiceIntent(intent);
                setPendingFlow("drop");
                goto("quickCheck");
                return;
              }
              if (intent === "Ship a Package") {
                setServiceIntent(intent);
                setPendingFlow("ship");
                goto("quickCheck");
                return;
              }
              if (intent === "Buy Stamps") {
                setServiceIntent(intent);
                goto("stampsIntro");
                return;
              }
              if (intent === "Pick Up Mail or Package") {
                goto("pickupTriage");
                return;
              }
              setServiceIntent(intent);
              goto("wayfinding");
            }}
          />
        )}
        {screen === "pickupChoice" && (
          <PickupChoice
            onSelect={(intent) => {
              setServiceIntent(intent);
              goto("wayfinding");
            }}
            onBack={back}
          />
        )}
        {screen === "wayfinding" && (
          <Wayfinding
            service={serviceIntent}
            onFound={() => goto("arrived")}
            onBack={back}
          />
        )}
        {screen === "arrived" && (
          <Arrived
            service={serviceIntent}
            onWalkthrough={() => {
              if (serviceIntent === "Ship a Package") goto("shipIntro");
              else goto("thanks");
            }}
            onDone={() => goto("anythingElse")}
          />
        )}
        {screen === "shipIntro" && (
          <ShipIntro onNext={() => goto("shipStep1")} onBack={back} />
        )}
        {screen === "shipStep1" && (
          <ShipStep1 onNext={() => goto("shipStep2")} onHelp={() => setChatOpen(true)} onBack={back} />
        )}
        {screen === "shipStep2" && (
          <ShipStep2 onNext={() => goto("shipStep3")} onHelp={() => setChatOpen(true)} onBack={back} />
        )}
        {screen === "shipStep3" && (
          <ShipStep3 onNext={() => goto("shipStep4")} onMore={() => goto("shipServiceCompare")} onBack={back} />
        )}
        {screen === "shipServiceCompare" && (
          <ShipServiceCompare onBack={back} />
        )}
        {screen === "shipStep4" && (
          <ShipStep4 onNext={() => goto("shipStep5")} onHelp={() => setChatOpen(true)} onBack={back} />
        )}
        {screen === "shipStep5" && (
          <ShipStep5 onNext={() => goto("shipDone")} onBack={back} />
        )}
        {screen === "shipDrumChuteWhere" && (
          <ShipDrumChuteWhere onBack={back} />
        )}
        {screen === "shipDone" && (
          <ShipDone
            onElse={() => { restart(); setTimeout(() => setScreen("greeting"), 0); }}
            onBack={back}
          />
        )}

        {/* Drop Off a Prepaid Package */}

        {/* Quick Check screening (Ship + Drop Off only) */}
        {screen === "quickCheck" && (
          <QuickCheck
            onContinue={(result) => {
              if (result === "none") {
                if (pendingFlow === "drop") goto("dropIntro");
                else if (pendingFlow === "ship") goto("wayfinding");
              } else {
                setQuickCheckReason(result as "hazmat" | "oversized" | "international" | "multiple");
                goto("quickCheckRedirect");
              }
            }}
            onBack={back}
          />
        )}
        {screen === "quickCheckRedirect" && (
          <StaffedPORedirect
            reason={quickCheckReason}
            onDirections={() => goto("wayfinding")}
            onBack={back}
          />
        )}

        {screen === "dropIntro" && (
          <DropIntro onNext={() => goto("dropFindAPD")} onBack={back} />
        )}
        {screen === "dropFindAPD" && (
          <DropFindAPD onNext={() => goto("dropStep1")} onHelp={() => setChatOpen(true)} onBack={back} />
        )}
        {screen === "dropStep1" && (
          <DropStep1 onNext={() => goto("dropStep2")} onHelp={() => setChatOpen(true)} onBack={back} />
        )}
        {screen === "dropStep2" && (
          <DropStep2 onNext={() => goto("dropStep3")} onTooBig={() => goto("dropTooBig")} onBack={back} />
        )}
        {screen === "dropTooBig" && (
          <DropTooBigRedirect onDirections={() => goto("wayfinding")} onBack={back} />
        )}
        {screen === "dropStep3" && (
          <DropStep3 onNext={() => goto("dropDone")} onReport={() => goto("dropReceiptIssue")} onBack={back} />
        )}
        {screen === "dropReceiptIssue" && (
          <DropReceiptIssue
            onTrack={() => setChatOpen(true)}
            onReport={() => goto("thanks")}
            onBack={back}
          />
        )}
        {screen === "dropDone" && (
          <DropDone
            onElse={() => { restart(); setTimeout(() => setScreen("greeting"), 0); }}
            onBack={back}
          />
        )}

        {/* Buy Stamps */}
        {screen === "stampsIntro" && (
          <StampsIntro onNext={() => goto("stampsFindSSK")} onBack={back} />
        )}
        {screen === "stampsFindSSK" && (
          <StampsFindSSK onNext={() => goto("stampsStep1")} onHelp={() => setChatOpen(true)} onBack={back} />
        )}
        {screen === "stampsStep1" && (
          <StampsStep1 onNext={() => goto("stampsStep2")} onHelp={() => setChatOpen(true)} onBack={back} />
        )}
        {screen === "stampsStep2" && (
          <StampsStep2 onNext={() => goto("stampsStep3")} onHelp={() => setChatOpen(true)} onBack={back} />
        )}
        {screen === "stampsStep3" && (
          <StampsStep3 onNext={() => goto("stampsDone")} onReport={() => goto("thanks")} onBack={back} />
        )}
        {screen === "stampsDone" && (
          <StampsDone
            onElse={() => { restart(); setTimeout(() => setScreen("greeting"), 0); }}
            onBack={back}
          />
        )}

        {/* Pick Up Mail or Package */}
        {screen === "pickupTriage" && (
          <PickupTriage
            onPackage={() => goto("pkgFindLockers")}
            onPOBox={() => goto("poBoxFind")}
            onHeld={() => goto("heldMailRedirect")}
            onBack={back}
          />
        )}
        {screen === "pkgFindLockers" && (
          <PkgFindLockers onNext={() => goto("pkgEnterCode")} onHelp={() => setChatOpen(true)} onBack={back} />
        )}
        {screen === "pkgEnterCode" && (
          <PkgEnterCode onNext={() => goto("pkgDone")} onHelp={() => setChatOpen(true)} onBack={back} />
        )}
        {screen === "pkgDone" && (
          <PkgDone
            onElse={() => { restart(); setTimeout(() => setScreen("greeting"), 0); }}
            onBack={back}
          />
        )}
        {screen === "poBoxFind" && (
          <POBoxFind onNext={() => goto("poBoxDone")} onHelp={() => setChatOpen(true)} onBack={back} />
        )}
        {screen === "poBoxDone" && (
          <POBoxDone
            onElse={() => { restart(); setTimeout(() => setScreen("greeting"), 0); }}
            onBack={back}
          />
        )}
        {screen === "heldMailRedirect" && (
          <HeldMailRedirect
            onDirections={() => goto("wayfinding")}
            onBack={back}
          />
        )}

        {screen === "confirmLocation" && (
          <ConfirmLocation
            address={userLocation}
            onConfirm={() => goto("thanks")}
            onDeny={() => goto("addressEntry")}
          />
        )}
        {screen === "thanks" && <Thanks onNext={() => goto("status")} />}
        {screen === "status" && (
          <StatusScreen
            onNext={(equipment) => {
              if (!equipment) { goto("services"); return; }
              setProblem(equipment);
              if (equipment.includes("Drum Chute")) goto("drumChute");
              else goto("voiceProblem");
            }}
          />
        )}
        {screen === "voiceProblem" && (
          <VoiceListen
            prompt={
              problem.includes("SSK")
                ? "What's the problem with the Self-Service Kiosk? Type or speak into the mic."
                : "What's the problem? Type or speak into the mic."
            }
            onStop={(t, c) => {
              setProblemDetail(t);
              setVoiceConf(c);
              goto("submitting");
            }}
          />
        )}
        {screen === "services" && <Services onReport={() => goto("problemType")} />}
        {screen === "problemType" && (
          <ProblemType
            onPick={(p) => {
              setProblem(p);
              if (p === "Drum Chute") goto("drumChute");
              else goto("submitting");
            }}
          />
        )}
        {screen === "drumChute" && (
          <DrumChute
            onPick={(d) => {
              setProblemDetail(d);
              goto("submitting");
            }}
          />
        )}
        {screen === "submitting" && (
          <Submitting onDone={() => goto("submitted")} problem={problem} detail={problemDetail} />
        )}
        {screen === "submitted" && (
          <Submitted
            problem={problem}
            onYes={() => goto("nearest")}
            onNo={() => { restart(); setTimeout(() => setScreen("greeting"), 0); }}
          />
        )}
        {screen === "nearest" && <Nearest onNext={() => goto("anythingElse")} onHome={() => { setHistory([]); setScreen("greeting"); }} />}
        {screen === "anythingElse" && (
          <AnythingElse onAnother={() => { restart(); setTimeout(() => setScreen("greeting"), 0); }} onDone={() => { restart(); setTimeout(() => setScreen("greeting"), 0); }} />
        )}
        {screen === "csat" && (
          <Csat
            feedback={feedback}
            setFeedback={setFeedback}
            comment={comment}
            setComment={setComment}
            onSubmit={restart}
          />
        )}
        {screen === "voiceListen" && (
          <VoiceListen
            onStop={(t, c) => {
              setVoiceTranscript(t);
              setVoiceConf(c);
              const intent = classifyVoiceIntent(t);
              if (intent === "wayfinding") goto("wayfinding");
              else if (intent === "report") goto("voiceConfirm");
              else goto("voiceUnclear");
            }}
          />
        )}
        {screen === "voiceConfirm" && (
          <VoiceConfirm
            transcript={voiceTranscript}
            confidence={voiceConf}
            onConfirm={() => goto("thanks")}
            onRetry={() => goto("voiceListen")}
          />
        )}
        {screen === "voiceUnclear" && (
          <VoiceUnclear
            transcript={voiceTranscript}
            onWayfinding={() => goto("wayfinding")}
            onReport={() => goto("thanks")}
            onRetry={() => goto("voiceListen")}
          />
        )}
      </div>
      <ChatbotModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        location={userLocation}
        pageContext={ctx.label}
        suggestions={ctx.suggestions}
      />
      {showGlobalBack && (
        <button
          onClick={back}
          aria-label="Back"
          className="absolute bottom-5 left-5 z-40 h-12 px-4 rounded-full bg-white text-aiva-navy border-2 border-aiva-navy shadow-lg hover:bg-aiva-navy/5 active:scale-95 transition-all flex items-center justify-center gap-1"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-semibold">Back</span>
        </button>
      )}
      {showChatFab && (
        <button
          onClick={() => setChatOpen(true)}
          aria-label="Chat with AIVA"
          className="absolute bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-aiva-blue-deep text-white shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center ring-4 ring-white/60"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </PhoneFrame>
  );
};

/* ---------- Page context for chatbot ---------- */

function getPageContext(screen: Screen, serviceIntent: string): { label?: string; suggestions?: string[] } {
  const generic = [
    "What are the Post Office hours?",
    "How much to ship a 2 lb package?",
    "How do I track a package?",
  ];
  switch (screen) {
    case "greeting":
    case "findIntent":
      return { label: "Home — choosing a service", suggestions: generic };
    case "quickCheck":
    case "quickCheckRedirect":
      return {
        label: "Quick check — pre-shipping screening",
        suggestions: [
          "What counts as hazardous materials?",
          "Can I ship lithium batteries?",
          "What are the size limits?",
          "Where's the nearest staffed Post Office?",
        ],
      };
    case "wayfinding":
    case "arrived":
      return {
        label: `Wayfinding — ${serviceIntent || "finding equipment"}`,
        suggestions: [
          `Where is the equipment for ${serviceIntent || "this service"}?`,
          "What does the SOPO zone signage look like?",
          "How do I get help in the lobby?",
        ],
      };
    case "shipIntro":
    case "shipStep1":
    case "shipStep2":
    case "shipStep3":
    case "shipServiceCompare":
    case "shipStep4":
    case "shipStep5":
    case "shipDrumChuteWhere":
      return {
        label: "Ship a Package walkthrough",
        suggestions: [
          "What shipping service should I pick?",
          "How do I weigh my package?",
          "Where is the Drum Chute?",
          "What forms of payment does the kiosk take?",
        ],
      };
    case "dropIntro":
    case "dropFindAPD":
    case "dropStep1":
    case "dropStep2":
    case "dropStep3":
    case "dropTooBig":
    case "dropReceiptIssue":
      return {
        label: "Drop Off a Prepaid Package",
        suggestions: [
          "What if my label won't scan?",
          "What size packages fit in the APD?",
          "What if the receipt didn't print?",
          "Is my package tracked after I drop it?",
        ],
      };
    case "stampsIntro":
    case "stampsFindSSK":
    case "stampsStep1":
    case "stampsStep2":
    case "stampsStep3":
      return {
        label: "Buy Stamps at the SSK",
        suggestions: [
          "How much is a Forever stamp?",
          "Does the kiosk sell books of stamps?",
          "What designs are available?",
          "Can I pay with cash?",
        ],
      };
    case "pickupTriage":
    case "pkgFindLockers":
    case "pkgEnterCode":
      return {
        label: "Pick Up a Package",
        suggestions: [
          "Where do I find my pickup code?",
          "What if my locker won't open?",
          "How long are packages held in the locker?",
        ],
      };
    case "poBoxFind":
      return {
        label: "PO Box pickup",
        suggestions: [
          "I lost my PO Box key — what now?",
          "How do I rent a PO Box?",
          "What hours can I access my PO Box?",
        ],
      };
    case "heldMailRedirect":
      return {
        label: "Held mail redirect",
        suggestions: [
          "Why can't I pick up held mail here?",
          "What do I need to bring to a staffed Post Office?",
        ],
      };
    case "thanks":
    case "status":
    case "services":
    case "problemType":
    case "drumChute":
    case "submitting":
    case "submitted":
    case "notify":
      return {
        label: "Report a problem",
        suggestions: [
          "What kinds of problems can I report?",
          "How long will the fix take?",
          "Who gets notified about my report?",
        ],
      };
    default:
      return { suggestions: generic };
  }
}

/* ---------- Screens ---------- */

const DisclaimerScreen = ({ onContinue }: { onContinue: () => void }) => (
  <div className="flex-1 flex flex-col bg-white text-aiva-navy anim-fade-up overflow-y-auto">
    <div className="flex-1 flex flex-col justify-center px-7 py-10 gap-7">
      <img src={uspsLogo} alt="USPS" className="w-28 h-auto object-contain mx-auto" />

      <div className="space-y-3 text-center">
        <span className="inline-block text-[10px] font-bold tracking-[0.18em] uppercase text-aiva-blue-deep bg-aiva-blue-deep/10 px-3 py-1 rounded-full">
          Please note
        </span>
        <h1 className="text-[22px] font-bold leading-tight tracking-tight">
          This is a draft prototype
        </h1>
      </div>

      <div className="rounded-2xl border border-border bg-aiva-page p-5 space-y-3 text-[13px] leading-relaxed text-foreground/80">
        <p>
          This experience uses the existing flows and journey maps that the
          <span className="font-semibold text-aiva-navy"> LMI Team </span>
          has created.
        </p>
        <p>
          It is <span className="font-semibold text-aiva-navy">not a finished product</span> and
          should not be seen as the final design, content, or behavior of AIVA.
        </p>
        <p>
          The purpose is purely <span className="font-semibold text-aiva-navy">representational</span> —
          to give an idea of the end-to-end experience and to support further
          gap analysis.
        </p>
        <p className="text-foreground/60 italic">Thank you!</p>
      </div>

      <button
        onClick={onContinue}
        className="w-full inline-flex items-center justify-center gap-2 bg-aiva-blue-deep text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        I understand &middot; Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const ConsentScreen = ({ onAgree }: { onAgree: () => void }) => {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="flex-1 flex flex-col p-6 bg-white text-aiva-navy anim-fade-up overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center gap-5 py-6">
        <img src={uspsLogo} alt="USPS" className="w-32 h-auto object-contain mx-auto" />
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold tracking-tight">Before you continue</h1>
          <p className="text-[13px] text-foreground/70 leading-relaxed">
            Please review how AIVA handles your information.
          </p>
        </div>

        <div className="bg-aiva-bot-bg rounded-xl p-4 text-[12px] leading-relaxed space-y-3 text-foreground/80">
          <div>
            <div className="font-semibold text-foreground mb-1">What we collect</div>
            Your menu choices and any messages you send so AIVA can help you. If you opt in to SMS updates, we use your phone number only for that ticket.
          </div>
          <div>
            <div className="font-semibold text-foreground mb-1">Voice input</div>
            Voice is transcribed by your browser's built-in speech engine. Audio is processed on your device and is <span className="font-semibold">not recorded or stored</span> by USPS.
          </div>
          <div>
            <div className="font-semibold text-foreground mb-1">No tracking, no selling</div>
            AIVA does not sell your information or use it for advertising. This is a demo experience — no real account is created.
          </div>
        </div>

        <label className="flex items-start gap-3 text-[13px] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-aiva-blue-deep cursor-pointer"
          />
          <span className="text-foreground/80">
            I agree to the{" "}
            <span className="text-aiva-blue-deep font-semibold underline">Terms of Use</span> and{" "}
            <span className="text-aiva-blue-deep font-semibold underline">Privacy Notice</span>.
          </span>
        </label>

        <button
          onClick={onAgree}
          disabled={!agreed}
          className="w-full bg-aiva-blue-deep text-white px-6 py-3.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
        >
          Agree & Continue
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground tracking-wide text-center">
        Demo only · Not a real USPS service
      </p>
    </div>
  );
};

const QrLanding = ({ onScan }: { onScan: () => void }) => (
  <div className="flex-1 flex flex-col bg-white text-aiva-navy anim-fade-up">
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-7">
      <img
        src={uspsLogo}
        alt="USPS logo"
        className="w-44 h-auto object-contain animate-[fade-up_0.7s_ease-out]"
        style={{ animationDelay: "0.05s", animationFillMode: "both" }}
      />
      <div className="space-y-3 max-w-[280px]">
        <h1
          className="text-[26px] leading-tight font-bold tracking-tight anim-fade-up"
          style={{ animationDelay: "0.25s", animationFillMode: "both" }}
        >
          Welcome to <span className="text-aiva-blue-deep">AIVA</span>
        </h1>
        <p
          className="text-[14px] leading-relaxed text-foreground/70 anim-fade-up"
          style={{ animationDelay: "0.4s", animationFillMode: "both" }}
        >
          Your AI Virtual Assistant for Self-Operating Post Offices.
        </p>
      </div>
      <button
        onClick={onScan}
        className="group inline-flex items-center gap-2 bg-aiva-blue-deep text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all anim-fade-up"
        style={{ animationDelay: "0.55s", animationFillMode: "both" }}
      >
        Get started
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
    <div className="text-center pb-5 space-y-1.5">
      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground/70 bg-aiva-bot-bg px-2.5 py-1 rounded-full">
        <img
          src="https://cdn.britannica.com/79/4479-050-6EF87027/flag-Stars-and-Stripes-May-1-1795.jpg"
          alt="US flag"
          className="h-3 w-auto rounded-[1px] object-cover"
        />
      </div>
      <p className="text-[10px] text-muted-foreground tracking-wide">
        Demo · No real account or data needed
      </p>
    </div>
  </div>
);

const LOCATION_EQUIPMENT = [
  { name: "Self-Service Kiosk", zone: "Zone 2" },
  { name: "Drum Chute", zone: "Zone 3" },
  { name: "Automated Parcel Drop", zone: "Zone 3" },
  { name: "Mail Chute", zone: "Zone 3" },
  { name: "Parcel Lockers", zone: "Zone 4" },
  { name: "PO Boxes", zone: "Zone 4" },
];

const LocationEquipmentCard = () => {
  const [location, setLocation] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("aiva-location") || "";
  });
  const [entry, setEntry] = useState("");
  const [open, setOpen] = useState(false);

  if (!location) {
    return (
      <div className="bg-white border border-aiva-navy/15 rounded-xl p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <MapPin className="w-4 h-4 text-aiva-navy" />
          <span className="text-sm font-semibold text-aiva-navy">See equipment at your Post Office</span>
        </div>
        <p className="text-[12px] text-muted-foreground mb-2.5 leading-relaxed">
          Enter your location to view available equipment.
        </p>
        <div className="flex gap-2">
          <input
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="ZIP or city"
            className="flex-1 h-9 px-3 rounded-full border border-aiva-navy/20 text-[13px] outline-none focus:border-aiva-navy/50 bg-aiva-page"
          />
          <button
            onClick={() => {
              if (!entry.trim()) return;
              try { localStorage.setItem("aiva-location", entry.trim()); } catch {}
              setLocation(entry.trim());
            }}
            className="h-9 px-4 rounded-full bg-aiva-navy text-white text-[13px] font-semibold disabled:opacity-40"
            disabled={!entry.trim()}
          >
            View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-aiva-navy/15 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-aiva-bot-bg/40 transition"
      >
        <span className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-aiva-navy shrink-0" />
          <span className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-aiva-navy">Available services</span>
            <span className="text-[11px] text-muted-foreground truncate">SOPO near me · 8150 Leesburg Pike Ste 180B, Vienna, VA</span>
          </span>
        </span>
        <span className={`text-aiva-navy/60 transition-transform shrink-0 ml-2 ${open ? "rotate-180" : ""}`} aria-hidden>▾</span>
      </button>
      {open && (
        <ul className="px-4 pb-3 pt-0 space-y-1.5 anim-fade-up">
          {LOCATION_EQUIPMENT.map((e) => (
            <li key={e.name} className="flex items-center text-[13px]">
              <span className="text-aiva-navy">{e.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Greeting = ({
  onWayfinding, onReport, onVoice: _onVoice, location,
}: { onWayfinding: () => void; onReport: () => void; onVoice: () => void; location?: string }) => {
  const [showButtons, setShowButtons] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowButtons(true), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex-1 flex flex-col anim-slide-right min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {!showButtons ? <Typing /> : (
          <>
            <BotBubble>Hi, I'm AIVA. How can I help you today?</BotBubble>
            <div className="space-y-2 pt-2">
              <ChoiceButton onClick={onWayfinding}>
                <span className="inline-flex items-center gap-2"><MapIcon className="w-4 h-4" /> Help me find something</span>
              </ChoiceButton>
              <ChoiceButton onClick={onReport}>
                <span className="inline-flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Report a problem</span>
              </ChoiceButton>
            </div>
            <div className="pt-3">
              <LocationEquipmentCard />
            </div>
          </>
        )}
      </div>
      <InlineChat location={location} />
    </div>
  );
};

const FIND_INTENTS = [
  "Ship a Package",
  "Drop Off a Prepaid Package",
  "Buy Stamps",
  "Pick Up Mail or Package",
];

const ZONE_INFO = [
  { zone: "Zone 1", name: "Prep", desc: "Package preparation area — pack, label, and tape your items before sending." },
  { zone: "Zone 2", name: "Purchase", desc: "Self-Service Kiosk (SSK) — buy stamps, weigh and pay for shipping, print labels." },
  { zone: "Zone 3", name: "Send It", desc: "Drop-off zone — Drum Chute, Automated Parcel Drop (APD), and Mail Chute." },
  { zone: "Zone 4", name: "Pick Up", desc: "Parcel Lockers and PO Boxes — collect packages and mail." },
];

const EQUIPMENT_INFO = [
  { name: "Self-Service Kiosk (SSK)", desc: "Touchscreen kiosk for buying stamps, weighing packages, printing shipping labels, and paying — no clerk needed." },
  { name: "Drum Chute", desc: "Rotating drum drop for letters and small flat-rate packages already labeled and paid." },
  { name: "Automated Parcel Drop (APD)", desc: "Scans your prepaid label and accepts packages up to a set size — no waiting in line." },
  { name: "Mail Chute", desc: "Standard slot for letters and stamped envelopes." },
  { name: "Parcel Lockers", desc: "Secure lockers where USPS leaves packages for pickup using a key or code from your delivery notice." },
  { name: "PO Boxes", desc: "Your private locked mailbox for receiving mail at the Post Office address." },
];

const Expandable = ({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-aiva-navy/15 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-aiva-bot-bg/40 transition"
      >
        <span className="text-sm font-semibold text-aiva-navy">{label}</span>
        <span
          className={`text-aiva-navy/60 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="px-4 pb-3 pt-0 anim-fade-up">{children}</div>
      )}
    </div>
  );
};

const EquipmentGuideSheet = ({ onClose }: { onClose: () => void }) => (
  <div className="absolute inset-0 z-50 flex flex-col bg-aiva-page" role="dialog" aria-modal="true" aria-label="Equipment guide">
    <div className="flex items-start justify-between gap-4 border-b border-border bg-white/95 px-5 py-4 backdrop-blur-sm">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Resource</div>
        <h2 className="text-xl font-bold text-aiva-navy">Equipment guide</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Quick explanations of the equipment available in this Post Office.
        </p>
      </div>
      <button
        onClick={onClose}
        aria-label="Close equipment guide"
        className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-aiva-navy bg-white text-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-hide">
      {EQUIPMENT_INFO.map((equipment) => (
        <div key={equipment.name} className="rounded-2xl border border-aiva-navy/15 bg-white px-4 py-3 shadow-sm">
          <div className="text-sm font-semibold text-aiva-navy">{equipment.name}</div>
          <div className="mt-1 text-[13px] leading-relaxed text-foreground/75">{equipment.desc}</div>
        </div>
      ))}
    </div>

    <div className="border-t border-border bg-aiva-page px-5 pb-5 pt-3">
      <button
        onClick={onClose}
        className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
      >
        Done
      </button>
    </div>
  </div>
);

const FindIntent = ({ onSelect }: { onSelect: (intent: string) => void }) => {
  const [showEquipmentGuide, setShowEquipmentGuide] = useState(false);

  return (
    <div className="relative flex-1 flex flex-col anim-slide-right bg-aiva-page">
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-20 scrollbar-hide">
        <h1 className="text-xl font-bold text-aiva-navy mb-1">What would you like to do?</h1>
        <p className="text-sm text-muted-foreground mb-5">Pick a service and I'll point you to the right equipment.</p>
        <div className="space-y-2.5">
          {FIND_INTENTS.map((intent) => (
            <button
              key={intent}
              onClick={() => onSelect(intent)}
              className="w-full h-12 rounded-full font-semibold text-sm transition border-2 bg-white text-aiva-navy border-aiva-navy/20 hover:border-aiva-navy/50 hover:bg-aiva-navy hover:text-white active:scale-[0.99]"
            >
              {intent}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
            Resources
          </div>
          <div className="space-y-2">
            <Expandable label="Zones in this Post Office">
              <div className="space-y-2.5 pt-2">
                {ZONE_INFO.map((z) => (
                  <div key={z.zone} className="flex gap-3">
                    <div className="shrink-0 w-20">
                      <div className="text-[12px] font-semibold text-aiva-navy leading-tight">
                        {z.name}
                      </div>
                    </div>
                    <div className="text-[12px] text-foreground/75 leading-relaxed flex-1">
                      {z.desc}
                    </div>
                  </div>
                ))}
              </div>
            </Expandable>
            <button
              onClick={() => setShowEquipmentGuide(true)}
              className="w-full rounded-xl border border-aiva-navy/15 bg-white px-4 py-3 text-left hover:bg-aiva-bot-bg/40 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-aiva-navy">Equipment guide</div>
                  <div className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                    Open a cleaner full-screen list of the equipment in this location.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0 text-aiva-navy/60" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {showEquipmentGuide && <EquipmentGuideSheet onClose={() => setShowEquipmentGuide(false)} />}
    </div>
  );
};

const PickupChoice = ({ onSelect, onBack }: { onSelect: (intent: string) => void; onBack?: () => void }) => (
  <div className="flex-1 flex flex-col anim-slide-right bg-aiva-page">
    <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 scrollbar-hide">
      <h1 className="text-xl font-bold text-aiva-navy mb-1">What are you picking up?</h1>
      <p className="text-sm text-muted-foreground mb-5">
        I'll point you to the right equipment.
      </p>
    </div>
    <div className="px-5 pb-5 pt-2 space-y-2 shrink-0">
      <button
        onClick={() => onSelect("Pick Up a Package")}
        className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
      >
        A package
      </button>
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="shrink-0 inline-flex items-center justify-center h-12 px-4 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => onSelect("Access PO Box")}
          className="flex-1 h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
        >
          Mail from my PO Box
        </button>
      </div>
    </div>
  </div>
);

const ComposerBar = ({ onMic: _onMic }: { onMic: () => void }) => {
  const [text, setText] = useState("");
  return (
    <div className="border-t border-border bg-white p-2 shrink-0">
      <div className="flex items-end gap-2">
        <VoiceTextInput
          value={text}
          onChange={setText}
          placeholder="Type or dictate a message…"
          ariaLabel="Message"
          className="flex-1"
        />
        <button
          aria-label="Send"
          disabled={!text.trim()}
          className="w-10 h-10 rounded-full bg-aiva-blue-deep text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ConvoLayout = ({ messages, children }: { messages: ChatMsg[]; children?: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [messages, children]);
  return (
    <div ref={ref} className="flex-1 overflow-y-auto p-4 pb-20 space-y-3 scrollbar-hide anim-slide-right">
      {messages.map((m, i) =>
        m.who === "bot" ? <BotBubble key={i}>{m.text}</BotBubble> : <UserBubble key={i}>{m.text}</UserBubble>
      )}
      {children}
    </div>
  );
};

const useTypingDelay = (ms = 500) => {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return done;
};

const ConfirmLocation = ({
  address, onConfirm, onDeny,
}: { address: string; onConfirm: () => void; onDeny: () => void }) => {
  const ready = useTypingDelay(500);
  // Parse a friendly two-line address. Fall back gracefully.
  const lines = (address || "8150 Leesburg Pike, Vienna, VA 22182").split(",").map((s) => s.trim());
  const line1 = lines[0] || address;
  const line2 = lines.slice(1).join(", ");

  return (
    <ConvoLayout messages={[{ who: "bot", text: "Is this your current location?" }]}>
      {!ready ? <Typing /> : (
        <>
          <Card>
            <div className="rounded-xl overflow-hidden border border-border">
              <iframe
                title="Your location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${line1}${line2 ? ", " + line2 : ""}`)}&output=embed`}
                width="100%"
                height="170"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="flex items-start gap-3 pt-3">
              <div className="w-10 h-10 rounded-full bg-aiva-blue-deep/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-aiva-blue-deep" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-tight">{line1}</div>
                {line2 && (
                  <div className="text-xs text-muted-foreground mt-0.5">{line2}</div>
                )}
                <div className="text-[11px] text-aiva-success font-medium mt-1 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-aiva-success" /> Location detected
                </div>
              </div>
            </div>
          </Card>
          <div className="space-y-2 pt-1">
            <ChoiceButton variant="primary" onClick={onConfirm}>Yes, that's right</ChoiceButton>
            <ChoiceButton onClick={onDeny}>No, change address</ChoiceButton>
          </div>
        </>
      )}
    </ConvoLayout>
  );
};

const ARRIVED_INFO: Record<string, { equipment: string; zone: string; context: string; photo: string; alt: string; cta: string }> = {
  "Ship a Package": {
    equipment: "Self-Service Kiosk", zone: "Zone 2",
    context: "Use this to weigh, label, and pay for your package.",
    photo: sskKioskPhoto, alt: "USPS Self-Service Kiosk",
    cta: "Walk me through shipping",
  },
  "Drop Off a Prepaid Package": {
    equipment: "Automated Parcel Drop", zone: "Zone 3",
    context: "Scan your prepaid label and drop your package inside.",
    photo: apdPhoto, alt: "USPS Automated Parcel Drop",
    cta: "Walk me through dropping off",
  },
  "Buy Stamps": {
    equipment: "Self-Service Kiosk", zone: "Zone 2",
    context: "Use this to buy stamps and pay with card or contactless.",
    photo: sskKioskPhoto, alt: "USPS Self-Service Kiosk",
    cta: "Walk me through buying stamps",
  },
  "Pick Up a Package": {
    equipment: "Parcel Lockers", zone: "Zone 4",
    context: "Tap your pickup code on the screen to open your locker.",
    photo: parcelLockersPhoto, alt: "USPS Parcel Lockers",
    cta: "Walk me through pickup",
  },
  "Access PO Box": {
    equipment: "PO Box Wall", zone: "Zone 4",
    context: "Use your PO Box key or combination to retrieve your mail.",
    photo: parcelLockersPhoto, alt: "USPS PO Boxes",
    cta: "Walk me through PO Box access",
  },
};

const Arrived = ({ service, onWalkthrough, onDone }: { service?: string; onWalkthrough: () => void; onDone: () => void }) => {
  const info = (service && ARRIVED_INFO[service]) || ARRIVED_INFO["Ship a Package"];
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-aiva-page anim-slide-right">
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 scrollbar-hide">
        <h1 className="text-xl font-bold text-aiva-navy mb-1">{info.equipment}</h1>
        <p className="text-sm text-muted-foreground mb-4">
          {info.context}
        </p>

        <div className="rounded-2xl overflow-hidden bg-white border border-border shadow-sm">
          <img
            src={info.photo}
            alt={info.alt}
            loading="lazy"
            className="w-full h-auto object-cover block"
          />
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 space-y-2 shrink-0 bg-aiva-page">
        <button
          onClick={onWalkthrough}
          className="w-full h-12 rounded-full bg-aiva-navy text-white font-semibold text-sm hover:bg-aiva-navy/90 transition active:scale-[0.99]"
        >
          {info.cta}
        </button>
        <button
          onClick={onDone}
          className="w-full h-12 rounded-full bg-white text-aiva-navy font-semibold text-sm border-2 border-aiva-navy hover:bg-aiva-navy/5 transition active:scale-[0.99]"
        >
          I'm good, thanks
        </button>
      </div>
    </div>
  );

};

const Thanks = ({ onNext }: { onNext: () => void }) => {
  const ready = useTypingDelay(450);
  useEffect(() => { if (ready) { const t = setTimeout(onNext, 700); return () => clearTimeout(t); } }, [ready, onNext]);
  return (
    <ConvoLayout
      messages={[
        { who: "user", text: "Yes, confirm location" },
        ...(ready ? [{ who: "bot" as const, text: "Thanks for confirming." }] : []),
      ]}
    >
      {!ready && <Typing />}
    </ConvoLayout>
  );
};

const EQUIP_STATUS = [
  { name: "Self-Service Kiosk (SSK)", ok: true },
  { name: "Drum Chute", ok: true },
  { name: "Automated Parcel Drop (APD)", ok: true },
  { name: "Parcel Lockers", ok: true },
  { name: "Mail Chute", ok: true },
  { name: "PO Boxes", ok: true },
];

const StatusScreen = ({ onNext }: { onNext: (equipment?: string) => void }) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "Here's the current status of your location. Select the equipment you're having an issue with." }]}>
      {!ready ? <Typing /> : (
        <Card>
          <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Equipment at this SOPO</div>
          <ul className="grid grid-cols-2 gap-2.5">
            {EQUIP_STATUS.map((e) => {
              const photo = EQUIPMENT_PHOTOS[e.name];
              const src = photo ? photo.photo : photoUnavailableImg;
              const alt = photo ? photo.alt : "Photo unavailable";
              return (
                <li key={e.name}>
                  <button
                    onClick={() => onNext(e.name)}
                    className="w-full flex flex-col rounded-xl border border-border bg-white overflow-hidden hover:border-aiva-navy/40 active:scale-[0.99] transition text-left"
                  >
                    <img
                      src={src}
                      alt={alt}
                      loading="lazy"
                      className="w-full aspect-[4/3] object-cover block"
                    />
                    <span className="px-2.5 py-2 text-[13px] font-medium text-aiva-navy leading-tight">
                      {e.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </ConvoLayout>
  );
};

const Services = ({ onReport }: { onReport: () => void }) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "What services can I help with today?" }]}>
      {!ready ? <Typing /> : <ChoiceButton variant="primary" onClick={onReport}>Report a Problem</ChoiceButton>}
    </ConvoLayout>
  );
};

const PROBLEMS = ["Self-Service Kiosk (SSK)", "Drum Chute", "Automated Parcel Drop (APD)", "Parcel Lockers", "Mail Chute", "Something else"];
const ProblemType = ({ onPick }: { onPick: (p: string) => void }) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "What kind of problem are you having?" }]}>
      {!ready ? <Typing /> : (
        <div className="space-y-2">
          {PROBLEMS.map((p) => {
            const photo = EQUIPMENT_PHOTOS[p];
            if (p === "Something else") {
              return <ChoiceButton key={p} onClick={() => onPick(p)}>{p}</ChoiceButton>;
            }
            return (
              <button
                key={p}
                onClick={() => onPick(p)}
                className="w-full flex items-center gap-3 bg-white border border-border rounded-xl p-2.5 text-left hover:border-aiva-navy/40 active:scale-[0.99] transition"
              >
                {photo ? (
                  <img
                    src={photo.photo}
                    alt={photo.alt}
                    loading="lazy"
                    className="w-14 h-14 rounded-lg object-cover border border-border shrink-0"
                  />
                ) : (
                  <img
                    src={photoUnavailableImg}
                    alt="Photo unavailable"
                    loading="lazy"
                    className="w-14 h-14 rounded-lg object-cover border border-border shrink-0"
                  />
                )}
                <span className="flex-1 text-sm font-semibold text-aiva-navy">{p}</span>
              </button>
            );
          })}
        </div>
      )}
    </ConvoLayout>
  );
};

const DRUM = ["It's full", "It's jammed", "Won't open", "Something else"];
const DrumChute = ({ onPick }: { onPick: (d: string) => void }) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout
      messages={[
        { who: "user", text: "Drum Chute" },
        ...(ready ? [{ who: "bot" as const, text: "Got it, the Drum Chute. What's happening with it?" }] : []),
      ]}
    >
      {!ready ? <Typing /> : (
        <div className="space-y-2">
          {DRUM.map((d) => (
            <ChoiceButton key={d} onClick={() => onPick(d)}>{d}</ChoiceButton>
          ))}
        </div>
      )}
    </ConvoLayout>
  );
};

const Submitting = ({ onDone, problem, detail }: { onDone: () => void; problem: string; detail: string }) => {
  useEffect(() => { const t = setTimeout(onDone, 1800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 anim-fade-up">
      <Loader2 className="w-12 h-12 text-aiva-blue animate-spin" />
      <div className="text-base font-semibold">Submitting your report…</div>
      <div className="text-xs text-muted-foreground text-center">
        {problem}{detail ? ` · ${detail}` : ""}
      </div>
    </div>
  );
};

const Submitted = ({
  onYes,
  onNo,
  problem,
}: {
  onYes: () => void;
  onNo: () => void;
  problem?: string;
}) => {
  const ready = useTypingDelay(700);
  // Strip parenthetical abbreviation, e.g. "Self-Service Kiosk (SSK)" -> "Self-Service Kiosk"
  const cleaned = (problem || "").replace(/\s*\(.*?\)\s*/g, "").trim();
  const equipmentLabel = cleaned && cleaned.toLowerCase() !== "something else"
    ? `the ${cleaned}`
    : "the issue you reported";
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3 scrollbar-hide anim-slide-right">
      <div className="flex flex-col items-center gap-2 pt-4 anim-fade-up">
        <div className="w-16 h-16 rounded-full bg-aiva-navy/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-aiva-navy" />
        </div>
        <div className="font-semibold text-base">Report submitted</div>
      </div>
      <Card>
        <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-1">What happens next</div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          The local post office has been notified about {equipmentLabel}. You don't need to do anything else — your report is in the queue.
        </p>
      </Card>
      {!ready ? <Typing /> : (
        <>
          <BotBubble>Do you still need to drop off your package? If so, we can send you to the nearest post office.</BotBubble>
          <div className="space-y-2">
            <ChoiceButton variant="primary" onClick={onYes}>Yes</ChoiceButton>
            <ChoiceButton onClick={onNo}>No</ChoiceButton>
          </div>
        </>
      )}
    </div>
  );
};

const Notify = ({ onYes, onNo }: { onYes: () => void; onNo: () => void }) => {
  const ready = useTypingDelay(450);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "Do you still need to drop off your package? If so, we can send you to the nearest post office." }]}>
      {!ready ? <Typing /> : (
        <div className="space-y-2">
          <ChoiceButton variant="primary" onClick={onYes}>Yes</ChoiceButton>
          <ChoiceButton onClick={onNo}>No</ChoiceButton>
        </div>
      )}
    </ConvoLayout>
  );
};

const SmsOptIn = ({ phone, setPhone, onSend }: { phone: string; setPhone: (s: string) => void; onSend: () => void }) => (
 <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3 scrollbar-hide anim-slide-right">
    <BotBubble>Enter a mobile number and we'll text you when it's fixed.</BotBubble>
    <Card>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mobile number</label>
      <div className="flex items-center gap-2 mt-2 border border-border rounded-lg px-3 py-2">
        <Smartphone className="w-4 h-4 text-muted-foreground" />
        <input
          type="tel"
          inputMode="tel"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">Number used once, not stored.</p>
    </Card>
    <ChoiceButton variant="primary" onClick={onSend}>Send</ChoiceButton>
  </div>
);

const SmsSent = ({ onNext }: { onNext: () => void }) => {
  const ready = useTypingDelay(700);
  useEffect(() => { if (ready) { const t = setTimeout(onNext, 900); return () => clearTimeout(t); } }, [ready, onNext]);
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 anim-fade-up">
      <CheckCircle2 className="w-12 h-12 text-aiva-success" />
      <div className="font-semibold">You're all set</div>
      <div className="text-sm text-muted-foreground text-center">We'll text you when the issue is resolved.</div>
    </div>
  );
};

const Directions = ({ onYes, onNo }: { onYes: () => void; onNo: () => void }) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "Want directions to the nearest staffed post office?" }]}>
      {!ready ? <Typing /> : (
        <div className="space-y-2">
          <ChoiceButton variant="primary" onClick={onYes}>Yes</ChoiceButton>
          <ChoiceButton onClick={onNo}>No</ChoiceButton>
        </div>
      )}
    </ConvoLayout>
  );
};

const Nearest = ({ onNext, onHome }: { onNext: () => void; onHome?: () => void }) => {
  // Hard-coded nearest post office
  const PO = {
    name: "Merrifield Post Office",
    address: "8409 Lee Hwy",
    city: "Merrifield, VA 22116",
    hours: "9 AM – 8 PM",
    driveMinutes: 8,
    miles: 3.2,
  };
  const fullAddress = `${PO.address}, ${PO.city}`;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

  const [step, setStep] = useState<"info" | "askText" | "phone" | "sent">("info");
  const [phone, setPhone] = useState("");

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3 scrollbar-hide anim-slide-right">
      <BotBubble>Here's the nearest staffed post office.</BotBubble>
      <Card>
        <div>
          <div className="font-semibold text-sm">{PO.name}</div>
          <div className="text-xs text-muted-foreground">{PO.address}</div>
          <div className="text-xs text-muted-foreground">{PO.city}</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-xl bg-aiva-bot-bg px-2.5 py-2">
            <div className="text-muted-foreground uppercase tracking-wide text-[9px] font-semibold">Drive</div>
            <div className="font-semibold text-foreground mt-0.5">{PO.driveMinutes} min · {PO.miles} mi</div>
          </div>
          <div className="rounded-xl bg-aiva-bot-bg px-2.5 py-2">
            <div className="text-muted-foreground uppercase tracking-wide text-[9px] font-semibold">Open today</div>
            <div className="font-semibold text-aiva-success mt-0.5">{PO.hours}</div>
          </div>
        </div>
        <div className="mt-3 rounded-xl overflow-hidden border border-border">
          <iframe
            title="Map to Merrifield Post Office"
            src={embedUrl}
            width="100%"
            height="180"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Card>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 bg-aiva-blue-deep text-white px-4 py-3 rounded-full font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition"
      >
        <Navigation className="w-4 h-4" /> Get directions
      </a>

      {step === "info" && (
        <button
          onClick={() => setStep("askText")}
          className="w-full text-center text-aiva-navy text-sm font-semibold underline underline-offset-4 py-2 hover:opacity-80 transition"
        >
          Text me the address instead
        </button>
      )}

      {step === "askText" && (
        <>
          <BotBubble>Would you like a text with the address?</BotBubble>
          <div className="space-y-2">
            <ChoiceButton variant="primary" onClick={() => setStep("phone")}>Yes, text it to me</ChoiceButton>
            <ChoiceButton onClick={onNext}>Skip</ChoiceButton>
          </div>
        </>
      )}

      {step === "phone" && (
        <Card>
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mobile number</label>
          <div className="flex items-center gap-2 mt-2 border border-border rounded-lg px-3 py-2">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              inputMode="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Number used once, not stored.</p>
          <div className="mt-3">
            <ChoiceButton variant="primary" onClick={() => setStep("sent")}>Send</ChoiceButton>
          </div>
        </Card>
      )}

      {step === "sent" && (
        <>
          <div className="flex items-center gap-2 bg-white border border-border text-aiva-navy rounded-xl p-3 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-aiva-navy" />
            Address sent to your phone.
          </div>
          <ChoiceButton variant="primary" onClick={onNext}>Continue</ChoiceButton>
        </>
      )}
    </div>
  );
};

const AnythingElse = ({ onAnother }: { onAnother: () => void; onDone?: () => void }) => {
  const ready = useTypingDelay(450);
  return (
    <ConvoLayout messages={[{ who: "bot", text: "Is there anything else I can help you with?" }]}>
      {!ready ? <Typing /> : (
        <ChoiceButton variant="primary" onClick={onAnother}>Yes, help me with something else</ChoiceButton>
      )}
    </ConvoLayout>
  );
};

const Csat = ({
  feedback, setFeedback, comment, setComment, onSubmit,
}: {
  feedback: "up" | "down" | null;
  setFeedback: (f: "up" | "down") => void;
  comment: string;
  setComment: (s: string) => void;
  onSubmit: () => void;
}) => (
  <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-4 scrollbar-hide anim-slide-right">
    <div className="text-center pt-2">
      <h2 className="font-semibold text-lg">How was this experience?</h2>
      <p className="text-sm text-muted-foreground mt-1">Your feedback helps us improve AIVA.</p>
    </div>
    <div className="flex gap-3 justify-center pt-2">
      {(["up", "down"] as const).map((v) => {
        const Icon = v === "up" ? ThumbsUp : ThumbsDown;
        const active = feedback === v;
        return (
          <button
            key={v}
            onClick={() => setFeedback(v)}
            className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition ${
              active ? "border-aiva-blue-deep bg-aiva-blue-deep/10 text-aiva-blue-deep" : "border-border text-muted-foreground"
            }`}
            aria-label={v === "up" ? "Thumbs up" : "Thumbs down"}
          >
            <Icon className="w-8 h-8" />
          </button>
        );
      })}
    </div>
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Add a comment (optional)
      </label>
      <div className="mt-2">
        <VoiceTextInput
          value={comment}
          onChange={setComment}
          placeholder="Tell us more — type or dictate…"
          ariaLabel="Comment"
          multiline
          rows={3}
        />
      </div>
    </div>
    <ChoiceButton variant="primary" onClick={onSubmit}>Submit feedback</ChoiceButton>
  </div>
);

/* ------- Voice ------- */

type VoiceIntent = "wayfinding" | "report" | "unclear";

const classifyVoiceIntent = (raw: string): VoiceIntent => {
  const t = (raw || "").toLowerCase().trim();
  if (!t) return "unclear";

  const wayfindingKeywords = [
    "find", "where", "locate", "location", "directions", "direction",
    "show me", "help me find", "look for", "looking for",
    "drop off", "drop-off", "mailbox", "drop box", "kiosk",
    "stamps", "stamp machine", "package", "packages", "parcel",
    "scale", "weigh", "po box", "p.o. box", "pickup", "pick up",
    "hours", "open", "closed", "wayfinding", "navigate",
  ];
  const reportKeywords = [
    "report", "problem", "issue", "broken", "not working", "doesn't work",
    "doesnt work", "isn't working", "isnt working", "stuck", "jam", "jammed",
    "error", "complaint", "complain", "bug", "fix", "out of order",
    "malfunction", "trouble", "help with", "something wrong", "not functioning",
  ];

  if (wayfindingKeywords.some((k) => t.includes(k))) return "wayfinding";
  if (reportKeywords.some((k) => t.includes(k))) return "report";
  return "unclear";
};

const VoiceUnclear = ({
  transcript, onWayfinding, onReport, onRetry,
}: {
  transcript: string;
  onWayfinding: () => void;
  onReport: () => void;
  onRetry: () => void;
}) => {
  const ready = useTypingDelay(500);
  return (
    <ConvoLayout
      messages={[
        { who: "user", text: transcript || "(no audio)" },
        ...(ready
          ? [{
              who: "bot" as const,
              text: `Sorry, I didn't quite catch that as one of my options. I can help you with two things — would you like to find something, or report a problem?`,
            }]
          : []),
      ]}
    >
      {!ready ? <Typing /> : (
        <>
          <ChoiceButton variant="primary" onClick={onWayfinding}>
            <span className="inline-flex items-center gap-2"><MapIcon className="w-4 h-4" /> Help me find something</span>
          </ChoiceButton>
          <ChoiceButton onClick={onReport}>
            <span className="inline-flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Report a problem</span>
          </ChoiceButton>
          <ChoiceButton onClick={onRetry}>
            <span className="inline-flex items-center gap-2"><Mic className="w-4 h-4" /> Try voice again</span>
          </ChoiceButton>
        </>
      )}
    </ConvoLayout>
  );
};


const VoiceListen = ({ onStop, prompt }: { onStop: (transcript: string, conf: number) => void; prompt?: string }) => {
  const [supported, setSupported] = useState<boolean>(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");
  const [showExplainer, setShowExplainer] = useState(false);
  const recRef = useRef<any>(null);
  const finalRef = useRef<string>("");
  const interimRef = useRef<string>("");

  // Detect support on mount but DO NOT auto-start (gesture required)
  useEffect(() => {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!Ctor);
    return () => {
      try { recRef.current?.stop(); } catch {}
    };
  }, []);

  // Synchronous start inside the click handler — preserves the gesture chain
  const startListening = () => {
    setError(null);
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) { setSupported(false); return; }
    if (listening) return;

    try {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (e: any) => {
        let interimText = "";
        let conf = 0;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) {
            finalRef.current += r[0].transcript + " ";
            conf = Math.max(conf, r[0].confidence || 0.9);
          } else {
            interimText += r[0].transcript;
          }
        }
        setTranscript(finalRef.current.trim());
        interimRef.current = interimText;
        setInterim(interimText);
        if (conf) setConfidence(conf);
      };
      rec.onerror = (e: any) => {
        if (e.error === "no-speech") return; // keep listening
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setError("Microphone permission was denied. Please allow access in your browser.");
        } else {
          setError(`Mic error: ${e.error}`);
        }
        setListening(false);
      };
      rec.onend = () => {
        setListening(false);
        const final = (finalRef.current + " " + interimRef.current).trim();
        if (final) {
          setManualText((prev) => (prev ? prev.trimEnd() + " " : "") + final);
          finalRef.current = "";
          interimRef.current = "";
          setTranscript("");
          setInterim("");
        }
      };

      finalRef.current = "";
      setTranscript("");
      setInterim("");
      setConfidence(0);
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch (err: any) {
      setError(err?.message || "Could not start microphone.");
      setListening(false);
    }
  };

  const onMicTap = async () => {
    if (!hasSeenMicExplainer()) {
      setShowExplainer(true);
      return;
    }
    const ok = await ensureMicPermission();
    if (!ok) {
      setError("Microphone permission denied. Enable it in your browser settings to use voice.");
      return;
    }
    startListening();
  };

  const onExplainerAllow = async () => {
    markMicExplainerSeen();
    setShowExplainer(false);
    const ok = await ensureMicPermission();
    if (!ok) {
      setError("Microphone permission denied. Enable it in your browser settings to use voice.");
      return;
    }
    startListening();
  };

  const stopAndContinue = () => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
    const final = (finalRef.current + " " + interim).trim();
    onStop(final || transcript || "I'd like to report a problem", confidence || 0.92);
  };

  if (!supported) {
    return (
      <div className="flex-1 flex flex-col p-5 gap-4 anim-fade-up">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-sm">
          Voice input isn't supported in this browser. Try Chrome or Safari, or type below.
        </div>
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          rows={4}
          placeholder="Type your problem here…"
          className="w-full border border-border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-aiva-blue/40 resize-none"
        />
        <ChoiceButton variant="primary" onClick={() => onStop(manualText || "I'd like to report a problem", 1)}>
          Continue
        </ChoiceButton>
      </div>
    );
  }

  const liveText = (transcript + (interim ? " " + interim : "")).trim();

  return (
    <div className="flex-1 flex flex-col gap-4 p-5 bg-gradient-to-b from-white to-aiva-page anim-fade-up overflow-y-auto">
      {prompt && (
        <div className="text-sm font-semibold text-foreground px-1">{prompt}</div>
      )}

      {/* Primary: type your problem */}
      <div className="w-full space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Describe the problem
        </label>
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          rows={5}
          placeholder="Type your problem here…"
          className="w-full border border-border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-aiva-blue/40 resize-none bg-white"
        />
        <ChoiceButton
          variant="primary"
          onClick={() => {
            const text = manualText.trim() || transcript.trim();
            if (!text) return;
            onStop(text, 1);
          }}
        >
          Submit
        </ChoiceButton>
      </div>

      {/* Secondary: voice to text */}
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground pt-1">
        <div className="flex-1 h-px bg-border" />
        <span>or use voice to text</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex items-center gap-3">
        {!listening ? (
          <button
            onClick={onMicTap}
            className="w-12 h-12 rounded-full bg-aiva-blue-deep text-white flex items-center justify-center shadow active:scale-95 transition shrink-0"
            aria-label="Start recording"
          >
            <Mic className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => {
              try { recRef.current?.stop(); } catch {}
              setListening(false);
              const final = (finalRef.current + " " + interimRef.current).trim();
              if (final) {
                setManualText((prev) => (prev ? prev.trimEnd() + " " : "") + final);
                finalRef.current = "";
                interimRef.current = "";
                setTranscript("");
                setInterim("");
              }
            }}
            className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow active:scale-95 transition shrink-0"
            aria-label="Stop recording"
          >
            <Square className="w-5 h-5" fill="white" />
          </button>
        )}
        <div className="flex-1 text-xs text-muted-foreground">
          {listening
            ? "Listening… tap stop to insert your speech into the text box."
            : "Tap the mic to dictate. Your words will fill the text box above."}
        </div>
      </div>

      {listening && liveText && (
        <div className="w-full bg-aiva-bot-bg rounded-xl p-3 text-sm">
          <span className="text-foreground">{transcript}</span>
          {interim && <span className="text-muted-foreground italic"> {interim}</span>}
        </div>
      )}

      <div className="w-full flex items-start gap-2 text-[11px] text-muted-foreground bg-aiva-bot-bg/60 border border-border rounded-lg px-3 py-2">
        <Lock aria-hidden className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
        <span>
          Voice is transcribed by your browser. Audio isn't recorded or sent to USPS — only the text you confirm is shared.
        </span>
      </div>

      {error && (
        <div className="w-full bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs">{error}</div>
      )}

      <MicPermissionExplainer
        open={showExplainer}
        onAllow={onExplainerAllow}
        onCancel={() => setShowExplainer(false)}
      />
    </div>
  );
};

const VoiceConfirm = ({
  transcript, confidence, onConfirm, onRetry,
}: { transcript: string; confidence: number; onConfirm: () => void; onRetry: () => void }) => {
  const ready = useTypingDelay(500);
  const pct = Math.round((confidence || 0.92) * 100);
  return (
    <ConvoLayout
      messages={[
        { who: "user", text: transcript || "(no audio)" },
        ...(ready ? [{ who: "bot" as const, text: `I heard: "${transcript}" — does that sound right?` }] : []),
      ]}
    >
      {!ready ? <Typing /> : (
        <>
          <Card>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground inline-flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Confidence</span>
              <span className="font-semibold text-aiva-blue-deep">{pct}%</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-aiva-blue-deep rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </Card>
          <ChoiceButton variant="primary" onClick={onConfirm}>Yes, that's right</ChoiceButton>
          <ChoiceButton onClick={onRetry}>Let me try again</ChoiceButton>
        </>
      )}
    </ConvoLayout>
  );
};

/* ------- Location permission & manual address ------- */

const LocationPermission = ({
  onGranted, onDenied,
}: { onGranted: (address: string) => void; onDenied: () => void }) => {
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Location services aren't available in this browser.");
      onDenied();
      return;
    }
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let friendly = "";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            { headers: { "Accept": "application/json" } },
          );
          if (res.ok) {
            const data = await res.json();
            const a = data.address || {};
            const street = [a.house_number, a.road].filter(Boolean).join(" ");
            const city = a.city || a.town || a.village || a.hamlet || a.suburb || "";
            const state = a.state || "";
            const postcode = a.postcode || "";
            const cityLine = [city, [state, postcode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
            friendly = [street, cityLine].filter(Boolean).join(", ") || data.display_name || "";
          }
        } catch {
          // ignore — fall through to coordinate fallback
        }
        if (!friendly) {
          friendly = `Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`;
        }
        setRequesting(false);
        onGranted(friendly);
      },
      (err) => {
        setRequesting(false);
        if (err.code === err.PERMISSION_DENIED) {
          onDenied();
        } else {
          setError("We couldn't get your location. You can enter it manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-white text-aiva-navy anim-fade-up overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center gap-5 py-6">
        <div className="w-20 h-20 rounded-full bg-aiva-blue-deep/10 flex items-center justify-center mx-auto">
          <Navigation className="w-10 h-10 text-aiva-blue-deep" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold tracking-tight">Share your location</h1>
          <p className="text-[13px] text-foreground/70 leading-relaxed max-w-[280px] mx-auto">
            AIVA uses your location to find the nearest Self-Operating Post Office and route you to it.
          </p>
        </div>

        <div className="bg-aiva-bot-bg rounded-xl p-4 text-[12px] leading-relaxed space-y-2 text-foreground/80">
          <div className="flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-aiva-blue-deep" />
            <span>
              Your location is used only for this session. It's never stored on our servers or shared with third parties.
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs">{error}</div>
        )}

        <div className="space-y-2">
          <button
            onClick={requestLocation}
            disabled={requesting}
            className="w-full bg-aiva-blue-deep text-white px-6 py-3.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {requesting ? "Requesting…" : "Allow location access"}
          </button>
          <button
            onClick={onDenied}
            className="w-full bg-white border border-border text-foreground px-6 py-3 rounded-full font-medium text-sm hover:bg-aiva-bot-bg transition"
          >
            Enter address manually
          </button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground tracking-wide text-center">
        Demo only · Not a real USPS service
      </p>
    </div>
  );
};

const AddressEntry = ({ onSubmit }: { onSubmit: (address: string) => void }) => {
  const [address, setAddress] = useState("");
  const valid = address.trim().length >= 4;
  return (
    <div className="flex-1 flex flex-col p-6 bg-white text-aiva-navy anim-fade-up overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center gap-5 py-6">
        <div className="w-20 h-20 rounded-full bg-aiva-blue-deep/10 flex items-center justify-center mx-auto">
          <MapPin className="w-10 h-10 text-aiva-blue-deep" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold tracking-tight">Enter your address</h1>
          <p className="text-[13px] text-foreground/70 leading-relaxed max-w-[280px] mx-auto">
            Type or dictate your address so AIVA can find the right Self-Operating Post Office for you.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Street address
          </label>
          <VoiceTextInput
            value={address}
            onChange={setAddress}
            placeholder="e.g. 8150 Leesburg Pike, Vienna VA"
            ariaLabel="Address"
          />
        </div>

        <button
          onClick={() => onSubmit(address.trim())}
          disabled={!valid}
          className="w-full bg-aiva-blue-deep text-white px-6 py-3.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
        >
          Continue
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground tracking-wide text-center">
        Demo only · Not a real USPS service
      </p>
    </div>
  );
};

const ConfirmInitialLocation = ({
  address, onConfirm, onChange,
}: { address: string; onConfirm: () => void; onChange: () => void }) => {
  const lines = (address || "").split(",").map((s) => s.trim()).filter(Boolean);
  const line1 = lines[0] || address || "Detected location";
  const line2 = lines.slice(1).join(", ");

  return (
    <div className="flex-1 flex flex-col p-6 bg-white text-aiva-navy anim-fade-up overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center gap-5 py-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold tracking-tight">Confirm your location</h1>
          <p className="text-[13px] text-foreground/70 leading-relaxed max-w-[280px] mx-auto">
            We detected the location below. Is this where you are right now?
          </p>
        </div>

        <Card>
          <div className="rounded-xl overflow-hidden border border-border">
            <iframe
              title="Detected location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${line1}${line2 ? ", " + line2 : ""}`)}&output=embed`}
              width="100%"
              height="170"
              style={{ border: 0, display: "block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex items-start gap-3 pt-3">
            <div className="w-10 h-10 rounded-full bg-aiva-blue-deep/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-aiva-blue-deep" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight break-words">{line1}</div>
              {line2 && (
                <div className="text-xs text-muted-foreground mt-0.5">{line2}</div>
              )}
              <div className="text-[11px] text-aiva-success font-medium mt-1 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-aiva-success" /> Location detected
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-2 pt-1">
          <button
            onClick={onConfirm}
            className="w-full bg-aiva-blue-deep text-white px-6 py-3.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Yes, that's right
          </button>
          <button
            onClick={onChange}
            className="w-full bg-white border border-border text-foreground px-6 py-3 rounded-full font-medium text-sm hover:bg-aiva-bot-bg transition"
          >
            No, enter address manually
          </button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground tracking-wide text-center">
        Demo only · Not a real USPS service
      </p>
    </div>
  );
};
