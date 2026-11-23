const pages = [...document.querySelectorAll(".page")];
const header = document.getElementById("party-header");
const footer = document.getElementById("party-footer");
let currentPage = 1, friendName = "Birthday Star", birthdayDate = "";
const totalPages = pages.length;

function goToPage(n) {
  if (n < 1 || n > totalPages) return;
  const previousPage = currentPage;
  currentPage = n;
  pages.forEach((p, i) => { p.classList.toggle("active", i === n - 1); p.hidden = i !== n - 1; });
  header.hidden = n === 1; footer.hidden = n === 1;
  const progress = Math.round(((n - 1) / (totalPages - 1)) * 100);
  document.getElementById("page-label").textContent = `Page ${n} of ${totalPages}`;
  document.getElementById("progress-percent").textContent = `${progress}%`;
  document.getElementById("progress-bar").style.width = `${progress}%`;
  if (n === 5) {
    if (previousPage === 4) startQuiz();
    else renderQuiz();
  }
  if (n === 6) renderMessage();
  window.scrollTo({top:0,behavior:"smooth"});
}
function updateNames() {
  document.querySelectorAll(".friend-name").forEach(el => el.textContent = friendName);
  const dob = document.getElementById("final-dob");
  if (birthdayDate) {
    const d = new Date(`${birthdayDate}T12:00:00`);
    dob.textContent = `Your special day: ${d.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})} 🎂`;
  } else dob.textContent = "";
}
document.getElementById("start-btn").addEventListener("click", () => {
  const name = document.getElementById("friend-name").value.trim();
  const err = document.getElementById("entry-error");
  if (!name) { err.textContent = "Please enter your name first! 😊"; document.getElementById("friend-name").focus(); return; }
  friendName = name; birthdayDate = document.getElementById("friend-dob").value; err.textContent = "";
  updateNames();
  const proceed = () => goToPage(2);
  if (typeof window.playOpeningAnimation === "function") window.playOpeningAnimation(proceed);
  else proceed();
  launchConfetti();
});
document.getElementById("welcome-next").addEventListener("click", () => goToPage(3));
document.querySelectorAll("[data-back]").forEach(b => b.addEventListener("click", () => goToPage(currentPage - 1)));

// Page 3: continuous 72-second birthday animation timeline.
const stage = document.getElementById("robot-stage");
const sceneCaption = document.getElementById("scene-caption");
const sceneStatus = document.getElementById("scene-status");
const sceneNext = document.getElementById("scene-next");
const sceneReplay = document.getElementById("scene-replay");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueLine = document.getElementById("dialogue-line");
const dialogueProgress = document.getElementById("dialogue-progress-bar");
const deliveryCake = document.getElementById("delivery-cake");
const realCake = document.getElementById("real-cake");
const CHARACTER_CONFIG = [
  { id: "red", color: "#ef5262", label: "R" },
  { id: "green", color: "#38b978", label: "G" },
  { id: "blue", color: "#438de5", label: "B" },
  { id: "yellow", color: "#f2bf3c", label: "Y" }
];

function createCharacter({ id, color, label }) {
  const unit = document.createElement("div");
  unit.className = `robot-unit character-${id}`;
  unit.id = `character-${id}`;
  unit.dataset.character = id;
  unit.setAttribute("aria-label", `${id.toUpperCase()} character`);
  unit.style.setProperty("--character-color", color);
  const visual = `<span class="character-label">${label}</span><img class="character-image" alt="" hidden>`;
  unit.innerHTML = `<span class="character-bubble" id="bubble-${id}" aria-live="polite"></span><div class="character-visual">${visual}</div>`;
  return unit;
}

