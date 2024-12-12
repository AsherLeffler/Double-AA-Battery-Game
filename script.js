//* Get the canvas HTML element
const canvas = document.getElementById("gameCanvas");

//* Specify width and height of canvas
canvas.width = 400;
canvas.height = 400;

//* Start working with canvas
const ctx = canvas.getContext("2d");
//* color of canvas
ctx.fillStyle = "rgb(120, 120, 180)";
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

  update() {
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
    ctx.fillStyle = "red";
    ctx.fillRect(this.xPos, this.yPos, this.w, this.h);
  }

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

function mainLoop() {
  ctx.fillStyle = "rgb(120, 120, 180)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (mainPlayer.yPos + mainPlayer.h > canvas.height) {
    mainPlayer.setYPos(canvas.height - mainPlayer.h);
    mainPlayer.setYSpeed(0);
  } else if (mainPlayer.yPos != canvas.height - mainPlayer.h) {
    mainPlayer.setYSpeed(mainPlayer.getYSpeed() + 0.15);
  }
  mainPlayer.update();
  requestAnimationFrame(mainLoop);
}

let canJump = true;

//* Add event listeners to listen for arrow movements
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (canJump && mainPlayer.yPos > 0) {
        mainPlayer.setYSpeed(-5);
        canJump = false;
      }
      break;
    case "ArrowLeft":
      mainPlayer.setXSpeed(-4);
      break;
    case "ArrowRight":
      mainPlayer.setXSpeed(4);
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowUp":
      canJump = true;
      break;
    case "ArrowLeft":
      mainPlayer.setXSpeed(0);
      if (mainPlayer.xPos < 0) {
        mainPlayer.xPos = 0;
      }
      break;
    case "ArrowRight":
      mainPlayer.setXSpeed(0);
      break;
  }
});

//! Start main loop
mainLoop();
