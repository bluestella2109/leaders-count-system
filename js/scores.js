/* =========================================================
   FESTIVAL SCORE SYSTEM
   scores.js

   ・新着順
   ・ランキング順
   ・本来の順位を保持
   ・案内完了
   ・全データ初期化
   ・リアルタイム更新
   ========================================================= */

import { db } from "./firebase.js";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


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


/*
  全データ初期化ボタン

  HTML側で
  id="resetButton"
  または
  id="resetAllButton"

  のどちらでも動くようにしています。
*/

const resetButton =
  document.getElementById("resetButton")
  || document.getElementById("resetAllButton");


/* =========================================================
   VARIABLES
========================================================= */

let allScores = [];

let currentMode = "newest";

let unsubscribe = null;

let isResetting = false;


/* =========================================================
   FIRESTORE COLLECTION
========================================================= */

const scoresRef =
  collection(
    db,
    "festivalScores"
  );


/* =========================================================
   START
========================================================= */

startScores();


function startScores() {

  /*
    Firestoreから全データを取得して
    リアルタイム監視
  */

  unsubscribe =
    onSnapshot(
      scoresRef,
      (snapshot) => {

        allScores =
          snapshot.docs.map(
            (document) => {

              const data =
                document.data();

              return {

                id:
                  document.id,

                nickname:
                  data.nickname || "PLAYER",

                quizScore:
                  toNumber(
                    data.quizScore
                  ),

                shootingScore:
                  toNumber(
                    data.shootingScore
                  ),

                totalScore:
                  toNumber(
                    data.totalScore
                  ),

                completed:
                  data.completed === true,

                createdAt:
                  data.createdAt || null

              };

            }
          );


        /*
          Firestoreのデータが
          変更されたら毎回順位を計算
        */

        render();

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

        emptyMessage.textContent =
          "DATABASE ERROR";

      }
    );

}


/* =========================================================
   NUMBER CONVERSION
========================================================= */

function toNumber(value) {

  const number =
    Number(value);

  if (
    Number.isFinite(number)
  ) {

    return number;

  }

  return 0;

}


/* =========================================================
   TIMESTAMP
========================================================= */

function getTime(score) {

  if (!score.createdAt) {
    return 0;
  }


  /*
    Firestore Timestamp
  */

  if (
    typeof score.createdAt.toMillis
    === "function"
  ) {

    return score.createdAt.toMillis();

  }


  /*
    Date
  */

  if (
    score.createdAt instanceof Date
  ) {

    return score.createdAt.getTime();

  }


  /*
    通常の値
  */

  const time =
    new Date(
      score.createdAt
    ).getTime();


  if (
    Number.isFinite(time)
  ) {

    return time;

  }


  return 0;

}


/* =========================================================
   SORT : NEWEST
========================================================= */

function sortNewest(scores) {

  return [...scores].sort(
    (a, b) => {

      const timeA =
        getTime(a);

      const timeB =
        getTime(b);


      /*
        新しいものを上
      */

      if (
        timeA !== timeB
      ) {

        return timeB - timeA;

      }


      /*
        万が一同時刻なら
        Firestore IDで安定化
      */

      return b.id.localeCompare(
        a.id
      );

    }
  );

}


/* =========================================================
   SORT : RANKING
========================================================= */

function sortRanking(scores) {

  return [...scores].sort(
    (a, b) => {

      /*
        合計点数が高い順
      */

      if (
        a.totalScore !==
        b.totalScore
      ) {

        return (
          b.totalScore
          -
          a.totalScore
        );

      }


      /*
        同点の場合は
        登録が早い人を上位
      */

      const timeA =
        getTime(a);

      const timeB =
        getTime(b);


      if (
        timeA !== timeB
      ) {

        return (
          timeA
          -
          timeB
        );

      }


      return a.id.localeCompare(
        b.id
      );

    }
  );

}


/* =========================================================
   RANKING CALCULATION
========================================================= */

