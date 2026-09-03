/* =========================================
   FESTIVAL SCORE SYSTEM
   SCORES.JS
   Score Database & Ranking Management
========================================= */

import {
  db,
  SCORES_COLLECTION
} from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/* =========================================
   DOM ELEMENTS
========================================= */

const entryCountEl = document.getElementById("entryCount");
const waitingCountEl = document.getElementById("waitingCount");
const completeCountEl = document.getElementById("completeCount");
const scoreListEl = document.getElementById("scoreList");
const emptyMessageEl = document.getElementById("emptyMessage");

const newestButton = document.getElementById("newestButton");
const rankingButton = document.getElementById("rankingButton");
const resetButton = document.getElementById("resetButton");

/* =========================================
   STATE
========================================= */

let scoresData = [];
let currentSort = "newest"; // "newest" or "ranking"

/* =========================================
   INITIALIZATION
========================================= */

window.addEventListener("DOMContentLoaded", () => {
  initCodeRain();
  fetchScores();

  if (newestButton) {
    newestButton.addEventListener("click", () => {
      setSortMode("newest");
    });
  }

  if (rankingButton) {
    rankingButton.addEventListener("click", () => {
      setSortMode("ranking");
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", handleResetAll);
  }
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
   FETCH SCORES FROM FIRESTORE
========================================= */

async function fetchScores() {
  try {
    const querySnapshot = await getDocs(collection(db, SCORES_COLLECTION));
    scoresData = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      scoresData.push({
        id: docSnap.id,
        name: data.name || "UNKNOWN",
        quiz: Number(data.quiz) || 0,
        shooting: Number(data.shooting) || 0,
        total: (Number(data.quiz) || 0) + (Number(data.shooting) || 0),
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        status: data.status || "active" // active or complete
      });
    });

    updateDatabaseInfo();
    renderScores();
  } catch (error) {
    console.error("Failed to fetch scores:", error);
  }
}

/* =========================================
   UPDATE DATABASE INFO STATS
========================================= */

function updateDatabaseInfo() {
  const totalEntries = scoresData.length;
  const waitingCount = scoresData.filter(item => item.status !== "complete").length;
  const completeCount = scoresData.filter(item => item.status === "complete").length;

  if (entryCountEl) entryCountEl.textContent = totalEntries;
  if (waitingCountEl) waitingCountEl.textContent = waitingCount;
  if (completeCountEl) completeCountEl.textContent = completeCount;
}

/* =========================================
   SORT MODE SWITCH
========================================= */

function setSortMode(mode) {
  currentSort = mode;

  if (newestButton && rankingButton) {
    if (mode === "newest") {
      newestButton.classList.add("active");
      rankingButton.classList.remove("active");
    } else {
      rankingButton.classList.add("active");
      newestButton.classList.remove("active");
    }
  }

  renderScores();
}

/* =========================================
   RENDER SCORES TABLE
========================================= */

function renderScores() {
  if (!scoreListEl) return;
  scoreListEl.innerHTML = "";

  if (scoresData.length === 0) {
    if (emptyMessageEl) emptyMessageEl.classList.remove("hidden");
    return;
  }

  if (emptyMessageEl) emptyMessageEl.classList.add("hidden");

  // Sorting logic
  let sortedList = [...scoresData];
  if (currentSort === "ranking") {
    sortedList.sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total; // Total score descending
      }
      return b.createdAt - a.createdAt; // Newer first if tie
    });
  } else {
    sortedList.sort((a, b) => b.createdAt - a.createdAt); // Newest first
  }

  sortedList.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "score-row";
    if (item.status === "complete") {
      row.classList.add("is-complete");
    }

    const rankDisplay = currentSort === "ranking" ? index + 1 : "-";
    const formattedDate = formatDate(item.createdAt);

    row.innerHTML = `
      <div class="col-rank">${rankDisplay}</div>
      <div class="col-player" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
      <div class="col-quiz">${item.quiz}</div>
      <div class="col-shooting">${item.shooting}</div>
      <div class="col-total total-cell">${item.total}</div>
      <div class="col-status status-cell">${formattedDate}</div>
      <div class="col-action">
        <button class="complete-button" type="button" data-id="${item.id}" data-status="${item.status}">
          ${item.status === "complete" ? "DONE" : "COMPLETE"}
        </button>
      </div>
    `;

    scoreListEl.appendChild(row);
  });

  // Bind action buttons
  const actionButtons = scoreListEl.querySelectorAll(".complete-button");
  actionButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      const currentStatus = e.target.getAttribute("data-status");
      const newStatus = currentStatus === "complete" ? "active" : "complete";
      await toggleCompleteStatus(id, newStatus);
    });
  });
}

/* =========================================
   TOGGLE STATUS (COMPLETE / ACTIVE)
========================================= */

async function toggleCompleteStatus(id, newStatus) {
  try {
    const docRef = doc(db, SCORES_COLLECTION, id);
    await updateDoc(docRef, { status: newStatus });

    // Local state update
    const target = scoresData.find(item => item.id === id);
    if (target) {
      target.status = newStatus;
    }

    updateDatabaseInfo();
    renderScores();
  } catch (error) {
    console.error("Failed to update status:", error);
  }
}

/* =========================================
   RESET ALL DATA
========================================= */

async function handleResetAll() {
  const confirmed = window.confirm("すべてのデータを初期化しますか？この操作は取り消せません。");
  if (!confirmed) return;

  try {
    const querySnapshot = await getDocs(collection(db, SCORES_COLLECTION));
    const deletePromises = querySnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, SCORES_COLLECTION, docSnap.id))
    );

    await Promise.all(deletePromises);

    scoresData = [];
    updateDatabaseInfo();
    renderScores();
    alert("すべてのデータを初期化しました。");
  } catch (error) {
    console.error("Failed to reset database:", error);
    alert("初期化に失敗しました。");
  }
}

/* =========================================
   UTILITIES
========================================= */

function formatDate(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${m}/${d} ${h}:${min}`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
