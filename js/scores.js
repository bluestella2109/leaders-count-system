/* =========================================================
   FESTIVAL SCORE SYSTEM
   scores.js
========================================================= */

import { db } from "./firebase.js";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================================
   ELEMENTS
========================================================= */

const scoreList =
  document.getElementById("scoreList");

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

const emptyMessage =
  document.getElementById("emptyMessage");



/* =========================================================
   VARIABLES
========================================================= */

let scores = [];

let currentSort =
  "newest";

let isUpdating =
  false;



/* =========================================================
   FIRESTORE QUERY
========================================================= */

const scoresQuery =
  query(
    collection(
      db,
      "festivalScores"
    ),
    orderBy(
      "createdAt",
      "desc"
    )
  );



/* =========================================================
   REALTIME LISTENER
========================================================= */

onSnapshot(
  scoresQuery,
  (snapshot) => {

    scores = [];


    snapshot.forEach(
      (document) => {

        const data =
          document.data();


        scores.push({

          id:
            document.id,

          nickname:
            data.nickname || "UNKNOWN",

          quizScore:
            Number(
              data.quizScore || 0
            ),

          shootingScore:
            Number(
              data.shootingScore || 0
            ),

          totalScore:
            Number(
              data.totalScore || 0
            ),

          completed:
            data.completed === true,

          createdAt:
            data.createdAt || null

        });

      }
    );


    updateInformation();

    renderScores();

  },


  (error) => {

    console.error(
      "Firestore error:",
      error
    );


    if (scoreList) {

      scoreList.innerHTML = `
        <div class="error-message">
          <span>ERROR</span>
          <strong>DATABASE CONNECTION FAILED</strong>
          <small>通信状態を確認してください。</small>
        </div>
      `;

    }

  }

);



/* =========================================================
   UPDATE INFORMATION
========================================================= */

function updateInformation() {

  const total =
    scores.length;


  const completed =
    scores.filter(
      (score) =>
        score.completed === true
    ).length;


  const waiting =
    total - completed;


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
      completed.toLocaleString(
        "ja-JP"
      );

  }

}



/* =========================================================
   SORT BUTTONS
========================================================= */

if (newestButton) {

  newestButton.addEventListener(
    "click",
    () => {

      if (
        currentSort === "newest"
      ) {
        return;
      }


      currentSort =
        "newest";


      updateSortButtons();

      renderScores();

    }
  );

}



if (rankingButton) {

  rankingButton.addEventListener(
    "click",
    () => {

      if (
        currentSort === "ranking"
      ) {
        return;
      }


      currentSort =
        "ranking";


      updateSortButtons();

      renderScores();

    }
  );

}



/* =========================================================
   UPDATE SORT BUTTONS
========================================================= */

function updateSortButtons() {

  if (newestButton) {

    newestButton.classList.toggle(
      "active",
      currentSort === "newest"
    );

  }


  if (rankingButton) {

    rankingButton.classList.toggle(
      "active",
      currentSort === "ranking"
    );

  }


  if (sortModeText) {

    sortModeText.textContent =
      currentSort === "newest"
        ? "SORT : NEWEST"
        : "SORT : RANKING";

  }

}



/* =========================================================
   RENDER SCORES
========================================================= */

function renderScores() {

  if (!scoreList) {
    return;
  }


  if (
    scores.length === 0
  ) {

    scoreList.innerHTML =
      "";


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


  /*
   * コピーを作成して
   * 元データを壊さない
   */

  let sortedScores =
    [...scores];


  /* -------------------------------------------------------
     NEWEST
  ------------------------------------------------------- */

  if (
    currentSort === "newest"
  ) {

    sortedScores.sort(
      (a, b) => {

        const aTime =
          getTime(
            a.createdAt
          );

        const bTime =
          getTime(
            b.createdAt
          );


        return bTime - aTime;

      }
    );

  }


  /* -------------------------------------------------------
     RANKING
  ------------------------------------------------------- */

  if (
    currentSort === "ranking"
  ) {

    sortedScores.sort(
      (a, b) => {

        /*
         * まず合計点
         */

        if (
          b.totalScore !==
          a.totalScore
        ) {

          return (
            b.totalScore -
            a.totalScore
          );

        }


        /*
         * 同点なら新しい方
         */

        const aTime =
          getTime(
            a.createdAt
          );

        const bTime =
          getTime(
            b.createdAt
          );


        return bTime - aTime;

      }
    );

  }


  /*
   * HTML生成
   */

  scoreList.innerHTML =
    sortedScores
      .map(
        (
          score,
          index
        ) => {

          return createScoreCard(
            score,
            index
          );

        }
      )
      .join("");


  /*
   * 完了ボタン
   */

  attachCompleteButtons();

}



/* =========================================================
   CREATE SCORE CARD
========================================================= */

function createScoreCard(
  score,
  index
) {

  const rank =
    index + 1;


  const statusClass =
    score.completed
      ? "completed"
      : "waiting";


  const statusText =
    score.completed
      ? "COMPLETE"
      : "WAITING";


  const dateText =
    formatDate(
      score.createdAt
    );


  /*
   * ランキング表示
   */

  let rankHTML =
    "";


  if (
    currentSort === "ranking"
  ) {

    rankHTML = `
      <div class="score-rank">
        <span>RANK</span>
        <strong>
          ${rank
            .toString()
            .padStart(2, "0")}
        </strong>
      </div>
    `;

  }



  /*
   * 完了ボタン
   */

  let actionHTML =
    "";


  if (
    score.completed
  ) {

    actionHTML = `
      <div class="score-completed">
        <span>✓</span>
       案内完了
      </div>
    `;

  } else {

    actionHTML = `
      <button
        class="complete-button"
        data-id="${escapeHTML(
          score.id
        )}"
      >
        案内完了
      </button>
    `;

  }



  return `
    <article
      class="score-card ${statusClass}"
    >

      <div class="score-main">

        ${rankHTML}

        <div class="player-info">

          <div class="player-label">
            PLAYER
          </div>

          <div class="player-name">
            ${escapeHTML(
              score.nickname
            )}
          </div>

          <div class="score-date">
            ${dateText}
          </div>

        </div>


        <div class="total-score">

          <span>TOTAL</span>

          <strong>
            ${score.totalScore.toLocaleString(
              "ja-JP"
            )}
          </strong>

          <small>PTS</small>

        </div>

      </div>


      <div class="score-details">

        <div class="detail-item">

          <span>QUIZ</span>

          <strong>
            ${score.quizScore.toLocaleString(
              "ja-JP"
            )}
          </strong>

        </div>


        <div class="detail-item">

          <span>SHOOTING</span>

          <strong>
            ${score.shootingScore.toLocaleString(
              "ja-JP"
            )}
          </strong>

        </div>


        <div class="detail-status">

          <span
            class="status-dot"
          ></span>

          ${statusText}

        </div>


        ${actionHTML}

      </div>

    </article>
  `;

}



/* =========================================================
   COMPLETE BUTTONS
========================================================= */

function attachCompleteButtons() {

  const buttons =
    document.querySelectorAll(
      ".complete-button"
    );


  buttons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset.id;


          if (!id) {
            return;
          }


          completeScore(
            id,
            button
          );

        }
      );

    }
  );

}



