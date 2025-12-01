// Virtual Pet Simulator
// ---------------------
// This script manages the pet's attributes, user interactions, animations,
// and simple game logic (time-based changes and day/night cycle).

const petElement = document.getElementById("pet");
const petStateText = document.getElementById("pet-state-text");

const hungerBar = document.getElementById("hunger-bar");
const happinessBar = document.getElementById("happiness-bar");
const energyBar = document.getElementById("energy-bar");
const cleanBar = document.getElementById("clean-bar");
const healthBar = document.getElementById("health-bar");

const hungerValueLabel = document.getElementById("hunger-value");
const happinessValueLabel = document.getElementById("happiness-value");
const energyValueLabel = document.getElementById("energy-value");
const cleanValueLabel = document.getElementById("clean-value");
const healthValueLabel = document.getElementById("health-value");
const timeOfDayLabel = document.getElementById("time-of-day");

const feedBtn = document.getElementById("feed-btn");
const playBtn = document.getElementById("play-btn");
const sleepBtn = document.getElementById("sleep-btn");
const bathBtn = document.getElementById("bath-btn");
const medBtn = document.getElementById("med-btn");
const resetBtn = document.getElementById("reset-btn");

let hunger = 40; // 0 = full, 100 = very hungry
let happiness = 80; // 0 = sad, 100 = very happy
let energy = 70; // 0 = exhausted, 100 = full of energy
let cleanliness = 90; // 0 = very dirty, 100 = very clean
let health = 90; // 0 = very sick, 100 = very healthy

let isSleeping = false;
let timeIsNight = false;
let tickIntervalId = null;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function updateBars() {
  const setBar = (barEl, labelEl, value, isReversedMeaning = false) => {
    const percentage = clamp(value, 0, 100);
    const rounded = Math.round(percentage);
    barEl.style.width = `${rounded}%`;
    labelEl.textContent = rounded.toString();

    let severityValue = isReversedMeaning ? 100 - rounded : rounded;
    let className = "fill-good";
    if (severityValue >= 70) {
      className = "fill-bad";
    } else if (severityValue >= 40) {
      className = "fill-warning";
    }

    barEl.classList.remove("fill-good", "fill-warning", "fill-bad");
    barEl.classList.add(className);
  };

  setBar(hungerBar, hungerValueLabel, hunger, false);
  setBar(happinessBar, happinessValueLabel, happiness, true);
  setBar(energyBar, energyValueLabel, energy, true);
  setBar(cleanBar, cleanValueLabel, cleanliness, true);
  setBar(healthBar, healthValueLabel, health, true);
}

function updatePetVisualState() {
  petElement.classList.remove(
    "state-happy",
    "state-hungry",
    "state-sad",
    "state-sleeping",
    "state-excited"
  );

  if (isSleeping) {
    petElement.classList.add("state-sleeping");
    petStateText.textContent = "Your pet is sleeping peacefully... 😴";
    return;
  }

  const veryHungry = hunger >= 80;
  const starving = hunger >= 95;
  const veryTired = energy <= 20;
  const exhausted = energy <= 5;
  const verySad = happiness <= 25;
  const veryDirty = cleanliness <= 25;
  const filthy = cleanliness <= 10;
  const verySick = health <= 25;
  const criticallySick = health <= 10;
  const thrilled = happiness >= 90 && hunger <= 40 && energy >= 60;

  // Update dirt appearance based on cleanliness
  petElement.classList.remove("is-dirty", "is-very-dirty");
  if (cleanliness <= 60) {
    petElement.classList.add("is-dirty");
  }
  if (cleanliness <= 30) {
    petElement.classList.add("is-very-dirty");
  }

  // Highest priority: critical sickness
  if (criticallySick) {
    petElement.classList.add("state-sad");
    petStateText.textContent =
      "Your pet feels very sick... please give it medicine. 💊";
    return;
  }

  // Next: very dirty
  if (filthy && !isSleeping) {
    petElement.classList.add("state-sad");
    petStateText.textContent =
      "Your pet is really dirty and uncomfortable. It needs a bath! 🛁";
    return;
  }

  if (starving || exhausted || verySad) {
    petElement.classList.add("state-sad");
    if (starving) {
      petStateText.textContent = "Your pet is starving! Please feed it. 🥺";
    } else if (exhausted) {
      petStateText.textContent = "Your pet is exhausted. Time for sleep. 😴";
    } else {
      petStateText.textContent = "Your pet feels very lonely. Try playing. 💔";
    }
  } else if (veryDirty || verySick) {
    petElement.classList.add("state-hungry");
    if (veryDirty) {
      petStateText.textContent =
        "Your pet feels dirty. Please give it a bath. 🛁";
    } else {
      petStateText.textContent =
        "Your pet feels a bit unwell. Some medicine would help. 💊";
    }
  } else if (veryHungry || veryTired) {
    petElement.classList.add("state-hungry");
    if (veryHungry) {
      petStateText.textContent = "Your pet is getting hungry... 🍗";
    } else {
      petStateText.textContent = "Your pet is getting tired... 💤";
    }
  } else if (thrilled) {
    petElement.classList.add("state-excited");
    petStateText.textContent = "Your pet is thrilled! Best day ever! 🎉";
  } else {
    petElement.classList.add("state-happy");
    petStateText.textContent = "Your pet feels great! Keep it up. 😊";
  }
}

