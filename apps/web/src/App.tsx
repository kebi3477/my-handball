import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SlideMenu from "./components/SlideMenu";
import styles from "./App.module.scss";

import Main from "./pages/Main";
import Schedule from "./pages/Schedule";
import Calendar from "./pages/Calendar";
import Welcome from "./pages/Welcome";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Welcome />
  )

  return (
    <BrowserRouter>
      <div className={styles.appShell}>
        <Header onOpenMenu={() => setMenuOpen(true)} />

        <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/calendar" element={<Calendar />} />
        </Routes>

        <Footer />

        <SlideMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      </div>

    </BrowserRouter>
  );
}