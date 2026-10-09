import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App";
import "./index.css";

try {
  const t = localStorage.getItem("theme");
  if (t) document.documentElement.dataset.theme = t;
} catch {
  /* storage unavailable */
}

createRoot(document.getElementById("root")!).render(
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>,
);
