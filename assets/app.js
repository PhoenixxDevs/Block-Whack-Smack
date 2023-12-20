const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreboard = document.getElementById("score");
const scoreboardHi = document.getElementById("hi-score");
const gameOverScreen = document.getElementById("game-over");
const gameStartScreen = document.getElementById("start-screen");
const endScore = document.getElementById("score-end");
const endScoreHi = document.getElementById("score-end-hi");

let WIDTH, HEIGHT
let chunk, player;
let blocks = [];
let particles = [];
let gameStart = false;
let gameOver = false;
let running = false;
let blocksNum = 6;
let score = 0;
let hiScore = 0;

function init() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  chunk = HEIGHT / blocksNum;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  //generate starting blocks
  blocks = [];
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
  scoreboard.classList.toggle("hide");
  scoreboardHi.classList.toggle("hide");
  scoreboard.innerText = `Score: ${score}`;







  for(let k = 0; k < 40; k++){
    particles.push(new Particle('block', blocks[blocks.length - 2]))
  }
  console.log(particles)






  
  if (gameOver) {
    gameOverScreen.classList.toggle("hide");
    gameOver = false;
  }

  if (!running) {
    animate();
  }
}

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
    this.color = "#FF44FF";
  }
  draw() {
    ctx.fillStyle = this.color;
    switch (this.pos) {
      case 0:
        ctx.fillRect(this.pos0.x, this.pos0.y, this.width, this.height);
        break;
      case 1:
        ctx.fillRect(this.pos1.x, this.pos1.y, this.width, this.height);
        break;
    }
  }
  update() {
    this.draw();
  }
}

/////////////////////////////// BLOCK CLASS

class Block {
  constructor(num) {
    this.height = chunk;
    this.width = Math.floor(this.height / 1.2);
    this.pos = {
      x: WIDTH / 2 - this.width / 2,
      y: num,
    };
    this.lightness = Math.floor(Math.random() * 100) + 155;
    this.color = `rgb(${this.lightness}, ${this.lightness}, ${this.lightness})`;
    this.type = Math.floor(Math.random() * 3);
    this.branchOffset = chunk / 1.5;
    this.branch = this.branchOffset / 3;
  }
  draw() {
    // branch
    ctx.fillStyle = "#FF4635";
    switch (this.type) {
      case 1:
        ctx.fillRect(
          this.pos.x - this.branchOffset,
          this.pos.y * this.height + this.branch,
          this.branchOffset,
          this.branch
        );
        break;
      case 2:
        ctx.fillRect(
          this.pos.x + this.width,
          this.pos.y * this.height + this.branch,
          this.branchOffset,
          this.branch
        );
        break;
    }

    // main log
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "#FF4622";
    ctx.fillRect(this.pos.x, this.pos.y * this.height, this.width, this.height);
    ctx.strokeRect(
      this.pos.x,
      this.pos.y * this.height,
      this.width,
      this.height
    );
  }
  update() {
    this.draw();
  }
}

////////////////////////// PARTICLE CLASS

class Particle {
  constructor(type, blockDescriptor) {
    this.type = type;
    this.blockDescriptor = blockDescriptor;
    this.size;
    this.pos;
    this.vel;
    this.grav = false;
    this.gravity;
    this.color;
    switch(this.type){
      case 'block':
        this.typeBlock();
      break;
    }
  }
  typeBlock(){
    this.size = Math.floor(Math.random() * 3) + 2;
    this.pos = {
      x: Math.floor(Math.random() * this.blockDescriptor.width) + this.blockDescriptor.pos.x,
      y: Math.floor(Math.random() * this.blockDescriptor.height) + this.blockDescriptor.pos.y
    };
    this.vel = {
      x: Math.random() * 6 - 3,
      y: -Math.random() * 4
    };
    this.grav = true;
    this.gravity = 0.1;
    this.color = 'pink';
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
  move(){
    //apply gravity
    if (this.grav){
      this.vel.y += this.gravity;
    }

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }
  update() {
    this.move();

    this.draw();
  }
}

function removeBlock() {
  blocks.pop();
  for (let i = 0; i < blocks.length; i++) {
    blocks[i].pos.y++;
  }
  blocks.unshift(new Block(0));
}

function checkDeath() {
  removeBlock();
  if (player.pos === 0 && blocks[blocks.length - 1].type === 1) {
    endGame();
  } else if (player.pos === 1 && blocks[blocks.length - 1].type === 2) {
    endGame();
  } else {
    score++;
    scoreboard.innerText = `Score: ${score}`;
    if (score > hiScore) {
      hiScore = score;
      scoreboardHi.innerText = `Hi-Score: ${hiScore}`;
    }
  }
}

function endGame() {
  gameOverScreen.classList.toggle("hide");
  scoreboard.classList.toggle("hide");
  scoreboardHi.classList.toggle("hide");
  gameOver = true;
  endScore.innerText = `Score: ${score}`;
  endScoreHi.innerText = `Hi-Score: ${hiScore}`;
}

//GAMELOOP
function animate() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  for (let i = 0; i < blocks.length; i++) {
    blocks[i].update();
  }
  for (let j = 0; j < particles.length; j++) {
    particles[j].update();
  }

  player.update();

  requestAnimationFrame(animate);
}

// window.addEventListener("DOMContentLoaded", init);
window.addEventListener("keydown", function (e) {
  if (e.repeat) {
    return;
  }
  switch (e.key) {
    case "ArrowLeft": case "a": case "A":
      if (gameOver) {
        return;
      }
      player.pos = 0;
      checkDeath();
      break;
    case "ArrowRight": case "d": case "D":
      if (gameOver) {
        return;
      }
      player.pos = 1;
      checkDeath();
      break;
    case "Enter":
      if (!gameStart) {
        init();
        gameStartScreen.classList.toggle("hide");
        gameStart = true;
      }
      if (gameOver) {
        init();
      }
      break;
  }
});