function updateDayNight(isNight) {
  timeIsNight = isNight;
  const app = document.querySelector(".app");
  if (isNight) {
    app.classList.add("night");
    timeOfDayLabel.textContent = "Night";
  } else {
    app.classList.remove("night");
    timeOfDayLabel.textContent = "Day";
  }
}

function handleFeed() {
  if (isSleeping) return;
  hunger = clamp(hunger - 20, 0, 100);
  happiness = clamp(happiness + 5, 0, 100);
  energy = clamp(energy + 5, 0, 100);
  temporaryExcited();
  redraw();
}

function handlePlay() {
  if (isSleeping) return;
  if (energy <= 10 || hunger >= 90) {
    petStateText.textContent =
      "Your pet is too tired or hungry to play. Feed or let it sleep first.";
    return;
  }
  happiness = clamp(happiness + 20, 0, 100);
  hunger = clamp(hunger + 10, 0, 100);
  energy = clamp(energy - 15, 0, 100);
  temporaryExcited();
  redraw();
}

// Give the pet a bath: mainly improves happiness, small impact on energy/hunger.
function handleBath() {
  if (isSleeping) return;
  cleanliness = clamp(cleanliness + 30, 0, 100);
  happiness = clamp(happiness + 15, 0, 100);
  energy = clamp(energy - 5, 0, 100);
  hunger = clamp(hunger + 3, 0, 100);
  petStateText.textContent = "Your pet is enjoying a nice bath! 🛁";
  temporaryExcited();
  redraw();
}

// Give medicine: helpful when the pet is in bad condition.
function handleMedicine() {
  if (isSleeping) return;

  const isUnwell =
    hunger >= 80 || energy <= 25 || happiness <= 35 || cleanliness <= 25;

  if (isUnwell) {
    health = clamp(health + 35, 0, 100);
    hunger = clamp(hunger - 15, 0, 100);
    energy = clamp(energy + 20, 0, 100);
    happiness = clamp(happiness + 12, 0, 100);
    petStateText.textContent = "Medicine helped your pet feel much better. 💊";
  } else {
    // Small effect if used when not really needed
    happiness = clamp(happiness + 3, 0, 100);
    petStateText.textContent = "Your pet is already healthy but appreciates the care.";
  }

  temporaryExcited();
  redraw();
}

function handleSleepToggle() {
  isSleeping = !isSleeping;
  if (isSleeping) {
    petStateText.textContent = "Shh... your pet is sleeping. 🌙";
    sleepBtn.textContent = "Wake up";
    feedBtn.disabled = true;
    playBtn.disabled = true;
    bathBtn.disabled = true;
    medBtn.disabled = true;
  } else {
    sleepBtn.textContent = "Sleep";
    feedBtn.disabled = false;
    playBtn.disabled = false;
    bathBtn.disabled = false;
    medBtn.disabled = false;
  }
  redraw();
}

function handleReset() {
  hunger = 40;
  happiness = 80;
  energy = 70;
  cleanliness = 90;
  health = 90;
  isSleeping = false;
  sleepBtn.textContent = "Sleep";
  feedBtn.disabled = false;
  playBtn.disabled = false;
  bathBtn.disabled = false;
  medBtn.disabled = false;
  updateDayNight(false);
  petStateText.textContent = "Welcome back! Take good care of your pet. 🐾";
  redraw();
}

function temporaryExcited() {
  petElement.classList.add("state-excited");
  setTimeout(() => {
    if (!isSleeping) {
      updatePetVisualState();
    }
  }, 700);
}

function gameTick() {
  const hungerDelta = isSleeping ? 1 : 2;
  hunger = clamp(hunger + hungerDelta, 0, 100);

  // Dust / dirt slowly appears over time
  const baseCleanLoss = isSleeping ? 0 : 2;
  cleanliness = clamp(cleanliness - baseCleanLoss, 0, 100);

  // Playing makes the pet dirtier a bit faster – this is handled indirectly
  // by the regular tick, but medicine/bath can recover it quickly.

  if (isSleeping) {
    energy = clamp(energy + 4, 0, 100);
    happiness = clamp(happiness - 1, 0, 100);
  } else {
    const energyDelta = hunger >= 80 ? -3 : -2;
    energy = clamp(energy + energyDelta, 0, 100);

    if (hunger >= 80 || energy <= 20 || cleanliness <= 25) {
      happiness = clamp(happiness - 3, 0, 100);
    } else {
      happiness = clamp(happiness + 1, 0, 100);
    }
  }

  // Health slowly reacts to overall condition
  if (hunger >= 90 || energy <= 15 || cleanliness <= 15) {
    health = clamp(health - 4, 0, 100);
  } else if (hunger <= 60 && energy >= 40 && cleanliness >= 40) {
    health = clamp(health + 2, 0, 100);
  }

  if (hunger >= 90 || energy <= 10 || happiness <= 20) {
    updateDayNight(true);
  } else if (hunger <= 70 && energy >= 30 && happiness >= 40) {
    updateDayNight(false);
  }

  redraw();
}

function redraw() {
  updateBars();
  updatePetVisualState();
}

function init() {
  feedBtn.addEventListener("click", handleFeed);
  playBtn.addEventListener("click", handlePlay);
  bathBtn.addEventListener("click", handleBath);
  medBtn.addEventListener("click", handleMedicine);
  sleepBtn.addEventListener("click", handleSleepToggle);
  resetBtn.addEventListener("click", handleReset);

  redraw();
  updateDayNight(false);

  tickIntervalId = setInterval(gameTick, 3000);
}

window.addEventListener("DOMContentLoaded", init);

