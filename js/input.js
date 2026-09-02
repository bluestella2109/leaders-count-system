// ========================================
// FESTIVAL SCORE SYSTEM
// input.js
// ========================================

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ========================================
// ELEMENTS
// ========================================

// --- START SCREEN ---

const startScreen =
  document.getElementById("startScreen");

const nicknameInput =
  document.getElementById("nicknameInput");

const startButton =
  document.getElementById("startButton");


// --- SCORE SCREEN ---

const scoreScreen =
  document.getElementById("scoreScreen");

const playerName =
  document.getElementById("playerName");


// --- SCORE DISPLAY ---

const quizDisplay =
  document.getElementById("quizDisplay");

const shootingDisplay =
  document.getElementById("shootingDisplay");

const totalPreview =
  document.getElementById("totalPreview");


// --- SUBMIT ---

const submitButton =
  document.getElementById("submitButton");

const sendStatus =
  document.getElementById("sendStatus");


// --- RESULT ---

const resultOverlay =
  document.getElementById("resultOverlay");

const resultName =
  document.getElementById("resultName");

const resultQuiz =
  document.getElementById("resultQuiz");

const resultShooting =
  document.getElementById("resultShooting");

const resultTotal =
  document.getElementById("resultTotal");

const newEntryButton =
  document.getElementById("newEntryButton");


// --- CODE RAIN ---

const codeRain =
  document.getElementById("codeRain");


// ========================================
// VARIABLES
// ========================================

let nickname = "";

let quizScore = "";

let shootingScore = "";

let isSending = false;


// ========================================
// UTILITY
// ========================================

function getNumber(value) {

  const number = Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  return number;
}


function formatScore(value) {

  return getNumber(value).toLocaleString("ja-JP");

}


// ========================================
// START
// ========================================

function startInput() {

  if (!nicknameInput) {
    return;
  }

  const name =
    nicknameInput.value.trim();


  // ニックネーム未入力

  if (!name) {

    if (sendStatus) {
      sendStatus.textContent =
        "ニックネームを入力してください。";
    }

    nicknameInput.focus();

    nicknameInput.classList.add("input-error");

    setTimeout(() => {

      nicknameInput.classList.remove(
        "input-error"
      );

    }, 700);

    return;
  }


  // 長すぎる名前を防止

  if (name.length > 20) {

    if (sendStatus) {
      sendStatus.textContent =
        "ニックネームは20文字以内で入力してください。";
    }

    nicknameInput.focus();

    return;
  }


  nickname = name;


  // プレイヤー名表示

  if (playerName) {

    playerName.textContent =
      nickname;

  }


  // ステータスをリセット

  if (sendStatus) {
    sendStatus.textContent = "";
  }


  // 画面切り替え

  if (startScreen) {

    startScreen.classList.add(
      "hidden"
    );

  }


  if (scoreScreen) {

    scoreScreen.classList.remove(
      "hidden"
    );

  }


  // 最初はクイズ側

  const firstKeypad =
    document.querySelector(
      '.keypad[data-target="quiz"]'
    );

  if (firstKeypad) {

    firstKeypad.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }

}


if (startButton) {

  startButton.addEventListener(
    "click",
    startInput
  );

}


if (nicknameInput) {

  nicknameInput.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {

        event.preventDefault();

        startInput();

      }

    }
  );

}


// ========================================
// KEYPAD
// ========================================

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


        // 押されたテンキーの対象

        const target =
          keypad.dataset.target;


        // 数字

        const value =
          button.dataset.value;


        // 特殊操作

        const action =
          button.dataset.action;


        // =================================
        // NUMBER
        // =================================

        if (value !== undefined) {

          addNumber(
            target,
            value
          );

        }


        // =================================
        // CLEAR
        // =================================

        if (action === "clear") {

          clearScore(
            target
          );

        }


        // =================================
        // BACKSPACE
        // =================================

        if (action === "back") {

          backspace(
            target
          );

        }

      }
    );

  });


