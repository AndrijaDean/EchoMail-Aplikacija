/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC4t_M8TVNBdNl3mGcrupQrE1ORid-7EDk",
  authDomain: "echomail-ad.firebaseapp.com",
  projectId: "echomail-ad",
  storageBucket: "echomail-ad.firebasestorage.app",
  messagingSenderId: "804720035110",
  appId: "1:804720035110:web:784703632b0cf02ecd6de7"
});

firebase.messaging();