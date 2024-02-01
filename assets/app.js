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

/////////////////////  IMAGES
const playerSprite = new Image();
const blockTexture = new Image();
const branchTexture = new Image();

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
};

blockTexture.src = "assets/img/metal.png";
const blockTextures = [
  {
    x: 0,
    y: 0,
    width: 150,
    height: 225,
  },
  {
    x: 150,
    y: 0,
    width: 150,
    height: 225,
  },
  {
    x: 300,
    y: 0,
    width: 150,
    height: 225,
  },
  {
    x: 450,
    y: 0,
    width: 150,
    height: 225,
  },
  {
    x: 600,
    y: 0,
    width: 150,
    height: 225,
  },
  {
    x: 750,
    y: 0,
    width: 150,
    height: 225,
  },
  {
    x: 900,
    y: 0,
    width: 150,
    height: 225,
  },
  {
    x: 1050,
    y: 0,
    width: 150,
    height: 225,
  },
];

branchTexture.src = "assets/img/branch.png";
branchTextureDimensions = [
  {
    x: 0,
    y: 0,
    width: 225,
    height: 76,
  },
  {
    x: 75,
    y: 0,
    width: 225,
    height: 76,
  },
  {
    x: 150,
    y: 0,
    width: 225,
    height: 76,
  },
  {
    x: 225,
    y: 0,
    width: 225,
    height: 76,
  },
  {
    x: 300,
    y: 0,
    width: 225,
    height: 76,
  },
  {
    x: 375,
    y: 0,
    width: 225,
    height: 76,
  },
  {
    x: 450,
    y: 0,
    width: 225,
    height: 76,
  },
  {
    x: 525,
    y: 0,
    width: 225,
    height: 76,
  },
  {
    x: 600,
    y: 0,
    width: 225,
    height: 76,
  },
  {
    x: 675,
    y: 0,
    width: 225,
    height: 76,
  }
];

const touch = {
  x: null,
};

let WIDTH, HEIGHT;
let chunk, player;
let particlesLength;
let grd, hiScore;
let blocks = [];
let particles = [];
let gameStart = false;
let gameOver = false;
let gamePrepped = false;
let running = false;
let blocksNum = 5;
let score = 0;

/////////////////////////////// CLASSES

////////////////////////// PLAYER CLASS

class Player {
  constructor(pos) {
    this.width = Math.floor(chunk * 0.5);
    this.height = Math.floor(chunk * 0.7);
    this.pos = pos;
    this.pos0 = {
      x: Math.floor(WIDTH / 2 - chunk),
      y: Math.floor(HEIGHT - this.height),
    };
    this.pos1 = {
      x: Math.floor(WIDTH / 2 + chunk * 0.5),
      y: Math.floor(HEIGHT - this.height),
    };
    this.posLegacy = pos;
    this.color = "#FF44FF";
  }
  draw() {
    if (this.posLegacy != this.pos) {
      this.clear();
      this.posLegacy = this.pos;
    }
    // ctx.fillStyle = this.color;
    switch (this.pos) {
      case 0:
        ctx.drawImage(
          playerSprite,
          player0Sprite_states.idle0.x,
          player0Sprite_states.idle0.y,
          playerSpriteDimensions.width,
          playerSpriteDimensions.height,
          this.pos0.x,
          this.pos0.y,
          this.width,
          this.height
        );
        break;
      case 1:
        ctx.drawImage(
          playerSprite,
          player0Sprite_states.idle1.x,
          player0Sprite_states.idle0.y,
          playerSpriteDimensions.width,
          playerSpriteDimensions.height,
          this.pos1.x,
          this.pos1.y,
          this.width,
          this.height
        );
        break;
    }
  }
  clear() {
    switch (this.posLegacy) {
      case 0:
        ctx.clearRect(this.pos0.x, this.pos0.y, this.width, this.height);
        break;
      case 1:
        ctx.clearRect(this.pos1.x, this.pos1.y, this.width, this.height);
        break;
    }
  }
  update() {
    this.draw();
  }
}

/////////////////////////// BLOCK CLASS

