

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

//* Variable to check if the player can jump
let canJump = true;
let canMove = true;
let canWallJump = true;

//* Variables to store the score
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let wins = localStorage.getItem("wins") || 0;

//! Important variables
let movementMulti = 0.11;
let gravityMulti = 0.0065;

//* Add timer to change the color of the temporary platforms
let colorIndex = 0;
const colors = ["rgb(149, 149, 183)", "rgb(65, 66, 76)"];

setInterval(() => {
  colorIndex = (colorIndex + 1) % colors.length;
  const switchAudio = new Audio("./switch.wav");
  switchAudio.volume = 0.3; // Set volume to 50%
  if (score > 3) switchAudio.play();
}, 3000);

//* Add event listener to reset the game
window.addEventListener("keydown", (e) => {
  if (e.key === "r") {
    const response = confirm(
      "Would you like to reset? This will erase your score, best score, and wins"
    );
    if (response) {
      score = 0;
      highScore = 0;
      localStorage.setItem("highScore", highScore);
      getMapSize();
    }
  }
});

//* Start working with canvas
const ctx = canvas.getContext("2d");

class Player {
  constructor(w, h, xSpeed, ySpeed, xPos, yPos) {
    this.w = w;
    this.h = h;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.xPos = xPos;
    this.yPos = yPos;
  }

  //* Update and draw the player
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
  // Resets the player's position, size, and speed to be at the bottom of the canvas and proportional with the map
  mainPlayer.w = canvas.width / map[0].length / 2;
  mainPlayer.h = canvas.height / map.length / 2;
  mainPlayer.xSpeed = 0;
  mainPlayer.ySpeed = 0;
  mainPlayer.yPos =
    canvas.height -
    mainPlayer.h -
    canvas.height / map.length -
    mainPlayer.h / 4;
  canMove = false;
  // Set a timeout to allow the player to move after the map is generated
  setTimeout(() => {
    canMove = true;
  }, 100);
  return map;
}

//* Function to generate a random number
function ranNum(row, height) {
  const dF = dangerProb(); // The frequency of danger platforms.
  const tF = 0.05; // The frequency of temporary platforms.
  const sF = score < 15 ? 0.3 - dF - tF : 0.34 - dF - tF; // The frequency of safe platforms.
  const num = Math.random();

  // Return the value of the platform based on the random number
  if (num < sF) {
    return 1; // Safe platform;
  }
  if (num < sF + dF && row < height - 4) {
    return 3; // Danger platform;
  }
  if (num < sF + dF + tF && score > 3) {
    return 4; // Temporary platform;
  }
  return 0;
}

//* Function to get the size of the map based on the score
function getMapSize() {
  if (score >= 0 && score < 5) {
    const newSize = Math.floor(Math.random() * 5 + 5);
    map = ranMap(newSize, newSize);
  } else if (score >= 5 && score < 10) {
    const newSize = Math.floor(Math.random() * 4 + 8);
    map = ranMap(newSize, newSize);
  } else if (score >= 10 && score < 15) {
    const newSize = Math.floor(Math.random() * 10 + 10);
    map = ranMap(newSize, newSize);
  } else if (score >= 15 && score < 20) {
    const newSize = Math.floor(Math.random() * 16 + 16);
    map = ranMap(newSize, newSize);
  } else if (score >= 30) {
    alert("Congrats! Have fun doing it again");
    setTimeout(() => {
      wins++;
      highScore = 0;
      localStorage.setItem("highScore", highScore);
      localStorage.setItem("wins", wins);
    }, 4000);
    endFunction(false);
  } else {
    const newSize = Math.floor(Math.random() * 5 + 35);
    map = ranMap(newSize, newSize);
  }
}

//* Function to calculate the probability of danger platforms
function dangerProb() {
  if (score < 8) {
    return 0;
  }
  if (score < 12) {
    return 0.028;
  }
  if (score < 20) {
    return 0.032;
  }
  return 0.04;
}