const characterRow = document.getElementById("character-row");
CHARACTER_CONFIG.forEach(character => characterRow.append(createCharacter(character)));
const characters = Object.fromEntries(CHARACTER_CONFIG.map(({ id }) => [id, document.getElementById(`character-${id}`)]));
const characterIds = CHARACTER_CONFIG.map(({ id }) => id);
const STICKER_SEQUENCE = [
  { scene: 1, stickers: [13, 13, 13, 13] },
  { scene: 2, stickers: [12, 13, 13, 13] },
  { scene: 3, stickers: [12, 16, 13, 13] },
  { scene: 4, stickers: [12, 16, 17, 13] },
  { scene: 5, stickers: [19, 15, 14, 15] },
  { scene: 6, stickers: [10, 21, 14, 22] },
  { scene: 7, stickers: [16, 16, 11, 18] },
  { scene: 8, stickers: [5, 6, 7, null] },
  { scene: 9, stickers: [5, 6, 7, 4] },
  { scene: 10, stickers: [2, 1, 2, 4] },
  { scene: 11, stickers: [20, 22, 8, 4] },
  { scene: 12, stickers: [20, 22, 24, 4] },
  { scene: 13, stickers: [23, 23, 23, 23] }
];
function applyStickers(numbers) {
  characterIds.forEach((id, index) => {
    const character = characters[id];
    const image = character.querySelector(".character-image");
    const label = character.querySelector(".character-label");
    const number = numbers[index];
    character.style.visibility = number == null ? "hidden" : "visible";
    character.setAttribute("aria-hidden", String(number == null));
    if (number == null) { character.dataset.sticker = ""; return; }
    if (character.dataset.sticker === String(number)) return;
    character.dataset.sticker = String(number);
    image.classList.remove("loaded");
    image.onload = () => requestAnimationFrame(() => image.classList.add("loaded"));
    image.src = `stickers/sticker-${String(number).padStart(2, "0")}.png`;
    image.alt = `Sticker ${number}`;
    image.hidden = false;
    label.hidden = true;
    character.classList.add("has-sticker");
    if (image.complete) requestAnimationFrame(() => image.classList.add("loaded"));
  });
}
applyStickers(STICKER_SEQUENCE[0].stickers);
let timelineFrame = 0;
let timelineStartedAt = 0;
let activeBeat = -1;
let chaseRestPositions = null;
let sceneStarted = false;
let sceneFinished = false;

