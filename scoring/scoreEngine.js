// scoring/scoreEngine.js
// Step 5: Scoring System — Evaluates how well the user reacts, based on their actions.
// PDF has 4 criteria: Timeliness, Correctness, Personal Safety, Loss Control

const RESPONSE_THRESHOLD_SECONDS = 60; // If no response within 60 seconds, Timeliness score is 0

/**
 * Creates a new empty tracker state — called once at the start of the simulation.
 */
function createTracker() {
  return {
    faultStartTime: null, // The second when the first ORANGE/RED alert occurs
    respondedAtTime: null, // The second when the user first disconnects an appliance (correct action)
    invalidActions: 0, // Incremented by 1 for each invalid action during a fault
    peakTemp: 25,
    ignitionOccurred: false,
  };
}

/**
 * Called every second (tick) — updates the tracker based on the alert level and temperature.
 */
function recordTick(tracker, alertLevel, temperature, currentSecond) {
  // Step 1: Check if a fault has started — record the time when the first ORANGE/RED alert occurs
  if ((alertLevel === "ORANGE" || alertLevel === "RED") && tracker.faultStartTime === null) {
    tracker.faultStartTime = currentSecond;
  }

  // Step 2: Keep track of the highest temperature
  tracker.peakTemp = Math.max(tracker.peakTemp, temperature);

  // Step 3: Check for ignition condition
  if (alertLevel === "RED") {
    tracker.ignitionOccurred = true;
  }
}

/**
 * Called when the user disconnects an appliance (correct response).
 */
function recordDisconnect(tracker, currentSecond) {
  if (tracker.faultStartTime !== null && tracker.respondedAtTime === null) {
    tracker.respondedAtTime = currentSecond;
  }
}

/**
 * Called when the user adds a new appliance during a fault (incorrect response).
 */
function recordInvalidAction(tracker) {
  if (tracker.faultStartTime !== null) {
    tracker.invalidActions += 1;
  }
}

/**
 * Calculates the final score based on all tracked information.
 */
function calculateScore(tracker) {
  // --- Timeliness (২৫%) ---
  let timeliness = 0;
  if (tracker.faultStartTime !== null && tracker.respondedAtTime !== null) {
    const responseTime = tracker.respondedAtTime - tracker.faultStartTime;
    if (responseTime <= RESPONSE_THRESHOLD_SECONDS) {
      
      timeliness = 100 * (1 - responseTime / RESPONSE_THRESHOLD_SECONDS);
    }
  }

  
  const correctness = Math.max(0, 100 - tracker.invalidActions * 20);

  
  const personalSafety = 100;

 
  let lossControl;
  if (tracker.ignitionOccurred) {
    lossControl = 0;
  } else if (tracker.peakTemp < 100) {
    lossControl = 100;
  } else {
    lossControl = 50; // Partial score between 100-150°C
  }

  const total = Math.round(
    timeliness * 0.25 + correctness * 0.25 + personalSafety * 0.25 + lossControl * 0.25
  );

  return {
    timeliness: Math.round(timeliness),
    correctness,
    personalSafety,
    lossControl,
    total,
  };
}

if (typeof window !== "undefined") {
  window.ScoreEngine = { createTracker, recordTick, recordDisconnect, recordInvalidAction, calculateScore };
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createTracker, recordTick, recordDisconnect, recordInvalidAction, calculateScore };
}