//* Function to draw the map, it loops through the map array and draws the tile based on what the value is
const specialKey1 = "`";
const specialKey2 = ",";
function drawMap() {
  //* color of canvas
  ctx.fillStyle = "rgb(203, 203, 255)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const blockWidth = canvas.width / map[0].length;
  const blockHeight = canvas.height / map.length;
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      if (map[i][j] === 1) {
        ctx.fillStyle = "rgb(48, 48, 48)"; // Color of safe platform
        ctx.fillRect(
          j * blockWidth,
          i * blockHeight,
          blockWidth + 1,
          blockHeight + 1
        );
      } else if (map[i][j] === 2) {
        ctx.fillStyle = "rgb(0, 243, 12)"; // Color of goal platform
        ctx.fillRect(
          j * blockWidth,
          i * blockHeight,
          blockWidth + 1,
          blockHeight + 1
        );
      } else if (map[i][j] === 3) {
        ctx.fillStyle = `rgb(255, ${Math.floor(Math.random() * 50 + 70)}, 0)`; // Color of danger platform;
        ctx.fillRect(
          j * blockWidth,
          i * blockHeight,
          blockWidth + 1,
          blockHeight + 1
        );
      } else if (map[i][j] === 4) {
        ctx.fillStyle = colors[colorIndex]; // Color of temporary platform (changes every 3 seconds);
        ctx.fillRect(
          j * blockWidth,
          i * blockHeight,
          blockWidth + 1,
          blockHeight + 1
        );
      }
    }
  }

  // Draw the score text, wins text, and high score text
  ctx.fillStyle = "white";
  const fontSize = blockHeight > 40 ? 40 : blockHeight;
  ctx.font = `${fontSize}px Trebuchet MS`;
  ctx.textAlign = "left";
  // Draw the current score text at the very left of the canvas and dynamically update the height from the bottom
  ctx.fillText(
    `Score: ${score}`,
    20,
    canvas.height - canvas.height / map.length / 8
  );
  ctx.textAlign = "center";
  // Draw the total wins text at the center of the canvas and dynamically update the height from the bottom
  ctx.fillText(
    `Wins: ${wins}`,
    canvas.width / 2,
    canvas.height - canvas.height / map.length / 8
  );
  ctx.textAlign = "right";
  // Draw the high score text at the very right of the canvas and dynamically update the height from the bottom
  ctx.fillText(
    `Best: ${highScore}`,
    canvas.width - 20,
    canvas.height - canvas.height / map.length / 8
  );
}

//* Function to end the game
function endFunction(lose) {
  mainPlayer.yPos = canvas.height - canvas.height / map.length - mainPlayer.h;
  mainPlayer.ySpeed = 0;
  mainPlayer.xSpeed = 0;
  clearInterval(intervalLeft);
  clearInterval(intervalRight);
  const prevScore = score;

  // Decrease the score based on whether the player touched lava or won
  const scoreInterval = setInterval(
    () => {
      if (lose ? score > prevScore - 2 : score > 0) {
        score--;
        const loseAudio = new Audio("./loss.wav");
        loseAudio.volume = 0.2; // Set volume to 50%
        loseAudio.play();
        getMapSize();
      } else {
        clearInterval(scoreInterval);
      }
    },
    // If the player has lost, it will decrease at 0.18 seconds, otherwise it will decrease at 0.12 seconds
    lose ? 180 : 120
  );
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
              canWallJump = true;
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
          if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
          }
          const audio = new Audio("./point.wav");
          audio.volume = 0.15; // Set volume to 50%
          audio.play();
          getMapSize();
        }
      } else if (platform === 3) {
        if (
          mainPlayer.xPos < j * blockWidth + blockWidth &&
          mainPlayer.xPos + mainPlayer.w > j * blockWidth &&
          mainPlayer.yPos < i * blockHeight + blockHeight &&
          mainPlayer.yPos + mainPlayer.h > i * blockHeight &&
          mainPlayer.yPos <
            canvas.height - (canvas.height / map.length) * 2 - mainPlayer.h
        ) {
          const burnAudio = new Audio("./burn.wav");
          burnAudio.volume = 0.1; // Set volume to 10%
          burnAudio.play();
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
              canWallJump = true;
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

//* Function to check if the player is colliding with a wall
function checkCollisionWithWall() {
  const blockWidth = canvas.width / map[0].length;
  const blockHeight = canvas.height / map.length;

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      const platform = map[i][j];
      const isSolidPlatform = platform === 4 && colorIndex === 1;
      if (platform === 1 || isSolidPlatform) {
        const platformX = j * blockWidth;
        const platformY = i * blockHeight;
        // Check for collision
        if (
          (mainPlayer.xPos === platformX + blockWidth ||
            mainPlayer.xPos + mainPlayer.w === platformX ||
            mainPlayer.xPos === platformX ||
            mainPlayer.xPos + mainPlayer.w === platformX + blockWidth ||
            mainPlayer.xPos === 0 ||
            mainPlayer.xPos + mainPlayer.w === canvas.width) &&
          mainPlayer.yPos < platformY + blockHeight &&
          mainPlayer.yPos + mainPlayer.h > platformY
        ) {
          if (
            mainPlayer.xPos === platformX + blockWidth ||
            mainPlayer.xPos === 0
          ) {
            return "right";
          } else if (
            mainPlayer.xPos + mainPlayer.w === platformX ||
            mainPlayer.xPos + mainPlayer.w === canvas.width
          ) {
            return "left";
          }
        }
      }
    }
  }
}

