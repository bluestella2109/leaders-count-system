/* =========================================
   FESTIVAL SCORE SYSTEM
   INPUT.JS
   Score Input & Player Authentication
========================================= */

import {
  db,
  SCORES_COLLECTION
} from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/* =========================================
   DOM ELEMENTS
========================================= */

const menuScreen = document.getElementById("menuScreen");
const authScreen = document.getElementById("authScreen");
const scoreScreen = document.getElementById("scoreScreen");
const resultOverlay = document.getElementById("resultOverlay");

const gotoAuthButton = document.getElementById("gotoAuthButton");
const startButton = document.getElementById("startButton");
const backToMenuButton = document.getElementById("backToMenuButton");
const menuFromScoreButton = document.getElementById("menuFromScoreButton");
const submitButton = document.getElementById("submitButton");
const newEntryButton = document.getElementById("newEntryButton");

const nicknameInput = document.getElementById("nicknameInput");
const playerNameEl = document.getElementById("playerName");
const authSystemStatus = document.getElementById("authSystemStatus");

const quizDisplay = document.getElementById("quizDisplay");
const shootingDisplay = document.getElementById("shootingDisplay");
const totalPreview = document.getElementById("totalPreview");
const sendStatus = document.getElementById("sendStatus");

/* Result overlay elements */
const resultName = document.getElementById("resultName");
const resultTotal = document.getElementById("resultTotal");
const resultQuiz = document.getElementById("resultQuiz");
const resultShooting = document.getElementById("resultShooting");

/* =========================================
   STATE
========================================= */

let currentPlayerData = {
  name: "",
  quiz: "0",
  shooting: "0"
};

let activeKeypadTarget = "quiz"; // "quiz" or "shooting"

/* =========================================
   INITIALIZATION
========================================= */

window.addEventListener("DOMContentLoaded", () => {
  initCodeRain();
  setupEventListeners();
});

/* =========================================
   BACKGROUND CODE RAIN
========================================= */

function initCodeRain() {
  const container = document.getElementById("codeRain");
  if (!container) return;

  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz<>/[]{}#%&$@+=-_";
  const count = Math.max(18, Math.floor(window.innerWidth / 25));

  for (let i = 0; i < count; i++) {
    const column = document.createElement("div");
    column.className = "code-column";

    if (Math.random() < 0.10) {
      column.classList.add("red");
    }

    let text = "";
    const length = 18 + Math.floor(Math.random() * 45);
    for (let j = 0; j < length; j++) {
      text += characters[Math.floor(Math.random() * characters.length)];
    }

    column.textContent = text;
    column.style.left = `${Math.random() * 100}%`;
    column.style.fontSize = `${8 + Math.random() * 4}px`;
    column.style.animationDuration = `${10 + Math.random() * 18}s`;
    column.style.animationDelay = `${Math.random() * -20}s`;
    column.style.opacity = `${0.15 + Math.random() * 0.45}`;

    container.appendChild(column);
  }
}

/* =========================================
   EVENT LISTENERS SETUP
========================================= */

function setupEventListeners() {
  // Menu -> Auth Screen
  if (gotoAuthButton) {
    gotoAuthButton.addEventListener("click", () => {
      switchScreen("auth");
      if (nicknameInput) nicknameInput.focus();
    });
  }

  // Auth Back -> Menu
  if (backToMenuButton) {
    backToMenuButton.addEventListener("click", () => {
      switchScreen("menu");
    });
  }

  // Score Screen Back -> Menu
  if (menuFromScoreButton) {
    menuFromScoreButton.addEventListener("click", () => {
      const confirmed = window.confirm("メニューに戻りますか？入力中のデータは破棄されます。");
      if (confirmed) {
        switchScreen("menu");
      }
    });
  }

  // Start Button (Nickname validation & enter score screen)
  if (startButton) {
    startButton.addEventListener("click", handleStartSession);
  }

  if (nicknameInput) {
    nicknameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleStartSession();
      }
    });
  }

  // Keypads setup
  const keypads = document.querySelectorAll(".keypad");
  keypads.forEach((keypad) => {
    const targetType = keypad.getAttribute("data-target"); // "quiz" or "shooting"
    const keys = keypad.querySelectorAll(".key");

    keys.forEach((key) => {
      key.addEventListener("click", () => {
        const value = key.getAttribute("data-value");
        const action = key.getAttribute("data-action");

        handleKeypadInput(targetType, value, action);
      });
    });
  });

  // Submit Button
  if (submitButton) {
    submitButton.addEventListener("click", handleSubmitScore);
  }

  // New Entry Button (After result overlay)
  if (newEntryButton) {
    newEntryButton.addEventListener("click", () => {
      if (resultOverlay) resultOverlay.classList.add("hidden");
      resetForm();
      switchScreen("auth");
      if (nicknameInput) nicknameInput.focus();
    });
  }
}

