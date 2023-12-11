const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let WIDTH, HEIGHT, chunk;
let running = false;
let blocks = [];
let blocksNum = 6;

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
      y: num
    };
    this.color = '#FFFFFF';
    this.type = Math.floor(Math.random() * 3);
    this.branchOffset = chunk / 1.5;
    this.branch = this.branchOffset / 3;
  }
  draw(){
    // branch
    ctx.fillStyle = '#FF4635';
    switch(this.type){
      case 1:
        ctx.fillRect(this.pos.x - this.branchOffset, this.pos.y * this.height + this.branch, this.branchOffset, this.branch);
        break;
      case 2:
        ctx.fillRect(this.pos.x + this.width , this.pos.y * this.height + this.branch, this.branchOffset, this.branch);
        break;
    }

    // main log
    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.x, this.pos.y * this.height, this.width, this.height);
    
  }
  update() {
    this.draw();
  }
}

function removeBlock(){
  blocks.pop();
  for(let i = 0; i < blocks.length; i++){
    blocks[i].pos.y++;
  }
  blocks.unshift(new Block(0));
}

function animate() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
  for(let i = 0; i < blocks.length; i++) {
    blocks[i].update();
  }

  requestAnimationFrame(animate);
}

window.addEventListener('DOMContentLoaded', init);
window.addEventListener('keydown', function(e) {
  if(e.repeat){return;}
  switch(e.key){
    case 'ArrowLeft':
      removeBlock();
      break;
    case 'ArrowRight':
      removeBlock();
    break;
  }
})