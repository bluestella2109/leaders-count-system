/* =========================================================
   FIREBASE CONFIG
   FESTIVAL SCORE SYSTEM
========================================================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyCiSxUY5BVu2DB_b2bpe9mZxk5LR4Q7PBQ",

  authDomain:
    "leaders-count-system.firebaseapp.com",

  projectId:
    "leaders-count-system",

  storageBucket:
    "leaders-count-system.firebasestorage.app",

  messagingSenderId:
    "242036957530",

  appId:
    "1:242036957530:web:822d539394f3cb83b6d363"

};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app =
  initializeApp(firebaseConfig);


/* =========================================================
   FIRESTORE
========================================================= */

export const db =
  getFirestore(app);
