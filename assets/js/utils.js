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
  blocks[blocksNum - 1].clearBlorg();

  blocks.pop();
  for (let i = 0; i < blocks.length; i++) {
    let b = blocks[i];
    b.clearBlorg();
    player.draw();
    b.clear();
    b.pos.y++;
  }
  player.update();
  blocks.unshift(new Block(0));
}

function handleStorage(isGet) {
  let result;

  if (isGet) {
    gameConfig.mode === "speed"
      ? (result = localStorage.getItem("best-time"))
      : (result = localStorage.getItem("hi-score"));
    return result;
  } else {
    gameConfig.mode === "speed"
      ? localStorage.setItem("best-time", bestTime)
      : (result = localStorage.setItem("hi-score", hiScore));
  }
}

function handleScore(reset, mode) {
  switch (mode) {
    case "arcade":
      updateScores();
      break;

    case "endless":
      updateScores();
      break;

    case "speed":
      speedScore();
      break;
  }

  function updateScores() {
    score++;
    scoreboard.innerText = `Score: ${score}`;
    if (score > hiScore) {
      hiScore = score;
      scoreboardHi.innerText = `Hi-Score: ${hiScore}`;
    }
  }

  function speedScore() {
    score++;
    scoreboard.innerText = `Score: ${score}`;
    console.log(timeTracker, bestTime);
    if (score === 10) {
      speedTimeStart = false;
      gameOver = true;
      gamePrepped = false;

      if (timeTracker < bestTime) {
        console.log("best score updated");
        bestTime = timeTracker;
        scoreboardHi.innerText = `Best Time: ${bestTime}`;
      }

      setTimeout(endGame, 500);
    }
  }

  if (reset) {
    score = 0;
    scoreboard.classList.toggle("hide");
    scoreboardHi.classList.toggle("hide");
    gameConfig.mode === "speed"
      ? (scoreboardHi.innerText = `Best Time: ${bestTime}`)
      : (scoreboardHi.innerText = `Hi-Score: ${hiScore}`);
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
      handleScore(0, gameConfig.mode);
      notes.push(
        new Audio(
          hitSound[Math.floor(Math.random() * (hitSound.length - 1))].src
        )
      );
      notes[notes.length - 1].volume = 0.5;
      notes[notes.length - 1].play();
      if (blocks[blocksNum - 1].blorg.chance) {
        blorgs++;
      }
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
      handleScore(0, gameConfig.mode);
      notes.push(
        new Audio(
          hitSound[Math.floor(Math.random() * (hitSound.length - 1))].src
        )
      );
      notes[notes.length - 1].volume = 0.5;
      notes[notes.length - 1].play();
      if (blocks[blocksNum - 1].blorg.chance) {
        blorgs++;
        console.log(blorgs);
      }
    }
  }
}

function endGame() {
  if (gameConfig.mode === "speed") {
    handleScore(0, gameConfig.mode);
    endScore.innerText = `Time: ${timeTracker}`;
    // handleScore(1, gameConfig.mode);
    console.log(bestTime);
    endScoreHi.innerText = `Best Time: ${bestTime}`;
  } else {
    endScore.innerText = `Score: ${score}`;
    endScoreHi.innerText = `Hi-Score: ${hiScore}`;
  }
  gameOverScreen.classList.toggle("hide");
  scoreboard.classList.toggle("hide");
  scoreboardHi.classList.toggle("hide");
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

//EXAMPLE float = 0.7 = 70% chance;
function chanceBool(float) {
  let result;
  Math.random() < float ? (result = true) : (result = false);
  return result;
}
