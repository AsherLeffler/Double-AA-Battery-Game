//* Get the canvas HTML element
const canvas = document.getElementById("gameCanvas");

//* Specify width and height of canvas
const screenWidth = window.innerWidth - 20;
const screenHeight = window.innerHeight - 20;
canvas.width = screenWidth > screenHeight ? screenHeight : screenWidth;
canvas.height = screenWidth > screenHeight ? screenHeight : screenWidth;

window.addEventListener("resize", () => {
  const screenWidth = window.innerWidth - 20;
  const screenHeight = window.innerHeight - 20;
  canvas.width = screenWidth > screenHeight ? screenHeight : screenWidth;
  canvas.height = screenWidth > screenHeight ? screenHeight : screenWidth;
});

//* Create the main soundtrack
window.addEventListener("DOMContentLoaded", () => {
  const mainSoundtrack = new Audio("./soundTrack.mp3");
  let soundTrackCanPlay = true;
  mainSoundtrack.volume = 0.03; // Set volume to 10%
  mainSoundtrack.loop = true;

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "ArrowUp" ||
      e.key === "w" ||
      e.key === "ArrowLeft" ||
      e.key === "a" ||
      e.key === "ArrowRight" ||
      (e.key === "d" && soundTrackCanPlay)
    ) {
      mainSoundtrack.play();
      soundTrackCanPlay = false;
    }
  });
});

//* Variable to check if the player can jump
let canJump = true;

//* Variable to store the score
let score = 0;

//* Add timer to change the color of the temporary platforms
let colorIndex = 0;
const colors = ["rgba(48, 48, 48, 0.35)", "rgba(48, 48, 48, 0.8)"];

setInterval(() => {
  colorIndex = (colorIndex + 1) % colors.length;
}, 3000);

//* Start working with canvas
const ctx = canvas.getContext("2d");
//* color of canvas
ctx.fillStyle = "rgb(120, 120, 120)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

class Player {
  constructor(w, h, xSpeed, ySpeed, xPos, yPos) {
    this.w = w;
    this.h = h;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.xPos = xPos;
    this.yPos = yPos;
  }

  //* Draw the player
  update() {
    this.w = canvas.width / map[0].length / 2;
    this.h = canvas.height / map.length / 2;

    this.xPos += this.xSpeed;
    this.yPos += this.ySpeed;
    if (this.xPos < 0) {
      this.xPos = 0;
    }
    if (this.xPos + this.w > canvas.width) {
      this.xPos = canvas.width - this.w;
    }
    if (this.yPos < 0) {
      this.yPos = 0;
      this.ySpeed = 0;
    }
    if (this.yPos + this.h - 1 > canvas.height - canvas.height / map.length) {
      this.yPos = canvas.height - this.h - canvas.height / map.length;
      this.ySpeed = 0;
    }
    ctx.fillStyle = "red";
    ctx.fillRect(this.xPos, this.yPos, this.w, this.h);
  }

  //* Getters and Setters
  setXSpeed(s) {
    this.xSpeed = s;
  }

  setYSpeed(s) {
    this.ySpeed = s;
  }

  getYSpeed() {
    return this.ySpeed;
  }

  setYPos(yPos) {
    this.yPos = yPos;
  }
}

//* Create the main player
const mainPlayer = new Player(
  20,
  20,
  0,
  0,
  canvas.width / 2,
  canvas.height / 2
);

//! Define map
// 1's = platforms, 0's = empty space
const s = Math.floor(Math.random() * 5 + 5);
let map = ranMap(s, s);

//* Function to generate a random map
function ranMap(width, height) {
  const map = [];
  const goalNum = Math.floor(Math.random() * width); // Randomly place the '2' in the top row
  for (let i = 0; i < height; i++) {
    map.push([]);
    for (let j = 0; j < width; j++) {
      if (i === 0 && j === goalNum) {
        // Top row: place the goal (2)
        map[i].push(2);
      } else if (i === height - 1) {
        // Bottom row: place (1)
        map[i].push(1);
      } else if (i === height - 2) {
        // Second-to-last row: place (0)
        map[i].push(0);
      } else {
        // Check for adjacency to a 2
        if (
          (i > 0 && i - 1 === 0 && j === goalNum) || // Above
          (j > 0 && i === 0 && j - 1 === goalNum) || // Left
          (j < width - 1 && i === 0 && j + 1 === goalNum) || // Right
          (i > 0 && j > 0 && i - 1 === 0 && j - 1 === goalNum) || // Top-left
          (i > 0 && j < width - 1 && i - 1 === 0 && j + 1 === goalNum) // Top-right
        ) {
          // Adjacent to a 2: must be 0
          map[i].push(0);
        } else {
          // Not adjacent to a 2: use ranNum()
          map[i].push(ranNum(i, height));
        }
      }
    }
  }
  mainPlayer.w = canvas.width / map[0].length / 2;
  mainPlayer.h = canvas.height / map.length / 2;
  mainPlayer.xSpeed = 0;
  mainPlayer.ySpeed = 0;
  mainPlayer.yPos =
    canvas.height -
    mainPlayer.h -
    canvas.height / map.length -
    mainPlayer.h / 2;
  return map;
}

