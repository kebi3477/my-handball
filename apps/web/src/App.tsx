import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Menu from "./components/Menu";
import TutorialOverlay from "./components/TutorialOverlay";
import styles from "./App.module.scss";

import Main from "./pages/Main";
import Schedule from "./pages/Schedule";
import Calendar from "./pages/Calendar";
import MyPage from "./pages/MyPage";
import Welcome from "./pages/Welcome";
import { useProfileSetup } from "./hooks/useProfileSetup";
import Ranking from "./pages/Ranking";
import Policy from "./pages/Policy";
import { useTutorial } from "./hooks/useTutorial";

export default function App() {
  const { profileSetup } = useProfileSetup();
  const { seen, start } = useTutorial();

  useEffect(() => {
    if (!profileSetup) return;
    if (seen) return;
    start();
  }, [profileSetup, seen, start]);

  return (
    <BrowserRouter>
      <div className={styles.app}>
        {profileSetup && <Header />}

        <div className={`${styles.app__page} ${!profileSetup ? styles.app__page_welcome : ""}`}>
          <Routes>
            {profileSetup ? (
              <>
                <Route path="/" element={<Main />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/my" element={<MyPage />} />
                <Route path="/policy" element={<Policy />} />
              </>
            ) : (
              <>
                <Route path="/policy" element={<Policy />} />
                <Route path="*" element={<Welcome />} />
              </>
            )}
          </Routes>
        </div>

        {profileSetup && <Menu />}
        {profileSetup && <TutorialOverlay />}
      </div>

    </BrowserRouter>
  );
}