/* =========================================
   SCREEN SWITCHER
========================================= */

function switchScreen(screenName) {
  if (menuScreen) menuScreen.classList.add("hidden");
  if (authScreen) authScreen.classList.add("hidden");
  if (scoreScreen) scoreScreen.classList.add("hidden");

  if (screenName === "menu" && menuScreen) {
    menuScreen.classList.remove("hidden");
  } else if (screenName === "auth" && authScreen) {
    authScreen.classList.remove("hidden");
  } else if (screenName === "score" && scoreScreen) {
    scoreScreen.classList.remove("hidden");
  }
}

/* =========================================
   START SESSION
========================================= */

function handleStartSession() {
  const nameVal = nicknameInput ? nicknameInput.value.trim() : "";

  if (!nameVal) {
    if (nicknameInput) {
      nicknameInput.classList.add("input-error");
      setTimeout(() => nicknameInput.classList.remove("input-error"), 300);
    }
    if (authSystemStatus) {
      authSystemStatus.textContent = "SYSTEM // ERROR: NICKNAME REQUIRED";
    }
    return;
  }

  currentPlayerData.name = nameVal;
  if (playerNameEl) playerNameEl.textContent = nameVal;

  resetForm();
  switchScreen("score");
}

/* =========================================
   KEYPAD INPUT HANDLER
========================================= */

function handleKeypadInput(target, value, action) {
  let currentStr = target === "quiz" ? currentPlayerData.quiz : currentPlayerData.shooting;

  if (value !== null && value !== undefined) {
    // Number typed
    if (currentStr === "0") {
      currentStr = value;
    } else {
      if (currentStr.length < 4) { // Max length limit
        currentStr += value;
      }
    }
  } else if (action === "clear") {
    currentStr = "0";
  } else if (action === "back") {
    if (currentStr.length > 1) {
      currentStr = currentStr.slice(0, -1);
    } else {
      currentStr = "0";
    }
  }

  // Update state
  if (target === "quiz") {
    currentPlayerData.quiz = currentStr;
  } else {
    currentPlayerData.shooting = currentStr;
  }

  updateDisplays();
}

/* =========================================
   UPDATE DISPLAYS
========================================= */

function updateDisplays() {
  const qNum = Number(currentPlayerData.quiz) || 0;
  const sNum = Number(currentPlayerData.shooting) || 0;
  const total = qNum + sNum;

  if (quizDisplay) quizDisplay.textContent = qNum;
  if (shootingDisplay) shootingDisplay.textContent = sNum;
  if (totalPreview) totalPreview.textContent = total;
}

/* =========================================
   RESET FORM
========================================= */

function resetForm() {
  currentPlayerData.quiz = "0";
  currentPlayerData.shooting = "0";
  if (nicknameInput) nicknameInput.value = "";
  if (sendStatus) sendStatus.textContent = "";
  updateDisplays();
}

/* =========================================
   SUBMIT SCORE TO FIRESTORE
========================================= */

async function handleSubmitScore() {
  const qNum = Number(currentPlayerData.quiz) || 0;
  const sNum = Number(currentPlayerData.shooting) || 0;
  const total = qNum + sNum;

  if (!currentPlayerData.name) {
    alert("プレイヤー名が設定されていません。");
    switchScreen("auth");
    return;
  }

  if (sendStatus) {
    sendStatus.textContent = "TRANSMITTING DATA...";
  }

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    await addDoc(collection(db, SCORES_COLLECTION), {
      name: currentPlayerData.name,
      quiz: qNum,
      shooting: sNum,
      total: total,
      status: "active",
      createdAt: serverTimestamp()
    });

    if (sendStatus) {
      sendStatus.textContent = "TRANSMISSION COMPLETE.";
    }

    // Show Result Overlay
    if (resultName) resultName.textContent = currentPlayerData.name;
    if (resultTotal) {
      resultTotal.textContent = total;
      resultTotal.setAttribute("data-text", total);
    }
    if (resultQuiz) resultQuiz.textContent = qNum;
    if (resultShooting) resultShooting.textContent = sNum;

    if (resultOverlay) {
      resultOverlay.classList.remove("hidden");
    }

  } catch (error) {
    console.error("Failed to submit score:", error);
    if (sendStatus) {
      sendStatus.textContent = "ERROR: TRANSMISSION FAILED";
    }
    alert("データの送信に失敗しました。ネットワーク状況を確認してください。");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}