//* Function to generate a random number
function ranNum(row, height) {
  const dF = dangerProb(); // The frequency of danger platforms.
  const tF = 0.05; // The frequency of temporary platforms.
  const sF = 0.3 - dF - tF; // The frequency of safe platforms; 0.25 is regular.
  const num = Math.random();

  if (num < sF) {
    return 1;
  }
  if (num < sF + dF && row < height - 4) {
    return 3;
  }
  if (num < sF + dF + tF) {
    return 4;
  }
  return 0;
}

//* Function to calculate the probability of danger platforms
function dangerProb() {
  if (score < 8) {
    return 0;
  }
  if (score < 12) {
    return 0.035;
  }
  if (score < 15) {
    return 0.05;
  }
  if (score < 20) {
    return 0.9;
  }
  return 1.2;
}

//* Function to draw the map, it loops through the map array and draws the tile based on what the value is
function drawMap() {
  const blockWidth = canvas.width / map[0].length;
  const blockHeight = canvas.height / map.length;

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      if (map[i][j] === 1) {
        ctx.fillStyle = "rgb(48, 48, 48)";
        ctx.fillRect(
          j * blockWidth,
          i * blockHeight,
          blockWidth + 1,
          blockHeight + 1
        );
      } else if (map[i][j] === 2) {
        ctx.fillStyle = "rgb(0, 243, 12)";
        ctx.fillRect(
          j * blockWidth,
          i * blockHeight,
          blockWidth + 1,
          blockHeight + 1
        );
      } else if (map[i][j] === 3) {
        ctx.fillStyle = `rgb(255, ${Math.floor(Math.random() * 50 + 70)}, 0)`;
        ctx.fillRect(
          j * blockWidth,
          i * blockHeight,
          blockWidth + 1,
          blockHeight + 1
        );
      } else if (map[i][j] === 4) {
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(
          j * blockWidth,
          i * blockHeight,
          blockWidth + 1,
          blockHeight + 1
        );
      } else {
        ctx.fillStyle = "rgb(203, 203, 255)";
        ctx.fillRect(
          j * blockWidth,
          i * blockHeight,
          blockWidth + 1,
          blockHeight + 1
        );
      }
    }
  }
  // Draw the score counter
  ctx.fillStyle = "white";
  const fontSize = blockHeight > 60 ? 60 : blockHeight;
  ctx.font = `${fontSize}px Trebuchet MS`;
  ctx.textAlign = "center";
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height - 10);
}

//* Function to end the game
function endFunction(lose) {
  mainPlayer.yPos = canvas.height - canvas.height / map.length - mainPlayer.h;
  mainPlayer.ySpeed = 0;
  mainPlayer.xSpeed = 0;
  clearInterval(intervalLeft);
  clearInterval(intervalRight);
  const prevScore = score;
  const scoreInterval = setInterval(() => {
    if (lose ? score > prevScore - 2 : score > 0) {
      score--;
      if (score >= 0 && score < 5) {
        const newSize = Math.floor(Math.random() * 5 + 5);
        map = ranMap(newSize, newSize);
      } else if (score >= 5 && score < 10) {
        const newSize = Math.floor(Math.random() * 4 + 8);
        map = ranMap(newSize, newSize);
      } else if (score >= 10 && score < 15) {
        const newSize = Math.floor(Math.random() * 15 + 15);
        map = ranMap(newSize, newSize);
      } else if (score >= 15 && score < 20) {
        const newSize = Math.floor(Math.random() * 20 + 30);
        map = ranMap(newSize, newSize);
      } else {
        const newSize = Math.floor(Math.random() * 15 + 55);
        map = ranMap(newSize, newSize);
      }
    } else {
      clearInterval(scoreInterval);
    }
  }, 180);
}

