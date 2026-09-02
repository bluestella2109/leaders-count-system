// ========================================
// Firebase 初期設定
// ========================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ========================================
// Firebase Config
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyCiSxUY5BVu2DB_b2bpe9mZxk5LR4Q7PBQ",

  authDomain: "leaders-count-system.firebaseapp.com",

  projectId: "leaders-count-system",

  storageBucket: "leaders-count-system.firebasestorage.app",

  messagingSenderId: "242036957530",

  appId: "1:242036957530:web:822d539394f3cb83b6d363"
};


// ========================================
// Firebase 初期化
// ========================================

const app = initializeApp(firebaseConfig);


// ========================================
// Firestore
// ========================================

export const db = getFirestore(app);
