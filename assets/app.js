const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let WIDTH, HEIGHT, chunk;
let running = false;
let blocks = [];
let blocksNum = 8;

function init() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  chunk = HEIGHT / blocksNum;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  
  //generate starting blocks
  for(let i = 0; i < blocksNum; i++) {
    blocks.push(new Block(i));
    console.log(blocks[i].type);
  }
  
  if(!running) {
    animate();
  }
}

class Block {
  constructor(num){
    this.height = chunk;
    this.width = Math.floor(this.height / 1.2);
    this.pos = {
      x: WIDTH / 2 - this.width / 2,
      y: num * this.height 
    };
    this.color = '#FFFFFF';
    this.type = Math.floor(Math.random() * 3);
  }
  draw(){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  }
  update() {
    this.draw();
  }
}

function animate() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
  for(let i = 0; i < blocks.length; i++) {
    blocks[i].update();
  }

  requestAnimationFrame(animate);
}

window.addEventListener('DOMContentLoaded', init);