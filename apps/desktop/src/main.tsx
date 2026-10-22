import "@halianza/shared/tokens.css";
import "./styles/global.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { initTheme } from "@halianza/shared/theme";
import App from "./App";

// Aplica o tema antes da primeira renderização, para evitar um flash de cor.
initTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