function createRankingMap() {

  const ranking =
    sortRanking(
      allScores
    );


  const map =
    new Map();


  /*
    1位、2位、3位……
  */

  ranking.forEach(
    (score, index) => {

      map.set(
        score.id,
        index + 1
      );

    }
  );


  return map;

}


/* =========================================================
   RENDER
========================================================= */

function render() {

  updateInformation();

  updateButtons();


  /*
    ランキング順位を先に計算

    これが重要。

    新着順で表示していても、

    AAA → 01位
    CCC → 03位
    BBB → 02位

    のように表示できる。
  */

  const rankingMap =
    createRankingMap();


  let displayScores;


  if (
    currentMode === "ranking"
  ) {

    displayScores =
      sortRanking(
        allScores
      );

  } else {

    displayScores =
      sortNewest(
        allScores
      );

  }


  renderList(
    displayScores,
    rankingMap
  );

}


/* =========================================================
   INFORMATION
========================================================= */

function updateInformation() {

  const total =
    allScores.length;


  const completed =
    allScores.filter(
      (score) =>
        score.completed === true
    ).length;


  const waiting =
    total -
    completed;


  if (entryCount) {

    entryCount.textContent =
      total;

  }


  if (waitingCount) {

    waitingCount.textContent =
      waiting;

  }


  if (completeCount) {

    completeCount.textContent =
      completed;

  }

}


/* =========================================================
   BUTTON STATE
========================================================= */

function updateButtons() {

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
      currentMode === "ranking"
    ) {

      sortModeText.textContent =
        "SORT : RANKING";

    } else {

      sortModeText.textContent =
        "SORT : NEWEST";

    }

  }

}


/* =========================================================
   RENDER LIST
========================================================= */

