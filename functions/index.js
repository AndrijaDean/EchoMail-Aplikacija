const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// ── Notifikacija pri novoj pošti ──────────────────────────────────────────────
exports.sendMailNotification = onDocumentCreated(
  "mailboxes/{mailboxId}/history/{eventId}",
  async (event) => {
    const data = event.data.data();
    if (data.type !== "mail_inserted") return;

    const mailboxId = event.params.mailboxId;

    const tokensSnap = await db
      .collection("fcmTokens")
      .where("mailboxId", "==", mailboxId)
      .get();

    if (tokensSnap.empty) return;

    const tokens = tokensSnap.docs.map((d) => d.data().token).filter(Boolean);
    if (tokens.length === 0) return;

    const message = {
      notification: {
        title: "📬 Nova pošta!",
        body: "Stigla je nova pošta u sandučić.",
      },
      webpush: {
        notification: {
          icon: "https://echomail-ad.web.app/EchoMail_Favicon.png",
          badge: "https://echomail-ad.web.app/EchoMail_Favicon.png",
        },
        fcmOptions: {
          link: "https://echomail-ad.web.app/",
        },
      },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`[FCM] sent: ${response.successCount}, failed: ${response.failureCount}`);

    // Očisti nevažeće tokene
    const toDelete = [];
    response.responses.forEach((r, i) => {
      if (!r.success) toDelete.push(tokensSnap.docs[i].ref);
    });
    await Promise.all(toDelete.map((ref) => ref.delete()));
  }
);

// ── Postavi createdAt na svaki write unclaimed dokumenta ─────────────────────
// onDocumentWritten okida i na create i na update (re-boot s novim kodom).
// Guard: ako createdAt već postoji, preskoči — izbjegavamo infinite loop.
// Napomena: expiresAt više ne postavljamo — kod traje zauvijek pa svatko može
// kasnije dodati svoj telefon koristeći isti kod.
exports.onUnclaimedWritten = onDocumentWritten(
  "unclaimed/{mailboxId}",
  async (event) => {
    const after = event.data.after?.data();
    if (!after) return;            // dokument obrisan — nije naš posao
    if (after.createdAt) return;   // createdAt već postavljen, ne diramo

    const now = admin.firestore.Timestamp.now();
    await event.data.after.ref.update({
      createdAt: now,
    });
  }
);

// ── Claim endpoint ────────────────────────────────────────────────────────────
// Prvi korisnik s ispravnim kodom kreira mailbox.
// Sljedeći korisnici s istim kodom samo dobiju mailboxId i pridruže se.
// Unclaimed dokument se NIKAD ne briše — kod traje zauvijek.
exports.claimMailbox = onCall(async (request) => {
  const code = String(request.data.claimCode || "").trim();
  if (!/^\d{6}$/.test(code)) {
    throw new HttpsError("invalid-argument", "Code must be 6 digits.");
  }

  const snap = await db
    .collection("unclaimed")
    .where("claimCode", "==", code)
    .limit(1)
    .get();

  if (snap.empty) {
    throw new HttpsError("not-found", "Invalid code.");
  }

  const doc = snap.docs[0];
  const mailboxId = doc.id;

  // Ako mailbox već postoji (drugi user pridružuje se), samo vrati ID.
  // Ako ne postoji, kreiraj ga (prvi claim).
  const mbRef = db.collection("mailboxes").doc(mailboxId);
  const existing = await mbRef.get();

  if (!existing.exists) {
    await mbRef.set({
      deviceName: "Sandučić",
      mailCount: 0,
      pairingEnabled: false,
      claimedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`[CLAIM] First claim for mailbox ${mailboxId}`);
  } else {
    console.log(`[CLAIM] Additional user joined mailbox ${mailboxId}`);
  }

  return { success: true, mailboxId };
});