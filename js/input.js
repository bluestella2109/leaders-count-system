/* =========================================================
   FESTIVAL SCORE SYSTEM
   input.js
========================================================= */

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================================
   ELEMENTS
========================================================= */

// 画面
const startScreen =
  document.getElementById("startScreen");

const scoreScreen =
  document.getElementById("scoreScreen");


// ニックネーム
const nicknameInput =
  document.getElementById("nicknameInput");

const startButton =
  document.getElementById("startButton");

const playerName =
  document.getElementById("playerName");


// 点数表示
const quizDisplay =
  document.getElementById("quizDisplay");

const shootingDisplay =
  document.getElementById("shootingDisplay");

const totalPreview =
  document.getElementById("totalPreview");


// 送信
const submitButton =
  document.getElementById("submitButton");

const sendStatus =
  document.getElementById("sendStatus");


// 結果
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
   START
========================================================= */

function startGame() {

  const name =
    nicknameInput.value.trim();


  // ニックネーム未入力
  if (!name) {

    nicknameInput.focus();

    nicknameInput.style.borderColor =
      "#d61924";

    return;
  }


  // 長すぎる名前を防止
  if (name.length > 20) {

    sendStatus.textContent =
      "ニックネームは20文字以内にしてください。";

    return;
  }


  nickname = name;


  playerName.textContent =
    nickname;


  nicknameInput.style.borderColor =
    "";


  startScreen.classList.add(
    "hidden"
  );

  scoreScreen.classList.remove(
    "hidden"
  );


  updateDisplay();


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


        // 数字
        if (
          value !== undefined
        ) {

          addNumber(
            target,
            value
          );

        }


        // CLEAR
        if (
          action === "clear"
        ) {

          clearScore(
            target
          );

        }


        // BACKSPACE
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

  /*
   * 最大6桁
   */

  if (target === "quiz") {

    if (
      quizScore.length >= 6
    ) {
      return;
    }


    // 先頭0を防止
    if (
      quizScore === "0" &&
      number === "0"
    ) {

      return;

    }


    // 0の後に別の数字を入力した場合
    if (
      quizScore === "0"
    ) {

      quizScore =
        number;

    } else {

      quizScore +=
        number;

    }

  }



  if (target === "shooting") {

    if (
      shootingScore.length >= 6
    ) {
      return;
    }


    // 先頭0を防止
    if (
      shootingScore === "0" &&
      number === "0"
    ) {

      return;

    }


    // 0の後に別の数字
    if (
      shootingScore === "0"
    ) {

      shootingScore =
        number;

    } else {

      shootingScore +=
        number;

    }

  }


  updateDisplay();

}



/* =========================================================
   CLEAR SCORE
========================================================= */

function clearScore(
  target
) {

  if (
    target === "quiz"
  ) {

    quizScore = "";

  }


  if (
    target === "shooting"
  ) {

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

  if (
    target === "quiz"
  ) {

    quizScore =
      quizScore.slice(
        0,
        -1
      );

  }


  if (
    target === "shooting"
  ) {

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


  // クイズ
  if (quizDisplay) {

    quizDisplay.textContent =
      quiz.toLocaleString(
        "ja-JP"
      );

  }


  // 射的
  if (shootingDisplay) {

    shootingDisplay.textContent =
      shooting.toLocaleString(
        "ja-JP"
      );

  }


  // 合計
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

  // 二重送信防止
  if (isSending) {
    return;
  }


  // ニックネーム確認
  if (!nickname) {

    sendStatus.textContent =
      "ニックネームを入力してください。";

    return;

  }


  // 点数確認
  if (
    quizScore === "" ||
    shootingScore === ""
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



  /* -------------------------------------------------------
     SEND START
  ------------------------------------------------------- */

  isSending = true;


  submitButton.disabled =
    true;


  sendStatus.textContent =
    "SENDING...";


  try {

    /* -----------------------------------------------------
       FIRESTORE
    ----------------------------------------------------- */

    await addDoc(
      collection(
        db,
        "festivalScores"
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


    /* -----------------------------------------------------
       SHOW RESULT
    ----------------------------------------------------- */

    showResult(
      quiz,
      shooting,
      total
    );


    sendStatus.textContent =
      "";


  } catch (error) {

    console.error(
      "Firestore error:",
      error
    );


    sendStatus.textContent =
      "送信に失敗しました。通信状態を確認してください。";


  } finally {

    isSending =
      false;


    submitButton.disabled =
      false;

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

  if (resultName) {

    resultName.textContent =
      nickname;

  }


  if (resultQuiz) {

    resultQuiz.textContent =
      quiz.toLocaleString(
        "ja-JP"
      );

  }


  if (resultShooting) {

    resultShooting.textContent =
      shooting.toLocaleString(
        "ja-JP"
      );

  }


  if (resultTotal) {

    resultTotal.textContent =
      total.toLocaleString(
        "ja-JP"
      );


    resultTotal.dataset.text =
      total.toLocaleString(
        "ja-JP"
      );

  }


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
    () => {

      // リセット
      nickname =
        "";

      quizScore =
        "";

      shootingScore =
        "";


      // 入力欄
      if (nicknameInput) {

        nicknameInput.value =
          "";

        nicknameInput.style.borderColor =
          "";

      }


      // 表示更新
      updateDisplay();


      // 結果画面を閉じる
      if (resultOverlay) {

        resultOverlay.classList.add(
          "hidden"
        );

      }


      // 点数画面を閉じる
      if (scoreScreen) {

        scoreScreen.classList.add(
          "hidden"
        );

      }


      // スタート画面
      if (startScreen) {

        startScreen.classList.remove(
          "hidden"
        );

      }


      if (sendStatus) {

        sendStatus.textContent =
          "";

      }


      window.scrollTo({
        top: 0,
        behavior: "instant"
      });


      setTimeout(
        () => {

          if (nicknameInput) {

            nicknameInput.focus();

          }

        },
        100
      );

    }
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
   * 二重生成防止
   */

  container.innerHTML =
    "";


  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz<>/[]{}#%&";


  const width =
    window.innerWidth;


  /*
   * 画面幅に応じて
   * コードの列数を調整
   */

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
     * 一部だけ赤
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
     * 開始位置をランダム化
     */

    column.style.animationDelay =
      `${Math.random() * -20}s`;


    /*
     * 透明度
     */

    column.style.opacity =
      `${0.18 + Math.random() * 0.5}`;


    /*
     * 少しサイズを変える
     */

    column.style.fontSize =
      `${10 + Math.random() * 5}px`;


    container.appendChild(
      column
    );

  }

}



/* =========================================================
   INITIALIZE CODE RAIN
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
        250
      );

  }
);



/* =========================================================
   INITIAL DISPLAY
========================================================= */

updateDisplay();
