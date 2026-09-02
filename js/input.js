import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================================================
   ELEMENTS
========================================================= */

/* START SCREEN */

const startScreen =
  document.getElementById("startScreen");

const scoreScreen =
  document.getElementById("scoreScreen");


/* NICKNAME */

const nicknameModal =
  document.getElementById("nicknameModal");

const nicknameInput =
  document.getElementById("nicknameInput");

const startButton =
  document.getElementById("startButton");


/* PLAYER */

const playerName =
  document.getElementById("playerName");


/* SCORE */

const quizDisplay =
  document.getElementById("quizDisplay");

const shootingDisplay =
  document.getElementById("shootingDisplay");

const totalPreview =
  document.getElementById("totalPreview");


/* SUBMIT */

const submitButton =
  document.getElementById("submitButton");

const sendStatus =
  document.getElementById("sendStatus");


/* RESULT */

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
   INITIALIZE
========================================================= */

function initialize() {

  /*
   * 最初はトップ画面だけ表示
   */

  if (startScreen) {
    startScreen.classList.remove("hidden");
  }

  if (scoreScreen) {
    scoreScreen.classList.add("hidden");
  }

  if (nicknameModal) {
    nicknameModal.classList.add("hidden");
  }

  if (resultOverlay) {
    resultOverlay.classList.add("hidden");
  }


  updateDisplay();

}


initialize();


/* =========================================================
   OPEN NICKNAME SCREEN
========================================================= */

/*
 * index.html の
 *
 * 点数を入力する
 *
 * ボタンから呼び出される。
 */

window.showScoreScreen = function () {

  if (!nicknameModal) {
    return;
  }


  nicknameModal.classList.remove("hidden");


  /*
   * 入力欄を自動選択
   */

  setTimeout(() => {

    if (nicknameInput) {

      nicknameInput.focus();

      nicknameInput.select();

    }

  }, 100);

};


/* =========================================================
   START
========================================================= */

function startGame() {

  if (!nicknameInput) {
    return;
  }


  const name =
    nicknameInput.value.trim();


  /*
   * ニックネーム未入力
   */

  if (!name) {

    nicknameInput.classList.add(
      "input-error"
    );

    nicknameInput.focus();

    return;

  }


  /*
   * 長すぎる名前を防止
   */

  if (name.length > 20) {

    sendStatus.textContent =
      "ニックネームは20文字以内で入力してください。";

    return;

  }


  /*
   * エラー表示解除
   */

  nicknameInput.classList.remove(
    "input-error"
  );


  /*
   * ニックネーム保存
   */

  nickname = name;


  /*
   * PLAYER表示
   */

  if (playerName) {

    playerName.textContent =
      nickname;

  }


  /*
   * ニックネーム画面を閉じる
   */

  if (nicknameModal) {

    nicknameModal.classList.add(
      "hidden"
    );

  }


  /*
   * トップ画面を閉じる
   */

  if (startScreen) {

    startScreen.classList.add(
      "hidden"
    );

  }


  /*
   * 点数入力画面を表示
   */

  if (scoreScreen) {

    scoreScreen.classList.remove(
      "hidden"
    );

  }


  /*
   * 初期化
   */

  quizScore = "";

  shootingScore = "";

  updateDisplay();


  /*
   * 画面トップへ
   */

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });

}


/* START BUTTON */

if (startButton) {

  startButton.addEventListener(
    "click",
    startGame
  );

}


/* ENTER KEY */

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
   NICKNAME INPUT CHANGE
========================================================= */

