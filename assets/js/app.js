// canvas for the block tree and player
const canvas = document.getElementById("canvas");
// canvas for particles
const canvas2 = document.getElementById("canvas2");
// canvas for extras and special effects
const canvas3 = document.getElementById("canvas3");
const ctx = canvas.getContext("2d");
const ctx2 = canvas2.getContext("2d");
const ctx3 = canvas3.getContext("2d");
const scoreboard = document.getElementById("score");
const scoreboardHi = document.getElementById("hi-score");
const gameOverScreen = document.getElementById("game-over");
const gameStartScreen = document.getElementById("start-screen");
const endScore = document.getElementById("score-end");
const endScoreHi = document.getElementById("score-end-hi");
const html = document.querySelector("html");
const loader = document.querySelector("#load");
const counterOnscreen = document.querySelector("#endless-time");
const mainMenu = {
  start: document.getElementById("button-start"),
  mode: document.getElementById("button-mode-select"),
  help: document.getElementById("button-how-to"),
  shop: document.getElementById("button-shop")
}

const modes = {
  arcade: {
    config: {
      mode: "arcade",
      hiScore: 0 || localStorage.getItem("hiScore.arcade"),
      playerLosesLife: true,
      blorgChance: 0.6,
    },
  },
  speed: {
    config: {
      mode: "speed",
      bestTime: 100 || localStorage.getItem("hiScore.speed"),
      playerLosesLife: false,
      blorgChance: 0.8,
    },
  },
  endless: {
    config: {
      mode: "endless",
      hiScore: 0 || localStorage.getItem("hiScore.endless"),
      playerLosesLife: false,
      blorgChance: 0.2,
    },
  },
  select(mode) {
    let result;
    switch (mode) {
      case "arcade":
        result = this.arcade.config;
        break;
      case "speed":
        result = this.speed.config;
        break;
      case "endless":
        result = this.endless.config;
        break;
    }
    return result;
  },
};

/////////////////////  IMAGES
const playerSprite = new Image();
const blockTexture = new Image();
const branchTexture = new Image();
const spikeTexture = new Image();
const dustFX = new Image();
const dustFXRev = new Image();
const blorg = new Image();

playerSprite.src = "assets/img/players.png";
const playerSpriteDimensions = {
  width: 100,
  height: 140,
};
const player0Sprite_states = {
  idle0: {
    x: 0,
    y: 0,
  },
  idle1: {
    x: 100,
    y: 0,
  },
  attack0: {
    x: 200,
    y: 0,
  },
  attack1: {
    x: 300,
    y: 0,
  },
  death0: {
    x: 400,
    y: 0,
  },
  death1: {
    x: 500,
    y: 0,
  },
};
const blockTextureConfig = {
  src: "assets/img/metal.png",
  width: 150,
  height: 225,
  pos: [
    {
      x: 0,
      y: 0,
    },
    {
      x: 150,
      y: 0,
    },
    {
      x: 300,
      y: 0,
    },
    {
      x: 450,
      y: 0,
    },
    {
      x: 600,
      y: 0,
    },
    {
      x: 750,
      y: 0,
    },
    {
      x: 900,
      y: 0,
    },
    {
      x: 1050,
      y: 0,
    },
  ],
};
blockTexture.src = blockTextureConfig.src;
const branchTextureConfig = {
  src: "assets/img/branch.png",
  width: 225,
  height: 76,
  pos: [
    {
      x: 0,
      y: 0,
    },
    {
      x: 75,
      y: 0,
    },
    {
      x: 150,
      y: 0,
    },
    {
      x: 225,
      y: 0,
    },
    {
      x: 300,
      y: 0,
    },
    {
      x: 375,
      y: 0,
    },
    {
      x: 450,
      y: 0,
    },
    {
      x: 525,
      y: 0,
    },
    {
      x: 600,
      y: 0,
    },
    {
      x: 675,
      y: 0,
    },
  ],
};
branchTexture.src = branchTextureConfig.src;
const spikeTextureConfig = {
  src: "assets/img/spikes.png",
  x: 0,
  y: 0,
  width: 128,
  height: 64,
};
spikeTexture.src = spikeTextureConfig.src;
const dustFXConfig = {
  src: "assets/img/dustfx.png",
  srcRev: "assets/img/dustfx-rev.png",
  x: [0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960, 1040, 1120],
  y: [0, 100],
  width: 80,
  height: 70,
};
dustFX.src = dustFXConfig.src;
dustFXRev.src = dustFXConfig.srcRev;
const blorgConfig = {
  src: "assets/img/blorg.png",
  x: 0,
  y: 0,
  width: 300,
  height: 300,
};
blorg.src = blorgConfig.src;

//////////////////////////////  AUDIO

const song = new Audio("assets/sound/whack-song.mp3");
const hitSound = [
  new Audio("assets/sound/hit1.mp3"),
  new Audio("assets/sound/hit2.mp3"),
  new Audio("assets/sound/hit3.mp3"),
  new Audio("assets/sound/hit4.mp3"),
  new Audio("assets/sound/hit5.mp3"),
  new Audio("assets/sound/hit6.mp3"),
  new Audio("assets/sound/hit7.mp3"),
  new Audio("assets/sound/hit8.mp3"),
  new Audio("assets/sound/death.mp3"),
];
let notes = [];
let deathSound;

