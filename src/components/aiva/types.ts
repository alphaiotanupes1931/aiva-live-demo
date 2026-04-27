export type Screen =
  | "qr"
  | "greeting"
  | "wayfinding"
  | "report-confirmLocation"
  | "report-thanks"
  | "report-status"
  | "report-services"
  | "report-problemType"
  | "report-drumChute"
  | "report-submitting"
  | "report-submitted"
  | "report-notify"
  | "report-sms"
  | "report-smsSent"
  | "report-directions"
  | "report-nearest"
  | "report-anythingElse"
  | "report-csat"
  | "voice-listening"
  | "voice-confirm";

export type Msg =
  | { kind: "bot"; text: string }
  | { kind: "user"; text: string };
