import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, deleteDoc } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyC4t_M8TVNBdNl3mGcrupQrE1ORid-7EDk",
  authDomain: "echomail-ad.firebaseapp.com",
  projectId: "echomail-ad",
  storageBucket: "echomail-ad.firebasestorage.app",
  messagingSenderId: "804720035110",
  appId: "1:804720035110:web:784703632b0cf02ecd6de7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const functions = getFunctions(app);

const getUserDeviceId = () => {
  let id = localStorage.getItem("userDeviceId");
  if (!id) {
    id = "user_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("userDeviceId", id);
  }
  return id;
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const mailboxId = localStorage.getItem("mailboxId");
    if (!mailboxId) {
      console.warn("No mailboxId — claim a mailbox first");
      return null;
    }
    const userDeviceId = getUserDeviceId();

    const token = await getToken(messaging, {
      vapidKey: "BJe0fpzcOk3n7YXrH73_BBi1d7wvt95KyvNyjd6Ro_6Xv3wKdyw_fugsinjNYHxhr4TF3EAczz6lYlly8sofTUE"
    });

    if (token) {
      await setDoc(doc(db, "fcmTokens", userDeviceId), {
        token,
        mailboxId,
        userDeviceId,
        updatedAt: new Date().toISOString()
      });
      console.log("FCM Token spremljen za mailbox:", mailboxId);
      return token;
    }
  } catch (err) {
    console.error("Notification error:", err);
  }
};

export const removeNotificationToken = async () => {
  try {
    const userDeviceId = getUserDeviceId();
    await deleteDoc(doc(db, "fcmTokens", userDeviceId));
    console.log("FCM Token obrisan");
  } catch (err) {
    console.error("Error brisanja tokena:", err);
  }
};