//////////////////////////////  GLOBALS

const touch = {
  x: null,
};
let WIDTH, HEIGHT;
let chunk, player, mode;
let arrayLength;
let hiScore = 0 || localStorage.getItem("hi-score");
let blocks = [];
let particles = [];
let effects = [];
let score = 0;
let blorgs = 0;
let blocksNum = 6;
let delta = 0;
let lastFrame = 0;
let gameLoaded = false;
let gameStart = false;
let gameOver = false;
let gamePrepped = false;
let gamePaused = false;
let running = false;
let gameConfig = modes.select("speed");
let speedTimeStart = 0;
let speedTime = 0;
let bestTime = localStorage.getItem("best-time");
bestTime = bestTime ? parseFloat(bestTime) : 100;

/////////////////////////////// SET UP

addEventListener("DOMContentLoaded", () => {

  function init() {
    blocks = [];
    particles = [];
    notes = [];

    resize(1);

    if (!song) {
      audioSetup();
    }

    // generate starting blocks
    for (let i = 0; i < blocksNum; i++) {
      blocks.push(new Block(i));
    }

    // check where to spawn player and spawn
    switch (blocks[blocks.length - 1].type) {
      case 1:
        player = new Player(1, 0, gameConfig.playerLosesLife);
        break;
      case 2:
      default:
        player = new Player(0, 0, gameConfig.playerLosesLife);
        break;
    }

    // here "truthy" resets score
    handleScore(1);

    //reset timer for endless mode
    if (gameConfig.mode === "speed") {
      speedTime = 0;
      timeTracker = 0;
      speedTimeStart = false;
      counterOnscreen.innerHTML = `Time Elapsed: ${timeTracker}`;
    }

    if (gameOver) {
      gameOverScreen.classList.toggle("hide");
      gameOver = false;
    }
    if (!running) {
      animate();
      running = true;
      if (!song.playing) {
        song.play();
        song.loop = true;
      }
    }

    updateArray(blocks);
    player.update();
  }
  function start() {
    if (!gameStart) {
      init();
      gameStartScreen.classList.toggle("hide");
      gameStart = true;
    }
    if (gameOver && gamePrepped) {
      init();
    }
  }

  // Placeholder loader function
  setTimeout(function () {
    loader.style.display = "none";
    gameLoaded = true;
    gamePrepped = true;
  }, 10);

  ///////////////////////////// GAMELOOP
  let screenTime = 0;
  function animate(timestamp) {
    if (!gamePaused) {
      //calculate time since last frame
      if (!timestamp) {
        timestamp = 0;
      }
      delta = timestamp - lastFrame;
      lastFrame = timestamp;

      if (speedTimeStart) {
        timeTracker = ((new Date().getTime() - speedTime) / 1000).toFixed(2);
        counterOnscreen.innerText = `Time Elapsed: ${
          Math.floor(timeTracker * 10) / 10
        }`;
        // console.log(timeTracker);
        console.log(timeTracker);
      }

      noteRecycler();

      // Player
      if (player.isMoving) {
        player.playerMove();
      }

      if (player.isCounting) {
        player.stateHandler();
      }
      if (gameConfig.playerLosesLife && player.losingHealth) {
        player.handleHealth();
      }

      // Arrays
      updateArray(particles);
      updateArray(effects);

      touch.x = null;
    }
    requestAnimationFrame(animate);
  }

  /////////////////// INPUT AND HANDLERS

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", function (e) {
    if (e.repeat) {
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        if (!gameStart || gameOver) {
          return;
        }
        !gamePaused ? (gamePaused = true) : (gamePaused = false);
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        if (!gameStart || gameOver || gamePaused) {
          return;
        }
        if (!player.losingHealth) {
          player.losingHealth = true;
        }
        if (gameConfig.mode === "speed" && !speedTimeStart) {
          speedTimeStart = true;
          speedTime = new Date().getTime();
        }
        player.pos = 0;
        player.isMoving = true;
        player.health += player.healthAdd;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        if (!gameStart || gameOver || gamePaused) {
          return;
        }
        if (!player.losingHealth) {
          player.losingHealth = true;
        }
        if (gameConfig.mode === "speed" && !speedTimeStart) {
          speedTimeStart = true;
          speedTime = new Date().getTime();
        }
        player.pos = 1;
        player.isMoving = true;
        player.health += player.healthAdd;
        break;
      case "Enter":
        if (gameLoaded) {
          start();
        }
        break;
    }
  });
  window.addEventListener("touchstart", (e) => {
    touch.x = Math.floor(e.changedTouches[0].clientX);
    if (touch.x < WIDTH / 2 && !gameOver) {
      player.pos = 0;
      player.isMoving = true;
    } else if (touch.x >= WIDTH / 2 && !gameOver) {
      player.pos = 1;
      player.isMoving = true;
    }
    if (gameLoaded && gamePrepped) {
      start();
    }
  });
  mainMenu.start.addEventListener('click', start);
});