//* Function to detect collision between player and platform and handle it
function collisionDetection() {
  const blockWidth = canvas.width / map[0].length;
  const blockHeight = canvas.height / map.length;

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      const platform = map[i][j];
      if (platform === 1) {
        // Calculate the position of the platform and store width
        const platformX = j * blockWidth;
        const platformY = i * blockHeight;
        const platformWidth = blockWidth;
        const platformHeight = blockHeight;

        // Check for collision
        if (
          mainPlayer.xPos < platformX + platformWidth &&
          mainPlayer.xPos + mainPlayer.w > platformX &&
          mainPlayer.yPos < platformY + platformHeight &&
          mainPlayer.yPos + mainPlayer.h > platformY
        ) {
          // Calculate the overlap between player and platform
          const overlapX =
            Math.min(
              mainPlayer.xPos + mainPlayer.w,
              platformX + platformWidth
            ) - Math.max(mainPlayer.xPos, platformX);
          const overlapY =
            Math.min(
              mainPlayer.yPos + mainPlayer.h,
              platformY + platformHeight
            ) - Math.max(mainPlayer.yPos, platformY);

          if (overlapX < overlapY) {
            // Horizontal collision
            if (mainPlayer.xPos < platformX) {
              mainPlayer.xPos = platformX - mainPlayer.w; // Colliding from the left
            } else {
              mainPlayer.xPos = platformX + platformWidth; // Colliding from the right
            }
            mainPlayer.xSpeed = 0;
          } else {
            // Vertical collision
            if (mainPlayer.yPos < platformY && mainPlayer.ySpeed >= -0.1) {
              mainPlayer.yPos = platformY - mainPlayer.h; // Colliding from above
              mainPlayer.ySpeed = 0;
              canJump = true;
            } else if (mainPlayer.yPos > platformY) {
              mainPlayer.yPos = platformY + platformHeight; // Colliding from below
              mainPlayer.ySpeed = 0.1;
            }
          }
        }
      } else if (platform === 2) {
        // Check if the player has reached the goal
        if (
          mainPlayer.xPos < j * blockWidth + blockWidth &&
          mainPlayer.xPos + mainPlayer.w > j * blockWidth &&
          mainPlayer.yPos < i * blockHeight + blockHeight &&
          mainPlayer.yPos + mainPlayer.h > i * blockHeight
        ) {
          // Generate a new map
          score++;
          const audio = new Audio("./point.wav");
          audio.volume = 0.2; // Set volume to 50%
          audio.play();
          if (score >= 0 && score < 5) {
            const newSize = Math.floor(Math.random() * 5 + 5);
            map = ranMap(newSize, newSize);
          } else if (score >= 5 && score < 10) {
            const newSize = Math.floor(Math.random() * 4 + 8);
            map = ranMap(newSize, newSize);
          } else if (score >= 10 && score < 15) {
            const newSize = Math.floor(Math.random() * 15 + 15);
            map = ranMap(newSize, newSize);
          } else if (score >= 15 && score < 20) {
            const newSize = Math.floor(Math.random() * 20 + 30);
            map = ranMap(newSize, newSize);
          } else if (score >= 30) {
            confirm("Congrats! Want to restart?") ? endFunction(false) : null;
          } else {
            const newSize = Math.floor(Math.random() * 15 + 55);
            map = ranMap(newSize, newSize);
          }
        }
      } else if (platform === 3) {
        if (
          mainPlayer.xPos < j * blockWidth + blockWidth &&
          mainPlayer.xPos + mainPlayer.w > j * blockWidth &&
          mainPlayer.yPos < i * blockHeight + blockHeight &&
          mainPlayer.yPos + mainPlayer.h > i * blockHeight
        ) {
          endFunction(true);
        }
      } else if (platform === 4) {
        if (
          mainPlayer.xPos < j * blockWidth + blockWidth &&
          mainPlayer.xPos + mainPlayer.w > j * blockWidth &&
          mainPlayer.yPos < i * blockHeight + blockHeight &&
          mainPlayer.yPos + mainPlayer.h > i * blockHeight &&
          colorIndex === 1
        ) {
          const platformX = j * blockWidth;
          const platformY = i * blockHeight;
          const platformWidth = blockWidth;
          const platformHeight = blockHeight;

          // Calculate the overlap between player and platform
          const overlapX =
            Math.min(
              mainPlayer.xPos + mainPlayer.w,
              platformX + platformWidth
            ) - Math.max(mainPlayer.xPos, platformX);
          const overlapY =
            Math.min(
              mainPlayer.yPos + mainPlayer.h,
              platformY + platformHeight
            ) - Math.max(mainPlayer.yPos, platformY);

          if (overlapX < overlapY) {
            // Horizontal collision
            if (mainPlayer.xPos < platformX) {
              mainPlayer.xPos = platformX - mainPlayer.w; // Colliding from the left
            } else {
              mainPlayer.xPos = platformX + platformWidth; // Colliding from the right
            }
            mainPlayer.xSpeed = 0;
          } else {
            // Vertical collision
            if (mainPlayer.yPos < platformY && mainPlayer.ySpeed >= -0.1) {
              mainPlayer.yPos = platformY - mainPlayer.h; // Colliding from above
              mainPlayer.ySpeed = 0;
              canJump = true;
            } else if (mainPlayer.yPos > platformY) {
              mainPlayer.yPos = platformY + platformHeight; // Colliding from below
              mainPlayer.ySpeed = 0.1;
            }
          }
        }
      }
    }
  }
}

