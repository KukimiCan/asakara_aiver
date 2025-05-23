document.addEventListener("DOMContentLoaded", () => {
    const hintList = document.querySelector("#hints ul");
    const answerDiv = document.getElementById("answer");
    const addHintBtn = document.querySelector("#add_hint button");
    const showAnswerBtn = document.querySelector("#show_ans button");

    // 仮のデータ（後でGemini APIで取得したものに置き換え）
    let currentHintIndex = 0;
    let hints = [];
    let theme = "";

    // Gemini API などから取得したと仮定するデータ
    function fetchThemeAndHints() {
        // この部分はAPIから取得するように書き換え予定
        theme = "名前にしたら強そうな野菜といえば？";
        hints = ["ゴボウ", "レンコン", "アスパラガス", "ブロッコリー"];
    }

    function showNextHint() {
        if (currentHintIndex < hints.length) {
            const li = document.createElement("li");
            li.textContent = hints[currentHintIndex];
            hintList.appendChild(li);
            currentHintIndex++;
        } else {
            alert("これ以上ヒントはありません！");
        }
    }

    function showAnswer() {
        answerDiv.innerHTML = `<h1>お題：${theme}</h1>`;
    }

    // 初期化
    fetchThemeAndHints();

    addHintBtn.addEventListener("click", showNextHint);
    showAnswerBtn.addEventListener("click", showAnswer);
});
