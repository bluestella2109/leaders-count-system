import { db } from "./firebase.js";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

const scoreList =
  document.getElementById(
    "scoreList"
  );

const emptyMessage =
  document.getElementById(
    "emptyMessage"
  );


const newestButton =
  document.getElementById(
    "newestButton"
  );

const rankingButton =
  document.getElementById(
    "rankingButton"
  );


const sortModeText =
  document.getElementById(
    "sortModeText"
  );


const entryCount =
  document.getElementById(
    "entryCount"
  );

const waitingCount =
  document.getElementById(
    "waitingCount"
  );

const completeCount =
  document.getElementById(
    "completeCount"
  );


/* =========================================
   DATA
========================================= */

let scores = [];

let currentSort =
  "newest";


/* =========================================
   FIRESTORE REALTIME
========================================= */

onSnapshot(
  collection(
    db,
    "festivalScores"
  ),

  (snapshot) => {

    scores =
      snapshot.docs.map(
        (documentSnapshot) => {

          return {

            id:
              documentSnapshot.id,

            ...documentSnapshot.data()

          };

        }
      );


    updateCounters();

    renderScores();

  },

  (error) => {

    console.error(error);

    emptyMessage.textContent =
      "DATABASE ERROR";

    emptyMessage.classList.remove(
      "hidden"
    );

  }
);


/* =========================================
   SORT
========================================= */

