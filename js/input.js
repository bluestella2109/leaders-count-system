/* =========================================================
   FESTIVAL SCORE SYSTEM
   js/input.js

   INPUT SCREEN
========================================================= */

import {
  db,
  SCORES_COLLECTION
} from "./firebase.js";


import {
  collection,
  addDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================================
   ELEMENTS
========================================================= */


/* ---------- START SCREEN ---------- */

const startScreen =
  document.getElementById("startScreen");


const scoreScreen =
  document.getElementById("scoreScreen");


const nicknameInput =
  document.getElementById("nicknameInput");


const startButton =
  document.getElementById("startButton");


const playerName =
  document.getElementById("playerName");


/* ---------- SCORE DISPLAY ---------- */

const quizDisplay =
  document.getElementById("quizDisplay");


const shootingDisplay =
  document.getElementById("shootingDisplay");


const totalPreview =
  document.getElementById("totalPreview");


/* ---------- SUBMIT ---------- */

const submitButton =
  document.getElementById("submitButton");


const sendStatus =
  document.getElementById("sendStatus");


/* ---------- RESULT ---------- */

const resultOverlay =
  document.getElementById("resultOverlay");


const resultName =
  document.getElementById("resultName");


const resultTotal =
  document.getElementById("resultTotal");


const resultQuiz =
  document.getElementById("resultQuiz");


const resultShooting =
  document.getElementById("resultShooting");


const newEntryButton =
  document.getElementById("newEntryButton");


/* =========================================================
   VARIABLES
========================================================= */

let nickname = "";

let quizScore = "";

let shootingScore = "";

let isSending = false;


/* =========================================================
   INITIAL DISPLAY
========================================================= */

updateDisplay();


/* =========================================================
   START GAME
========================================================= */

function startGame() {

  const name =
    nicknameInput.value.trim();


  /* ---------- EMPTY CHECK ---------- */

  if (!name) {

    nicknameInput.classList.add(
      "input-error"
    );

    nicknameInput.focus();

    setTimeout(() => {

      nicknameInput.classList.remove(
        "input-error"
      );

    }, 700);

    return;
  }


  /* ---------- SAVE NAME ---------- */

  nickname = name;


  playerName.textContent =
    nickname;


  /* ---------- SCREEN CHANGE ---------- */

  startScreen.classList.add(
    "hidden"
  );


  scoreScreen.classList.remove(
    "hidden"
  );


  /* ---------- RESET SCORES ---------- */

  quizScore = "";

  shootingScore = "";

  updateDisplay();


  /* ---------- SCROLL TOP ---------- */

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });

}


/* =========================================================
   START BUTTON
========================================================= */

if (startButton) {

  startButton.addEventListener(
    "click",
    startGame
  );

}


/* =========================================================
   ENTER KEY
========================================================= */

if (nicknameInput) {

  nicknameInput.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {

        event.preventDefault();

        startGame();

      }

    }
  );

}


/* =========================================================
   KEYPAD
========================================================= */

document
  .querySelectorAll(".keypad")
  .forEach((keypad) => {


    keypad.addEventListener(
      "click",
      (event) => {


        const button =
          event.target.closest(".key");


        if (!button) {
          return;
        }


        const target =
          keypad.dataset.target;


        const value =
          button.dataset.value;


        const action =
          button.dataset.action;


        /* ---------- NUMBER ---------- */

        if (
          value !== undefined
          && value !== null
        ) {

          addNumber(
            target,
            value
          );

        }


        /* ---------- CLEAR ---------- */

        if (
          action === "clear"
        ) {

          clearScore(
            target
          );

        }


        /* ---------- BACKSPACE ---------- */

        if (
          action === "back"
        ) {

          backspace(
            target
          );

        }

      }
    );

  });


/* =========================================================
   ADD NUMBER
========================================================= */

function addNumber(
  target,
  number
) {


  /* =======================================================
     QUIZ
  ======================================================= */

  if (target === "quiz") {


    /*
      最大6桁
    */

    if (
      quizScore.length >= 6
    ) {

      return;

    }


    /*
      00... を防止
    */

    if (
      quizScore === "0"
      && number === "0"
    ) {

      return;

    }


    quizScore +=
      number;

  }


  /* =======================================================
     SHOOTING
  ======================================================= */

  if (target === "shooting") {


    /*
      最大6桁
    */

    if (
      shootingScore.length >= 6
    ) {

      return;

    }


    /*
      00... を防止
    */

    if (
      shootingScore === "0"
      && number === "0"
    ) {

      return;

    }


    shootingScore +=
      number;

  }


  /* ---------- UPDATE ---------- */

  updateDisplay();

}


