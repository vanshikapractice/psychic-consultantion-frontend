import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/ui.css";
import "./styles/app.css";
import App from "./App.tsx";
import "./api";

function syncDarkMode() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const update = () => {
    document.documentElement.classList.toggle("dark", prefersDark.matches);
  };

  update();
  prefersDark.addEventListener("change", update);
  return () => prefersDark.removeEventListener("change", update);
}

function ThemeSync() {
  useEffect(syncDarkMode, []);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeSync />
    <App />
  </StrictMode>
);
