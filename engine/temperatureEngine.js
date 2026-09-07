const AMBIENT_TEMP = 25; // Ambient temperature (°C), from which the calculation starts

/**
 * Calculates the temperature change over a time step.
 *
 * @param {number} currentTemp - The current temperature of the conductor (°C)
 * @param {number} current - The current flowing through the conductor (A), obtained from circuitEngine
 * @param {number} ratedCurrent - The rated current of the strip (A)
 * @param {number} deltaSeconds - The time elapsed (seconds)
 * @returns {number} The new temperature of the conductor (°C)
 */
function updateTemperature(currentTemp, current, ratedCurrent, deltaSeconds = 1) {
  // Step 1: Calculate the load ratio — how much the current exceeds the rated current
  const loadRatio = current / ratedCurrent;

  // Step 2: Heat gain — the more loaded the conductor, the faster it heats up (related to I², similar to real physics)
  const heatGainRate = 5; // The maximum temperature increase per second (constant, can be tuned)
  const heatGain = heatGainRate * Math.pow(loadRatio, 2) * deltaSeconds;

  // Step 3: Cooling — the hotter the conductor compared to the ambient temperature, the faster it will cool down
  const coolingRate = 0.05; // The percentage of temperature difference lost per second
  const cooling = (currentTemp - AMBIENT_TEMP) * coolingRate * deltaSeconds;

  // Step 4: New temperature = Previous + Heating - Cooling
  const newTemp = currentTemp + heatGain - cooling;

  return Number(newTemp.toFixed(2));
}

if (typeof window !== "undefined") {
  window.TemperatureEngine = { updateTemperature, AMBIENT_TEMP };
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { updateTemperature, AMBIENT_TEMP };
}