/* =========================================================
   FESTIVAL SCORE SYSTEM
   js/scores.js

   SCORE LIST / RANKING
========================================================= */

import {
  db,
  SCORES_COLLECTION
} from "./firebase.js";


import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================================
   ELEMENTS
========================================================= */

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


/* =========================================================
   VARIABLES
========================================================= */

let scores = [];


/*
  表示モード

  newest
  ↓
  新着順

  ranking
  ↓
  ランキング順
*/

let currentMode =
  "newest";


/*
  案内完了処理中のID

  同じボタンを連打して
  二重更新されるのを防ぐ
*/

const updatingIds =
  new Set();


/* =========================================================
   INITIALIZE
========================================================= */

startScoreListener();


/* =========================================================
   SORT BUTTONS
========================================================= */

if (newestButton) {

  newestButton.addEventListener(
    "click",
    () => {

      currentMode =
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

      currentMode =
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

    if (
      currentMode === "newest"
    ) {

      sortModeText.textContent =
        "SORT : NEWEST";

    } else {

      sortModeText.textContent =
        "SORT : RANKING";

    }

  }

}


/* =========================================================
   FIRESTORE LISTENER
========================================================= */

function startScoreListener() {


  /*
    createdAtの新しい順で取得

    ここではFirestoreから
    「新着順」の元データを取得します。
  */

  const scoresQuery =
    query(
      collection(
        db,
        SCORES_COLLECTION
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );


  onSnapshot(
    scoresQuery,
    (snapshot) => {


      scores = [];


      snapshot.forEach(
        (documentSnapshot) => {


          const data =
            documentSnapshot.data();


          scores.push({

            id:
              documentSnapshot.id,

            nickname:
              data.nickname ?? "UNKNOWN",

            quizScore:
              Number(
                data.quizScore ?? 0
              ),

            shootingScore:
              Number(
                data.shootingScore ?? 0
              ),

            totalScore:
              Number(
                data.totalScore ?? 0
              ),

            completed:
              data.completed === true,

            createdAt:
              data.createdAt ?? null

          });

        }
      );


      /*
        ランキング順位を計算
      */

      calculateRanks();


      /*
        上部の件数を更新
      */

      updateStatistics();


      /*
        一覧を表示
      */

      renderScores();

    },


    (error) => {

      console.error(
        "Firestore listener error:",
        error
      );


      if (scoreList) {

        scoreList.innerHTML = `
          <div class="error-message">
            <div class="error-code">
              ERROR
            </div>

            <div>
              データを取得できませんでした。
            </div>

            <small>
              ${escapeHTML(error.message)}
            </small>
          </div>
        `;

      }

    }

  );

}


/* =========================================================
   CALCULATE RANKS
========================================================= */

function calculateRanks() {


  /*
    ランキング用コピー

    元の scores は
    新着順のまま維持します。
  */

  const rankingScores =
    [...scores];


  /*
    合計点の高い順

    同点の場合は
    登録が早い人を上位にします。
  */

  rankingScores.sort(
    (a, b) => {

      if (
        b.totalScore !==
        a.totalScore
      ) {

        return (
          b.totalScore -
          a.totalScore
        );

      }


      return (
        getTime(a.createdAt) -
        getTime(b.createdAt)
      );

    }
  );


  /*
    順位を付与
  */

  rankingScores.forEach(
    (score, index) => {

      score.rank =
        index + 1;

    }
  );

}


/* =========================================================
   GET TIME
========================================================= */

function getTime(
  timestamp
) {


  if (!timestamp) {

    return 0;

  }


  /*
    Firestore Timestamp
  */

  if (
    typeof timestamp.toMillis ===
    "function"
  ) {

    return timestamp.toMillis();

  }


  /*
    Date
  */

  if (
    timestamp instanceof Date
  ) {

    return timestamp.getTime();

  }


  return 0;

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {


  const total =
    scores.length;


  const complete =
    scores.filter(
      score =>
        score.completed
    ).length;


  const waiting =
    total - complete;


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


/* =========================================================
   RENDER SCORES
========================================================= */

function renderScores() {


  if (!scoreList) {

    return;

  }


  /*
    データがない場合
  */

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
    表示用配列を作成

    scores自体は新着順
  */

  let displayScores =
    [...scores];


  /*
    ランキング順の場合

    rankの小さい順
  */

  if (
    currentMode === "ranking"
  ) {

    displayScores.sort(
      (a, b) =>
        a.rank - b.rank
    );

  }


  /*
    新着順の場合

    Firestoreから取得した
    createdAt desc の順をそのまま使用
  */


  scoreList.innerHTML =
    "";


  /*
    各行を生成
  */

  displayScores.forEach(
    (score, index) => {

      const row =
        createScoreRow(
          score,
          index
        );


      scoreList.appendChild(
        row
      );

    }
  );

}


/* =========================================================
   CREATE SCORE ROW
========================================================= */

function createScoreRow(
  score,
  index
) {


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "score-row";


  /*
    完了済みならクラス追加
  */

  if (score.completed) {

    row.classList.add(
      "completed"
    );

  }


  /*
    更新中ならクラス追加
  */

  if (
    updatingIds.has(
      score.id
    )
  ) {

    row.classList.add(
      "updating"
    );

  }


  /* =======================================================
     RANK
  ======================================================= */

  const rankCell =
    document.createElement(
      "div"
    );


  rankCell.className =
    "score-rank";


  rankCell.textContent =
    formatRank(
      score.rank
    );


  /*
    上位3位
  */

  if (
    score.rank === 1
  ) {

    rankCell.classList.add(
      "rank-1"
    );

  }


  if (
    score.rank === 2
  ) {

    rankCell.classList.add(
      "rank-2"
    );

  }


  if (
    score.rank === 3
  ) {

    rankCell.classList.add(
      "rank-3"
    );

  }


  /* =======================================================
     NICKNAME
  ======================================================= */

  const nicknameCell =
    document.createElement(
      "div"
    );


  nicknameCell.className =
    "score-nickname";


  nicknameCell.textContent =
    score.nickname;


  nicknameCell.title =
    score.nickname;


  /* =======================================================
     QUIZ
  ======================================================= */

  const quizCell =
    document.createElement(
      "div"
    );


  quizCell.className =
    "score-number score-quiz";


  quizCell.textContent =
    score.quizScore.toLocaleString(
      "ja-JP"
    );


  /* =======================================================
     SHOOTING
  ======================================================= */

  const shootingCell =
    document.createElement(
      "div"
    );


  shootingCell.className =
    "score-number score-shooting";


  shootingCell.textContent =
    score.shootingScore.toLocaleString(
      "ja-JP"
    );


  /* =======================================================
     TOTAL
  ======================================================= */

  const totalCell =
    document.createElement(
      "div"
    );


  totalCell.className =
    "score-total";


  totalCell.textContent =
    score.totalScore.toLocaleString(
      "ja-JP"
    );


  totalCell.dataset.text =
    score.totalScore.toLocaleString(
      "ja-JP"
    );


  /* =======================================================
     STATUS
  ======================================================= */

  const statusCell =
    document.createElement(
      "div"
    );


  statusCell.className =
    "score-status";


  const statusBadge =
    document.createElement(
      "span"
    );


  statusBadge.className =
    "status-badge";


  if (score.completed) {

    statusBadge.classList.add(
      "status-complete"
    );

    statusBadge.textContent =
      "完了";

  } else {

    statusBadge.classList.add(
      "status-waiting"
    );

    statusBadge.textContent =
      "待機";

  }


  statusCell.appendChild(
    statusBadge
  );


  /* =======================================================
     ACTION
  ======================================================= */

  const actionCell =
    document.createElement(
      "div"
    );


  actionCell.className =
    "score-action";


  if (score.completed) {


    const completeText =
      document.createElement(
        "span"
      );


    completeText.className =
      "complete-text";


    completeText.textContent =
      "✓ 完了";


    actionCell.appendChild(
      completeText
    );


  } else {


    const completeButton =
      document.createElement(
        "button"
      );


    completeButton.className =
      "complete-button";


    completeButton.type =
      "button";


    completeButton.textContent =
      "案内完了";


    /*
      更新中
    */

    if (
      updatingIds.has(
        score.id
      )
    ) {

      completeButton.disabled =
        true;

      completeButton.textContent =
        "更新中...";

    }


    completeButton.addEventListener(
      "click",
      () => {

        completeScore(
          score.id
        );

      }
    );


    actionCell.appendChild(
      completeButton
    );

  }


  /* =======================================================
     APPEND CELLS
  ======================================================= */

  row.appendChild(
    rankCell
  );


  row.appendChild(
    nicknameCell
  );


  row.appendChild(
    quizCell
  );


  row.appendChild(
    shootingCell
  );


  row.appendChild(
    totalCell
  );


  row.appendChild(
    statusCell
  );


  row.appendChild(
    actionCell
  );


  return row;

}


/* =========================================================
   FORMAT RANK
========================================================= */

function formatRank(
  rank
) {


  return String(
    rank
  ).padStart(
    2,
    "0"
  );

}


/* =========================================================
   COMPLETE SCORE
========================================================= */

async function completeScore(
  id
) {


  /*
    連打防止
  */

  if (
    updatingIds.has(id)
  ) {

    return;

  }


  const target =
    scores.find(
      score =>
        score.id === id
    );


  if (!target) {

    return;

  }


  /*
    すでに完了していたら何もしない
  */

  if (
    target.completed
  ) {

    return;

  }


  /*
    確認ダイアログ
  */

  const confirmed =
    window.confirm(
      `${target.nickname} さんを「案内完了」にしますか？`
    );


  if (!confirmed) {

    return;

  }


  /*
    更新開始
  */

  updatingIds.add(
    id
  );


  renderScores();


  try {


    const scoreRef =
      doc(
        db,
        SCORES_COLLECTION,
        id
      );


    await updateDoc(
      scoreRef,
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
      "案内完了の更新に失敗しました。\n通信状態を確認してください。"
    );


  } finally {


    updatingIds.delete(
      id
    );


    /*
      FirestoreのonSnapshotが
      自動的に再描画します。
    */

  }

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
    既存の雨を削除
  */

  container.innerHTML =
    "";


  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz<>/[]{}#%&$";


  const width =
    window.innerWidth;


  const columnCount =
    Math.max(
      15,
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
      一部だけ赤
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


      const randomIndex =
        Math.floor(
          Math.random()
          *
          characters.length
        );


      text +=
        characters[randomIndex];


      text +=
        "\n";

    }


    column.textContent =
      text;


    /*
      横位置
    */

    column.style.left =
      `${
        Math.random() * 100
      }%`;


    /*
      アニメーション速度
    */

    column.style.animationDuration =
      `${
        8 +
        Math.random() * 18
      }s`;


    /*
      ランダムな開始位置
    */

    column.style.animationDelay =
      `${
        Math.random() * -20
      }s`;


    /*
      透明度
    */

    column.style.opacity =
      `${
        0.15 +
        Math.random() * 0.45
      }`;


    /*
      サイズ
    */

    column.style.fontSize =
      `${
        8 +
        Math.random() * 4
      }px`;


    container.appendChild(
      column
    );

  }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
  value
) {


  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    String(
      value ?? ""
    );


  return div.innerHTML;

}


/* =========================================================
   CREATE CODE RAIN
========================================================= */

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
        300
      );

  }
);


/* =========================================================
   INITIAL SORT BUTTON
========================================================= */

updateSortButtons();
