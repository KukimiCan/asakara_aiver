let data = null;
let hintIndex = 0;

async function fetchTheme() {
  const res = await fetch('/api/gemini');
  data = await res.json();
  document.getElementById('hint-list').innerHTML = '';
  document.querySelector('#answer h1').textContent = 'お題が最終的に表示される場所';
  hintIndex = 0;
}

function showNextHint() {
  if (!data || hintIndex >= data.hints.length) return;
  const li = document.createElement('li');
  li.textContent = data.hints[hintIndex++];
  document.getElementById('hint-list').appendChild(li);
}

function showAnswer() {
  if (data) {
    document.querySelector('#answer h1').textContent = `お題：${data.theme}`;
  }
}

document.getElementById('add-hint').addEventListener('click', showNextHint);
document.getElementById('show-answer').addEventListener('click', showAnswer);

fetchTheme();
