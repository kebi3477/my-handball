import React from "react";
import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import App from "./App";
import { useTheme } from "./hooks/useTheme";
import "./assets/styles/globals.scss";

function ThemeGate({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <ThemeGate>
        <App />
      </ThemeGate>
    </RecoilRoot>
  </React.StrictMode>
);
