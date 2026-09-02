import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";



/* =========================================
   ELEMENTS
========================================= */

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

const resetButton =
  document.getElementById("resetButton");



/* =========================================
   VARIABLES
========================================= */

let scores = [];

let displayMode = "newest";



/* =========================================
   LOAD DATA
========================================= */

async function loadScores() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "festivalScores"
        )
      );


    scores =
      snapshot.docs.map(
        documentSnapshot => {

          const data =
            documentSnapshot.data();

          return {

            id:
              documentSnapshot.id,

            ...data

          };

        }
      );


    calculateRanking();

    render();

  }
  catch (error) {

    console.error(
      "Failed to load scores:",
      error
    );

    scoreList.innerHTML = `
      <div class="database-error">
        DATABASE ERROR
      </div>
    `;

  }

}



/* =========================================
   CALCULATE RANKING
========================================= */

function calculateRanking() {

  /*
   * 合計点の高い順に並べる
   *
   * 同点の場合は登録時間の早い方を上位
   */

  const rankingList =
    [...scores].sort(
      (a, b) => {

        const totalA =
          Number(a.totalScore || 0);

        const totalB =
          Number(b.totalScore || 0);


        if (totalB !== totalA) {

          return totalB - totalA;

        }


        const timeA =
          getTime(a.createdAt);

        const timeB =
          getTime(b.createdAt);


        return timeA - timeB;

      }
    );


  /*
   * ここでランキング順位を
   * 元データに保存
   */

  rankingList.forEach(
    (score, index) => {

      const target =
        scores.find(
          item => item.id === score.id
        );

      if (target) {

        target.rank =
          index + 1;

      }

    }
  );

}



/* =========================================
   GET TIME
========================================= */

function getTime(timestamp) {

  if (!timestamp) {
    return Number.MAX_SAFE_INTEGER;
  }


  if (
    typeof timestamp.toMillis ===
    "function"
  ) {

    return timestamp.toMillis();

  }


  if (
    timestamp.seconds !== undefined
  ) {

    return (
      timestamp.seconds * 1000
      +
      Math.floor(
        (timestamp.nanoseconds || 0)
        / 1000000
      )
    );

  }


  return Number.MAX_SAFE_INTEGER;

}



/* =========================================
   SORT FOR DISPLAY
========================================= */

function getDisplayScores() {

  const list =
    [...scores];


  if (displayMode === "ranking") {

    /*
     * ランキング順
     */

    list.sort(
      (a, b) =>
        Number(a.rank || 999999)
        -
        Number(b.rank || 999999)
    );

  }
  else {

    /*
     * 新着順
     */

    list.sort(
      (a, b) =>
        getTime(b.createdAt)
        -
        getTime(a.createdAt)
    );

  }


  return list;

}



/* =========================================
   RENDER
========================================= */

function render() {

  updateCounters();


  const displayScores =
    getDisplayScores();


  scoreList.innerHTML = "";


  if (displayScores.length === 0) {

    emptyMessage.classList.remove(
      "hidden"
    );

    return;

  }


  emptyMessage.classList.add(
    "hidden"
  );


  displayScores.forEach(
    score => {

      const row =
        createScoreRow(score);

      scoreList.appendChild(row);

    }
  );

}



/* =========================================
   COUNTERS
========================================= */

function updateCounters() {

  const total =
    scores.length;


  const waiting =
    scores.filter(
      score =>
        score.completed !== true
    ).length;


  const complete =
    scores.filter(
      score =>
        score.completed === true
    ).length;


  entryCount.textContent =
    total;


  waitingCount.textContent =
    waiting;


  completeCount.textContent =
    complete;

}



/* =========================================
   CREATE ROW
========================================= */

