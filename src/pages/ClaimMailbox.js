import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { useTheme } from "../ThemeContext";
import { getTranslations } from "../translations";

function ClaimMailbox() {
  const [code, setCode]     = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError]   = useState("");

  const { dark } = useTheme();
  const t        = getTranslations();
  const navigate = useNavigate();

  const handleClaim = async () => {
  setStatus("loading");
  setError("");
  try {
    const claimMailbox = httpsCallable(functions, "claimMailbox");
    const res = await claimMailbox({ claimCode: code });
    localStorage.setItem("mailboxId", res.data.mailboxId);
    setStatus("success");
  } catch (e) {
    const errCode = e?.code?.replace("functions/", "") || "";
    if (errCode === "not-found")              setError(t.claimNotFound);
    else if (errCode === "deadline-exceeded") setError(t.claimExpired);
    else setError(e.message);
    setStatus("error");
  }
};
  
  const cardStyle = {
    maxWidth: "460px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "4px",
    backgroundColor: dark ? "#141414" : "#ffffff",
    border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
    boxShadow: dark ? "6px 6px 0px #000" : "6px 6px 0px #111",
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "14px",
    marginTop: "8px",
    marginBottom: "20px",
    fontSize: "28px",
    fontWeight: "700",
    letterSpacing: "0.3em",
    textAlign: "center",
    borderRadius: "4px",
    border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
    backgroundColor: dark ? "#0a0a0a" : "#fafafa",
    color: dark ? "#f0ede8" : "#111",
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
  };

  const primaryBtn = {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "700",
    fontFamily: "inherit",
    cursor: "pointer",
    borderRadius: "4px",
    border: "2px solid #111",
    backgroundColor: dark ? "#f0ede8" : "#111",
    color: dark ? "#111" : "#f0ede8",
    letterSpacing: "0.05em",
  };

  if (status === "success") {
    return (
      <div style={{ padding: "20px" }}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📬</div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px" }}>
              {t.claimSuccess}
            </h2>
            <button onClick={() => navigate("/")} style={{ ...primaryBtn, marginTop: "20px" }}>
              {t.status} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={cardStyle}>
        <div style={{ fontSize: "11px", letterSpacing: "0.15em", opacity: 0.4, marginBottom: "6px" }}>
          {t.claimSectionLabel}
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
          {t.claimTitle}
        </h1>
        <p style={{ fontSize: "14px", opacity: 0.6, marginBottom: "28px", lineHeight: 1.5 }}>
          {t.claimSubtitle}
        </p>

        <label style={{ fontSize: "12px", letterSpacing: "0.1em", opacity: 0.6 }}>KOD</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="· · · · · ·"
          style={inputStyle}
          autoFocus
        />

        <button
          onClick={handleClaim}
          disabled={code.length !== 6 || status === "loading"}
          style={{
            ...primaryBtn,
            opacity: code.length !== 6 || status === "loading" ? 0.4 : 1,
            cursor: code.length !== 6 || status === "loading" ? "not-allowed" : "pointer",
          }}
        >
          {status === "loading" ? t.claimConnecting : t.claimButton}
        </button>

        {status === "error" && (
          <p style={{ color: "#c0392b", marginTop: "12px", fontSize: "13px", textAlign: "center" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default ClaimMailbox;