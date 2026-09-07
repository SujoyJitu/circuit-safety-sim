# Power Strip Safety Simulator

An interactive web simulation where the user adds/removes appliances and sees,
in real time, how overload, rising temperature, and electrical fire hazards
develop — driven by actual physics calculations, not fixed/scripted animation.

## Problem it solves

Instead of a static/scripted demo, this project runs a real simulation engine
using real-time circuit physics, thermal accumulation, and rule-based fault
diagnosis — so the user can see the actual consequences of their own decisions.

## Architecture (Four-Tier)

```
circuit-safety-sim/
├── engine/                 # Simulation Engine — pure physics calculations
│   ├── circuitEngine.js    #   current, power, load% (based on Ohm's law)
│   └── temperatureEngine.js#   how the wire heats up / cools down over time
│
├── rules/                  # Rules Layer — reads Engine output and decides
│   └── alertSystem.js      #   Yellow / Orange / Red alert logic
│
├── scoring/                # Data Layer — turns user behavior into a score
│   └── scoreEngine.js      #   Timeliness / Correctness / Safety / Loss Control
│
├── ai/                     # AI Layer — educational explanations
│   └── aiAssistant.js      #   rule-based fallback (has a seam for the real Coze API)
│
├── ui/                     # Presentation Layer — brings everything together
│   ├── index.html
│   └── app.js
│
├── demo.js                 # Node.js script to test the engines from the terminal
└── README.md
```

Each layer is **independent** — `engine/` knows nothing about the UI or
scoring; it only takes input and returns output. Layers above it consume the
output of the layers below.

## How to run it

**Browser dashboard (the main simulation):**
Open `ui/index.html` directly in a browser, or run it with the Live Server
extension in VS Code. Check appliance checkboxes, watch live current /
temperature / alert readouts, chat with the AI assistant, then click
"Finish simulation" to see the score.

**Testing just the engines in the terminal:**
```
node demo.js
```

## Tech stack

Vanilla JavaScript (no framework or build step) — the same code runs in both
Node.js and the browser, since every module uses a dual-export pattern
(`module.exports` + `window.ModuleName`).

## Possible next steps

- Wire up the real Coze API inside `ai/aiAssistant.js` (currently a rule-based fallback)
- Free drag-and-drop wiring (currently appliances are toggled with checkboxes)
- Short-circuit triggering and saving data to a backend (currently all in-browser memory)
