const RATED_CURRENT = 10; // 10A power strip


const APPLIANCE_OPTIONS = [
  { id: "dryer", name: "Hair Dryer", watt: 1200 },
  { id: "kettle", name: "Electric Kettle", watt: 1500 },
  { id: "computer", name: "Computer", watt: 300 },
  { id: "heater", name: "Heater (Prohibited device)", watt: 2000 },
];

let temperature = window.TemperatureEngine.AMBIENT_TEMP;
let elapsedSeconds = 0;
const tracker = window.ScoreEngine.createTracker();
let autoTriggered = false; 


function addAssistantMessage(text, isSelf = false) {
  if (!text) return;
  const log = document.getElementById("assistant-log");
  const msg = document.createElement("div");
  msg.className = isSelf ? "console-msg self" : "console-msg";
  msg.textContent = text;
  log.appendChild(msg);
  log.scrollTop = log.scrollHeight;
}


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


listEl.querySelectorAll("input").forEach((chk) => {
  chk.addEventListener("change", () => {
    if (chk.checked) {
      
      window.ScoreEngine.recordInvalidAction(tracker);
    } else {
   
      window.ScoreEngine.recordDisconnect(tracker, elapsedSeconds);
    }
  });
});


function getActiveAppliances() {
  return Array.from(listEl.querySelectorAll("input:checked")).map((chk) => ({
    name: chk.id,
    watt: Number(chk.dataset.watt),
  }));
}


let simRunning = true;

function tick() {
  if (!simRunning) return;
  elapsedSeconds += 1;

  const appliances = getActiveAppliances();

  // Step 1: circuitEngine
  const circuit = window.CircuitEngine.calculateCircuit(appliances, RATED_CURRENT);

  // Step 2: temperatureEngine (Take the previous temperature and find the new one.)
  temperature = window.TemperatureEngine.updateTemperature(
    temperature,
    circuit.current,
    RATED_CURRENT,
    1
  );

  // Step 3: alertSystem
  const alert = window.AlertSystem.checkAlertLevel(circuit.loadPercent, temperature);


  window.ScoreEngine.recordTick(tracker, alert.level, temperature, elapsedSeconds);

 
  document.getElementById("val-current").textContent = `${circuit.current} A`;
  document.getElementById("val-load").textContent = `${circuit.loadPercent} %`;
  document.getElementById("val-temp").textContent = `${temperature} °C`;
  document.getElementById("val-power").textContent = `${circuit.totalPower} W`;

 
  const loadPointerPos = Math.min(100, (circuit.loadPercent / 150) * 100);
  const tempPointerPos = Math.min(100, (temperature / 200) * 100);
  document.getElementById("ptr-load").style.left = `${loadPointerPos}%`;
  document.getElementById("ptr-temp").style.left = `${tempPointerPos}%`;

  const bar = document.getElementById("alert-bar");
  bar.textContent = alert.message;
  bar.className = `alert-strip ${alert.level}`;


  if (alert.level === "NORMAL") {
    autoTriggered = false; 
  } else if (!autoTriggered) {
    autoTriggered = true;
    setTimeout(() => {
      addAssistantMessage(window.AIAssistant.getAutoDiagnosis(alert.level));
    }, 3000);
  }
}

setInterval(tick, 1000);
tick();


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