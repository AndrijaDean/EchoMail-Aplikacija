import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useTheme } from "../ThemeContext";
import { getTranslations } from "../translations";

function Dashboard() {
  const [mailCount, setMailCount] = useState(null);
  const [mailboxId] = useState(localStorage.getItem("mailboxId") || "");
  const { dark } = useTheme();
  const t = getTranslations();

  useEffect(() => {
    if (!mailboxId) return;
    const unsub = onSnapshot(doc(db, "mailboxes", mailboxId), (docSnap) => {
      if (docSnap.exists()) {
        setMailCount(docSnap.data().mailCount ?? 0);
      }
    });
    return () => unsub();
  }, [mailboxId]);

  const hasMail = mailCount > 0;

  const cardStyle = {
    maxWidth: "460px",
    margin: "60px auto",
    padding: "40px",
    borderRadius: "4px",
    backgroundColor: dark ? "#141414" : "#ffffff",
    border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
    boxShadow: dark ? "6px 6px 0px #000" : "6px 6px 0px #111",
  };

  const statusBox = {
    marginTop: "28px",
    padding: "28px",
    borderRadius: "4px",
    border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
    backgroundColor: hasMail
      ? dark ? "#0f2a0f" : "#f0fff0"
      : dark ? "#1a1a1a" : "#fafafa",
    textAlign: "center",
  };

  // Nije još claimano
  if (!mailboxId) {
    return (
      <div style={{ padding: "20px" }}>
        <div style={cardStyle}>
          <div style={statusBox}>
            <p style={{ fontSize: "42px", marginBottom: "10px" }}>📪</p>
            <p style={{ fontSize: "16px", opacity: 0.6 }}>
              {t.noMailboxAdded}
            </p>
            <p style={{ fontSize: "12px", opacity: 0.4, marginTop: "8px" }}>
              {t.goToConfigToAdd}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={cardStyle}>
        <div style={{ fontSize: "11px", letterSpacing: "0.15em", opacity: 0.4, marginBottom: "6px" }}>
          {t.deviceLabel} / {mailboxId.slice(0, 8)}…
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.01em" }}>
          {t.mailboxStatus}
        </h1>

        <div style={statusBox}>
          {mailCount === null && (
            <p style={{ fontSize: "16px", opacity: 0.5 }}>{t.loading}</p>
          )}
          {mailCount !== null && hasMail && (
            <>
              <p style={{ fontSize: "42px", marginBottom: "10px" }}>📬</p>
              <p style={{ fontSize: "32px", fontWeight: "700", color: "#2d8a2d" }}>
                {mailCount}
              </p>
              <p style={{ fontSize: "14px", fontWeight: "500", marginTop: "4px" }}>
                {mailCount === 1 ? t.mailCountSingular : t.mailCountPlural}
              </p>
              <p style={{ fontSize: "12px", opacity: 0.5, marginTop: "8px" }}>
                {t.checkMailbox}
              </p>
            </>
          )}
          {mailCount !== null && !hasMail && (
            <>
              <p style={{ fontSize: "42px", marginBottom: "10px" }}>📭</p>
              <p style={{ fontSize: "20px", fontWeight: "700", opacity: 0.4 }}>
                {t.noMail}
              </p>
              <p style={{ fontSize: "12px", opacity: 0.3, marginTop: "6px" }}>
                {t.mailboxEmpty}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;