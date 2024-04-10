/////////////////////////////// CLASSES

  ////////////////////////// PLAYER CLASS

  class Player {
    constructor(pos, playerNumber, takesDamage) {
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
      takesDamage ? this.losingHealth = true : this.losingHealth = false;
      this.health = 100;
      this.healthRate = 0.08;
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
    playerMove() {
      this.setState("attack");
      this.update();
      this.isMoving = false;
      effects.push(new Effect("color"));
      checkDeath();
      updateArray(blocks);
    }
    stateHandler() {
      if (this.stateCounter > this.stateTime) {
        this.setState("idle");
        this.stateCounter = 0;
        this.isCounting = false;
        this.update();
      } else {
        this.stateCounter += delta;
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

      // block
      this.blockTexture =
        blockTextureConfig.pos[
          Math.floor(Math.random() * blockTextureConfig.pos.length)
        ];
      this.blockWidth = blockTextureConfig.width;
      this.blockHeight = blockTextureConfig.height;

      // branch
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

      // blorg
      this.blorg = {
        chance: chanceBool(gameConfig.blorgChance),
        left: {},
        right: {
          x: this.pos.x + this.width + this.branchWidth / 2,
          y: this.pos.y,
        },
        pos: {},
        size: chunk * 0.4,
        texture: blorgConfig,
      };
      this.blorg.left = {
        x: this.pos.x - this.branchWidth / 2 - this.blorg.size / 2,
        y: this.pos.y,
      };
      this.blorg.right = {
        x: this.pos.x + this.width + this.branchWidth / 2 - this.blorg.size / 2,
        y: this.pos.y,
      };
      if (this.blorg.chance) {
        if (this.type === 1) {
          this.blorg.pos = this.blorg.right;
        } else if (this.type === 2) {
          this.blorg.pos = this.blorg.left;
        } else {
          Math.round(Math.random())
            ? (this.blorg.pos = this.blorg.left)
            : (this.blorg.pos = this.blorg.right);
        }
      }
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
    drawBlorg() {
      if (this.blorg.chance) {
        ctx.drawImage(
          blorg,
          blorgConfig.x,
          blorgConfig.y,
          blorgConfig.width,
          blorgConfig.height,
          // where to draw
          this.blorg.pos.x,
          this.pos.y * this.height + this.blorg.size * 1.3,
          this.blorg.size,
          this.blorg.size
        );
        player.draw();
      }
    }
    clearBlorg() {
      ctx.clearRect(
        this.blorg.pos.x,
        this.pos.y * this.height + this.blorg.size * 1.3 - 1,
        this.blorg.size + 1,
        this.blorg.size + 1
      );
    }
    update() {
      this.draw();
      this.drawBlorg();
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
      this.size = Math.floor(Math.random() * 2) + 2;
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
      this.colorPalette = ["#FAE2C3", "#FFF78A", "#FFE", "#FF4E", "#FFBD"];
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
        y: Math.floor(player.pos0.y * 1.02),
      };
      this.width;
      this.height;
      this.spriteWidth = dustFXConfig.width;
      this.spriteHeight = dustFXConfig.height;
      this.spritePosY = 0;
      this.frame = 0;
      this.frameOffset = 0;
      this.frames = [];
      this.frameStep = 1;
      this.framesMax = 1;
      this.frameConfig = {};
      this.framesToClear = [];
      this.framesLocation = 0;
      this.delayCounter = 0;
      this.animationDelay = 20;
      this.config;
      this.init();
    }
    init() {
      this.frameOffset = Math.floor(Math.random() * 5);
      this.frame = this.frameOffset;
      //switch for scalability
      switch (this.type) {
        case "color":
        default:
          this.width = Math.floor(WIDTH / 2 / dustFXConfig.x.length) * 2.2;
          this.height = Math.floor(Math.random() * 30 + player.height);

          if (player.pos) {
            this.src = dustFX;
            for (
              let i = this.frame;
              i < dustFXConfig.x.length - this.frameOffset;
              i++
            ) {
              this.frameConfig = {
                spriteX: dustFXConfig.x[this.frame],
                spriteY: dustFXConfig.y[0],
                pos: {
                  x:
                    this.frame * this.width -
                    this.frameOffset * this.width +
                    WIDTH / 2 +
                    player.width,
                  y: this.pos.y,
                },
                remove: false,
              };
              this.frames.push(this.frameConfig);
              this.frame += this.frameStep;
            }
          } else {
            this.src = dustFXRev;
            for (
              let i = this.frame;
              i < dustFXConfig.x.length - this.frameOffset;
              i++
            ) {
              this.frameConfig = {
                spriteX: dustFXConfig.x[dustFXConfig.x.length - this.frame],
                spriteY: dustFXConfig.y[0] + 10,
                pos: {
                  x:
                    WIDTH / 2 -
                    this.frame * this.width +
                    this.frameOffset * this.width -
                    player.width,
                  y: this.pos.y,
                },
                remove: false,
              };
              this.frames.push(this.frameConfig);
              this.frame += this.frameStep;
            }
          }
          break;
        case "blast":
          this.spritePosY = dustFXConfig.y[1];
          this.width = player.height * 1.5;
          this.height = player.height * 0.7;
          break;
      }
      this.frame = 0;
      // for(let i = 0; i < this.framesMax; i++) {
      //   this.framesToDraw.push(this.frames[this.framesLocation]);
      //   this.framesLocation++;
      // }
    }
    clear(frame) {
      ctx3.clearRect(frame.pos.x, frame.pos.y, this.width, this.height);
    }
    draw(frame) {
      ctx3.drawImage(
        this.src,
        frame.spriteX,
        frame.spriteY,
        this.spriteWidth,
        this.spriteHeight,
        frame.pos.x,
        frame.pos.y,
        this.width,
        this.height
      );
    }
    update() {
      // check if time to draw, max, add one, clear, draw, remove
      if (this.counter < this.animationDelay) {
        this.counter += delta;
        for (let i = 0; i < this.framesToClear.length; i++) {
          if (this.framesToClear[i].remove) {
            this.framesToClear.splice(i, 1);
          }
        }
      } else {
        if (this.frames[0]) {
          this.framesToClear.push(this.frames.shift());
        }
        if (
          this.framesToClear.length > this.framesMax ||
          (this.frames.length <= this.framesMax &&
            this.framesToClear.length > 0)
        ) {
          this.clear(this.framesToClear[0]);
          this.framesToClear[0].remove = true;
        }
        if (this.frames.length >= 1) {
          this.draw(this.frames[0]);
        }
        this.counter = 0;
      }
    }
  }