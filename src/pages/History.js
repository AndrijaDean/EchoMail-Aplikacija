import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useTheme } from "../ThemeContext";
import { getTranslations } from "../translations";
import { Link } from "react-router-dom";

function History() {
  const [history, setHistory] = useState([]);
  const { dark } = useTheme();
  const t = getTranslations();
  const mailboxId = localStorage.getItem("mailboxId");

  useEffect(() => {
    if (!mailboxId) return;
    const q = query(
      collection(db, "mailboxes", mailboxId, "history"),
      orderBy("timestamp", "desc"),
      limit(5)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(items);
    });
    return () => unsub();
  }, [mailboxId]);

  // Mapiraj tip eventa na ikonu + tekst
  const renderEvent = (item) => {
    switch (item.type) {
      case "mail_inserted":
        return { icon: "📬", text: t.mailReceived };
      case "mail_collected":
        return { icon: "📭", text: t.mailRemoved };
      case "tag_paired":
        return { icon: "🔑", text: t.tagPaired };
      case "pairing_started":
        return { icon: "⚙️", text: t.pairingStarted };
      case "pairing_timeout":
        return { icon: "⏱️", text: t.pairingTimeout };
      case "unauthorized_attempt":
        return { icon: "⛔", text: t.unauthorizedAttempt };
      default:
        return { icon: "•", text: item.type || "—" };
    }
  };

  const containerStyle = {
    maxWidth: "560px",
    margin: "40px auto",
    padding: "0 20px",
  };

  const cardStyle = {
    backgroundColor: dark ? "#141414" : "#ffffff",
    border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
    borderRadius: "4px",
    boxShadow: dark ? "6px 6px 0px #000" : "6px 6px 0px #111",
    overflow: "hidden",
  };

  const itemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: `1px solid ${dark ? "#2a2a2a" : "#f0f0f0"}`,
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.15em", opacity: 0.4, marginBottom: "6px" }}>
          {t.deviceLabel} / {mailboxId ? mailboxId.slice(0, 8) + "…" : "—"}
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "700" }}>{t.historyTitle}</h1>
      </div>

      <div style={cardStyle}>
        {!mailboxId && (
          <div style={{ padding: "32px 24px", opacity: 0.4, fontSize: "14px" }}>
            {t.noMailboxAdded}
          </div>
        )}
        {mailboxId && history.length === 0 && (
          <div style={{ padding: "32px 24px", opacity: 0.4, fontSize: "14px" }}>
            {t.noRecords}
          </div>
        )}
        {history.map((item, index) => {
          const ev = renderEvent(item);
          return (
            <div key={item.id} style={{
              ...itemStyle,
              borderBottom: index === history.length - 1 ? "none" : itemStyle.borderBottom,
            }}>
              <span style={{ fontSize: "14px" }}>
                {ev.icon} {ev.text}
              </span>
              <span style={{ fontSize: "11px", opacity: 0.4, letterSpacing: "0.05em" }}>
                {item.timestamp?.toDate?.().toLocaleString(
                  localStorage.getItem("language") === "en" ? "en-GB" : "hr-HR"
                ) || "—"}
              </span>
            </div>
          );
        })}
      </div>

      {mailboxId && history.length > 0 && (
        <Link to="/history/full" style={{
          display: "block",
          marginTop: "16px",
          padding: "12px",
          fontSize: "13px",
          fontWeight: "700",
          textAlign: "center",
          borderRadius: "4px",
          border: `2px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
          backgroundColor: dark ? "#141414" : "#ffffff",
          color: "inherit",
          letterSpacing: "0.05em",
          textDecoration: "none",
        }}>
          {t.viewFullHistory}
        </Link>
      )}
    </div>
  );
}

export default History;