class Block {
  constructor(num) {
    this.height = chunk;
    this.width = Math.floor(this.height / 1.2);
    this.pos = {
      x: Math.floor(WIDTH / 2 - this.width / 2),
      y: num,
    };
    this.type = Math.floor(Math.random() * 3);
    this.branch = branchTextureDimensions[Math.floor(Math.random() * branchTextureDimensions.length)];
    this.branchWidth = Math.floor(chunk / 1.3);
    this.branchHeight = Math.floor(this.branchWidth / 3);
    this.blockTexture =
      blockTextures[Math.floor(Math.random() * blockTextures.length)];
  }
  draw() {
    // branch
    ctx.fillStyle = "indigo";
    switch (this.type) {
      case 1:
        ctx.drawImage(
          //texture placement
          branchTexture,
          this.branch.x,
          this.branch.y,
          this.branch.width,
          this.branch.height,
          //where to draw
          this.pos.x - this.branchWidth,
          this.pos.y * this.height + this.branchHeight,
          this.branchWidth,
          this.branchHeight
        );
        console.log(this.branch);
        // ctx.strokeRect(
        //   this.pos.x - this.branchWidth,
        //   this.pos.y * this.height + this.branchHeight,
        //   this.branchWidth,
        //   this.branchHeight
        // );
        break;
      case 2:
        ctx.drawImage(
          //texture placement
          branchTexture,
          this.branch.x,
          this.branch.y,
          this.branch.width,
          this.branch.height,
          //where to draw
          this.pos.x + this.width,
          this.pos.y * this.height + this.branchHeight,
          this.branchWidth,
          this.branchHeight
        );
        break;
    }
    // Main Trunk
    ctx.drawImage(
      blockTexture,
      this.blockTexture.x,
      this.blockTexture.y,
      this.blockTexture.width,
      this.blockTexture.height,
      this.pos.x,
      this.pos.y * this.height,
      this.width,
      this.height
    );
  }
  clear() {
    //Clear Branches
    if (this.type === 1) {
      ctx.clearRect(
        this.pos.x - this.branchWidth,
        this.pos.y * this.height + this.branchHeight,
        this.branchWidth,
        this.branchHeight
      );
    } else if (this.type == 2) {
      ctx.clearRect(
        this.pos.x + this.width,
        this.pos.y * this.height + this.branchHeight,
        this.branchWidth,
        this.branchHeight
      );
    } else return;
  }
  update() {
    this.draw();
  }
}

//////////////////////// PARTICLE CLASS

class Particle {
  constructor(type, blockDescriptor, direction) {
    this.type = type;
    this.blockDescriptor = blockDescriptor;
    this.direction = direction;
    this.grav = false;
    this.remove = false;
    switch (this.type) {
      case "block":
        this.typeBlock();
        break;
      case "death":
        this.typeDeath();
        break;
    }
  }
  typeBlock() {
    this.size = Math.floor(Math.random() * 4) + 2;
    this.pos = {
      x:
        Math.floor(Math.random() * this.blockDescriptor.width) +
        this.blockDescriptor.pos.x,
      y:
        Math.floor(Math.random() * this.blockDescriptor.height) +
        this.blockDescriptor.pos.y * this.blockDescriptor.height,
    };
    this.vel = {
      x: Math.random() * 2 + 3,
      y: -Math.random() * 9,
    };
    if (this.direction === "left") {
      this.vel.x *= -1;
      this.pos.x -= this.blockDescriptor.width / 2;
    }
    if (this.direction === "left") {
      this.pos.x += this.blockDescriptor.width / 2;
    }

    this.grav = true;
    this.gravity = 0.2;
    this.bounceMultiplier = -0.6;
    this.colorPalette = ["#FAE2C3", "#FFF78A", "#FFE382", "#FFC47E", "#FFBD94"];
    this.color =
      this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
  }
  typeDeath() {
    let playerPos;
    this.size = Math.floor(Math.random() * 10 + 5);
    switch (player.pos) {
      case 0:
        playerPos = player.pos0;
        break;
      case 1:
        playerPos = player.pos1;
        break;
    }
    this.pos = {
      x: Math.floor(playerPos.x + Math.random() * player.width),
      y: playerPos.y,
    };
    this.vel = {
      x: Math.random() * 4 - 2,
      y: -Math.random() * 3 - 2,
    };
    this.grav = true;
    this.gravity = 0.1;
    this.bounceMultiplier = -0.3;
    this.colorPalette = [
      "#842727",
      "#740707",
      "#560e07",
      "#490805",
      "#400303",
      "#a40707",
    ];
    this.color =
      this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
  }
  draw() {
    ctx2.beginPath();
    ctx2.fillStyle = this.color;
    ctx2.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2, false);
    ctx2.fill();
  }
  move() {
    //apply gravity
    if (this.grav) {
      this.vel.y += this.gravity;
    }

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }
  removeOffscreen() {
    if (this.pos.x < -this.size || this.pos.x > WIDTH + this.size) {
      this.remove = true;
    }
  }
  clear() {
    if (
      this.type === "block" ||
      (this.vel.y < -1 && this.pos.y < HEIGHT - this.size * 8)
    ) {
      ctx2.save(); // Save the current state of the canvas context
      ctx2.beginPath();
      ctx2.arc(this.pos.x, this.pos.y, this.size + 0.6, 0, Math.PI * 2, true);
      ctx2.clip();
      ctx2.clearRect(0, 0, WIDTH, HEIGHT); // Clear the entire canvas within the clipping path
      ctx2.restore(); // Restore the previous state of the canvas context
    }
  }
  bounce() {
    if (this.pos.y > HEIGHT - this.size) {
      this.pos.y = HEIGHT - this.size;
      this.vel.y *= this.bounceMultiplier;
    }
  }
  update() {
    this.clear();

    this.bounce();
    this.move();
    this.removeOffscreen();

    this.draw();
  }
}

///////////////////// UTILITY FUNCTIONS