const birthdayTimeline = [
  { scene: 1, start: 0, end: 4, status: "Four friends are ready to celebrate.", caption: "The birthday crew takes their places." },
  { scene: 2, start: 4, end: 9, speaker: "red", line: "Hey! It’s your birthday today!",status: "" , caption: "A birthday reminder", sound: "pop", moods: { red: "speaking" } },
  { scene: 3, start: 9, end: 13, speaker: "green", line: "Alright, everyone! Who brought the cake?", status: "", caption: "The big cake question", sound: "pop", moods: { green: "speaking" } },
  { scene: 4, start: 13, end: 17, speaker: "blue", line: "I brought the cake! What a beautiful cake!", status: "", caption: "The cake arrives", sound: "fanfare", classes: ["cake-arrives"], moods: { blue: "speaking" } },
  { scene: 5, start: 17, end: 23, speaker: "red", line: "Whoa! Be careful! The cake is falling!", status: "", caption: "Cake disaster!", sound: "crash", classes: ["fall", "impact"], moods: { red: "shocked", green: "shocked", blue: "startled", yellow: "shocked" } },
  { scene: 6, start: 23, end: 29, speaker: "red", line: "What happens now?", status: "RED is sad, BLUE is crying, and GREEN and YELLOW are furious.", caption: "Everyone reacts to the disaster", classes: ["sad"], moods: { red: "sad", green: "angry", blue: "crying", yellow: "angry" } },
  { scene: 7, start: 29, end: 34, speaker: "yellow", line: "Wait! I’ll get one! Hold on!", status: "", caption: "YELLOW has a plan", sound: "whoosh", moods: { red: "cheerful", green: "cheerful", blue: "hopeful", yellow: "preparing" } },
  { scene: 8, start: 34, end: 40, status: "", caption: "YELLOW rushes off to get a replacement cake.", classes: ["yellow-away"], moods: { red: "waiting", green: "waiting", blue: "waiting" } },
  { scene: 9, start: 40, end: 46, speaker: "yellow", line: "Here you go! The new cake is here!", status: "", caption: "The replacement cake arrives", sound: "fanfare", classes: ["cake-held-yellow", "rescue"], moods: { red: "cheerful", green: "cheerful", blue: "cheerful", yellow: "speaking" } },
  { scene: 10, start: 46, end: 47, speaker: "green", line: "Do you have a birthday wish?", status: "", caption: "The birthday decorations begin", sound: "fanfare", classes: ["decorated", "cake-held-yellow", "decorate-start"], moods: { red: "decorating", green: "speaking", blue: "decorating", yellow: "cheerful" } },
  { scene: 10, start: 47, end: 48, status: "", caption: "The birthday banner appears", classes: ["decorated", "cake-held-yellow", "banner-on"], moods: { red: "decorating", green: "cheerful", blue: "decorating", yellow: "cheerful" } },
  { scene: 10, start: 48, end: 49, status: "", caption: "Balloons join the celebration", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on"], moods: { red: "decorating", green: "cheerful", blue: "decorating", yellow: "cheerful" } },
  { scene: 10, start: 49, end: 50, status: "", caption: "More birthday decorations appear", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on"], moods: { red: "decorating", green: "cheerful", blue: "decorating", yellow: "cheerful" } },
  { scene: 10, start: 50, end: 51, status: "", caption: "Confetti settles over the party", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on", "settled"], confetti: true, moods: { red: "cheerful", green: "cheerful", blue: "cheerful", yellow: "cheerful" } },
  { scene: 10, start: 51, end: 52, status: "", caption: "The party background is ready", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on", "settled"], moods: { red: "cheerful", green: "cheerful", blue: "cheerful", yellow: "cheerful" } },
  { scene: 11, start: 52, end: 58, speaker: "blue", line: "You look absolutely wonderful today!", status: "", caption: "A birthday compliment", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on", "settled", "chase-ready"], moods: { red: "ready", green: "ready", blue: "cheerful", yellow: "cheerful" } },
  { scene: 12, start: 58, end: 61, speaker: "red", line: "Stop right there!", status: "", caption: "RED starts the chase", sound: "whoosh", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on", "settled", "chasing"], moods: { red: "running", green: "running", blue: "running", yellow: "cheerful" } },
  { scene: 12, start: 61, end: 64, speaker: "green", line: "Hey! Get back here!", status: "", caption: "GREEN joins the chase", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on", "settled", "chasing"], moods: { red: "running", green: "running", blue: "running", yellow: "cheerful" } },
  { scene: 12, start: 64, end: 66, status: "", caption: "The crew comes back to deliver the birthday wish", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on", "settled", "chasing"], moods: { red: "running", green: "running", blue: "running", yellow: "cheerful" } },
  { scene: 13, start: 66, end: 67, speaker: "red", line: "Happy", status: "", caption: "One last birthday wish", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on", "settled"], moods: { red: "speaking", green: "cheerful", blue: "cheerful", yellow: "cheerful" } },
  { scene: 13, start: 67, end: 68, speaker: "green", line: "Birthday", status: "", caption: "One last birthday wish", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on", "settled"], moods: { red: "cheerful", green: "speaking", blue: "cheerful", yellow: "cheerful" } },
  { scene: 13, start: 68, end: 69, speaker: "blue", line: "To", status: "", caption: "One last birthday wish", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on", "settled"], moods: { red: "cheerful", green: "cheerful", blue: "speaking", yellow: "cheerful" } },
  { scene: 13, start: 69, end: 70, speaker: "yellow", line: "Uhh!", status: "", caption: "One last birthday wish", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on", "settled"], moods: { red: "cheerful", green: "cheerful", blue: "cheerful", yellow: "speaking" } },
  { scene: 13, start: 70, end: 72, status: "", caption: "Happy Birthday!", classes: ["decorated", "cake-held-yellow", "banner-on", "balloons-on", "details-on", "settled", "finale"], moods: { red: "cheerful", green: "cheerful", blue: "cheerful", yellow: "cheerful" } }
];

const STAGE_CLASSES = ["cake-arrives", "fall", "impact", "sad", "rescue", "decorated", "decorate-start", "banner-on", "balloons-on", "details-on", "settled", "yellow-away", "cake-held-yellow", "chase-ready", "chase-red", "chase-green", "chasing", "finale"];
function clearCharacterBubbles() {
  characterIds.forEach(id => { const bubble = document.getElementById(`bubble-${id}`); bubble.textContent = ""; bubble.classList.remove("show"); });
}

function enterTimelineBeat(index) {
  const beat = birthdayTimeline[index];
  activeBeat = index;
  applyStickers(STICKER_SEQUENCE.find(sequence => sequence.scene === beat.scene).stickers);
  if (beat.classes?.includes("chasing") && !stage.classList.contains("chasing")) {
    const stageBounds = stage.getBoundingClientRect();
    chaseRestPositions = Object.fromEntries(["red", "green", "blue"].map(id => {
      const rect = characters[id].getBoundingClientRect();
      return [id, { x: rect.left - stageBounds.left + rect.width / 2, y: rect.top - stageBounds.top + rect.height / 2 }];
    }));
  }
  if (stage.classList.contains("chasing") && !beat.classes?.includes("chasing")) {
    ["red", "green", "blue"].forEach(id => {
      characters[id].style.removeProperty("left");
      characters[id].style.removeProperty("top");
      characters[id].style.removeProperty("z-index");
    });
    chaseRestPositions = null;
  }
  stage.classList.remove(...STAGE_CLASSES);
  beat.classes?.forEach(className => stage.classList.add(className));
  deliveryCake.hidden = !beat.classes?.includes("cake-arrives") && !beat.classes?.includes("fall");
  realCake.hidden = !beat.classes?.includes("cake-held-yellow");
  clearCharacterBubbles();
  characterIds.forEach(id => {
    const character = characters[id];
    character.className = `robot-unit character-${id}${character.dataset.sticker ? " has-sticker" : ""}`;
    if (beat.moods?.[id]) character.classList.add(`mood-${beat.moods[id]}`);
  });
  if (beat.speaker) {
    const bubble = document.getElementById(`bubble-${beat.speaker}`);
    bubble.textContent = beat.line;
    bubble.classList.add("show");
    characters[beat.speaker].classList.add("speaking");
    dialogueSpeaker.textContent = beat.speaker.toUpperCase();
    dialogueLine.textContent = beat.line;
    if (soundEnabled) playSfx("pop");
  } else {
    dialogueSpeaker.textContent = "BIRTHDAY CREW";
    dialogueLine.textContent = beat.line || beat.status;
  }
  sceneCaption.textContent = beat.caption;
  sceneStatus.textContent = beat.status;
  if (beat.sound && beat.sound !== "pop" && soundEnabled) playSfx(beat.sound);
  if (beat.confetti) launchConfetti();
}

function updateChasePositions(elapsed) {
  const bounds = stage.getBoundingClientRect();
  const centerX = bounds.width / 2;
  const centerY = bounds.height * 0.52;
  const radiusX = Math.min(bounds.width * 0.2, 112);
  const radiusY = Math.min(bounds.height * 0.22, 54);
  const rotation = -Math.PI / 2 + ((elapsed - 58) / 7) * Math.PI * 3;
  const followers = [
    { id: "blue", lag: 0 },
    { id: "red", lag: Math.PI * 0.68 },
    { id: "green", lag: Math.PI * 1.36 }
  ];
  followers.forEach(({ id, lag }) => {
    const angle = rotation - lag;
    let x = centerX + Math.cos(angle) * radiusX;
    let y = centerY + Math.sin(angle) * radiusY;
    if (elapsed >= 65 && chaseRestPositions) {
      const settle = Math.min(1, elapsed - 65);
      const eased = settle * settle * (3 - 2 * settle);
      x += (chaseRestPositions[id].x - x) * eased;
      y += (chaseRestPositions[id].y - y) * eased;
    }
    characters[id].style.left = `${x}px`;
    characters[id].style.top = `${y}px`;
    characters[id].style.zIndex = String(Math.round(y));
  });
}

function finishTimeline() {
  timelineFrame = 0;
  sceneFinished = true;
  dialogueProgress.style.width = "100%";
  sceneNext.disabled = false;
  sceneNext.textContent = "Continue to the cake";
  sceneReplay.hidden = false;
  if (soundEnabled) playSfx("fanfare");
  launchConfetti();
}

function updateTimeline(now) {
  const elapsed = Math.min(72, (now - timelineStartedAt) / 1000);
  if (elapsed >= 1 && stage.classList.contains("playing")) stage.classList.remove("playing");
  if (elapsed >= 58 && elapsed < 66) updateChasePositions(elapsed);
  dialogueProgress.style.width = `${(elapsed / 72) * 100}%`;
  let beatIndex = birthdayTimeline.findIndex(beat => elapsed >= beat.start && elapsed < beat.end);
  if (beatIndex < 0) beatIndex = birthdayTimeline.length - 1;
  if (beatIndex !== activeBeat) enterTimelineBeat(beatIndex);
  if (elapsed >= 72) { finishTimeline(); return; }
  timelineFrame = requestAnimationFrame(updateTimeline);
}

function startRobotScene(restart = false) {
  if (sceneFinished && !restart) { goToPage(4); return; }
  if (timelineFrame) cancelAnimationFrame(timelineFrame);
  sceneStarted = true;
  sceneFinished = false;
  activeBeat = -1;
  sceneNext.disabled = true;
  sceneNext.textContent = "The birthday show is playing...";
  sceneReplay.hidden = false;
  dialogueProgress.style.transition = "none";
  dialogueProgress.style.width = "0%";
  ["red", "green", "blue"].forEach(id => {
    characters[id].style.removeProperty("left");
    characters[id].style.removeProperty("top");
    characters[id].style.removeProperty("z-index");
  });
  chaseRestPositions = null;
  stage.classList.remove(...STAGE_CLASSES, "scene-entering", "delivering", "conversation", "robots-arrived", "playing");
  void stage.offsetWidth;
  stage.classList.add("playing");
  clearCharacterBubbles();
  deliveryCake.hidden = true;
  realCake.hidden = true;
  timelineStartedAt = performance.now();
  timelineFrame = requestAnimationFrame(updateTimeline);
  if (soundEnabled) playSfx("whoosh");
}

sceneNext.addEventListener("click", () => startRobotScene());
sceneReplay.addEventListener("click", () => startRobotScene(true));

document.getElementById("cut-cake-btn").addEventListener("click", () => {
  playSfx("cut");
  document.getElementById("cake-party").classList.add("cut");
  document.getElementById("candles").style.opacity = ".15";
  document.getElementById("cake-message").textContent = `Yay, ${friendName}! The cake has been cut! Now make a wish! ✨💖`;
  document.getElementById("cut-cake-btn").hidden = true;
  document.getElementById("cake-next").hidden = false;
  launchConfetti();
});
document.getElementById("cake-next").addEventListener("click", () => goToPage(5));

// Complete quiz collection. Each run uses a shuffled selection of seven.
const allQuestions = [

  // FUNNY BIRTHDAY AND PERSONALITY QUESTIONS

  {
    question: "What do you want most on your birthday? 🎂",
    options: ["Cake and gifts 🎁", "Unlimited sleep 😴", "Free food forever 🍕", "Everyone’s attention 😎"],
    feedback: ["A gift lover has been spotted! 😂", "Sleep is the real luxury! 😴", "Food lover detected! 🍕", "Main-character energy! 🌟"]
  },

  {
    question: "If you could have one superpower, what would you choose? 🦸",
    options: ["Mind reading 🧠", "Time travel ⏳", "Unlimited money 💸", "Becoming invisible 👻"],
    feedback: ["Now everyone’s secrets will be exposed! 👀", "Time to check both the past and the future! ⏳", "Goodbye, bills! 💸", "Your pranks would reach a whole new level! 😂"]
  },

  {
    question: "How does it feel to have me as a friend? 😂",
    options: ["The best decision of my life 😎", "I made a terrible mistake 😭", "I get free entertainment 😂", "You drive me crazy 😭😂"],
    feedback: ["Wow, such high praise! I’m taking a screenshot! 😂❤️", "You signed up for this friendship. The lifetime subscription cannot be cancelled! 🤣", "So I’m less of a friend and more of a comedy show? 😭🎭", "Oh, really? 😭😂 Then I’ll bother you twice as much from now on!"]
  },

  {
    question: "Who is the real VIP on your birthday? 👑",
    options: ["Me (the developer, meeeee!) 😎", "Crush 💗", "My friends 💖", "Whoever brings gifts 🎁"],
    feedback: ["Thanks for choosing me! 🫣", "You’ve earned VIP status for the birthday. Now, when will you become a friend? 😅🙃", "Friendship wins! 💗", "The gift department is clearly important! 😭"]
  },

  {
    question: "If your life were a movie, what would its genre be? 🎬",
    options: ["Comedy 😂", "Romance 💗", "Action 🔥", "Horror 👻"],
    feedback: ["Every day is a new joke! 🤣", "Waiting for someone special to make an entrance? 👀", "A hero’s grand entrance! 😎", "Life has already scared you enough! 😭"]
  },

  {
    question: "What is your greatest talent? 🤔",
    options: ["Overthinking 🧠", "Sleeping 😴", "Bothering people 😂", "Eating 🍕"],
    feedback: ["One hundred tabs open in your mind! 😭", "Sleeping champion! 🏆", "Public nuisance detected! 😂", "Food is always the answer! 🍕"]
  },

  {
    question: "What would you do if you became invisible for 24 hours? 👻",
    options: ["I’d prank my friends 😂", "Shop for free 🛍️", "Find out everyone’s secrets 👀", "Just enjoy myself 😎"],
    feedback: ["Prankster mode unlocked! 🤣", "Shopping without limits! 🛍️", "Secret-agent mode: ON! 🕵️", "No plan, just vibes! 😂"]
  },

  {
    question: "What takes up the most space on your phone? 📱",
    options: ["Selfies 🤳", "Memes 😂", "Study material 📚", "Random screenshots 📸"],
    feedback: ["Your camera roll is full! 😎", "Certified meme addict! 😂", "Study mode activated! 📚", "Only you know why you took all those screenshots! 😭"]
  },

  {
    question: "If you became king or queen for a day, what would you do? 👑",
    options: ["Give everyone a day off 🏖️", "Declare free food for everyone 🍕", "Make my own rules 📜", "Make everyone my fan 😎"],
    feedback: ["The people’s favourite ruler! ❤️", "You’re in charge of the food ministry! 😂", "Getting dictator vibes! 😭", "You’re already the main character! 🌟"]
  },

  {
    question: "What is your biggest birthday fear? 😭",
    options: ["Getting cake smeared on my face 🎂", "Nobody wishing you 🥲", "Feeling old 👴", "Having to do an embarrassing dance at the party 💃"],
    feedback: ["Keep a safe distance from the cake! 😂", "Keep checking your notifications! 📱", "Age is just a number! 😎", "That dance video is about to go viral! 🤣"]
  },

  // SAVAGE AND DEEP-LIFE QUESTIONS

  {
    question: "What is the biggest lesson life has taught you? 🥀",
    options: ["Never trust anyone blindly 🐍", "Expect nothing from anyone 😎", "People change, but memories don’t 🖤", "Learn to live for yourself 🔥"],
    feedback: ["Experience speaks louder than words! 🐍", "No expectations, no disappointments! 🥶", "Some memories hit harder than reality! 🥀", "Self-respect is the real flex! 👑"]
  },

  {
    question: "What would you do if life started ignoring you? 😏",
    options: ["I’d leave life on read too 😂", "I’d write my own story ✍️", "No regrets, no explanations 🥶", "Come back stronger 🔥"],
    feedback: ["Mutual ignoring: expert level! 😭", "The main character doesn’t need a script! 👑", "Silence is sometimes the loudest reply! 🖤", "Plot twist loading... 🚀"]
  },

  {
    question: "What should you do when someone fails to see your worth? 🥶",
    options: ["Ignore them 😎", "Know your own worth 👑", "Walk away from their life 🚶", "Let your success answer them one day 🔥"],
    feedback: ["Silence is the best response! 🖤", "Self-worth doesn’t need anyone’s approval! 👑", "Sometimes, your absence says it all! 🥀", "Let success make the noise! 🚀"]
  },

  {
    question: "What is the most dangerous thing in life? 💀",
    options: ["Fake promises 🤡", "Blind trust 🐍", "Overthinking 🧠", "The wrong people ❤️‍🩹"],
    feedback: ["Words are easy; actions matter! 🎭", "Trust, but keep your eyes open! 👀", "Give your mind a day off sometimes! 😭", "Not everyone deserves your energy! 🥀"]
  },

  {
    question: "What if someone underestimates you? 😏",
    options: ["Smile and move on 😌", "Prove them wrong 🔥", "Surprise them 🎯", "Don’t care about their opinion 😎"],
    feedback: ["Peace is also a power! 🖤", "Let your work speak! 👑", "Plot twist incoming! 😂", "Their opinion, not your problem! 🥶"]
  },

  {
    question: "What is life’s biggest illusion? 🎭",
    options: ["Everyone is loyal ❤️", "Money solves everything 💸", "Time waits for nobody ⏳", "Everyone wants you to succeed 🌚"],
    feedback: ["Loyalty is rare, but not impossible! 🥀", "Money helps, but it can’t buy everything! 💀", "Time is the one thing you can’t get back! ⏳", "Keep your circle genuine! 🐍"]
  },

  {
    question: "If you had a chance to go back to the past, what would you do? ⏳",
    options: ["Correct a few mistakes", "Never trust anyone", "Relive those same memories", "Change nothing at all"],
    feedback: ["Mistakes can teach expensive lessons! 🥀", "Trust wisely, not blindly! 🐍", "Some moments deserve to be relived! ❤️", "No regrets, just growth! 😎"]
  },

  {
    question: "What do you think true power is? 👑",
    options: ["Control over your emotions 🧠", "Financial independence 💸", "Walking away without regret 🚶", "Staying calm in the middle of chaos 🥶"],
    feedback: ["Master yourself, and you can master your world! 🔥", "Freedom has its own price! 💰", "Not every battle deserves your attention! 🖤", "A calm mind and razor-sharp focus! 🎯"]
  },

  {
    question: "What would you do if people misunderstood you? 🎭",
    options: ["Explain myself once 🗣️", "Let them think whatever they want 😎", "Prove it through my actions 🔥", "Keep my distance 🥀"],
    feedback: ["One explanation is enough! 👑", "Not everyone deserves an explanation! 🥶", "Actions always speak louder! 🔥", "Peace over unnecessary drama! 🖤"]
  },

  {
    question: "What should be life’s most savage rule? 🥀",
    options: ["Never beg for attention 😎", "Respect is earned, not demanded 👑", "Never lose yourself for anyone 🖤", "Know when it’s time to walk away 🚶"],
    feedback: ["Attention is temporary; self-respect lasts! 🔥", "Respect must go both ways! 🤝", "Be yourself; that is your true identity! 🥀", "Walking away can be a powerful decision! 🥶"]
  }

];
let selectedQuestions = [];
let qIndex = 0, answers = [];
let quizCompleted = false;
const qText = document.getElementById("question-text"), optionsBox = document.getElementById("answer-options");
const qFeedback = document.getElementById("quiz-feedback"), qNext = document.getElementById("quiz-next");
const quizContent = document.getElementById("quiz-content"), quizResult = document.getElementById("quiz-result");
const quizCounter = document.getElementById("quiz-counter");
function shuffleQuestions(items) {
  const shuffled = items.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function startQuiz() {
  selectedQuestions = shuffleQuestions(allQuestions).slice(0, 7);
  qIndex = 0;
  answers = Array(selectedQuestions.length).fill(null);
  quizCompleted = false;
  renderQuiz();
}
function renderQuiz() {
  quizContent.hidden = quizCompleted;
  quizResult.hidden = !quizCompleted;
  if (quizCompleted) {
    quizCounter.textContent = `Quiz complete: ${selectedQuestions.length} of ${selectedQuestions.length}`;
    return;
  }
  const q = selectedQuestions[qIndex], previous = answers[qIndex];
  quizCounter.textContent = `Question ${qIndex + 1} of ${selectedQuestions.length}`;
  qText.textContent = q.question;
  optionsBox.replaceChildren();
  qFeedback.textContent = "";
  q.options.forEach((option, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "answer-option"; b.textContent = option;
    if (previous !== null) { b.disabled = true; if (i === previous) b.classList.add("selected"); }
    b.addEventListener("click", () => {
      if (answers[qIndex] !== null) return;
      answers[qIndex] = i;
      qFeedback.textContent = q.feedback[i];
      [...optionsBox.children].forEach((el, j) => { el.disabled = true; if (j === i) el.classList.add("selected"); });
      updateQuizButtons();
    });
    optionsBox.appendChild(b);
  });
  if (previous !== null) qFeedback.textContent = q.feedback[previous];
  updateQuizButtons();
}
function updateQuizButtons() {
  const hasAnswer = answers[qIndex] !== null;
  qNext.hidden = !hasAnswer;
  qNext.textContent = qIndex === selectedQuestions.length - 1 ? "See your results! \u{1F389}" : "Next Question \u{279C}";
}
qNext.addEventListener("click", () => {
  if (answers[qIndex] === null) return;
  if (qIndex < selectedQuestions.length - 1) {
    qIndex++;
    renderQuiz();
  } else {
    quizCompleted = true;
    renderQuiz();
  }
});
document.getElementById("quiz-restart").addEventListener("click", startQuiz);
document.getElementById("quiz-continue").addEventListener("click", () => {
  if (quizCompleted && answers.length === 7 && answers.every(answer => answer !== null)) goToPage(6);
});

// Messages
const messages=[
 "Happy Birthday! May your life be filled with so much happiness that the sad days feel tiny. 💖",
 "Remember, life does not have to be perfect. What matters are good moments, genuine friends, and the effort you put into your dreams. 🌷",
 "Smile a little extra today, enjoy your favourite food, and take a moment to appreciate yourself. You made it through another year! 🎂",
 "No matter how far apart we are, these wishes are for you. Keep being your unique, wonderful self! 💌"
];
let messageIndex=0;
function renderMessage(){
  document.getElementById("message-text").textContent=messages[messageIndex];
  document.getElementById("message-count").textContent=`Message ${messageIndex+1} of ${messages.length}`;
  const last=messageIndex===messages.length-1;
  document.getElementById("message-next").hidden=last;
  document.getElementById("message-continue").hidden=!last;
}
document.getElementById("message-next").addEventListener("click",()=>{if(messageIndex<messages.length-1){messageIndex++;renderMessage();}});
document.getElementById("message-continue").addEventListener("click",()=>{if(messageIndex===messages.length-1){goToPage(7);launchConfetti();}});

// Sound effects only (no background music). Audio starts after a user gesture.
let audioContext=null, soundEnabled=true;
const musicButton=document.getElementById("music-btn");
function audioReady(){
  const AudioClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioClass)return null;
  if(!audioContext)audioContext=new AudioClass();
  if(audioContext.state==="suspended")audioContext.resume();
  return audioContext;
}
function tone(freq, duration, type="sine", volume=.08, delay=0){
  const ac=audioReady(); if(!ac||!soundEnabled)return;
  const osc=ac.createOscillator(), gain=ac.createGain(), t=ac.currentTime+delay;
  osc.type=type; osc.frequency.setValueAtTime(freq,t);
  gain.gain.setValueAtTime(.0001,t); gain.gain.exponentialRampToValueAtTime(volume,t+.025);
  gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  osc.connect(gain);gain.connect(ac.destination);osc.start(t);osc.stop(t+duration+.03);
}
function playSfx(kind){
  if(!soundEnabled)return;
  if(kind==="whoosh"){tone(260,.22,"sawtooth",.035);tone(520,.18,"triangle",.025,.08);}
  if(kind==="crash"){tone(115,.42,"triangle",.12);tone(72,.3,"sawtooth",.045,.08);}
  if(kind==="sad"){tone(440,.24,"sine",.045);tone(330,.32,"sine",.04,.2);}
  if(kind==="fanfare"){[523,659,784,1047].forEach((f,i)=>tone(f,.32,"triangle",.07,i*.12));}
  if(kind==="pop"){tone(740,.12,"sine",.05);tone(990,.16,"sine",.035,.07);}
  if(kind==="cut"){tone(660,.12,"triangle",.06);tone(880,.22,"triangle",.07,.12);}
}
musicButton.addEventListener("click",()=>{
  soundEnabled=!soundEnabled;
  musicButton.textContent=soundEnabled?"🔊 Sound Effects: ON":"🔇 Sound Effects: OFF";
  musicButton.setAttribute("aria-pressed",String(soundEnabled));
  if(soundEnabled)playSfx("pop");
});
// Confetti canvas, sized for mobile/high-density screens.
const canvas=document.getElementById("confetti-canvas"),ctx=canvas.getContext("2d");
let pieces=[],frame=null;
function launchConfetti(){
  if(!ctx)return;
  const w=window.innerWidth,h=window.innerHeight,dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  pieces=Array.from({length:75},()=>({x:Math.random()*w,y:-Math.random()*h,size:4+Math.random()*6,speed:2+Math.random()*3,drift:(Math.random()-.5)*2,rot:Math.random()*6,spin:(Math.random()-.5)*.15,hue:Math.random()*360}));
  if(frame)cancelAnimationFrame(frame);let left=150;
  function draw(){
    ctx.clearRect(0,0,w,h);
    pieces.forEach(p=>{p.x+=p.drift;p.y+=p.speed;p.rot+=p.spin;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=`hsl(${p.hue},85%,65%)`;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.5);ctx.restore();if(p.y>h+12){p.y=-12;p.x=Math.random()*w;}});
    if(--left>0)frame=requestAnimationFrame(draw);else{ctx.clearRect(0,0,w,h);frame=null;}
  }
  frame=requestAnimationFrame(draw);
}
document.getElementById("confetti-btn").addEventListener("click",()=>{playSfx("fanfare");launchConfetti();});
window.addEventListener("resize",()=>{if(frame){cancelAnimationFrame(frame);frame=null;ctx.clearRect(0,0,canvas.width,canvas.height);}});
startQuiz();
goToPage(1);
