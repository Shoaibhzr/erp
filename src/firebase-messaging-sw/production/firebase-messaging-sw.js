importScripts("https://www.gstatic.com/firebasejs/9.19.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.19.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCaOnm6pI_xOWSILj0VmtWaSENLmrnG9u8",
  authDomain: "truckin-382017.firebaseapp.com",
  projectId: "truckin-382017",
  storageBucket: "truckin-382017.appspot.com",
  messagingSenderId: "644129663736",
  appId: "1:644129663736:web:b4c3f305b3dc52c987290d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {

  const allClients = await clients.matchAll({ includeUncontrolled: true });

  for (const client of allClients) {

    client.postMessage({ id: 'fcm', payload: payload });

  }

});