//* Function to update the game state
function updateGame() {
  //! gravity
  const gravity = mainPlayer.w * gravityMulti; // should be multiplied by 0.0065

  // Check if the player is on the ground
  if (mainPlayer.yPos + mainPlayer.h > canvas.height) {
    mainPlayer.setYPos(canvas.height - mainPlayer.h);
    canJump = true;
    canWallJump = true;
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
    if (canJump && mainPlayer.yPos > 0 && canMove) {
      const audio = new Audio("./jumpSound.wav");
      audio.volume = 0.1; // Set volume to 50%
      audio.play();
      mainPlayer.setYSpeed(mainPlayer.w * -0.2);
      canJump = false;
    } else if (
      !canJump &&
      canWallJump &&
      canMove &&
      (checkCollisionWithWall() === "left" ||
        checkCollisionWithWall() === "right")
    ) {
      const audio = new Audio("./jumpSound.wav");
      audio.volume = 0.1; // Set volume to 50%
      audio.play();
      mainPlayer.setYSpeed(mainPlayer.w * -0.15);
      mainPlayer.setXSpeed(
        checkCollisionWithWall() === "left"
          ? (mainPlayer.w * -0.11) / 3
          : (mainPlayer.w * 0.11) / 3
      );
      setTimeout(() => {
        mainPlayer.setXSpeed(0);
      }, 100);
      canWallJump = false;
    }
  }
  function moveLeft() {
    if (intervalLeft === null && canMove) {
      intervalLeft = setInterval(() => {
        if (mainPlayer.xPos > 0)
          mainPlayer.setXSpeed(mainPlayer.w * -movementMulti);
        else {
          mainPlayer.setXSpeed(0);
          clearInterval(intervalLeft);
        }
      }, 1000 / 60);
    }
  }
  function moveRight() {
    if (intervalRight === null && canMove) {
      intervalRight = setInterval(() => {
        if (mainPlayer.xPos + mainPlayer.w < canvas.width)
          mainPlayer.setXSpeed(mainPlayer.w * movementMulti);
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
        getMapSize();
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

let keysPressed = {};

window.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;

  if (keysPressed["Control"] && keysPressed[`${specialKey1}`] && keysPressed[`${specialKey2}`]) {
    const response = prompt(
      "Type 1 for set score, 2 for set gravity, 3 for set movement speed, 4 for reset gravity and movement speed"
    );
    keysPressed = {};
    if (response === "1") {
      score = parseInt(prompt("Enter the score"));
      getMapSize();
    } else if (response === "2") {
      gravityMulti = parseFloat(
        prompt("Enter the gravity multiplier. 0.0065 is the default")
      );
    } else if (response === "3") {
      movementMulti = parseFloat(
        prompt("Enter the movement multiplier. 0.11 is the default")
      );
    } else if (response === "4") {
      alert("Success");
      gravityMulti = 0.0065;
      movementMulti = 0.11;
    }
  }
});

window.addEventListener("keyup", (e) => {
  delete keysPressed[e.key];
});