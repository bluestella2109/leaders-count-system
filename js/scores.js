import { db } from "./firebase.js";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
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

let sortMode = "newest";

let unsubscribe = null;


/* =========================================================
   START
========================================================= */

loadScores();


/* =========================================================
   LOAD FIRESTORE
========================================================= */

function loadScores() {

  const scoresRef =
    collection(
      db,
      "festivalScores"
    );


  /*
    createdAtの新しい順で取得

    ランキング表示は
    JavaScript側で並び替える
  */

  const scoresQuery =
    query(
      scoresRef,
      orderBy(
        "createdAt",
        "desc"
      )
    );


  unsubscribe =
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


        scoreList.innerHTML = "";


        emptyMessage.classList.remove(
          "hidden"
        );


        emptyMessage.innerHTML = `

          <div class="empty-code">
            ERROR
          </div>

          <div class="empty-title">
            DATABASE ERROR
          </div>

          <div class="empty-description">
            FIRESTORE CONNECTION FAILED
          </div>

        `;

      }

    );

}


/* =========================================================
   INFORMATION
========================================================= */

function updateInformation() {

  const total =
    scores.length;


  const complete =
    scores.filter(
      (score) =>
        score.completed === true
    ).length;


  const waiting =
    total - complete;


  entryCount.textContent =
    total;


  waitingCount.textContent =
    waiting;


  completeCount.textContent =
    complete;

}


/* =========================================================
   SORT
========================================================= */

function sortScores() {

  const sorted =
    [...scores];


  /* -----------------------------------------
     NEWEST
  ----------------------------------------- */

  if (sortMode === "newest") {

    sorted.sort(
      (a, b) => {

        const aTime =
          getTime(a.createdAt);

        const bTime =
          getTime(b.createdAt);

        return bTime - aTime;

      }
    );

  }


  /* -----------------------------------------
     RANKING
  ----------------------------------------- */

  if (sortMode === "ranking") {

    sorted.sort(
      (a, b) => {

        /*
          点数が高い順
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
          同点なら新しい順
        */

        return (
          getTime(b.createdAt) -
          getTime(a.createdAt)
        );

      }
    );

  }


  return sorted;

}


/* =========================================================
   GET TIME
========================================================= */

function getTime(timestamp) {

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
   RENDER
========================================================= */

function renderScores() {

  scoreList.innerHTML = "";


  if (scores.length === 0) {

    emptyMessage.classList.remove(
      "hidden"
    );

    return;

  }


  emptyMessage.classList.add(
    "hidden"
  );


  const sorted =
    sortScores();


  sorted.forEach(
    (score, index) => {

      const item =
        createScoreItem(
          score,
          index
        );


      scoreList.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   CREATE SCORE ITEM
========================================================= */

function createScoreItem(
  score,
  index
) {

  const article =
    document.createElement(
      "article"
    );


  article.className =
    "score-item";


  if (score.completed) {

    article.classList.add(
      "completed"
    );

  }


  /* -----------------------------------------
     PLAYER AREA
  ----------------------------------------- */

  const player =
    document.createElement(
      "div"
    );


  player.className =
    "score-player";


  const name =
    document.createElement(
      "div"
    );


  name.className =
    "score-player-name";


  name.textContent =
    score.nickname;


  const detail =
    document.createElement(
      "div"
    );


  detail.className =
    "score-player-detail";


  detail.textContent =
    `QUIZ ${formatNumber(score.quizScore)}  /  SHOOTING ${formatNumber(score.shootingScore)}`;


  player.appendChild(
    name
  );


  player.appendChild(
    detail
  );


  /* -----------------------------------------
     SCORE AREA
  ----------------------------------------- */

  const scoreArea =
    document.createElement(
      "div"
    );


  scoreArea.className =
    "score-value";


  /*
    ランキング時だけ順位を表示
  */

  if (sortMode === "ranking") {

    const rank =
      document.createElement(
        "span"
      );


    rank.className =
      "score-rank";


    rank.textContent =
      `#${index + 1}`;


    scoreArea.appendChild(
      rank
    );

  }


  const total =
    document.createElement(
      "span"
    );


  total.textContent =
    formatNumber(
      score.totalScore
    );


  scoreArea.appendChild(
    total
  );


  /* -----------------------------------------
     COMPLETE BUTTON
  ----------------------------------------- */

  if (!score.completed) {

    const completeButton =
      document.createElement(
        "button"
      );


    completeButton.type =
      "button";


    completeButton.className =
      "complete-button";


    completeButton.textContent =
      "案内完了";


    completeButton.addEventListener(
      "click",
      () => {

        completeScore(
          score.id,
          completeButton
        );

      }
    );


    player.appendChild(
      completeButton
    );

  }


  /* -----------------------------------------
     APPEND
  ----------------------------------------- */

  article.appendChild(
    player
  );


  article.appendChild(
    scoreArea
  );


  return article;

}


/* =========================================================
   COMPLETE
========================================================= */

async function completeScore(
  id,
  button
) {

  if (!id) {
    return;
  }


  const confirmed =
    window.confirm(
      "この参加者を「案内完了」にしますか？"
    );


  if (!confirmed) {
    return;
  }


  button.disabled =
    true;


  button.textContent =
    "処理中...";


  try {

    const scoreRef =
      doc(
        db,
        "festivalScores",
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
      "Complete error:",
      error
    );


    button.disabled =
      false;


    button.textContent =
      "案内完了";


    alert(
      "更新に失敗しました。\n通信状態を確認してください。"
    );

  }

}


/* =========================================================
   NEWEST BUTTON
========================================================= */

newestButton.addEventListener(
  "click",
  () => {

    if (
      sortMode === "newest"
    ) {
      return;
    }


    sortMode =
      "newest";


    newestButton.classList.add(
      "active"
    );


    rankingButton.classList.remove(
      "active"
    );


    sortModeText.textContent =
      "SORT : NEWEST";


    renderScores();

  }
);


/* =========================================================
   RANKING BUTTON
========================================================= */

rankingButton.addEventListener(
  "click",
  () => {

    if (
      sortMode === "ranking"
    ) {
      return;
    }


    sortMode =
      "ranking";


    rankingButton.classList.add(
      "active"
    );


    newestButton.classList.remove(
      "active"
    );


    sortModeText.textContent =
      "SORT : RANKING";


    renderScores();

  }
);


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(
  number
) {

  return Number(
    number || 0
  ).toLocaleString(
    "ja-JP"
  );

}


/* =========================================================
   PAGE LEAVE
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    if (
      typeof unsubscribe ===
      "function"
    ) {

      unsubscribe();

    }

  }
);
