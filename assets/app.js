window.addEventListener("DOMContentLoaded", () => {
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
    x: [
      0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960, 1040, 1120,
    ],
    y: [0, 100],
    width: 80,
    height: 100,
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
  let hiScore;
  let blocks = [];
  let particles = [];
  let effects = [];
  let score = 0;
  let blocksNum = 6;
  let delta = 0;
  let lastFrame = 0;
  let gameLoaded = false;
  let gameStart = false;
  let gameOver = false;
  let gamePrepped = false;
  let gamePaused = false;
  let running = false;

  /////////////////////////////// CLASSES

  ////////////////////////// PLAYER CLASS

  class Player {
    constructor(pos, playerNumber) {
      this.playerNumber = playerNumber;
      switch (this.playerNumber) {
        case 0:
          this.spriteStates = player0Sprite_states;
          break;
      }
      this.width = Math.floor(chunk * 0.5);
      this.height = Math.floor(chunk * 0.7);
      this.spriteWidth = playerSpriteDimensions.width;
      this.spriteHeight = playerSpriteDimensions.height;
      this.pos = pos;
      this.setState("idle");
      this.stateTime = 300;
      this.stateCounter = 0;
      this.isCounting = false;
      this.spriteDimensions = playerSpriteDimensions;
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
      this.losingHealth = false;
      this.health = 100;
      this.healthRate = 0.1;
      this.healthAdd = 1.1;
      this.healthBar = {};
    }
    setState(spriteState) {
      if (!this.pos) {
        switch (spriteState) {
          case "attack":
            this.state = this.spriteStates.attack0;
            this.stateCounter = 0;
            this.isCounting = true;
            break;
          case "idle":
            this.state = this.spriteStates.idle0;
            break;
          case "death":
            this.state = this.spriteStates.death0;
            break;
        }
      } else {
        switch (spriteState) {
          case "attack":
            this.state = this.spriteStates.attack1;
            this.stateCounter = 0;
            this.isCounting = true;
            break;
          case "idle":
            this.state = this.spriteStates.idle1;
            break;
          case "death":
            this.state = this.spriteStates.death1;
            break;
        }
      }
    }
    draw() {
      this.clear();
      this.posLegacy = this.pos;
      if (!this.pos) {
        this.drawPos = this.pos0;
      } else {
        this.drawPos = this.pos1;
      }

      ctx.drawImage(
        playerSprite,
        this.state.x,
        this.state.y,
        this.spriteWidth,
        this.spriteHeight,
        this.drawPos.x,
        this.drawPos.y,
        this.width,
        this.height
      );
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
    drawHealthBar() {
      ctx3.fillStyle = this.healthBar.color;
      ctx3.fillRect(
        this.healthBar.x,
        this.healthBar.y,
        (this.healthBar.width * this.health) / 100,
        this.healthBar.height
      );
      ctx3.strokeStyle = "pink";
      ctx3.strokeRect(
        this.healthBar.x,
        this.healthBar.y,
        this.healthBar.width,
        this.healthBar.height
      );
    }
    clearHealthBar() {
      ctx3.clearRect(
        this.healthBar.x - 1,
        this.healthBar.y - 1,
        this.healthBar.width + 2,
        this.healthBar.height + 2
      );
    }
    handleHealth() {
      this.clearHealthBar();
      if (this.health <= 0 && this.losingHealth) {
        player.health = 0;
        this.losingHealth = false;
        handleDeath();
      }
      if (this.health > 100) {
        this.health = 100;
      }
      this.health -= this.healthRate;
      this.healthBar = {
        x: Math.floor(this.drawPos.x - this.width / 2),
        y: Math.floor(this.drawPos.y - this.height * 0.15),
        width: Math.floor(this.width * 2),
        height: Math.floor(this.height * 0.1),
        color: `hsl(${this.health}, 100%, 50%)`,
      };
      if (this.pos) {
        this.healthBar.x = Math.floor(this.drawPos.x + this.width / 2);
      }
      this.drawHealthBar();
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
      this.branch =
        branchTextureConfig.pos[
          Math.floor(Math.random() * branchTextureConfig.pos.length)
        ];
        this.branchWidth = Math.floor(chunk / 1.3);
        this.branchHeight = Math.floor(this.branchWidth / 3);
        if (WIDTH < 460) {
          this.width * 0.8;
          this.branchWidth * 0.8;
          this.branchHeight * 0.8;
        }
        this.branchTextureWidth = branchTextureConfig.width;
        this.branchTextureHeight = branchTextureConfig.height;
      this.blockTexture =
        blockTextureConfig.pos[
          Math.floor(Math.random() * blockTextureConfig.pos.length)
        ];
      this.blockWidth = blockTextureConfig.width;
      this.blockHeight = blockTextureConfig.height;
    }
    draw() {
      // branch
      switch (this.type) {
        case 1:
          // Left branch
          ctx.drawImage(
            // texture placement
            spikeTexture,
            spikeTextureConfig.x,
            spikeTextureConfig.y,
            spikeTextureConfig.width,
            spikeTextureConfig.height,
            // where to draw
            this.pos.x - this.branchWidth,
            this.pos.y * this.height + this.branchHeight * 0.8,
            this.branchWidth,
            this.branchHeight * 1.3
          );
          ctx.drawImage(
            // texture placement
            branchTexture,
            this.branch.x,
            this.branch.y,
            this.branchTextureWidth,
            this.branchTextureHeight,
            // where to draw
            this.pos.x - this.branchWidth,
            this.pos.y * this.height,
            this.branchWidth,
            this.branchHeight
          );
          break;

        case 2:
          // Right branch
          ctx.drawImage(
            //texture placement
            spikeTexture,
            spikeTextureConfig.x,
            spikeTextureConfig.y,
            spikeTextureConfig.width,
            spikeTextureConfig.height,
            //where to draw
            this.pos.x + this.width,
            this.pos.y * this.height + this.branchHeight * 0.8,
            this.branchWidth,
            this.branchHeight * 1.3
          );
          ctx.drawImage(
            //texture placement
            branchTexture,
            this.branch.x,
            this.branch.y,
            this.branchTextureWidth,
            this.branchTextureHeight,
            //where to draw
            this.pos.x + this.width,
            this.pos.y * this.height,
            this.branchWidth,
            this.branchHeight
          );
          break;
      }
      // Main Trunk
      ctx.drawImage(
        //texture placement
        blockTexture,
        this.blockTexture.x,
        this.blockTexture.y,
        this.blockWidth,
        this.blockHeight,
        //where to draw
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
          this.pos.y * this.height - 2,
          this.branchWidth,
          this.branchHeight + spikeTextureConfig.height + 2
        );
      } else if (this.type == 2) {
        ctx.clearRect(
          this.pos.x + this.width,
          this.pos.y * this.height - 2,
          this.branchWidth,
          this.branchHeight + spikeTextureConfig.height + 2
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
      this.size = Math.floor(Math.random() * 5) + 4;
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
      this.colorPalette = [
        "#FAE2C3",
        "#FFF78A",
        "#FFE382",
        "#FFC47E",
        "#FFBD94",
      ];
      this.color =
        this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
    }
    typeDeath() {
      let playerPos;
      this.size = Math.floor(Math.random() * 15 + 10);
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
        ctx2.arc(this.pos.x, this.pos.y, this.size + 1, 0, Math.PI * 2, true);
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
    shrink() {
      if (this.type != "death") {
        return;
      }
      if (this.size < 0.2) {
        this.remove = true;
        return;
      }
      this.size *= 0.99;
    }
    update() {
      this.clear();
      this.bounce();
      this.move();
      this.removeOffscreen();
      this.shrink();

      this.draw();
    }
  }

  ///////////////////////// EFFECTS CLASS

  class Effect {
    constructor(type) {
      this.type = type; // 'color' or 'blast'
      this.pos = {
        x: WIDTH / 2,
        y: player.pos0.y * 0.96,
      };
      this.width;
      this.height;
      this.spriteWidth = dustFXConfig.width;
      this.spriteHeight = dustFXConfig.height;
      this.spritePosY = 0;
      this.frame = 0;
      this.frames = [];
      this.frameStep = 1;
      this.frameCount = 0;
      this.framesMax = 3;
      this.animationDelay = 0;
      this.remove = false;
      this.config;
      this.init();
    }
    init() {
      this.frame = 0;
      let config = {};
      //switch for scalability
      switch (this.type) {
        case "color":
        default:
          this.spritePosY = dustFXConfig.y[0];
          this.width = Math.floor(WIDTH / 2 / dustFXConfig.x.length);
          this.height = Math.floor(player.height);
          this.src = dustFX;
          if (player.pos) {
            // this.pos.y += this.height * 0.12;
            this.spritePosY = 10;
          }
          if (!player.pos) {
            this.src = dustFXRev;
            this.frame = dustFXConfig.x.length - 1;
            this.frameStep *= -1;
            // this.pos.y -= player.height;
          }
          break;
        case "blast":
          this.spritePosY = dustFXConfig.y[1];
          this.width = player.height * 1.5;
          this.height = player.height * 0.7;
          break;
      }
      config = {
        src: this.src,
        pos: this.pos,
        width: this.width,
        height: this.height,
        spriteY: this.spritePosY,
        spriteX: dustFXConfig.x[this.frame] * this.spriteWidth,
      };
      for (let i = 0; i < dustFXConfig.x.length; i++) {
        config.pos.x = this.frame * config.width;
        this.frames.push(config);
        this.frame += this.frameStep;
      }
      this.frame = 0;
    }
    clear(frame) {
      ctx.clearRect(frame.pos.x, frame.pos.y, frame.width, frame.height);
    }
    draw(frame) {
      ctx.drawImage(
        frame.src,
        frame.spriteX,
        frame.spriteY,
        dustFXConfig.width,
        dustFXConfig.height,
        frame.pos.x,
        frame.pos.y,
        frame.width,
        frame.height
      );
    }
    update() {}
    // clear() {
    //   ctx3.clearRect(this.pos.x, this.pos.y, this.width, this.height);
    // }
    // draw() {
    //   ctx3.drawImage(
    //     this.src,
    //     //decides which part of sprite to draw
    //     dustConfig.x[this.frame],
    //     this.spritePosY,
    //     this.spriteWidth,
    //     this.spriteHeight,
    //     //where to draw
    //     this.pos.x,
    //     this.pos.y,
    //     this.spriteWidth,
    //     this.height
    //     );
    //   }
    //   update() {
    //     if (this.frame < 0 || this.frame > dustConfig.x.length - 1) {
    //       this.remove = true;
    //     }
    //     if (this.animationDelay > 0) {
    //       this.clear();
    //       if(player.pos){this.pos.x = this.pos.x + (this.spriteWidth * this.frame) / 6}
    //       else {this.pos.x -= this.spriteWidth;
    //         console.log(this.pos.x)
    //       }
    //     this.draw();
    //     this.frame += this.frameStep;
    //     this.animationDelay = 0;
    //   } else {
    //     this.animationDelay += delta;
    //   }
    // }
  }

  ///////////////////// UTILITY FUNCTIONS

  function resize(initCalled) {
    WIDTH = html.clientWidth;
    HEIGHT = html.clientHeight;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas2.width = WIDTH;
    canvas2.height = HEIGHT;
    canvas3.width = WIDTH + 60;
    canvas3.height = HEIGHT + 60;

    // to make easier to see on mobile screens
    WIDTH < 750 ? (blocksNum = 5) : (blocksNum = 6);
    chunk = HEIGHT / blocksNum;

    // initcalled to stop loop in init function
    if (!initCalled && gameStart) {
      init();
    }
  }

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

  function handleStorage(isGet) {
    if (!localStorage) {
      localStorage.setItem("hi-score", hiScore);
    }
    if (isGet) {
      result = localStorage.getItem("hi-score");
      return result;
    } else localStorage.setItem("hi-score", hiScore);
  }

  function handleScore(reset) {
    if (!reset) {
      score++;
      scoreboard.innerText = `Score: ${score}`;
      if (score > hiScore) {
        hiScore = score;
        scoreboardHi.innerText = `Hi-Score: ${hiScore}`;
      }
    } else {
      score = 0;
      localStorage ? (hiScore = handleStorage(1)) : (hiScore = 0);
      scoreboard.classList.toggle("hide");
      scoreboardHi.classList.toggle("hide");
      scoreboardHi.innerText = `Hi-Score: ${hiScore}`;
      scoreboard.innerText = `Score: ${score}`;
    }
  }

  function handleDeath() {
    player.losingHealth = false;
    player.isCounting = false;
    player.setState("death");
    player.update();
    deathSound = new Audio(hitSound[hitSound.length - 1].src);
    deathSound.volume = 0.3;
    deathSound.play();
    createParticles("death", Math.floor(Math.random() * 15 + 20));
    gameOver = true;
    gamePrepped = false;
    setTimeout(endGame, 2000);
  }

  function checkDeath() {
    removeBlock();
    if (player.pos === 0) {
      createParticles(
        "block",
        Math.floor(Math.random() * 3) + 2,
        blocks[blocks.length - 1],
        "right"
      );
      if (blocks[blocksNum - 1].type === 1) {
        handleDeath();
      } else {
        handleScore();
        notes.push(
          new Audio(
            hitSound[Math.floor(Math.random() * (hitSound.length - 1))].src
          )
        );
        notes[notes.length - 1].volume = 0.5;
        notes[notes.length - 1].play();
      }
    } else if (player.pos === 1) {
      createParticles(
        "block",
        Math.floor(Math.random() * 3) + 2,
        blocks[blocks.length - 1],
        "left"
      );
      if (blocks[blocksNum - 1].type === 2) {
        handleDeath();
      } else {
        handleScore();
        notes.push(
          new Audio(
            hitSound[Math.floor(Math.random() * (hitSound.length - 1))].src
          )
        );
        notes[notes.length - 1].volume = 0.5;
        notes[notes.length - 1].play();
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

  function updateArray(array) {
    arrayLength = array.length;
    for (let j = 0; j < arrayLength; j++) {
      array[j].update();
      if (array[j].remove) {
        array.splice(j, 1);
        arrayLength = array.length;
      }
    }
  }

  function audioSetup() {
    // load all audio
    song.load();
    song.volume = 1;
    for (let i = 0; i < hitSound.length; i++) {
      hitSound[i].load();
    }
  }

  function noteRecycler() {
    for (let i = 0; i < notes.length; i++) {
      let n = notes[i];
      if (n.currentTime > 5) {
        notes.shift();
      }
    }
  }

  /////////////////////////////// SET UP

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
        player = new Player(1, 0);
        break;
      case 2:
      default:
        player = new Player(0, 0);
        break;
    }

    // here "truthy" resets score
    handleScore(1);

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
  }, 0);

  ///////////////////////////// GAMELOOP

  function animate(timestamp) {
    if (!gamePaused) {
      //calculate time since last frame
      if (!timestamp) {
        timestamp = 0;
      }
      delta = timestamp - lastFrame;
      lastFrame = timestamp;

      noteRecycler();

      // Player
      if (player.isMoving) {
        playerMove();
      }

      if (player.isCounting) {
        if (player.stateCounter > player.stateTime) {
          player.setState("idle");
          player.stateCounter = 0;
          player.isCounting = false;
          player.update();
        } else {
          player.stateCounter += delta;
        }
      }
      if (player.losingHealth) {
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

  function playerMove() {
    player.setState("attack");
    player.update();
    player.isMoving = false;
    effects.push(new Effect("color"));
    checkDeath();
    updateArray(blocks);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", function (e) {
    if (e.repeat) {
      return;
    }
    switch (e.key) {
      case "Escape":
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
});