/* =========================================================
   COMPLETE SCORE
========================================================= */

async function completeScore(
  id,
  button
) {

  if (isUpdating) {
    return;
  }


  if (!id) {
    return;
  }


  /*
   * 確認
   */

  const confirmed =
    window.confirm(
      "この人を「案内完了」にしますか？"
    );


  if (!confirmed) {
    return;
  }


  isUpdating =
    true;


  /*
   * ボタンを一時停止
   */

  if (button) {

    button.disabled =
      true;

    button.textContent =
      "UPDATING...";

  }


  try {

    await updateDoc(
      doc(
        db,
        "festivalScores",
        id
      ),
      {

        completed:
          true

      }
    );


  } catch (error) {

    console.error(
      "Complete update error:",
      error
    );


    alert(
      "案内完了の更新に失敗しました。"
    );


    if (button) {

      button.disabled =
        false;

      button.textContent =
        "案内完了";

    }

  } finally {

    isUpdating =
      false;

  }

}



/* =========================================================
   GET FIRESTORE TIMESTAMP
========================================================= */

function getTime(
  timestamp
) {

  if (!timestamp) {
    return 0;
  }


  /*
   * Firestore Timestamp
   */

  if (
    typeof timestamp.toMillis ===
    "function"
  ) {

    return timestamp.toMillis();

  }


  /*
   * Date
   */

  if (
    timestamp instanceof Date
  ) {

    return timestamp.getTime();

  }


  /*
   * number
   */

  if (
    typeof timestamp ===
    "number"
  ) {

    return timestamp;

  }


  return 0;

}



/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
  timestamp
) {

  const time =
    getTime(
      timestamp
    );


  if (!time) {

    return "TIME UNKNOWN";

  }


  const date =
    new Date(
      time
    );


  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  const hour =
    String(
      date.getHours()
    ).padStart(
      2,
      "0"
    );


  const minute =
    String(
      date.getMinutes()
    ).padStart(
      2,
      "0"
    );


  return `${year}.${month}.${day} ${hour}:${minute}`;

}



/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
  value
) {

  return String(
    value
  )
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



/* =========================================================
   CODE RAIN
========================================================= */

function createCodeRain() {

  const container =
    document.getElementById(
      "codeRain"
    );


  if (!container) {
    return;
  }


  /*
   * 一度削除して再生成
   */

  container.innerHTML =
    "";


  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz<>/[]{}#%&";


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
      document.createElement(
        "div"
      );


    column.className =
      "code-column";


    /*
     * 一部の列だけ赤
     */

    if (
      Math.random() < 0.12
    ) {

      column.classList.add(
        "red"
      );

    }


    let text =
      "";


    const length =
      20 +
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
          Math.random() *
          characters.length
        );


      text +=
        characters[random];

    }


    column.textContent =
      text;


    /*
     * 横位置
     */

    column.style.left =
      `${Math.random() * 100}%`;


    /*
     * アニメーション速度
     */

    column.style.animationDuration =
      `${8 + Math.random() * 18}s`;


    /*
     * 開始位置
     */

    column.style.animationDelay =
      `${Math.random() * -20}s`;


    /*
     * 透明度
     */

    column.style.opacity =
      `${0.18 + Math.random() * 0.5}`;


    /*
     * 文字サイズ
     */

    column.style.fontSize =
      `${10 + Math.random() * 5}px`;


    container.appendChild(
      column
    );

  }

}



/* =========================================================
   INITIALIZE
========================================================= */

updateSortButtons();

createCodeRain();



/* =========================================================
   RESIZE
========================================================= */

let resizeTimer;


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
        250
      );

  }
);