/* =========================================================
   CLEAR SCORE
========================================================= */

function clearScore(
  target
) {


  if (target === "quiz") {

    quizScore = "";

  }


  if (target === "shooting") {

    shootingScore = "";

  }


  updateDisplay();

}


/* =========================================================
   BACKSPACE
========================================================= */

function backspace(
  target
) {


  if (target === "quiz") {

    quizScore =
      quizScore.slice(
        0,
        -1
      );

  }


  if (target === "shooting") {

    shootingScore =
      shootingScore.slice(
        0,
        -1
      );

  }


  updateDisplay();

}


/* =========================================================
   UPDATE DISPLAY
========================================================= */

function updateDisplay() {


  /* ---------- QUIZ ---------- */

  if (quizDisplay) {

    quizDisplay.textContent =
      quizScore || "0";

  }


  /* ---------- SHOOTING ---------- */

  if (shootingDisplay) {

    shootingDisplay.textContent =
      shootingScore || "0";

  }


  /* ---------- TOTAL ---------- */

  const quiz =
    Number(
      quizScore || 0
    );


  const shooting =
    Number(
      shootingScore || 0
    );


  const total =
    quiz + shooting;


  if (totalPreview) {

    totalPreview.textContent =
      total.toLocaleString(
        "ja-JP"
      );

  }

}


/* =========================================================
   SUBMIT
========================================================= */

if (submitButton) {

  submitButton.addEventListener(
    "click",
    submitScore
  );

}


/* =========================================================
   SUBMIT FUNCTION
========================================================= */

async function submitScore() {


  /* ---------- DOUBLE CLICK ---------- */

  if (isSending) {

    return;

  }


  /* =======================================================
     NAME CHECK
  ======================================================= */

  if (!nickname) {

    sendStatus.textContent =
      "ニックネームを入力してください。";

    return;

  }


  /* =======================================================
     SCORE CHECK
  ======================================================= */

  if (
    quizScore === ""
    ||
    shootingScore === ""
  ) {

    sendStatus.textContent =
      "クイズと射的の両方を入力してください。";

    return;

  }


  /* =======================================================
     CONVERT
  ======================================================= */

  const quiz =
    Number(
      quizScore
    );


  const shooting =
    Number(
      shootingScore
    );


  const total =
    quiz + shooting;


  /* =======================================================
     SEND START
  ======================================================= */

  isSending = true;

  submitButton.disabled = true;

  submitButton.classList.add(
    "sending"
  );


  sendStatus.textContent =
    "SENDING...";


  try {


    /* =====================================================
       FIRESTORE
    ===================================================== */

    await addDoc(
      collection(
        db,
        SCORES_COLLECTION
      ),
      {

        nickname:
          nickname,

        quizScore:
          quiz,

        shootingScore:
          shooting,

        totalScore:
          total,

        completed:
          false,

        createdAt:
          serverTimestamp()

      }
    );


    /* =====================================================
       SUCCESS
    ===================================================== */

    showResult(
      quiz,
      shooting,
      total
    );


    sendStatus.textContent =
      "";


  } catch (error) {


    /* =====================================================
       ERROR
    ===================================================== */

    console.error(
      "Firestore error:",
      error
    );


    sendStatus.textContent =
      "送信に失敗しました。通信状態を確認してください。";


  } finally {


    isSending = false;

    submitButton.disabled =
      false;

    submitButton.classList.remove(
      "sending"
    );

  }

}


/* =========================================================
   SHOW RESULT
========================================================= */