// ========================================
// ADD NUMBER
// ========================================

function addNumber(
  target,
  number
) {


  if (
    target !== "quiz"
    &&
    target !== "shooting"
  ) {

    return;

  }


  // ======================================
  // QUIZ
  // ======================================

  if (target === "quiz") {


    // 最大6桁

    if (quizScore.length >= 6) {
      return;
    }


    // 0から始めない

    if (
      quizScore === "0"
      &&
      number === "0"
    ) {

      return;

    }


    // 0のあとに数字を入力したら置換

    if (
      quizScore === "0"
      &&
      number !== "0"
    ) {

      quizScore = number;

    } else {

      quizScore += number;

    }

  }


  // ======================================
  // SHOOTING
  // ======================================

  if (target === "shooting") {


    // 最大6桁

    if (shootingScore.length >= 6) {
      return;
    }


    // 0から始めない

    if (
      shootingScore === "0"
      &&
      number === "0"
    ) {

      return;

    }


    // 0のあとに数字を入力したら置換

    if (
      shootingScore === "0"
      &&
      number !== "0"
    ) {

      shootingScore = number;

    } else {

      shootingScore += number;

    }

  }


  updateDisplay();

}


// ========================================
// CLEAR
// ========================================

function clearScore(target) {


  if (target === "quiz") {

    quizScore = "";

  }


  if (target === "shooting") {

    shootingScore = "";

  }


  updateDisplay();

}


// ========================================
// BACKSPACE
// ========================================