newestButton.addEventListener(
  "click",
  () => {

    currentSort =
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


rankingButton.addEventListener(
  "click",
  () => {

    currentSort =
      "ranking";

    rankingButton.classList.add(
      "active"
    );

    newestButton.classList.remove(
      "active"
    );

    sortModeText.textContent =
      "SORT : SCORE";

    renderScores();

  }
);


/* =========================================
   COUNTERS
========================================= */

function updateCounters() {

  const total =
    scores.length;


  const completed =
    scores.filter(
      score =>
        score.completed === true
    ).length;


  const waiting =
    total - completed;


  entryCount.textContent =
    total;

  waitingCount.textContent =
    waiting;

  completeCount.textContent =
    completed;

}


/* =========================================
   SORT DATA
========================================= */

function getSortedScores() {

  const copied =
    [...scores];


  if (currentSort === "newest") {

    copied.sort(
      (a, b) => {

        const aTime =
          a.createdAt?.seconds || 0;

        const bTime =
          b.createdAt?.seconds || 0;


        return bTime - aTime;

      }
    );

  }


  if (currentSort === "ranking") {

    copied.sort(
      (a, b) => {

        const scoreDifference =
          (b.totalScore || 0)
          -
          (a.totalScore || 0);


        if (scoreDifference !== 0) {

          return scoreDifference;

        }


        const aTime =
          a.createdAt?.seconds || 0;

        const bTime =
          b.createdAt?.seconds || 0;


        return aTime - bTime;

      }
    );

  }


  return copied;

}


/* =========================================
   RENDER
========================================= */

function renderScores() {

  scoreList.innerHTML = "";


  const sorted =
    getSortedScores();


  if (sorted.length === 0) {

    emptyMessage.classList.remove(
      "hidden"
    );

    return;

  }


  emptyMessage.classList.add(
    "hidden"
  );


  sorted.forEach(
    (score, index) => {

      const card =
        createScoreCard(
          score,
          index
        );


      scoreList.appendChild(
        card
      );

    }
  );

}


/* =========================================
   CREATE CARD
========================================= */

function createScoreCard(
  score,
  index
) {

  const card =
    document.createElement("article");


  card.className =
    "score-card";


  if (score.completed) {

    card.classList.add(
      "completed"
    );

  } else {

    card.classList.add(
      "waiting"
    );

  }


  /* rank */

  const rank =
    document.createElement("div");

  rank.className =
    "card-rank";


  if (currentSort === "ranking") {

    rank.textContent =
      `#${index + 1}`;

    if (index < 3) {

      rank.classList.add(
        "top-rank"
      );

    }

  } else {

    rank.textContent =
      String(index + 1)
        .padStart(2, "0");

  }


  /* player */

  const player =
    document.createElement("div");

  player.className =
    "card-player";


  const name =
    document.createElement("div");

  name.className =
    "card-player-name";

  name.textContent =
    score.nickname || "NO NAME";


  const time =
    document.createElement("div");

  time.className =
    "card-time";

  time.textContent =
    formatDate(
      score.createdAt
    );


  player.appendChild(name);

  player.appendChild(time);


  /* subscores */

  const detail =
    document.createElement("div");

  detail.className =
    "card-subscore";


  const quizLine =
    document.createElement("div");

  quizLine.append(
    "QUIZ "
  );


  const quizStrong =
    document.createElement("strong");

  quizStrong.textContent =
    Number(
      score.quizScore || 0
    ).toLocaleString("ja-JP");


  quizLine.appendChild(
    quizStrong
  );


  const shootingLine =
    document.createElement("div");

  shootingLine.append(
    "SHOT "
  );


  const shootingStrong =
    document.createElement("strong");

  shootingStrong.textContent =
    Number(
      score.shootingScore || 0
    ).toLocaleString("ja-JP");


  shootingLine.appendChild(
    shootingStrong
  );


  detail.appendChild(
    quizLine
  );

  detail.appendChild(
    shootingLine
  );


  /* total */

  const total =
    document.createElement("div");

  total.className =
    "card-total";


  const totalLabel =
    document.createElement("span");

  totalLabel.textContent =
    "TOTAL";


  const totalScore =
    document.createElement("strong");

  totalScore.textContent =
    Number(
      score.totalScore || 0
    ).toLocaleString("ja-JP");


  total.appendChild(
    totalLabel
  );

  total.appendChild(
    totalScore
  );


  /* button */

  const completeButton =
    document.createElement("button");

  completeButton.className =
    "complete-button";


  if (score.completed) {

    completeButton.textContent =
      "✓ 案内完了";

    completeButton.disabled =
      true;

    completeButton.classList.add(
      "done"
    );

  } else {

    completeButton.textContent =
      "案内完了";


    completeButton.addEventListener(
      "click",
      async () => {

        await completeScore(
          score.id,
          completeButton
        );

      }
    );

  }


  card.appendChild(
    rank
  );

  card.appendChild(
    player
  );

  card.appendChild(
    detail
  );

  card.appendChild(
    total
  );

  card.appendChild(
    completeButton
  );


  return card;

}


/* =========================================
   COMPLETE
========================================= */

async function completeScore(
  id,
  button
) {

  button.disabled =
    true;

  button.textContent =
    "UPDATING...";


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


  } catch (error) {

    console.error(error);

    button.disabled =
      false;

    button.textContent =
      "ERROR / RETRY";

  }

}


/* =========================================
   DATE FORMAT
========================================= */

function formatDate(timestamp) {

  if (!timestamp) {

    return "SYNCING...";

  }


  const date =
    timestamp.toDate();


  return new Intl.DateTimeFormat(
    "ja-JP",
    {

      month: "2-digit",

      day: "2-digit",

      hour: "2-digit",

      minute: "2-digit",

      second: "2-digit"

    }
  ).format(date);

}


/* =========================================
   CODE RAIN
========================================= */

function createCodeRain() {

  const container =
    document.getElementById(
      "codeRain"
    );


  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/[]{}#%&";


  const width =
    window.innerWidth;


  const columnCount =
    Math.max(
      15,
      Math.floor(width / 35)
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


    if (Math.random() < 0.12) {

      column.classList.add(
        "red"
      );

    }


    let text = "";


    const length =
      20 +
      Math.floor(
        Math.random() * 40
      );


    for (
      let j = 0;
      j < length;
      j++
    ) {

      const random =
        Math.floor(
          Math.random()
          * characters.length
        );


      text +=
        characters[random];

    }


    column.textContent =
      text;


    column.style.left =
      `${Math.random() * 100}%`;


    column.style.animationDuration =
      `${8 + Math.random() * 18}s`;


    column.style.animationDelay =
      `${Math.random() * -20}s`;


    column.style.opacity =
      `${0.2 + Math.random() * 0.6}`;


    container.appendChild(
      column
    );

  }

}


createCodeRain();
