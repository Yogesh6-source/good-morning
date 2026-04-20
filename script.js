window.addEventListener("DOMContentLoaded", () => {
  const elements = {
    typingLine: document.getElementById("typingLine"),
    sparkleLayer: document.getElementById("sparkleLayer"),
    petalLayer: document.getElementById("petalLayer"),
    teaDisplay: document.getElementById("teaDisplay"),
    sceneVideo: document.getElementById("sceneVideo"),
    pourButton: document.getElementById("pourButton"),
    wishButton: document.getElementById("wishButton"),
    hiddenMessage: document.getElementById("hiddenMessage"),
    queenButton: document.getElementById("queenButton"),
    loveLetter: document.getElementById("loveLetter"),
    finalScene: document.getElementById("finalScene"),
    finalReplayButton: document.getElementById("finalReplayButton"),
    replayButton: document.getElementById("replayButton"),
    musicButton: document.getElementById("musicButton"),
    stepBrew: document.getElementById("stepBrew"),
    stepWish: document.getElementById("stepWish"),
    stepCrown: document.getElementById("stepCrown"),
  };

  if (Object.values(elements).some((item) => !item)) {
    return;
  }

  const greeting = `Good morning, My Queen ${String.fromCodePoint(0x1F451)}`;
  const petalIcons = [
    String.fromCodePoint(0x2764),
    String.fromCodePoint(0x273F),
    String.fromCodePoint(0x2740),
    String.fromCodePoint(0x2741),
  ];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    typingIndex: 0,
    teaPoured: false,
    wishRevealed: false,
    letterOpened: false,
    finaleShown: false,
    finaleTimer: null,
    audioContext: null,
    masterGain: null,
    drones: null,
    shimmerIntervalId: null,
    musicEnabled: false,
  };

  function typeGreeting() {
    if (state.typingIndex <= greeting.length) {
      elements.typingLine.textContent = greeting.slice(0, state.typingIndex);
      state.typingIndex += 1;
      window.setTimeout(typeGreeting, state.typingIndex < greeting.length ? 78 : 180);
    } else {
      elements.typingLine.classList.add("done");
    }
  }

  function buildSparkles() {
    const count = window.innerWidth < 760 ? 20 : 34;
    elements.sparkleLayer.innerHTML = "";

    for (let index = 0; index < count; index += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.animationDuration = `${9 + Math.random() * 8}s`;
      sparkle.style.animationDelay = `${Math.random() * -18}s`;
      sparkle.style.setProperty("--drift", `${-22 + Math.random() * 44}vw`);
      sparkle.style.opacity = `${0.35 + Math.random() * 0.45}`;
      elements.sparkleLayer.appendChild(sparkle);
    }
  }

  function burstPetals(count = 22) {
    for (let index = 0; index < count; index += 1) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.textContent = petalIcons[index % petalIcons.length];
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.color = index % 2 === 0 ? "rgba(204, 128, 151, 0.92)" : "rgba(201, 151, 63, 0.92)";
      petal.style.animationDuration = `${4.5 + Math.random() * 2.8}s`;
      petal.style.animationDelay = `${Math.random() * 0.4}s`;
      petal.style.setProperty("--petal-drift", `${-20 + Math.random() * 40}vw`);
      elements.petalLayer.appendChild(petal);

      petal.addEventListener("animationend", () => {
        petal.remove();
      }, { once: true });
    }
  }

  function setProgress() {
    // The progress rail mirrors the current emotional beat of the experience.
    const steps = [
      { element: elements.stepBrew, active: !state.teaPoured, complete: state.teaPoured },
      { element: elements.stepWish, active: state.teaPoured && !state.letterOpened, complete: state.letterOpened },
      { element: elements.stepCrown, active: state.letterOpened && !state.finaleShown, complete: state.finaleShown },
    ];

    steps.forEach(({ element, active, complete }) => {
      element.classList.toggle("is-active", active);
      element.classList.toggle("is-complete", complete);
    });
  }

  function revealWish() {
    if (state.wishRevealed) {
      return;
    }

    state.wishRevealed = true;
    elements.hiddenMessage.classList.add("revealed");
    burstPetals(12);
  }

  function pourTea() {
    if (state.teaPoured) {
      revealWish();
      return;
    }

    state.teaPoured = true;
    elements.teaDisplay.classList.add("is-pouring");
    if (elements.sceneVideo.paused) {
      elements.sceneVideo.play().catch(() => {});
    }

    window.setTimeout(() => {
      elements.teaDisplay.classList.remove("is-pouring");
      elements.teaDisplay.classList.add("is-poured");
      revealWish();
      setProgress();
    }, reduceMotion ? 40 : 1300);
  }

  function showFinale() {
    if (state.finaleShown) {
      return;
    }

    state.finaleShown = true;
    elements.finalScene.classList.add("active");
    elements.finalScene.setAttribute("aria-hidden", "false");
    elements.replayButton.classList.remove("hidden");
    setProgress();
  }

  function scheduleFinale() {
    window.clearTimeout(state.finaleTimer);
    state.finaleTimer = window.setTimeout(showFinale, reduceMotion ? 60 : 2500);
  }

  function openLetter() {
    if (state.letterOpened) {
      if (!state.finaleShown) {
        showFinale();
      }
      return;
    }

    if (!state.teaPoured) {
      pourTea();
    }

    state.letterOpened = true;
    revealWish();
    elements.loveLetter.classList.add("revealed");
    burstPetals(24);
    setProgress();
    scheduleFinale();
  }

  function resetExperience() {
    state.teaPoured = false;
    state.wishRevealed = false;
    state.letterOpened = false;
    state.finaleShown = false;
    state.typingIndex = 0;
    window.clearTimeout(state.finaleTimer);

    elements.teaDisplay.classList.remove("is-poured", "is-pouring");
    elements.hiddenMessage.classList.remove("revealed");
    elements.loveLetter.classList.remove("revealed");
    elements.finalScene.classList.remove("active");
    elements.finalScene.setAttribute("aria-hidden", "true");
    elements.replayButton.classList.add("hidden");
    elements.typingLine.textContent = "";
    elements.typingLine.classList.remove("done");
    elements.sceneVideo.currentTime = 0;
    elements.sceneVideo.play().catch(() => {});
    setProgress();
    typeGreeting();

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function createDrone(context, frequency, type, gainValue) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = gainValue;

    oscillator.connect(gainNode);
    gainNode.connect(state.masterGain);
    oscillator.start();

    return { oscillator, gainNode };
  }

  function playShimmer() {
    if (!state.audioContext || !state.masterGain) {
      return;
    }

    const now = state.audioContext.currentTime;
    const oscillator = state.audioContext.createOscillator();
    const gainNode = state.audioContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(523.25, now);
    oscillator.frequency.exponentialRampToValueAtTime(659.25, now + 0.9);
    oscillator.frequency.exponentialRampToValueAtTime(783.99, now + 1.7);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.45);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    oscillator.connect(gainNode);
    gainNode.connect(state.masterGain);
    oscillator.start(now);
    oscillator.stop(now + 3.4);
  }

  async function startMusic() {
    if (!state.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        elements.musicButton.textContent = "Music unavailable";
        elements.musicButton.disabled = true;
        return;
      }

      state.audioContext = new AudioContextClass();
      state.masterGain = state.audioContext.createGain();
      state.masterGain.gain.value = 0.08;
      state.masterGain.connect(state.audioContext.destination);
    }

    await state.audioContext.resume();

    if (!state.drones) {
      // A few gentle drones keep the page musical without needing an external audio file.
      state.drones = [
        createDrone(state.audioContext, 220, "sine", 0.42),
        createDrone(state.audioContext, 329.63, "triangle", 0.24),
        createDrone(state.audioContext, 440, "sine", 0.18),
      ];
      playShimmer();
    }

    if (!state.shimmerIntervalId) {
      state.shimmerIntervalId = window.setInterval(() => {
        if (state.musicEnabled) {
          playShimmer();
        }
      }, 6800);
    }

    state.musicEnabled = true;
    elements.musicButton.textContent = "Pause music \u266A";
    elements.musicButton.setAttribute("aria-pressed", "true");
  }

  async function pauseMusic() {
    if (!state.audioContext) {
      return;
    }

    if (state.shimmerIntervalId) {
      window.clearInterval(state.shimmerIntervalId);
      state.shimmerIntervalId = null;
    }

    await state.audioContext.suspend();
    state.musicEnabled = false;
    elements.musicButton.textContent = "Play music \u266A";
    elements.musicButton.setAttribute("aria-pressed", "false");
  }

  elements.pourButton.addEventListener("click", pourTea);
  elements.wishButton.addEventListener("click", () => {
    if (!state.teaPoured) {
      pourTea();
      return;
    }

    revealWish();
  });

  elements.teaDisplay.addEventListener("click", () => {
    if (!state.teaPoured) {
      pourTea();
    } else {
      revealWish();
    }
  });

  elements.teaDisplay.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!state.teaPoured) {
        pourTea();
      } else {
        revealWish();
      }
    }
  });

  elements.queenButton.addEventListener("click", async () => {
    openLetter();

    if (!state.musicEnabled) {
      try {
        await startMusic();
      } catch (error) {
        elements.musicButton.textContent = "Music unavailable";
      }
    }
  });

  elements.musicButton.addEventListener("click", async () => {
    try {
      if (state.musicEnabled) {
        await pauseMusic();
      } else {
        await startMusic();
      }
    } catch (error) {
      elements.musicButton.textContent = "Music unavailable";
    }
  });

  elements.replayButton.addEventListener("click", resetExperience);
  elements.finalReplayButton.addEventListener("click", resetExperience);

  window.addEventListener("resize", buildSparkles);

  buildSparkles();
  elements.sceneVideo.play().catch(() => {});
  setProgress();
  typeGreeting();
});
