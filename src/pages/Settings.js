import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { getTranslations } from "../translations";

function Settings() {
  const { dark } = useTheme();
  const t = getTranslations();
  const navigate = useNavigate();
  const mailboxId = localStorage.getItem("mailboxId");

  const cardStyle = {
    maxWidth: "460px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "4px",
    backgroundColor: dark ? "#141414" : "#ffffff",
    border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
    boxShadow: dark ? "6px 6px 0px #000" : "6px 6px 0px #111",
  };

  const buttonStyle = {
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
    ...buttonStyle,
    backgroundColor: "transparent",
    color: dark ? "#f0ede8" : "#111",
  };

  const idBox = {
    padding: "14px",
    marginTop: "8px",
    marginBottom: "20px",
    borderRadius: "4px",
    border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
    backgroundColor: dark ? "#0a0a0a" : "#fafafa",
    color: dark ? "#f0ede8" : "#111",
    fontFamily: "monospace",
    fontSize: "12px",
    wordBreak: "break-all",
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={cardStyle}>
        <div style={{ fontSize: "11px", letterSpacing: "0.15em", opacity: 0.4, marginBottom: "6px" }}>
          {t.configuration}
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "32px" }}>
          {t.configTitle}
        </h1>

        {mailboxId ? (
          <>
            <label style={{ fontSize: "12px", letterSpacing: "0.1em", opacity: 0.6 }}>
              MAILBOX ID
            </label>
            <div style={idBox}>{mailboxId}</div>
          </>
        ) : (
          <p style={{ fontSize: "14px", opacity: 0.6, marginBottom: "20px" }}>
            {t.noMailboxAdded}
          </p>
        )}

        <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: `1px solid ${dark ? "#2a2a2a" : "#e0e0e0"}` }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.15em", opacity: 0.4, marginBottom: "8px" }}>
            {t.claimSectionLabel?.toUpperCase()}
          </div>
          <button onClick={() => navigate("/claim")} style={ghostBtn}>
            + {t.claimAddNew}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;