
const { calculateCircuit } = require("./engine/circuitEngine");
const { updateTemperature, AMBIENT_TEMP } = require("./engine/temperatureEngine");
const { checkAlertLevel } = require("./rules/alertSystem");

const appliances = [
  { name: "Hair Dryer", watt: 1200 },
  { name: "Electric Kettle", watt: 1500 },
  { name: "Computer", watt: 300 },
];

const RATED_CURRENT = 10;
const result = calculateCircuit(appliances, RATED_CURRENT);

console.log("--- Circuit Result (Step 1: circuitEngine) ---");
console.log("Total Power:", result.totalPower, "W");
console.log("Current:", result.current, "A");
console.log("Load %:", result.loadPercent, "%");


console.log("\n--- Temperature + Alert (Step 2 + Step 3) ---");
let temp = AMBIENT_TEMP;

for (let second = 1; second <= 10; second++) {
  temp = updateTemperature(temp, result.current, RATED_CURRENT, 1);
  const alert = checkAlertLevel(result.loadPercent, temp);
  console.log(
    `Second ${second}: Temperature = ${temp}°C | Alert = ${alert.level} | ${alert.message}`
  );
}