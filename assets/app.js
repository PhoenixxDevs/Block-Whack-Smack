const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreboard = document.getElementById("score");
const scoreboardHi = document.getElementById("hi-score");
const gameOverScreen = document.getElementById("game-over");
const gameStartScreen = document.getElementById("start-screen");
const endScore = document.getElementById("score-end");
const endScoreHi = document.getElementById("score-end-hi");

const touch = {
  x: null
};

const grdStop = [0,0.33,0.66,1];
const grdColor = [
  'plum', 'cornflowerblue', 'darkturquoise', 'lightblue'
  // `rgb(${Math.floor(Math.random() * 80)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
  // `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
  // `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
  // `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
];

let WIDTH, HEIGHT
let chunk, player;
let particlesLength;
let grd;
let blocks = [];
let particles = [];
let gameStart = false;
let gameOver = false;
let gamePrepped = false;
let running = false;
let blocksNum = 5;
let score = 0;
let hiScore = 0;

// Create gradient

function init() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  chunk = HEIGHT / blocksNum;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  blocks = [];
  particles = [];

  grd = ctx.createLinearGradient(0, 0, 0, HEIGHT);

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
  scoreboard.classList.toggle("hide");
  scoreboardHi.classList.toggle("hide");
  scoreboard.innerText = `Score: ${score}`;
  
  if (gameOver) {
    gameOverScreen.classList.toggle("hide");
    gameOver = false;
  }

  if (!running) {
    animate();
    running = true;
  }
}

