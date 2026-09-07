// ui/app.js
// এইটাই সব ইঞ্জিনকে একসাথে জোড়া লাগানোর জায়গা — Presentation Layer.
// লক্ষ্য করো: এই ফাইলে কোনো ফিজিক্স ক্যালকুলেশন নাই — শুধু window.CircuitEngine,
// window.TemperatureEngine, window.AlertSystem কে call করে UI আপডেট করছি।

const RATED_CURRENT = 10; // 10A power strip

// PDF-এর উদাহরণের appliance গুলো — চাইলে এখানে আরো যোগ করা যাবে
const APPLIANCE_OPTIONS = [
  { id: "dryer", name: "Hair Dryer", watt: 1200 },
  { id: "kettle", name: "Electric Kettle", watt: 1500 },
  { id: "computer", name: "Computer", watt: 300 },
  { id: "heater", name: "Heater (নিষিদ্ধ যন্ত্র)", watt: 2000 },
];

let temperature = window.TemperatureEngine.AMBIENT_TEMP;
let elapsedSeconds = 0;
const tracker = window.ScoreEngine.createTracker();
let autoTriggered = false; // এই fault episode-এ auto-diagnosis একবারই দেখাবে

// ধাপ ০: assistant চ্যাট লগে মেসেজ যোগ করার ছোট্ট হেল্পার
function addAssistantMessage(text, isSelf = false) {
  if (!text) return;
  const log = document.getElementById("assistant-log");
  const msg = document.createElement("div");
  msg.className = isSelf ? "console-msg self" : "console-msg";
  msg.textContent = text;
  log.appendChild(msg);
  log.scrollTop = log.scrollHeight;
}

// ধাপ ১: checkbox লিস্ট তৈরি করি
const listEl = document.getElementById("appliance-list");
APPLIANCE_OPTIONS.forEach((a) => {
  const row = document.createElement("label");
  row.className = "switch-row";
  row.innerHTML = `
    <input type="checkbox" data-watt="${a.watt}" id="chk-${a.id}" />
    <span class="name">${a.name}</span>
    <span class="watt">${a.watt}W</span>
  `;
  listEl.appendChild(row);
});

// ধাপ ১.৫: প্রতিটা checkbox-এ change শুনি — এইটাই ইউজারের "action" ধরে ফেলে
listEl.querySelectorAll("input").forEach((chk) => {
  chk.addEventListener("change", () => {
    if (chk.checked) {
      // ইউজার নতুন appliance যোগ করলো — fault চলাকালীন হলে এটা ভুল action
      window.ScoreEngine.recordInvalidAction(tracker);
    } else {
      // ইউজার appliance বাদ দিলো — এটাই সঠিক response
      window.ScoreEngine.recordDisconnect(tracker, elapsedSeconds);
    }
  });
});

// ধাপ ২: এখন যেসব appliance চেক করা আছে, তাদের লিস্ট বানাই
function getActiveAppliances() {
  return Array.from(listEl.querySelectorAll("input:checked")).map((chk) => ({
    name: chk.id,
    watt: Number(chk.dataset.watt),
  }));
}

// ধাপ ৩: প্রতি সেকেন্ডে এই ফাংশনটা চলবে — এটাই সবগুলো ইঞ্জিনকে একসাথে চালায়
let simRunning = true;

function tick() {
  if (!simRunning) return;
  elapsedSeconds += 1;

  const appliances = getActiveAppliances();

  // Step 1: circuitEngine
  const circuit = window.CircuitEngine.calculateCircuit(appliances, RATED_CURRENT);

  // Step 2: temperatureEngine (আগের temperature নিয়ে নতুনটা বের করে)
  temperature = window.TemperatureEngine.updateTemperature(
    temperature,
    circuit.current,
    RATED_CURRENT,
    1
  );

  // Step 3: alertSystem
  const alert = window.AlertSystem.checkAlertLevel(circuit.loadPercent, temperature);

  // Step 5: scoreEngine — প্রতি সেকেন্ডে fault/peak temp/ignition ট্র্যাক করে
  window.ScoreEngine.recordTick(tracker, alert.level, temperature, elapsedSeconds);

  // ধাপ ৪: DOM আপডেট করি
  document.getElementById("val-current").textContent = `${circuit.current} A`;
  document.getElementById("val-load").textContent = `${circuit.loadPercent} %`;
  document.getElementById("val-temp").textContent = `${temperature} °C`;
  document.getElementById("val-power").textContent = `${circuit.totalPower} W`;

  // gauge pointer সরানো — LOAD স্কেল 0-150%, TEMPERATURE স্কেল 0-200°C ধরে হিসাব
  const loadPointerPos = Math.min(100, (circuit.loadPercent / 150) * 100);
  const tempPointerPos = Math.min(100, (temperature / 200) * 100);
  document.getElementById("ptr-load").style.left = `${loadPointerPos}%`;
  document.getElementById("ptr-temp").style.left = `${tempPointerPos}%`;

  const bar = document.getElementById("alert-bar");
  bar.textContent = alert.message;
  bar.className = `alert-strip ${alert.level}`;

  // Step 6: AI Assistant auto-trigger — PDF অনুযায়ী WARN state এর ৩ সেকেন্ড পর diagnosis দেখাবে
  if (alert.level === "NORMAL") {
    autoTriggered = false; // fault শেষ হয়ে গেলে পরের fault এ আবার trigger করার জন্য রিসেট
  } else if (!autoTriggered) {
    autoTriggered = true;
    setTimeout(() => {
      addAssistantMessage(window.AIAssistant.getAutoDiagnosis(alert.level));
    }, 3000);
  }
}

// ধাপ ৫: প্রতি ১ সেকেন্ডে tick() রান করবে — যেন real-time simulation মনে হয়
setInterval(tick, 1000);
tick(); // প্রথমবার সাথে সাথেই একবার চালাই, ১ সেকেন্ড অপেক্ষা না করে

// ধাপ ৬: "সিমুলেশন শেষ করো" বাটন — স্কোর বের করে দেখায়
document.getElementById("finish-btn").addEventListener("click", () => {
  simRunning = false;
  const score = window.ScoreEngine.calculateScore(tracker);

  const panel = document.getElementById("score-panel");
  panel.style.display = "block";
  panel.innerHTML = `
    <div>Timeliness: ${score.timeliness} / 100</div>
    <div>Correctness: ${score.correctness} / 100</div>
    <div>Personal Safety: ${score.personalSafety} / 100</div>
    <div>Loss Control: ${score.lossControl} / 100</div>
    <div style="margin-top:8px;font-size:18px;color:#f0a020;">মোট স্কোর: ${score.total} / 100</div>
  `;
});

// ধাপ ৭: ইউজার নিজে প্রশ্ন লিখে পাঠালে rule-based জবাব দেয়
function sendQuestion() {
  const input = document.getElementById("assistant-input");
  const question = input.value.trim();
  if (!question) return;
  addAssistantMessage(`তুমি: ${question}`, true);
  addAssistantMessage(window.AIAssistant.answerQuestion(question));
  input.value = "";
}
document.getElementById("assistant-send").addEventListener("click", sendQuestion);
document.getElementById("assistant-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendQuestion();
});