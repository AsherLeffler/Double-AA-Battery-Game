//* Get the canvas HTML element
const canvas = document.getElementById('gameCanvas');

//* Specify width and height of canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//* Start working with canvas
const ctx = canvas.getContext('2d');
//* color of canvas
ctx.fillStyle = 'rgb(120, 120, 180)';
ctx.fillRect(0, 0, canvas.width, canvas.height);

class player {
    constructor(w, h, xSpeed, ySpeed, x, y) {
        
    }
}

