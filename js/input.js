import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

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


const quizDisplay =
  document.getElementById("quizDisplay");

const shootingDisplay =
  document.getElementById("shootingDisplay");

const totalPreview =
  document.getElementById("totalPreview");


const submitButton =
  document.getElementById("submitButton");

const sendStatus =
  document.getElementById("sendStatus");


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


/* =========================================
   VARIABLES
========================================= */

let nickname = "";

let quizScore = "";

let shootingScore = "";

let isSending = false;


/* =========================================
   START
========================================= */

function startGame() {

  const name =
    nicknameInput.value.trim();

  if (!name) {

    nicknameInput.focus();

    nicknameInput.style.borderColor =
      "#d61924";

    return;
  }


  nickname = name;

  playerName.textContent =
    nickname;


  startScreen.classList.add("hidden");

  scoreScreen.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });

}


startButton.addEventListener(
  "click",
  startGame
);


nicknameInput.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {
      startGame();
    }

  }
);


/* =========================================
   KEYPAD
========================================= */

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


        if (value !== undefined) {

          addNumber(
            target,
            value
          );

        }


        if (action === "clear") {

          clearScore(target);

        }


        if (action === "back") {

          backspace(target);

        }

      }
    );

  });


/* =========================================
   ADD NUMBER
========================================= */

function addNumber(
  target,
  number
) {

  if (target === "quiz") {

    if (quizScore.length >= 6) {
      return;
    }


    if (
      quizScore === "0"
      && number === "0"
    ) {

      return;

    }


    quizScore += number;

  }


  if (target === "shooting") {

    if (shootingScore.length >= 6) {
      return;
    }


    if (
      shootingScore === "0"
      && number === "0"
    ) {

      return;

    }


    shootingScore += number;

  }


  updateDisplay();

}


/* =========================================
   CLEAR
========================================= */

function clearScore(target) {

  if (target === "quiz") {
    quizScore = "";
  }

  if (target === "shooting") {
    shootingScore = "";
  }


  updateDisplay();

}


/* =========================================
   BACKSPACE
========================================= */

function backspace(target) {

  if (target === "quiz") {

    quizScore =
      quizScore.slice(0, -1);

  }


  if (target === "shooting") {

    shootingScore =
      shootingScore.slice(0, -1);

  }


  updateDisplay();

}


/* =========================================
   DISPLAY
========================================= */

function updateDisplay() {

  quizDisplay.textContent =
    quizScore || "0";

  shootingDisplay.textContent =
    shootingScore || "0";


  const quiz =
    Number(quizScore || 0);

  const shooting =
    Number(shootingScore || 0);


  const total =
    quiz + shooting;


  totalPreview.textContent =
    total.toLocaleString("ja-JP");

}


/* =========================================
   SUBMIT
========================================= */

submitButton.addEventListener(
  "click",
  async () => {

    if (isSending) {
      return;
    }


    if (
      quizScore === ""
      || shootingScore === ""
    ) {

      sendStatus.textContent =
        "クイズと射的の両方を入力してください。";

      return;

    }


    const quiz =
      Number(quizScore);

    const shooting =
      Number(shootingScore);

    const total =
      quiz + shooting;


    isSending = true;

    submitButton.disabled = true;

    sendStatus.textContent =
      "SENDING...";


    try {

      await addDoc(
        collection(
          db,
          "festivalScores"
        ),
        {

          nickname: nickname,

          quizScore: quiz,

          shootingScore: shooting,

          totalScore: total,

          completed: false,

          createdAt:
            serverTimestamp()

        }
      );


      showResult(
        quiz,
        shooting,
        total
      );


      sendStatus.textContent = "";


    } catch (error) {

      console.error(error);

      sendStatus.textContent =
        "送信に失敗しました。通信状態を確認してください。";


    } finally {

      isSending = false;

      submitButton.disabled = false;

    }

  }
);


/* =========================================
   RESULT
========================================= */

function showResult(
  quiz,
  shooting,
  total
) {

  resultName.textContent =
    nickname;

  resultQuiz.textContent =
    quiz.toLocaleString("ja-JP");

  resultShooting.textContent =
    shooting.toLocaleString("ja-JP");

  resultTotal.textContent =
    total.toLocaleString("ja-JP");

  resultTotal.dataset.text =
    total.toLocaleString("ja-JP");


  resultOverlay.classList.remove(
    "hidden"
  );

}


/* =========================================
   NEXT PLAYER
========================================= */

newEntryButton.addEventListener(
  "click",
  () => {

    nickname = "";

    quizScore = "";

    shootingScore = "";


    nicknameInput.value = "";

    updateDisplay();


    resultOverlay.classList.add(
      "hidden"
    );


    scoreScreen.classList.add(
      "hidden"
    );


    startScreen.classList.remove(
      "hidden"
    );


    nicknameInput.focus();


    window.scrollTo({
      top: 0,
      behavior: "instant"
    });

  }
);


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
      document.createElement("div");


    column.className =
      "code-column";


    if (Math.random() < 0.12) {

      column.classList.add("red");

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
