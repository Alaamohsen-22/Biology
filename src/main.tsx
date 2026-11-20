import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./classroom/classroom.css";
import "./classroom/laboratory.css";
import "./nutrition/nutrition.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
if (
  import.meta.env.PROD &&
  import.meta.env.BASE_URL === "/Biology/" &&
  "serviceWorker" in navigator
) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
      })
      .catch(() => {
        /* Core online experience remains available. */
      });
  });
}