if (nicknameInput) {

  nicknameInput.addEventListener(
    "input",
    () => {

      nicknameInput.classList.remove(
        "input-error"
      );

      if (sendStatus) {
        sendStatus.textContent = "";
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


        /*
         * 入力対象
         *
         * quiz
         * shooting
         */

        const target =
          keypad.dataset.target;


        /*
         * 数字
         */

        const value =
          button.dataset.value;


        /*
         * 特殊操作
         */

        const action =
          button.dataset.action;


        if (value !== undefined) {

          addNumber(
            target,
            value
          );

        }


        if (action === "clear") {

          clearScore(
            target
          );

        }


        if (action === "back") {

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
   * QUIZ
   */

  if (target === "quiz") {


    /*
     * 最大6桁
     */

    if (quizScore.length >= 6) {

      return;

    }


    /*
     * 00... を防止
     */

    if (
      quizScore === "0"
      &&
      number === "0"
    ) {

      return;

    }


    /*
     * 0のあとに数字を入力したら
     * 0を消して数字にする
     */

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


  /*
   * SHOOTING
   */

  if (target === "shooting") {


    /*
     * 最大6桁
     */

    if (shootingScore.length >= 6) {

      return;

    }


    /*
     * 00... を防止
     */

    if (
      shootingScore === "0"
      &&
      number === "0"
    ) {

      return;

    }


    /*
     * 0のあとに数字を入力したら
     * 0を消して数字にする
     */

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


/* =========================================================
   CLEAR
========================================================= */

function clearScore(target) {


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


/* =========================================================
   DISPLAY
========================================================= */

function updateDisplay() {


  /*
   * QUIZ
   */

  if (quizDisplay) {

    quizDisplay.textContent =
      quizScore || "0";

  }


  /*
   * SHOOTING
   */

  if (shootingDisplay) {

    shootingDisplay.textContent =
      shootingScore || "0";

  }


  /*
   * TOTAL
   */

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
    async () => {


      /*
       * 二重送信防止
       */

      if (isSending) {

        return;

      }


      /*
       * ニックネーム確認
       */

      if (!nickname) {

        sendStatus.textContent =
          "ニックネームを入力してください。";

        return;

      }


      /*
       * クイズ未入力
       */

      if (quizScore === "") {

        sendStatus.textContent =
          "クイズの点数を入力してください。";

        return;

      }


      /*
       * 射的未入力
       */

      if (shootingScore === "") {

        sendStatus.textContent =
          "射的の点数を入力してください。";

        return;

      }


      /*
       * 数値化
       */

      const quiz =
        Number(quizScore);


      const shooting =
        Number(shootingScore);


      const total =
        quiz + shooting;


      /*
       * 送信開始
       */

      isSending = true;

      submitButton.disabled = true;


      if (sendStatus) {

        sendStatus.textContent =
          "SENDING...";

      }


      try {


        /*
         * Firestoreへ保存
         */

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


        /*
         * 成功
         */

        showResult(
          quiz,
          shooting,
          total
        );


        if (sendStatus) {

          sendStatus.textContent =
            "";

        }


      } catch (error) {


        console.error(
          "Firestore error:",
          error
        );


        if (sendStatus) {

          sendStatus.textContent =
            "送信に失敗しました。通信状態を確認してください。";

        }


      } finally {

        isSending = false;

        submitButton.disabled = false;

      }

    }
  );

}


/* =========================================================
   RESULT
========================================================= */

function showResult(
  quiz,
  shooting,
  total
) {


  /*
   * ニックネーム
   */

  if (resultName) {

    resultName.textContent =
      nickname;

  }


  /*
   * クイズ
   */

  if (resultQuiz) {

    resultQuiz.textContent =
      quiz.toLocaleString(
        "ja-JP"
      );

  }


  /*
   * 射的
   */

  if (resultShooting) {

    resultShooting.textContent =
      shooting.toLocaleString(
        "ja-JP"
      );

  }


  /*
   * 合計
   */

  const formattedTotal =
    total.toLocaleString(
      "ja-JP"
    );


  if (resultTotal) {

    resultTotal.textContent =
      formattedTotal;

    resultTotal.dataset.text =
      formattedTotal;

  }


  /*
   * 結果画面表示
   */

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


      /*
       * データ初期化
       */

      nickname = "";

      quizScore = "";

      shootingScore = "";


      /*
       * 入力欄初期化
       */

      if (nicknameInput) {

        nicknameInput.value = "";

        nicknameInput.classList.remove(
          "input-error"
        );

      }


      /*
       * 点数表示初期化
       */

      updateDisplay();


      /*
       * 結果画面を閉じる
       */

      if (resultOverlay) {

        resultOverlay.classList.add(
          "hidden"
        );

      }


      /*
       * 点数画面を閉じる
       */

      if (scoreScreen) {

        scoreScreen.classList.add(
          "hidden"
        );

      }


      /*
       * トップ画面を表示
       */

      if (startScreen) {

        startScreen.classList.remove(
          "hidden"
        );

      }


      /*
       * ニックネーム入力画面を表示
       */

      if (nicknameModal) {

        nicknameModal.classList.remove(
          "hidden"
        );

      }


      /*
       * ニックネーム入力欄へ
       */

      setTimeout(() => {

        if (nicknameInput) {

          nicknameInput.focus();

        }

      }, 100);


      /*
       * ページ最上部へ
       */

      window.scrollTo({
        top: 0,
        behavior: "instant"
      });

    }
  );

}


/* =========================================================
   PREVENT DOUBLE TAP ZOOM ON KEYPAD
========================================================= */

document
  .querySelectorAll(".key")
  .forEach((button) => {

    button.addEventListener(
      "touchend",
      (event) => {

        event.preventDefault();

        button.click();

      },
      {
        passive: false
      }
    );

  });


/* =========================================================
   SAFETY CHECK
========================================================= */

console.log(
  "FESTIVAL SCORE SYSTEM : INPUT MODULE ONLINE"
);
