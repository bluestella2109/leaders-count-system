// ========================================
// FESTIVAL SCORE SYSTEM
// scores.js
// ========================================

import { db } from "./firebase.js";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ========================================
// ELEMENTS
// ========================================

const scoreList =
  document.getElementById("scoreList");

const emptyMessage =
  document.getElementById("emptyMessage");

const entryCount =
  document.getElementById("entryCount");

const waitingCount =
  document.getElementById("waitingCount");

const completeCount =
  document.getElementById("completeCount");

const newestButton =
  document.getElementById("newestButton");

const rankingButton =
  document.getElementById("rankingButton");

const sortModeText =
  document.getElementById("sortModeText");

const codeRain =
  document.getElementById("codeRain");


// ========================================
// VARIABLES
// ========================================

let scores = [];

let currentMode = "newest";

let isResetting = false;


// ========================================
// FIRESTORE REFERENCE
// ========================================

const scoresCollection =
  collection(
    db,
    "festivalScores"
  );


// ========================================
// FORMAT SCORE
// ========================================

function formatScore(score) {

  const number =
    Number(score) || 0;

  return number.toLocaleString(
    "ja-JP"
  );

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(timestamp) {

  if (!timestamp) {

    return "---";

  }


  try {

    const date =
      timestamp.toDate();


    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");


    const day =
      String(
        date.getDate()
      ).padStart(2, "0");


    const hours =
      String(
        date.getHours()
      ).padStart(2, "0");


    const minutes =
      String(
        date.getMinutes()
      ).padStart(2, "0");


    return (
      `${year}.${month}.${day} ` +
      `${hours}:${minutes}`
    );

  } catch (error) {

    return "---";

  }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value ?? "";

  return div.innerHTML;

}


// ========================================
// SORT
// ========================================

function getSortedScores() {

  const copied =
    [...scores];


  // ======================================
  // NEWEST
  // ======================================

  if (currentMode === "newest") {

    copied.sort(
      (a, b) => {

        const aTime =
          a.createdAt?.toMillis?.() || 0;

        const bTime =
          b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;

      }
    );

  }


  // ======================================
  // RANKING
  // ======================================

  if (currentMode === "ranking") {

    copied.sort(
      (a, b) => {

        const aScore =
          Number(a.totalScore) || 0;

        const bScore =
          Number(b.totalScore) || 0;


        // 点数が高い順

        if (bScore !== aScore) {

          return bScore - aScore;

        }


        // 同点なら新しい方を上

        const aTime =
          a.createdAt?.toMillis?.() || 0;

        const bTime =
          b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;

      }
    );

  }


  return copied;

}


// ========================================
// RENDER
// ========================================

function renderScores() {

  if (!scoreList) {
    return;
  }


  scoreList.innerHTML = "";


  // ======================================
  // EMPTY
  // ======================================

  if (scores.length === 0) {

    if (emptyMessage) {

      emptyMessage.classList.remove(
        "hidden"
      );

    }

    return;

  }


  if (emptyMessage) {

    emptyMessage.classList.add(
      "hidden"
    );

  }


  const sortedScores =
    getSortedScores();


  // ======================================
  // CREATE ROWS
  // ======================================

  sortedScores.forEach(
    (score, index) => {

      const row =
        document.createElement("div");


      row.className =
        "score-item";


      if (score.completed === true) {

        row.classList.add(
          "completed"
        );

      }


      // ==================================
      // RANK
      // ==================================

      const rank =
        document.createElement("div");

      rank.className =
        "score-rank";

      rank.textContent =
        String(index + 1).padStart(
          2,
          "0"
        );


      // ==================================
      // PLAYER
      // ==================================

      const player =
        document.createElement("div");

      player.className =
        "score-player";

      player.textContent =
        score.nickname || "---";

      player.title =
        score.nickname || "---";


      // ==================================
      // DATE
      // ==================================

      const date =
        document.createElement("div");

      date.className =
        "score-date";

      date.textContent =
        formatDate(
          score.createdAt
        );


      // ==================================
      // QUIZ
      // ==================================

      const quiz =
        document.createElement("div");

      quiz.className =
        "score-quiz";

      quiz.textContent =
        formatScore(
          score.quizScore
        );


      // ==================================
      // SHOOTING
      // ==================================

      const shooting =
        document.createElement("div");

      shooting.className =
        "score-shooting";

      shooting.textContent =
        formatScore(
          score.shootingScore
        );


      // ==================================
      // TOTAL
      // ==================================

      const total =
        document.createElement("div");

      total.className =
        "score-total";

      total.textContent =
        formatScore(
          score.totalScore
        );


      // ==================================
      // STATUS
      // ==================================

      const status =
        document.createElement("div");


      status.className =
        "score-status";


      if (score.completed === true) {

        status.classList.add(
          "complete"
        );

        status.textContent =
          "COMPLETE";

      } else {

        status.classList.add(
          "waiting"
        );

        status.textContent =
          "WAITING";

      }


      // ==================================
      // ACTION
      // ==================================

      const action =
        document.createElement("div");

      action.className =
        "score-action";


      const completeButton =
        document.createElement("button");


      completeButton.type =
        "button";


      completeButton.className =
        "complete-button";


      if (score.completed === true) {

        completeButton.textContent =
          "✓ COMPLETED";

        completeButton.classList.add(
          "completed"
        );

        completeButton.disabled =
          true;

      } else {

        completeButton.textContent =
          "案内完了";


        completeButton.addEventListener(
          "click",
          () => {

            completeScore(
              score.id
            );

          }
        );

      }


      action.appendChild(
        completeButton
      );


      // ==================================
      // APPEND
      // ==================================

      row.appendChild(rank);

      row.appendChild(player);

      row.appendChild(date);

      row.appendChild(quiz);

      row.appendChild(shooting);

      row.appendChild(total);

      row.appendChild(status);

      row.appendChild(action);


      scoreList.appendChild(
        row
      );

    }
  );

}


// ========================================
// COMPLETE SCORE
// ========================================

async function completeScore(
  scoreId
) {

  if (!scoreId) {
    return;
  }


  const target =
    scores.find(
      (score) =>
        score.id === scoreId
    );


  if (!target) {
    return;
  }


  if (target.completed === true) {
    return;
  }


  const confirmed =
    window.confirm(
      `${target.nickname || "この参加者"} の案内を完了しますか？`
    );


  if (!confirmed) {
    return;
  }


  try {

    await updateDoc(
      doc(
        db,
        "festivalScores",
        scoreId
      ),
      {
        completed: true
      }
    );

  } catch (error) {

    console.error(
      "Complete Error:",
      error
    );


    window.alert(
      "案内完了の更新に失敗しました。"
    );

  }

}


// ========================================
// UPDATE COUNTS
// ========================================

function updateCounts() {

  const total =
    scores.length;


  const waiting =
    scores.filter(
      (score) =>
        score.completed !== true
    ).length;


  const complete =
    scores.filter(
      (score) =>
        score.completed === true
    ).length;


  if (entryCount) {

    entryCount.textContent =
      total.toLocaleString(
        "ja-JP"
      );

  }


  if (waitingCount) {

    waitingCount.textContent =
      waiting.toLocaleString(
        "ja-JP"
      );

  }


  if (completeCount) {

    completeCount.textContent =
      complete.toLocaleString(
        "ja-JP"
      );

  }

}


// ========================================
// UPDATE MODE UI
// ========================================

function updateModeUI() {

  if (newestButton) {

    newestButton.classList.toggle(
      "active",
      currentMode === "newest"
    );

  }


  if (rankingButton) {

    rankingButton.classList.toggle(
      "active",
      currentMode === "ranking"
    );

  }


  if (sortModeText) {

    if (currentMode === "ranking") {

      sortModeText.textContent =
        "RANKING";

    } else {

      sortModeText.textContent =
        "NEWEST";

    }

  }

}


// ========================================
// NEWEST BUTTON
// ========================================

if (newestButton) {

  newestButton.addEventListener(
    "click",
    () => {

      if (
        currentMode === "newest"
      ) {
        return;
      }


      currentMode =
        "newest";


      updateModeUI();

      renderScores();

    }
  );

}


// ========================================
// RANKING BUTTON
// ========================================

if (rankingButton) {

  rankingButton.addEventListener(
    "click",
    () => {

      if (
        currentMode === "ranking"
      ) {
        return;
      }


      currentMode =
        "ranking";


      updateModeUI();

      renderScores();

    }
  );

}


// ========================================
// REALTIME DATABASE
// ========================================

const scoresQuery =
  query(
    scoresCollection,
    orderBy(
      "createdAt",
      "desc"
    )
  );


onSnapshot(
  scoresQuery,
  (snapshot) => {


    scores =
      snapshot.docs.map(
        (document) => ({

          id:
            document.id,

          ...document.data()

        })
      );


    updateCounts();

    renderScores();

  },

  (error) => {

    console.error(
      "Firestore Listener Error:",
      error
    );


    if (emptyMessage) {

      emptyMessage.classList.remove(
        "hidden"
      );

      emptyMessage.innerHTML = `
        <div class="empty-code">
          // DATABASE ERROR
        </div>

        <div class="empty-title">
          CONNECTION ERROR
        </div>

        <div class="empty-text">
          FIRESTORE CONNECTION FAILED
        </div>
      `;

    }

  }
);


// ========================================
// CODE RAIN
// ========================================

function createCodeRain() {

  if (!codeRain) {
    return;
  }


  codeRain.innerHTML = "";


  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]{}";


  const width =
    window.innerWidth;


  const columnCount =
    Math.max(
      18,
      Math.floor(
        width / 32
      )
    );


  for (
    let i = 0;
    i < columnCount;
    i++
  ) {


    const column =
      document.createElement("div");


    column.className =
      "code-column";


    // ------------------------------------
    // RED
    // ------------------------------------

    if (
      Math.random() < 0.13
    ) {

      column.classList.add(
        "red"
      );

    }


    // ------------------------------------
    // TEXT
    // ------------------------------------

    let text = "";


    const length =
      25 +
      Math.floor(
        Math.random() * 45
      );


    for (
      let j = 0;
      j < length;
      j++
    ) {

      const random =
        Math.floor(
          Math.random()
          *
          characters.length
        );


      text +=
        characters[random];

      text += "\n";

    }


    column.textContent =
      text;


    // ------------------------------------
    // POSITION
    // ------------------------------------

    column.style.left =
      `${Math.random() * 100}%`;


    // ------------------------------------
    // FONT
    // ------------------------------------

    column.style.fontSize =
      `${8 + Math.random() * 5}px`;


    // ------------------------------------
    // SPEED
    // ------------------------------------

    column.style.animationDuration =
      `${8 + Math.random() * 18}s`;


    // ------------------------------------
    // DELAY
    // ------------------------------------

    column.style.animationDelay =
      `${Math.random() * -20}s`;


    // ------------------------------------
    // OPACITY
    // ------------------------------------

    column.style.opacity =
      `${0.12 + Math.random() * 0.35}`;


    codeRain.appendChild(
      column
    );

  }

}