function backspace(target) {


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


// ========================================
// DISPLAY
// ========================================

function updateDisplay() {


  // クイズ

  if (quizDisplay) {

    quizDisplay.textContent =
      formatScore(
        quizScore || 0
      );

  }


  // 射的

  if (shootingDisplay) {

    shootingDisplay.textContent =
      formatScore(
        shootingScore || 0
      );

  }


  // 合計

  const quiz =
    getNumber(
      quizScore || 0
    );


  const shooting =
    getNumber(
      shootingScore || 0
    );


  const total =
    quiz + shooting;


  if (totalPreview) {

    totalPreview.textContent =
      formatScore(total);

  }

}


// 初期表示

updateDisplay();


// ========================================
// SUBMIT
// ========================================

if (submitButton) {

  submitButton.addEventListener(
    "click",
    async () => {


      // ----------------------------------
      // 二重送信防止
      // ----------------------------------

      if (isSending) {
        return;
      }


      // ----------------------------------
      // ニックネームチェック
      // ----------------------------------

      if (!nickname) {

        if (sendStatus) {

          sendStatus.textContent =
            "先にニックネームを入力してください。";

        }

        return;

      }


      // ----------------------------------
      // 点数チェック
      // ----------------------------------

      if (
        quizScore === ""
        ||
        shootingScore === ""
      ) {

        if (sendStatus) {

          sendStatus.textContent =
            "クイズと射的の両方を入力してください。";

        }

        return;

      }


      // ----------------------------------
      // 数値化
      // ----------------------------------

      const quiz =
        getNumber(
          quizScore
        );


      const shooting =
        getNumber(
          shootingScore
        );


      const total =
        quiz + shooting;


      // ----------------------------------
      // SEND START
      // ----------------------------------

      isSending = true;

      submitButton.disabled = true;


      if (sendStatus) {

        sendStatus.textContent =
          "SENDING...";

      }


      submitButton.classList.add(
        "sending"
      );


      try {


        // =================================
        // FIRESTORE
        // =================================

        await addDoc(
          collection(
            db,
            "festivalScores"
          ),
          {

            // ニックネーム
            nickname: nickname,

            // クイズ
            quizScore: quiz,

            // 射的
            shootingScore: shooting,

            // 合計
            totalScore: total,

            // 案内完了
            completed: false,

            // 登録日時
            createdAt:
              serverTimestamp()

          }
        );


        // =================================
        // SUCCESS
        // =================================

        if (sendStatus) {

          sendStatus.textContent = "";

        }


        showResult(
          quiz,
          shooting,
          total
        );


      } catch (error) {


        console.error(
          "Firestore Error:",
          error
        );


        if (sendStatus) {

          sendStatus.textContent =
            "送信に失敗しました。通信状態を確認してください。";

        }

      } finally {


        isSending = false;

        submitButton.disabled = false;

        submitButton.classList.remove(
          "sending"
        );

      }

    }
  );

}


// ========================================
// RESULT
// ========================================

function showResult(
  quiz,
  shooting,
  total
) {


  if (resultName) {

    resultName.textContent =
      nickname;

  }


  if (resultQuiz) {

    resultQuiz.textContent =
      formatScore(quiz);

  }


  if (resultShooting) {

    resultShooting.textContent =
      formatScore(shooting);

  }


  if (resultTotal) {

    resultTotal.textContent =
      formatScore(total);

    resultTotal.dataset.text =
      formatScore(total);

  }


  if (resultOverlay) {

    resultOverlay.classList.remove(
      "hidden"
    );

  }

}


// ========================================
// NEXT PLAYER
// ========================================

if (newEntryButton) {

  newEntryButton.addEventListener(
    "click",
    () => {


      // ----------------------------------
      // DATA RESET
      // ----------------------------------

      nickname = "";

      quizScore = "";

      shootingScore = "";


      // ----------------------------------
      // INPUT RESET
      // ----------------------------------

      if (nicknameInput) {

        nicknameInput.value = "";

      }


      // ----------------------------------
      // DISPLAY RESET
      // ----------------------------------

      updateDisplay();


      // ----------------------------------
      // RESULT CLOSE
      // ----------------------------------

      if (resultOverlay) {

        resultOverlay.classList.add(
          "hidden"
        );

      }


      // ----------------------------------
      // SCREEN
      // ----------------------------------

      if (scoreScreen) {

        scoreScreen.classList.add(
          "hidden"
        );

      }


      if (startScreen) {

        startScreen.classList.remove(
          "hidden"
        );

      }


      // ----------------------------------
      // STATUS RESET
      // ----------------------------------

      if (sendStatus) {

        sendStatus.textContent = "";

      }


      // ----------------------------------
      // FOCUS
      // ----------------------------------

      if (nicknameInput) {

        setTimeout(() => {

          nicknameInput.focus();

        }, 100);

      }


      // ----------------------------------
      // SCROLL TOP
      // ----------------------------------

      window.scrollTo({
        top: 0,
        behavior: "instant"
      });

    }
  );

}


// ========================================
// CODE RAIN
// ========================================

function createCodeRain() {


  if (!codeRain) {
    return;
  }


  // すでに生成されていたら削除

  codeRain.innerHTML = "";


  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";


  // --------------------------------------
  // COLUMN COUNT
  // --------------------------------------

  const width =
    window.innerWidth;


  const columnCount =
    Math.max(
      18,
      Math.floor(
        width / 32
      )
    );


  // --------------------------------------
  // CREATE COLUMNS
  // --------------------------------------

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
    // RED COLUMN
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


      // 少し間隔を空ける

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
    // SIZE
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
// INITIALIZE CODE RAIN
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
// PREVENT ACCIDENTAL FORM SUBMIT
// ========================================

document.addEventListener(
  "keydown",
  (event) => {


    // Enterキーで意図しない送信を防ぐ

    if (
      event.key === "Enter"
      &&
      event.target.tagName !== "INPUT"
    ) {

      event.preventDefault();

    }

  }
);


// ========================================
// TOUCH FEEDBACK
// ========================================

document
  .querySelectorAll(
    ".key, .sort-button, button"
  )
  .forEach(
    (button) => {


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

    }
  );


// ========================================
// DEBUG
// ========================================

console.log(
  "FESTIVAL SCORE SYSTEM / input.js READY"
);
