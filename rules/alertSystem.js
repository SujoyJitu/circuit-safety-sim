const ALERT_LEVELS = {
  NORMAL: "NORMAL",
  YELLOW: "YELLOW", // Caution: current > 80% of rated
  ORANGE: "ORANGE", // Warning: current > 100% of rated (breaker trips after 30s)
  RED: "RED", // Hazard: temperature > 150°C or short circuit
};

/**
 *
 * @param {number} loadPercent - Load percentage coming from circuitEngine
 * @param {number} temperature - Temperature coming from temperatureEngine (°C)
 * @param {boolean} isShortCircuit - Whether a short circuit has occurred (currently always false, will come from UI later)
 * @returns {{level: string, message: string}}
 */
function checkAlertLevel(loadPercent, temperature, isShortCircuit = false) {
  // Step 1: Check the most dangerous condition first (Red level, as it's the most urgent)
  if (isShortCircuit || temperature > 150) {
    return {
      level: ALERT_LEVELS.RED,
      message: "Critical! Temperature exceeds 150°C or short circuit occurs — fire risk!",
    };
  }

  // Step 2: Orange — Load exceeds rated capacity
  if (loadPercent > 100) {
    return {
      level: ALERT_LEVELS.ORANGE,
      message: "Warning! Load exceeds rated capacity — the circuit breaker will trip in 30 seconds.",
    };
  }

  // Step 3: Yellow — Load is above 80% but below 100% of rated capacity
  if (loadPercent > 80) {
    return {
      level: ALERT_LEVELS.YELLOW,
      message: "Warning! Load exceeds 80% of rated capacity.。",
    };
  }

  // Step 4: If all else is well, return Normal
  return {
    level: ALERT_LEVELS.NORMAL,
    message: "Everything is normal.",
  };
}

if (typeof window !== "undefined") {
  window.AlertSystem = { checkAlertLevel, ALERT_LEVELS };
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { checkAlertLevel, ALERT_LEVELS };
}