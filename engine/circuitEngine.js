const RATED_VOLTAGE = 220; 

/**
 * @param {Array<{name: string, watt: number}>} appliances - The devices installed
 * @param {number} ratedCurrent - The rated current of the strip/circuit breaker (Amp), e.g., 10A
 * @returns {{totalPower: number, current: number, loadPercent: number}}
 */
function calculateCircuit(appliances, ratedCurrent = 10) {

  const totalPower = appliances.reduce((sum, a) => sum + a.watt, 0);

  const current = totalPower / RATED_VOLTAGE;

  const loadPercent = (current / ratedCurrent) * 100;

  return {
    totalPower,
    current: Number(current.toFixed(2)),
    loadPercent: Number(loadPercent.toFixed(1)),
  };
}

if (typeof window !== "undefined") {
  window.CircuitEngine = { calculateCircuit, RATED_VOLTAGE };
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculateCircuit, RATED_VOLTAGE };
}