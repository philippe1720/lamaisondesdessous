import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// React 19 owns metadata after startup; remove the build-time copies first.
document.head.querySelectorAll('[data-seo-prerender="true"]').forEach(tag => tag.remove());

createRoot(document.getElementById("root")!).render(<App />);