// ========================================
// INITIAL CODE RAIN
// ========================================

createCodeRain();


// ========================================
// RESIZE
// ========================================

let resizeTimer = null;


window.addEventListener(
  "resize",
  () => {

    clearTimeout(
      resizeTimer
    );


    resizeTimer =
      setTimeout(
        () => {

          createCodeRain();

        },
        300
      );

  }
);


// ========================================
// ALL DATA RESET
// ========================================

async function resetAllData() {

  if (isResetting) {
    return;
  }


  // --------------------------------------
  // CONFIRM 1
  // --------------------------------------

  const firstConfirm =
    window.confirm(
      "本当に全データを初期化しますか？\n\n登録されている点数データがすべて削除されます。"
    );


  if (!firstConfirm) {
    return;
  }


  // --------------------------------------
  // CONFIRM 2
  // --------------------------------------

  const secondConfirm =
    window.confirm(
      "【最終確認】\n\nすべての参加者データを削除します。\nこの操作は元に戻せません。\n\n本当に実行しますか？"
    );


  if (!secondConfirm) {
    return;
  }


  isResetting = true;


  try {


    // ====================================
    // GET ALL DOCUMENTS
    // ====================================

    const snapshot =
      await getDocs(
        scoresCollection
      );


    // ====================================
    // DELETE
    // ====================================

    const deletePromises =
      snapshot.docs.map(
        (document) =>
          deleteDoc(
            doc(
              db,
              "festivalScores",
              document.id
            )
          )
      );


    await Promise.all(
      deletePromises
    );


    window.alert(
      "全データを初期化しました。"
    );


  } catch (error) {

    console.error(
      "Reset Error:",
      error
    );


    window.alert(
      "データの初期化に失敗しました。"
    );


  } finally {

    isResetting = false;

  }

}


// ========================================
// RESET BUTTON
// ========================================
//
// index.html / scores.html のどちらかに
// id="resetAllButton" があれば動作します。
// ========================================

const resetAllButton =
  document.getElementById(
    "resetAllButton"
  );


if (resetAllButton) {

  resetAllButton.addEventListener(
    "click",
    resetAllData
  );

}


// ========================================
// INITIALIZE UI
// ========================================

updateModeUI();


// ========================================
// DEBUG
// ========================================

console.log(
  "FESTIVAL SCORE SYSTEM / scores.js READY"
);