function createParticles(type, amount, blockDescriptor, direction) {
  for (let i = 0; i < amount; i++) {
    type === "block"
      ? particles.push(new Particle(type, blockDescriptor, direction))
      : particles.push(new Particle(type));
  }
}

function removeBlock() {
  blocks[blocksNum - 1].clear();
  blocks.pop();
  for (let i = 0; i < blocks.length; i++) {
    let b = blocks[i];
    b.clear();
    b.pos.y++;
  }
  player.update();
  blocks.unshift(new Block(0));
}

function handleScore() {
  score++;
  scoreboard.innerText = `Score: ${score}`;
  if (score > hiScore) {
    hiScore = score;
    scoreboardHi.innerText = `Hi-Score: ${hiScore}`;
  }
}

function checkDeath() {
  removeBlock();
  if (player.pos === 0) {
    createParticles(
      "block",
      Math.floor(Math.random() * 5) + 5,
      blocks[blocks.length - 1],
      "right"
    );
    if (blocks[blocksNum - 1].type === 1) {
      createParticles("death", Math.floor(Math.random() * 15 + 20));
      gameOver = true;
      gamePrepped = false;
      setTimeout(endGame, 2000);
    } else {
      handleScore();
    }
  } else if (player.pos === 1) {
    createParticles(
      "block",
      Math.floor(Math.random() * 5) + 5,
      blocks[blocks.length - 1],
      "left"
    );
    if (blocks[blocksNum - 1].type === 2) {
      createParticles("death", Math.floor(Math.random() * 20 + 30));
      gameOver = true;
      gamePrepped = false;
      setTimeout(endGame, 2000);
    } else {
      handleScore();
    }
  }
}

function endGame() {
  gameOverScreen.classList.toggle("hide");
  scoreboard.classList.toggle("hide");
  scoreboardHi.classList.toggle("hide");
  endScore.innerText = `Score: ${score}`;
  endScoreHi.innerText = `Hi-Score: ${hiScore}`;
  gamePrepped = true;
  handleStorage(0);
}

function handleStorage(isGet) {
  if (!localStorage) {
    localStorage.setItem("hi-score", hiScore);
  }
  if (isGet) {
    result = localStorage.getItem("hi-score");
    return result;
  } else localStorage.setItem("hi-score", hiScore);
}

/////////////////////////////// SET UP

function init() {
  WIDTH = html.clientWidth;
  HEIGHT = html.clientHeight;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas2.width = WIDTH;
  canvas2.height = HEIGHT;
  canvas3.width = WIDTH + 60;
  canvas3.height = HEIGHT + 60;
  chunk = HEIGHT / blocksNum;

  blocks = [];
  particles = [];

  //generate starting blocks
  for (let i = 0; i < blocksNum; i++) {
    blocks.push(new Block(i));
  }

  // check where to spawn player and spawn
  switch (blocks[blocks.length - 1].type) {
    case 1:
      player = new Player(1);
      break;
    case 2:
    default:
      player = new Player(0);
      break;
  }

  score = 0;
  localStorage ? (hiScore = handleStorage(1)) : (hiScore = 0);
  scoreboard.classList.toggle("hide");
  scoreboardHi.classList.toggle("hide");
  scoreboardHi.innerText = `Hi-Score: ${hiScore}`;
  scoreboard.innerText = `Score: ${score}`;

  if (gameOver) {
    gameOverScreen.classList.toggle("hide");
    gameOver = false;
  }

  if (!running) {
    animate();
    running = true;
  }
  for (let i = 0; i < blocksNum; i++) {
    blocks[i].update();
  }
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

///////////////////////////// GAMELOOP

function animate() {
  particlesLength = particles.length;
  for (let j = 0; j < particlesLength; j++) {
    particles[j].update();
    if (particles[j].remove) {
      particles.splice(j, 1);
      particlesLength = particles.length;
    }
  }
  touch.x = null;
  requestAnimationFrame(animate);
}

/////////////////// INPUT AND HANDLERS

function playerMove(state) {
  !state ? (player.pos = 0) : (player.pos = 1);
  player.update();
  checkDeath();
  for (let i = 0; i < blocksNum; i++) {
    blocks[i].update();
  }
}

// window.addEventListener("DOMContentLoaded", init);
window.addEventListener("keydown", function (e) {
  if (e.repeat) {
    return;
  }
  switch (e.key) {
    case "ArrowLeft":
    case "a":
    case "A":
      if (gameOver) {
        return;
      }
      playerMove(0, 0);
      break;
    case "ArrowRight":
    case "d":
    case "D":
      if (gameOver) {
        return;
      }
      playerMove(1, 0);
      break;
    case "Enter":
      start();
      break;
  }
});

window.addEventListener("touchstart", (e) => {
  touch.x = Math.floor(e.changedTouches[0].clientX);
  if (touch.x < WIDTH / 2 && !gameOver) {
    playerMove(0);
  } else if (touch.x >= WIDTH / 2 && !gameOver) {
    playerMove(1);
  }
  start();
});