////////////////////////////// CLASSES

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
    grd = ctx.createLinearGradient(0, 0, 0, HEIGHT);
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
    this.lightness = Math.floor(Math.random() * 55) + 200;
    this.color = `rgb(${this.lightness + this.lightness / 2}, ${this.lightness}, ${this.lightness + this.lightness / 2})`;
    this.type = Math.floor(Math.random() * 3);
    this.branchOffset = chunk / 1.5;
    this.branch = this.branchOffset / 3;
  }
  draw() {
    // branch
    ctx.fillStyle = "indigo";
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
  constructor(type, blockDescriptor, direction) {
    this.type = type;
    this.blockDescriptor = blockDescriptor;
    this.direction = direction;
    this.size;
    this.pos;
    this.vel;
    this.grav = false;
    this.gravity;
    this.bounceMultiplier
    this.color;
    this.remove = false;
    switch(this.type){
      case 'block':
        this.typeBlock();
      break;
      case 'death':
        this.typeDeath();
      break;
    }
  }
  typeBlock(){
    this.size = Math.floor(Math.random() * 3) + 2;
    this.pos = {
      x: Math.floor(Math.random() * this.blockDescriptor.width) + this.blockDescriptor.pos.x,
      y: Math.floor(Math.random() * this.blockDescriptor.height) + this.blockDescriptor.pos.y * this.blockDescriptor.height
    };
    this.vel = {
      x: Math.random() * 2 + 3,
      y: -Math.random() * 9
    };
    if(this.direction === 'left'){
      this.vel.x *= -1;
      this.pos.x -= this.blockDescriptor.width / 2;
    }
    if(this.direction === 'left'){
      this.pos.x += this.blockDescriptor.width / 2;
    }
      
    this.grav = true;
    this.gravity = 0.2;
    this.bounceMultiplier = -0.6;
    this.color = `rgb(${Math.floor(Math.random() * 30) + 225}, ${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 30) + 225})`;
  }
  typeDeath(){
    let playerPos;
    this.size = Math.floor(Math.random() * 6 + 4);
    switch (player.pos) {
      case 0:
        playerPos = player.pos0;
        break;
      case 1:
        playerPos = player.pos1;  
      break;
    }
    this.pos = {
      x: Math.floor(playerPos.x + (Math.random() * player.width)),
      y: playerPos.y
    };
    this.vel = {
      x: Math.random() * 4 - 2,
      y: -Math.random() * 4 - 4
    };
    this.grav = true;
    this.gravity = 0.2;
    this.bounceMultiplier = -0.3;
    this.color = "red";
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
  removeOffscreen(){
    if(this.pos.x < -this.size || this.pos.x > WIDTH + this.size){
      this.remove = true;
    }
  }
  bounce(){
    if(this.pos.y > HEIGHT - this.size){
      this.pos.y = HEIGHT - this.size;
      this.vel.y *= this.bounceMultiplier;
    }
  }
  update() {
    this.bounce();
    this.move();
    this.removeOffscreen();

    this.draw();
  }
}

function createParticles(type, amount, blockDescriptor, direction){
  for(let i = 0; i < amount; i++){
    type === 'block' ?
    particles.push(new Particle(type, blockDescriptor, direction)) : 
    particles.push(new Particle(type));
  }
}

function removeBlock() {
  blocks.pop();
  for (let i = 0; i < blocks.length; i++) {
    blocks[i].pos.y++;
  }
  blocks.unshift(new Block(0));
}

function handleScore(){
  score++;
    scoreboard.innerText = `Score: ${score}`;
    if (score > hiScore) {
      hiScore = score;
      scoreboardHi.innerText = `Hi-Score: ${hiScore}`;
    }
}

function checkDeath() {
  removeBlock();
  if (player.pos === 0){
    createParticles('block', Math.floor(Math.random() * 5) + 5, blocks[blocks.length - 1], 'right');
    if (blocks[blocks.length - 1].type === 1) {
      createParticles("death", Math.floor(Math.random() * 15 + 20));
      console.log(particles)
      gameOver = true;
      gamePrepped = false;
      setTimeout(endGame, 2000);
    }
    else { handleScore(); }
  } else if (player.pos === 1) {
    createParticles('block', Math.floor(Math.random() * 5) + 5, blocks[blocks.length - 1], 'left');
    if (blocks[blocks.length - 1].type === 2) {
      createParticles("death", Math.floor(Math.random() * 20 + 30));
      console.log(particles)
      gameOver = true;
      gamePrepped = false;
        setTimeout(endGame, 2000);
      }
      else { handleScore(); }
    }
}

function endGame() {
  gameOverScreen.classList.toggle("hide");
  scoreboard.classList.toggle("hide");
  scoreboardHi.classList.toggle("hide");
  endScore.innerText = `Score: ${score}`;
  endScoreHi.innerText = `Hi-Score: ${hiScore}`;
  gamePrepped = true;
}

function moveGradient(){
  for(let i = 0; i < grdStop.length; i++) {
    grdStop[i] += 0.01;
    if(grdStop[i] > 1){
      grdStop[i] = 0;
    }
  }
}

//GAMELOOP
function animate() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  moveGradient();
  grd.addColorStop(grdStop[0], grdColor[0]);
  grd.addColorStop(grdStop[1], grdColor[1]);
  grd.addColorStop(grdStop[2], grdColor[2]);
  grd.addColorStop(grdStop[3], grdColor[3]);

// Fill with gradient
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  player.update();

  for (let i = 0; i < blocks.length; i++) {
    blocks[i].update();
  }
  particlesLength = particles.length;
  for (let j = 0; j < particlesLength; j++) {
    particles[j].update();
    if(particles[j].remove){
      particles.splice(j, 1);
      particlesLength = particles.length;
    }
  }
  touch.x = null;
  requestAnimationFrame(animate);
}

window.addEventListener("touchstart", (e) => {
  touch.x = Math.floor(e.changedTouches[0].clientX);
  if (touch.x < WIDTH / 2 && !gameOver) {
      player.pos = 0;
      checkDeath();
  } else if (touch.x >= WIDTH / 2 && !gameOver) {
      player.pos = 1;
      checkDeath();
  }
  
  if (!gameStart) {
    init();
    gameStartScreen.classList.toggle("hide");
    gameStart = true;
  }
  if (gameOver && gamePrepped) {
    init();
  }

});

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
