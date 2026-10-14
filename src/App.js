import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import FullHistory from "./pages/FullHistory";
import Settings from "./pages/Settings";
import ClaimMailbox from "./pages/ClaimMailbox";
import ShareMailbox from "./pages/ShareMailbox";
import { useTheme } from "./ThemeContext";
import { getTranslations } from "./translations";
import { requestNotificationPermission, removeNotificationToken } from "./firebase";
import { useEffect, useState } from "react";

function ThemeSync() {
  const { dark } = useTheme();
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);
  return null;
}

function BottomNavLink({ to, icon, label }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      padding: "8px 0",
      color: "inherit",
      opacity: active ? 1 : 0.5,
      fontWeight: active ? "700" : "400",
      fontSize: "11px",
      letterSpacing: "0.05em",
    }}>
      <span style={{ fontSize: "22px" }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function NotifFAB() {
  const [notifEnabled, setNotifEnabled] = useState(
    localStorage.getItem("notifEnabled") === "true"
  );
  const { dark } = useTheme();
  const t = getTranslations();

  const handleNotifToggle = async () => {
    if (!notifEnabled) {
      const token = await requestNotificationPermission();
      if (token) {
        localStorage.setItem("notifEnabled", "true");
        setNotifEnabled(true);
      }
    } else {
      await removeNotificationToken();
      localStorage.setItem("notifEnabled", "false");
      setNotifEnabled(false);
    }
  };

  return (
    <button
      onClick={handleNotifToggle}
      title={notifEnabled ? t.notifOn : t.notifOff}
      style={{
        position: "fixed",
        bottom: "80px",
        right: "16px",
        width: "52px",
        height: "52px",
        borderRadius: "50%",
        border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
        backgroundColor: notifEnabled ? "#2d8a2d" : (dark ? "#141414" : "#ffffff"),
        color: notifEnabled ? "white" : "inherit",
        fontSize: "22px",
        cursor: "pointer",
        boxShadow: dark ? "3px 3px 0px #000" : "3px 3px 0px #111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9,
      }}
    >
      {notifEnabled ? "🔔" : "🔕"}
    </button>
  );
}

function HamburgerMenu({ open, onClose, dark, toggleTheme }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "hr"
  );
  const t = getTranslations();

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    window.location.reload();
  };

  if (!open) return null;

  const menuItemStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "6px",
    fontSize: "13px",
    fontFamily: "inherit",
    cursor: "pointer",
    borderRadius: "4px",
    border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
    backgroundColor: "transparent",
    color: "inherit",
    textAlign: "left",
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 20,
      }} />
      <div style={{
        position: "fixed",
        top: "60px",
        right: "12px",
        backgroundColor: dark ? "#141414" : "#ffffff",
        border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
        borderRadius: "6px",
        boxShadow: dark ? "4px 4px 0px #000" : "4px 4px 0px #111",
        padding: "16px",
        minWidth: "200px",
        zIndex: 30,
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.15em", opacity: 0.4, marginBottom: "8px" }}>
          {t.theme}
        </div>
        <button onClick={toggleTheme} style={{ ...menuItemStyle, marginBottom: "16px" }}>
          {dark ? t.lightMode : t.darkMode}
        </button>

        <div style={{ fontSize: "11px", letterSpacing: "0.15em", opacity: 0.4, marginBottom: "8px" }}>
          {t.language}
        </div>
        <button onClick={() => changeLanguage("hr")} style={{
          ...menuItemStyle,
          backgroundColor: language === "hr" ? (dark ? "#2a2a2a" : "#f0f0f0") : "transparent",
          fontWeight: language === "hr" ? "700" : "400",
        }}>
          🇭🇷 Hrvatski
        </button>
        <button onClick={() => changeLanguage("en")} style={{
          ...menuItemStyle,
          marginBottom: 0,
          backgroundColor: language === "en" ? (dark ? "#2a2a2a" : "#f0f0f0") : "transparent",
          fontWeight: language === "en" ? "700" : "400",
        }}>
          🇬🇧 English
        </button>
      </div>
    </>
  );
}

function App() {
  const { dark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = getTranslations();

  const topBarStyle = {
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    backgroundColor: dark ? "#0a0a0a" : "#ffffff",
    color: dark ? "#f0ede8" : "#111",
    borderBottom: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
    position: "sticky",
    top: 0,
    zIndex: 10,
  };

  const bottomNavStyle = {
    display: "flex",
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: dark ? "#0a0a0a" : "#ffffff",
    color: dark ? "#f0ede8" : "#111",
    borderTop: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
    paddingBottom: "env(safe-area-inset-bottom)",
    zIndex: 10,
  };

  return (
    <BrowserRouter>
      <ThemeSync />
      <div style={{ paddingBottom: "80px", minHeight: "100vh" }}>
        <header style={topBarStyle}>
          <img
  src={dark ? "/EchoMail_Favicon_White.png" : "/EchoMail_Favicon.png"}
  alt="EchoMail"
  style={{ height: "28px", width: "28px", marginRight: "10px", objectFit: "contain" }}
/>  
          <span style={{ fontWeight: "800", fontSize: "16px", letterSpacing: "0.05em", flex: 1 }}>
            {t.appName}
          </span>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            padding: "8px 10px",
            border: `2px solid ${dark ? "#444" : "#ddd"}`,
            borderRadius: "4px",
            backgroundColor: menuOpen ? (dark ? "#2a2a2a" : "#f0f0f0") : "transparent",
            color: "inherit",
            fontSize: "16px",
            fontFamily: "inherit",
            cursor: "pointer",
            lineHeight: 1,
          }}>
            ☰
          </button>
        </header>

        <HamburgerMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          dark={dark}
          toggleTheme={toggleTheme}
        />

        <Routes>
          <Route path="/history/full" element={<FullHistory />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/claim" element={<ClaimMailbox />} />
          <Route path="/share" element={<ShareMailbox />} />
        </Routes>

        <NotifFAB />

        <nav style={bottomNavStyle}>
          <BottomNavLink to="/" icon="📬" label={t.status} />
          <BottomNavLink to="/history" icon="📜" label={t.history} />
          <BottomNavLink to="/settings" icon="⚙️" label={t.config} />
        </nav>
      </div>
    </BrowserRouter>
  );
}

export default App;