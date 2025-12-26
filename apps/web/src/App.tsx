import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header";
import Menu from "./components/Menu";
import styles from "./App.module.scss";

import Main from "./pages/Main";
import Schedule from "./pages/Schedule";
import Calendar from "./pages/Calendar";
import MyPage from "./pages/MyPage";
import Welcome from "./pages/Welcome";
import { useProfileSetup } from "./hooks/useProfileSetup";
import Ranking from "./pages/Ranking";

export default function App() {
  const { profileSetup } = useProfileSetup();

  if (!profileSetup) {
    return (
      <Welcome />
    )
  }

  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Header />

        <div className={styles.app__page}>
          <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/my" element={<MyPage />} />
          </Routes>
        </div>

        <Menu />
      </div>

    </BrowserRouter>
  );
}
