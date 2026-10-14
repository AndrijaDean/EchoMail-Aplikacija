import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { useTheme } from "../ThemeContext";
import { getTranslations } from "../translations";

function ShareMailbox() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [code, setCode]     = useState("");
  const [error, setError]   = useState("");

  const { dark } = useTheme();
  const t        = getTranslations();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setStatus("loading");
    setError("");
    try {
      const mailboxId = localStorage.getItem("mailboxId");
      if (!mailboxId) throw new Error("No mailbox");

      const createShareCode = httpsCallable(functions, "createShareCode");
      const res = await createShareCode({ mailboxId });
      setCode(res.data.code);
      setStatus("success");
    } catch (e) {
      setError(e.message);
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

  const codeBox = {
    padding: "30px",
    marginTop: "20px",
    marginBottom: "20px",
    borderRadius: "4px",
    border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
    backgroundColor: dark ? "#0a0a0a" : "#fafafa",
    color: dark ? "#f0ede8" : "#111",
    fontSize: "42px",
    fontWeight: "700",
    letterSpacing: "0.3em",
    textAlign: "center",
    fontFamily: "monospace",
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

  const ghostBtn = {
    ...primaryBtn,
    backgroundColor: "transparent",
    color: dark ? "#f0ede8" : "#111",
    marginTop: "10px",
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={cardStyle}>
        <div style={{ fontSize: "11px", letterSpacing: "0.15em", opacity: 0.4, marginBottom: "6px" }}>
          {t.shareSectionLabel}
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
          {t.shareTitle}
        </h1>
        <p style={{ fontSize: "14px", opacity: 0.6, marginBottom: "20px", lineHeight: 1.5 }}>
          {t.shareSubtitle}
        </p>

        {status === "success" ? (
          <>
            <div style={codeBox}>{code}</div>
            <p style={{ fontSize: "13px", opacity: 0.6, textAlign: "center", marginBottom: "20px" }}>
              {t.shareExpiresIn5min}
            </p>
            <button onClick={() => navigate("/settings")} style={ghostBtn}>
              {t.done}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleGenerate}
              disabled={status === "loading"}
              style={{ ...primaryBtn, opacity: status === "loading" ? 0.5 : 1 }}
            >
              {status === "loading" ? t.claimConnecting : t.shareGenerateCode}
            </button>
            {status === "error" && (
              <p style={{ color: "#c0392b", marginTop: "12px", fontSize: "13px", textAlign: "center" }}>
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ShareMailbox;