function showResult(
  quiz,
  shooting,
  total
) {


  /* ---------- NAME ---------- */

  if (resultName) {

    resultName.textContent =
      nickname;

  }


  /* ---------- QUIZ ---------- */

  if (resultQuiz) {

    resultQuiz.textContent =
      quiz.toLocaleString(
        "ja-JP"
      );

  }


  /* ---------- SHOOTING ---------- */

  if (resultShooting) {

    resultShooting.textContent =
      shooting.toLocaleString(
        "ja-JP"
      );

  }


  /* ---------- TOTAL ---------- */

  if (resultTotal) {

    const formattedTotal =
      total.toLocaleString(
        "ja-JP"
      );


    resultTotal.textContent =
      formattedTotal;


    /*
      CSSのグリッチ演出用
    */

    resultTotal.dataset.text =
      formattedTotal;

  }


  /* ---------- OVERLAY ---------- */

  if (resultOverlay) {

    resultOverlay.classList.remove(
      "hidden"
    );

  }

}


/* =========================================================
   NEXT PLAYER
========================================================= */

if (newEntryButton) {

  newEntryButton.addEventListener(
    "click",
    startNewEntry
  );

}


/* =========================================================
   RESET FOR NEXT PLAYER
========================================================= */

function startNewEntry() {


  /* ---------- VARIABLES ---------- */

  nickname = "";

  quizScore = "";

  shootingScore = "";

  isSending = false;


  /* ---------- INPUT ---------- */

  if (nicknameInput) {

    nicknameInput.value =
      "";

  }


  /* ---------- DISPLAY ---------- */

  updateDisplay();


  /* ---------- RESULT CLOSE ---------- */

  if (resultOverlay) {

    resultOverlay.classList.add(
      "hidden"
    );

  }


  /* ---------- SCORE SCREEN ---------- */

  if (scoreScreen) {

    scoreScreen.classList.add(
      "hidden"
    );

  }


  /* ---------- START SCREEN ---------- */

  if (startScreen) {

    startScreen.classList.remove(
      "hidden"
    );

  }


  /* ---------- STATUS ---------- */

  if (sendStatus) {

    sendStatus.textContent =
      "";

  }


  /* ---------- FOCUS ---------- */

  setTimeout(() => {

    if (nicknameInput) {

      nicknameInput.focus();

    }

  }, 100);


  /* ---------- TOP ---------- */

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });

}


/* =========================================================
   KEYPAD TOUCH EFFECT
========================================================= */

document
  .querySelectorAll(".key")
  .forEach((button) => {


    button.addEventListener(
      "touchstart",
      () => {

        button.classList.add(
          "touching"
        );

      },
      {
        passive: true
      }
    );


    button.addEventListener(
      "touchend",
      () => {

        button.classList.remove(
          "touching"
        );

      },
      {
        passive: true
      }
    );


    button.addEventListener(
      "touchcancel",
      () => {

        button.classList.remove(
          "touching"
        );

      },
      {
        passive: true
      }
    );

  });


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


  /* ---------- CLEAR ---------- */

  container.innerHTML =
    "";


  /* =======================================================
     CHARACTERS
  ======================================================= */

  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz<>/[]{}#%&$";


  /* =======================================================
     COLUMN COUNT
  ======================================================= */

  const width =
    window.innerWidth;


  const columnCount =
    Math.max(
      15,
      Math.floor(
        width / 32
      )
    );


  /* =======================================================
     CREATE COLUMNS
  ======================================================= */

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


    /* =====================================================
       RED COLUMN
    ===================================================== */

    if (
      Math.random() < 0.12
    ) {

      column.classList.add(
        "red"
      );

    }


    /* =====================================================
       RANDOM TEXT
    ===================================================== */

    let text = "";


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


      /*
        1文字ごとに改行
      */

      text += "\n";

    }


    column.textContent =
      text;


    /* =====================================================
       POSITION
    ===================================================== */

    column.style.left =
      `${
        Math.random() * 100
      }%`;


    /* =====================================================
       SPEED
    ===================================================== */

    column.style.animationDuration =
      `${
        8 +
        Math.random() * 18
      }s`;


    /* =====================================================
       DELAY
    ===================================================== */

    column.style.animationDelay =
      `${
        Math.random() * -20
      }s`;


    /* =====================================================
       OPACITY
    ===================================================== */

    column.style.opacity =
      `${
        0.15 +
        Math.random() * 0.45
      }`;


    /* =====================================================
       FONT SIZE
    ===================================================== */

    column.style.fontSize =
      `${
        8 +
        Math.random() * 4
      }px`;


    /* =====================================================
       APPEND
    ===================================================== */

    container.appendChild(
      column
    );

  }

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
