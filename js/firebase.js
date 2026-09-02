import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getFirestore
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const firebaseConfig = {

  apiKey: "ここにAPIキー",

  authDomain: "ここにauthDomain",

  projectId: "ここにprojectId",

  storageBucket: "ここにstorageBucket",

  messagingSenderId: "ここにmessagingSenderId",

  appId: "ここにappId"

};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
