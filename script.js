const defaults = {
  person: ["小學生", "忙碌的媽媽", "行動不便的長者", "怕生的新同學", "視障朋友", "愛忘東忘西的人", "寵物主人", "夜班工作者", "第一次來臺灣的旅客", "愛運動的人"],
  place: ["學校教室", "公園", "捷運站", "家裡的廚房", "圖書館", "醫院等候區", "下雨的街道", "露營地", "超級市場", "海邊"],
  situation: ["忘記帶東西", "正在排隊等候", "感到很無聊", "找不到想要的物品", "突然下大雨", "需要和陌生人溝通", "手上拿了太多東西", "時間快來不及了", "想要節省能源", "需要保持安靜"],
};

const keys = ["person", "place", "situation"];
let options = loadOptions();

function loadOptions() {
  try {
    const saved = JSON.parse(localStorage.getItem("invention-draw-options"));
    return saved && keys?.every?.(key => Array.isArray(saved[key]) && saved[key].length) ? saved : structuredClone(defaults);
  } catch { return structuredClone(defaults); }
}

function pick(items) { return items[Math.floor(Math.random() * items.length)]; }
function fillInputs() { keys.forEach(key => document.querySelector(`#${key}-input`).value = options[key].join("\n")); }

function draw() {
  const result = Object.fromEntries(keys.map(key => [key, pick(options[key])]));
  const cards = document.querySelectorAll(".draw-card");
  const button = document.querySelector("#draw-button");
  button.disabled = true;
  cards.forEach(card => card.classList.add("is-drawing"));

  setTimeout(() => {
    keys.forEach(key => document.querySelector(`#${key}-result`).textContent = result[key]);
    document.querySelector("#mission-person").textContent = result.person;
    document.querySelector("#mission-place").textContent = result.place;
    document.querySelector("#mission-situation").textContent = result.situation;
    document.querySelector("#mission").classList.remove("hidden");
    cards.forEach(card => card.classList.remove("is-drawing"));
    button.disabled = false;
  }, 650);
}

document.querySelector("#draw-button").addEventListener("click", draw);
document.querySelector("#save-button").addEventListener("click", () => {
  const next = Object.fromEntries(keys.map(key => [key, document.querySelector(`#${key}-input`).value.split("\n").map(item => item.trim()).filter(Boolean)]));
  if (keys.some(key => !next[key].length)) return alert("每個分類至少要保留一個項目喔！");
  options = next;
  localStorage.setItem("invention-draw-options", JSON.stringify(options));
  alert("已儲存自訂抽籤內容！");
});
document.querySelector("#reset-button").addEventListener("click", () => {
  options = structuredClone(defaults);
  localStorage.removeItem("invention-draw-options");
  fillInputs();
});

fillInputs();