function renderList(
  scores,
  rankingMap
) {

  /*
    データがない場合
  */

  if (
    scores.length === 0
  ) {

    scoreList.innerHTML = "";

    emptyMessage.classList.remove(
      "hidden"
    );

    emptyMessage.textContent =
      "NO DATA";

    return;

  }


  emptyMessage.classList.add(
    "hidden"
  );


  /*
    一旦クリア
  */

  scoreList.innerHTML = "";


  /*
    各行を作成
  */

  scores.forEach(
    (score) => {

      const row =
        createScoreRow(
          score,
          rankingMap.get(
            score.id
          )
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
  rank
) {

  /*
    1行

    順位
    ニックネーム
    クイズ
    射的
    合計
    状態
    操作
  */

  const row =
    document.createElement(
      "div"
    );


  row.className =
    "score-row";


  if (
    score.completed
  ) {

    row.classList.add(
      "completed-row"
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
    "rank score-rank";


  rankCell.textContent =
    formatRank(rank);


  row.appendChild(
    rankCell
  );


  /* =======================================================
     NICKNAME
  ======================================================= */

  const nicknameCell =
    document.createElement(
      "div"
    );

  nicknameCell.className =
    "nickname";


  nicknameCell.textContent =
    score.nickname;


  nicknameCell.title =
    score.nickname;


  row.appendChild(
    nicknameCell
  );


  /* =======================================================
     QUIZ
  ======================================================= */

  const quizCell =
    document.createElement(
      "div"
    );

  quizCell.className =
    "quiz quiz-score";


  quizCell.textContent =
    formatNumber(
      score.quizScore
    );


  row.appendChild(
    quizCell
  );


  /* =======================================================
     SHOOTING
  ======================================================= */

  const shootingCell =
    document.createElement(
      "div"
    );

  shootingCell.className =
    "shooting shooting-score";


  shootingCell.textContent =
    formatNumber(
      score.shootingScore
    );


  row.appendChild(
    shootingCell
  );


  /* =======================================================
     TOTAL
  ======================================================= */

  const totalCell =
    document.createElement(
      "div"
    );

  totalCell.className =
    "total total-score";


  totalCell.textContent =
    formatNumber(
      score.totalScore
    );


  row.appendChild(
    totalCell
  );


  /* =======================================================
     STATUS
  ======================================================= */

  const statusCell =
    document.createElement(
      "div"
    );

  statusCell.className =
    "status score-status";


  if (
    score.completed
  ) {

    statusCell.classList.add(
      "completed"
    );

    statusCell.textContent =
      "完了";

  } else {

    statusCell.classList.add(
      "waiting"
    );

    statusCell.textContent =
      "待機";

  }


  row.appendChild(
    statusCell
  );


  /* =======================================================
     ACTION
  ======================================================= */

  const actionCell =
    document.createElement(
      "div"
    );

  actionCell.className =
    "action score-action";


  if (
    score.completed
  ) {

    /*
      完了済み
    */

    const completeText =
      document.createElement(
        "span"
      );

    completeText.textContent =
      "✓ 完了";

    completeText.style.color =
      "#888";

    completeText.style.fontSize =
      "12px";

    actionCell.appendChild(
      completeText
    );

  } else {

    /*
      案内完了ボタン
    */

    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "complete-button";


    button.textContent =
      "案内完了";


    button.addEventListener(
      "click",
      () => {

        completeScore(
          score.id,
          button
        );

      }
    );


    actionCell.appendChild(
      button
    );

  }


  row.appendChild(
    actionCell
  );


  return row;

}


/* =========================================================
   RANK FORMAT
========================================================= */

function formatRank(rank) {

  if (
    !rank ||
    rank < 1
  ) {

    return "--";

  }


  return String(
    rank
  ).padStart(
    2,
    "0"
  );

}


/* =========================================================
   NUMBER FORMAT
========================================================= */

function formatNumber(number) {

  return Number(
    number || 0
  ).toLocaleString(
    "ja-JP"
  );

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


  /*
    二重クリック防止
  */

  if (button) {

    button.disabled =
      true;

    button.textContent =
      "更新中...";

  }


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
        completed: true
      }
    );


    /*
      onSnapshotが自動的に
      一覧を更新する
    */

  } catch (error) {

    console.error(
      "Complete error:",
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

  }

}


/* =========================================================
   SORT BUTTON
========================================================= */

if (newestButton) {

  newestButton.addEventListener(
    "click",
    () => {

      currentMode =
        "newest";

      render();

    }
  );

}


if (rankingButton) {

  rankingButton.addEventListener(
    "click",
    () => {

      currentMode =
        "ranking";

      render();

    }
  );

}


/* =========================================================
   RESET ALL DATA
========================================================= */

if (resetButton) {

  resetButton.addEventListener(
    "click",
    resetAllData
  );

}


async function resetAllData() {

  /*
    二重実行防止
  */

  if (isResetting) {
    return;
  }


  /*
    確認
  */

  const confirmed =
    window.confirm(
      "全データを削除します。\n\n" +
      "この操作は元に戻せません。\n" +
      "本当に削除しますか？"
    );


  if (!confirmed) {
    return;
  }


  /*
    もう一度確認
  */

  const secondConfirmed =
    window.confirm(
      "本当に全データを初期化しますか？"
    );


  if (!secondConfirmed) {
    return;
  }


  isResetting =
    true;


  if (resetButton) {

    resetButton.disabled =
      true;

    resetButton.textContent =
      "RESETTING...";

  }


  try {

    const snapshot =
      await getDocs(
        scoresRef
      );


    /*
      全ドキュメントを削除
    */

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


    alert(
      "全データを初期化しました。"
    );


  } catch (error) {

    console.error(
      "Reset error:",
      error
    );


    alert(
      "データの初期化に失敗しました。\n" +
      "Firebaseのルールを確認してください。"
    );


  } finally {

    isResetting =
      false;


    if (resetButton) {

      resetButton.disabled =
        false;

      resetButton.textContent =
        "RESET ALL DATA";

    }

  }

}


/* =========================================================
   PAGE CLEANUP
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    if (unsubscribe) {

      unsubscribe();

    }

  }
);
