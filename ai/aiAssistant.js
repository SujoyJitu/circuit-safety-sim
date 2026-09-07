const DIAGNOSIS_BY_LEVEL = {
  YELLOW:
    "Note: The current has exceeded 80% of the rated capacity. Removing an appliance now can avoid the risk.",
  ORANGE:
    "You are currently in an overloaded state (>100%). The breaker will trip on its own within 30 seconds. Remove an appliance before then.",
  RED:
    "Dangerous condition! The temperature has exceeded 150°C — this is the beginning of a potential fire. Turn off the main switch immediately.",
};


const FAQ = [
  { keywords: ["overload", "overload"], answer: "An overload occurs when the total current of multiple appliances connected to the power strip exceeds its rated capacity." },
  { keywords: ["breaker", "breaker"], answer: "A circuit breaker is a safety device that automatically cuts off the electrical supply if there is an overload or short circuit, preventing fires." },
  { keywords: ["heater", "heater", "prohibited"], answer: "High-power devices like heaters should not be plugged into standard power strips, as they can draw the entire rated current of the strip." },
];


function getAutoDiagnosis(alertLevel) {
  return DIAGNOSIS_BY_LEVEL[alertLevel] || null;
}


function answerQuestion(question) {
  const lower = question.toLowerCase();
  const match = FAQ.find((f) => f.keywords.some((k) => lower.includes(k)));
  if (match) return match.answer;
  return "This question is not in my rule-based list. (Here, the actual Coze AI API integration would go, allowing it to answer any question.)";
}


if (typeof window !== "undefined") {
  window.AIAssistant = { getAutoDiagnosis, answerQuestion };
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { getAutoDiagnosis, answerQuestion };
}
