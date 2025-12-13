import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header";
import Menu from "./components/Menu";
import SlideMenu from "./components/SlideMenu";
import styles from "./App.module.scss";

import Main from "./pages/Main";
import Schedule from "./pages/Schedule";
import Calendar from "./pages/Calendar";
import Welcome from "./pages/Welcome";
import { useProfileSetup } from "./hooks/useProfileSetup";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { profileSetup } = useProfileSetup();

  if (!profileSetup) {
    return (
      <Welcome />
    )
  }

  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Header onOpenMenu={() => setMenuOpen(true)} />

        <div className={styles.app__page}>
          <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </div>

        <Menu />

        <SlideMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      </div>

    </BrowserRouter>
  );
}