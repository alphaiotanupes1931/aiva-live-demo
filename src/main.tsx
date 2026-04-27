import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import uspsLogo from "@/assets/usps-logo.png";

// Preload the USPS logo so it's cached before the chat renders avatars
const preloadLink = document.createElement("link");
preloadLink.rel = "preload";
preloadLink.as = "image";
preloadLink.href = uspsLogo;
document.head.appendChild(preloadLink);

createRoot(document.getElementById("root")!).render(<App />);
