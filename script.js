const defaults = {
  person: ["小學生", "忙碌的媽媽", "行動不便的長者", "怕生的新同學", "視障朋友", "愛忘東忘西的人", "寵物主人", "夜班工作者", "第一次來臺灣的旅客", "愛運動的人", "獨自生活的長者", "剛搬家的家庭", "輪椅使用者", "左撇子", "很怕熱的人", "照顧嬰兒的家長", "外送員", "住在山上的居民", "需要復健的人", "喜歡畫畫的人"],
  place: ["學校教室", "公園", "捷運站", "家裡的廚房", "圖書館", "醫院等候區", "下雨的街道", "露營地", "超級市場", "海邊", "操場", "校園走廊", "公車上", "夜市", "垃圾回收場", "農田", "機場", "牙醫診所", "浴室", "社區大樓", "博物館", "寵物公園"],
  situation: ["忘記帶東西", "正在排隊等候", "感到很無聊", "找不到想要的物品", "突然下大雨", "需要和陌生人溝通", "手上拿了太多東西", "時間快來不及了", "想要節省能源", "需要保持安靜", "東西不小心打翻了", "手機快沒電", "天色很暗", "需要整理許多物品", "不想浪費食物", "和朋友走散了", "天氣非常炎熱", "需要照顧小動物", "想要學習新技能", "遇到危險需要求助", "想減少塑膠垃圾", "需要記住重要事情"],
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

function readCsv(text) {
  const rows = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/).map(row => row.split(",").map(cell => cell.trim()));
  const headings = rows.shift()?.map(item => item.replace(/"/g, "")) ?? [];
  const columnMap = { "對象": "person", "地点": "place", "地點": "place", "生活情境": "situation", "情境": "situation" };
  const imported = { person: [], place: [], situation: [] };
  rows.forEach(row => row.forEach((cell, index) => {
    const key = columnMap[headings[index]];
    const value = cell.replace(/^"|"$/g, "").trim();
    if (key && value) imported[key].push(value);
  }));
  return imported;
}

function readText(text) {
  const imported = { person: [], place: [], situation: [] };
  const sections = { "對象": "person", "地点": "place", "地點": "place", "生活情境": "situation", "情境": "situation" };
  let activeKey;
  text.replace(/^\uFEFF/, "").split(/\r?\n/).forEach(line => {
    const match = line.trim().match(/^(對象|地點|地点|生活情境|情境)\s*[:：]\s*(.*)$/);
    if (match) { activeKey = sections[match[1]]; if (match[2]) imported[activeKey].push(match[2]); }
    else if (activeKey && line.trim()) imported[activeKey].push(line.trim());
  });
  return imported;
}

document.querySelector("#import-file").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const imported = file.name.toLowerCase().endsWith(".csv") ? readCsv(reader.result) : readText(reader.result);
    if (keys.every(key => !imported[key].length)) return alert("找不到可匯入的內容。請確認檔案格式是否正確。");
    keys.forEach(key => { if (imported[key].length) options[key] = [...new Set(imported[key])]; });
    localStorage.setItem("invention-draw-options", JSON.stringify(options));
    fillInputs();
    alert("題庫已匯入！請按開始抽籤試試看。");
  };
  reader.readAsText(file, "UTF-8");
  event.target.value = "";
});

fillInputs();