//* Function to update the game state
function updateGame() {
  //! gravity
  const gravity = mainPlayer.w * 0.0065;

  // Check if the player is on the ground
  if (mainPlayer.yPos + mainPlayer.h > canvas.height) {
    mainPlayer.setYPos(canvas.height - mainPlayer.h);
    canJump = true;
    mainPlayer.setYSpeed(0);
  } else if (mainPlayer.yPos != canvas.height - mainPlayer.h) {
    mainPlayer.setYSpeed(mainPlayer.getYSpeed() + gravity); // Gravity
  }
  // Call the collision detection function
  collisionDetection();
  // Update the player
  mainPlayer.update();
}

//* Function to render the game
function renderGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  drawMap();
  mainPlayer.update();
  requestAnimationFrame(renderGame);
}

//* Add event listeners to listen for arrow movements
let canGenMap = true;
let intervalLeft = null;
let intervalRight = null;

document.addEventListener("keydown", (e) => {
  function jump() {
    if (canJump && mainPlayer.yPos > 0) {
      const audio = new Audio("./jumpSound.wav");
      audio.volume = 0.1; // Set volume to 50%
      audio.play();
      mainPlayer.setYSpeed(mainPlayer.w * -0.2);
      canJump = false;
    }
  }
  function moveLeft() {
    if (intervalLeft === null) {
      intervalLeft = setInterval(() => {
        if (mainPlayer.xPos > 0) mainPlayer.setXSpeed(mainPlayer.w * -0.11);
        else {
          mainPlayer.setXSpeed(0);
          clearInterval(intervalLeft);
        }
      }, 1000 / 60);
    }
  }
  function moveRight() {
    if (intervalRight === null) {
      intervalRight = setInterval(() => {
        if (mainPlayer.xPos + mainPlayer.w < canvas.width)
          mainPlayer.setXSpeed(mainPlayer.w * 0.11);
        else {
          mainPlayer.setXSpeed(0);
          clearInterval(intervalRight);
        }
      }, 1000 / 60);
    }
  }
  switch (e.key) {
    case "ArrowUp":
      jump();
      break;

    case "w":
      jump();
      break;

    case "ArrowLeft":
      moveLeft();
      break;

    case "a":
      moveLeft();
      break;

    case "ArrowRight":
      moveRight();
      break;

    case "d":
      moveRight();
      break;

    case "Enter":
      if (score > 0) score--;
      if (canGenMap) {
        const audio = new Audio("./loss.wav");
        audio.volume = 0.2; // Set volume to 50%
        audio.play();
        if (score >= 0 && score < 5) {
          const newSize = Math.floor(Math.random() * 5 + 5);
          map = ranMap(newSize, newSize);
        } else if (score >= 5 && score < 10) {
          const newSize = Math.floor(Math.random() * 7 + 8);
          map = ranMap(newSize, newSize);
        } else if (score >= 10 && score < 15) {
          const newSize = Math.floor(Math.random() * 15 + 15);
          map = ranMap(newSize, newSize);
        } else if (score >= 15 && score < 20) {
          const newSize = Math.floor(Math.random() * 20 + 30);
          map = ranMap(newSize, newSize);
        } else {
          const newSize = Math.floor(Math.random() * 15 + 55);
          map = ranMap(newSize, newSize);
        }
        canGenMap = false;
      }
      break;
  }
});

document.addEventListener("keyup", (e) => {
  function stopLeft() {
    clearInterval(intervalLeft);
    intervalLeft = null;
    mainPlayer.setXSpeed(0);
  }
  function stopRight() {
    clearInterval(intervalRight);
    intervalRight = null;
    mainPlayer.setXSpeed(0);
  }
  switch (e.key) {
    case "ArrowLeft":
      stopLeft();
      break;

    case "a":
      stopLeft();
      break;

    case "ArrowRight":
      stopRight();
      break;

    case "d":
      stopRight();
      break;

    case "Enter":
      canGenMap = true;
      break;
  }
});

//! Start main loop
setInterval(updateGame, 1000 / 60); // Update game logic at 60 FPS
requestAnimationFrame(renderGame); // Start rendering