function createScoreRow(score) {

  const row =
    document.createElement("div");


  row.className =
    "score-row";


  if (score.completed === true) {

    row.classList.add(
      "is-complete"
    );

  }


  const rank =
    String(
      score.rank || 0
    ).padStart(
      2,
      "0"
    );


  const nickname =
    escapeHTML(
      score.nickname || "UNKNOWN"
    );


  const quiz =
    Number(
      score.quizScore || 0
    );


  const shooting =
    Number(
      score.shootingScore || 0
    );


  const total =
    Number(
      score.totalScore || 0
    );



  /* ======================================
     ROW HTML
  ====================================== */

  row.innerHTML = `

    <div class="col-rank rank-cell">
      ${rank}
    </div>


    <div
      class="col-player player-cell"
      title="${nickname}"
    >
      ${nickname}
    </div>


    <div class="col-quiz score-cell">
      ${quiz}
    </div>


    <div class="col-shooting score-cell">
      ${shooting}
    </div>


    <div class="col-total total-cell">
      ${total}
    </div>


    <div class="col-status status-cell">

      ${
        score.completed === true

          ? `
            <span class="complete-status">
              ✓ 完了
            </span>
          `

          : `
            <span class="waiting-status">
              待機
            </span>
          `
      }

    </div>


    <div class="col-action action-cell">

      ${
        score.completed === true

          ? `
            <span class="completed-action">
              ✓ 完了
            </span>
          `

          : `
            <button
              class="complete-button"
              type="button"
              data-id="${score.id}"
            >
              案内完了
            </button>
          `
      }

    </div>

  `;


  const completeButton =
    row.querySelector(
      ".complete-button"
    );


  if (completeButton) {

    completeButton.addEventListener(
      "click",
      () => {

        completeScore(
          score.id
        );

      }
    );

  }


  return row;

}



/* =========================================
   COMPLETE SCORE
========================================= */

async function completeScore(id) {

  const target =
    scores.find(
      score =>
        score.id === id
    );


  if (!target) {
    return;
  }


  if (target.completed === true) {
    return;
  }


  const confirmed =
    confirm(
      `${target.nickname || "この参加者"}さんを「完了」にしますか？`
    );


  if (!confirmed) {
    return;
  }


  try {

    await updateDoc(
      doc(
        db,
        "festivalScores",
        id
      ),
      {
        completed: true
      }
    );


    target.completed = true;


    render();

  }
  catch (error) {

    console.error(error);

    alert(
      "更新に失敗しました。"
    );

  }

}



/* =========================================
   RESET ALL DATA
========================================= */

resetButton.addEventListener(
  "click",
  async () => {

    if (scores.length === 0) {

      alert(
        "削除するデータがありません。"
      );

      return;

    }


    const firstConfirm =
      confirm(
        "本当に全データを初期化しますか？\n\nこの操作は元に戻せません。"
      );


    if (!firstConfirm) {
      return;
    }


    const secondConfirm =
      confirm(
        "【最終確認】\n\nすべての点数データを削除します。"
      );


    if (!secondConfirm) {
      return;
    }


    resetButton.disabled = true;

    resetButton.textContent =
      "RESETTING...";


    try {

      /*
       * 全ドキュメントを削除
       */

      await Promise.all(

        scores.map(
          score =>
            deleteDoc(
              doc(
                db,
                "festivalScores",
                score.id
              )
            )
        )

      );


      scores = [];


      calculateRanking();

      render();


      alert(
        "全データを初期化しました。"
      );

    }
    catch (error) {

      console.error(error);

      alert(
        "データの初期化に失敗しました。\nFirebaseのルールを確認してください。"
      );

    }
    finally {

      resetButton.disabled = false;

      resetButton.innerHTML = `
        RESET ALL DATA
        <span>全データ初期化</span>
      `;

    }

  }
);



/* =========================================
   SORT BUTTON
========================================= */

newestButton.addEventListener(
  "click",
  () => {

    displayMode =
      "newest";


    newestButton.classList.add(
      "active"
    );

    rankingButton.classList.remove(
      "active"
    );


    render();

  }
);



rankingButton.addEventListener(
  "click",
  () => {

    displayMode =
      "ranking";


    rankingButton.classList.add(
      "active"
    );

    newestButton.classList.remove(
      "active"
    );


    render();

  }
);



/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}



/* =========================================
   CODE RAIN
========================================= */

function createCodeRain() {

  const container =
    document.getElementById(
      "codeRain"
    );


  if (!container) {
    return;
  }


  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz<>[]{}#$%&/";


  const columnCount =
    Math.max(
      18,
      Math.floor(
        window.innerWidth / 32
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

      text +=
        characters[
          Math.floor(
            Math.random()
            *
            characters.length
          )
        ];

      text += "\n";

    }


    column.textContent =
      text;


    column.style.left =
      `${Math.random() * 100}%`;


    column.style.animationDuration =
      `${10 + Math.random() * 18}s`;


    column.style.animationDelay =
      `${Math.random() * -20}s`;


    column.style.opacity =
      `${0.12 + Math.random() * 0.30}`;


    if (Math.random() < 0.12) {

      column.classList.add(
        "red"
      );

    }


    container.appendChild(
      column
    );

  }

}



/* =========================================
   START
========================================= */

createCodeRain();

loadScores();
