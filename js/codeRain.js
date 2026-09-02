/* =========================================
   FESTIVAL SCORE SYSTEM
   CODE RAIN
========================================= */

const container =
  document.getElementById("codeRain");


if (container) {

  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz<>/[]{}#%&$@+=-_";


  function createColumn() {

    const column =
      document.createElement("div");

    column.className =
      "code-column";


    /*
      一部だけ赤くする
    */

    if (Math.random() < 0.10) {

      column.classList.add("red");

    }


    /*
      ランダム文字列
    */

    let text = "";


    const length =
      18 +
      Math.floor(
        Math.random() * 45
      );


    for (
      let i = 0;
      i < length;
      i++
    ) {

      text +=
        characters[
          Math.floor(
            Math.random()
            * characters.length
          )
        ];

    }


    column.textContent =
      text;


    /*
      横位置
    */

    column.style.left =
      `${Math.random() * 100}%`;


    /*
      大きさ
    */

    const size =
      8 +
      Math.random() * 4;


    column.style.fontSize =
      `${size}px`;


    /*
      速度
    */

    const duration =
      10 +
      Math.random() * 18;


    column.style.animationDuration =
      `${duration}s`;


    /*
      開始位置
    */

    column.style.animationDelay =
      `${Math.random() * -20}s`;


    /*
      濃さ
    */

    column.style.opacity =
      0.15 +
      Math.random() * 0.45;


    container.appendChild(
      column
    );

  }


  /*
    画面幅に合わせて生成
  */

  const count =
    Math.max(
      18,
      Math.floor(
        window.innerWidth / 25
      )
    );


  for (
    let i = 0;
    i < count;
    i++
  ) {

    createColumn();

  }

}
