const canvas = document.getElementById("canvas");
const canvasWidth = 1000;
const canvasHeight = 500;
const blockSize = 15;
const widthInBlock = canvasWidth / blockSize;
const heightInBlock = canvasHeight / blockSize;
const ctx = canvas.getContext("2d");
const delay = 100;

let score;
let snakee;
let apple;
let intervalId;

let startButton = document.getElementById("start");
startButton.addEventListener("click", start);

//init();
/**
 * Lance le jeu
 */
function start() {
  canvas.style.display = "block";
  startButton.style.display = "none";
  init();
}

function init() {
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  snakee = new Snake([
    [6, 4],
    [5, 4],
    [4, 4],
  ]);
  apple = new Apple([10, 10]);
  score = 0;
  intervalId = setInterval(refreshCanvas, delay);
}

function refreshCanvas() {
  snakee.advance();
  if (snakee.checkCollision()) {
    clearInterval(intervalId);
    snakee.advance = null;
    gameOver();
  } else {
    if (snakee.hasEatenApple(apple)) {
      snakee.ateApple = true;
      score++;
      do {
        apple.setNewPosition();
      } while (apple.isOnSnake(snakee));
    }
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawScore();
    snakee.draw();
    apple.draw();
  }
}

function drawScore() {
  ctx.save();
  ctx.font = "200px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ddd";
  let centerX = canvasWidth * 0.43;
  let centerY = canvasHeight / 2;
  ctx.fillText(score.toString(), centerX, centerY);
  ctx.restore();
}

function gameOver() {
  ctx.save();
  ctx.font = "20px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#999";
  ctx.fillText("Ooops Vous avez Perdu :(", canvasWidth * 0.4, 105);
  ctx.fillText("Appuyez sur la touche Espace pour recommencer", 280, 35);
  ctx.restore();
}

function restart() {
  clearInterval(intervalId);
  snakee = new Snake([
    [6, 4],
    [5, 4],
    [4, 4],
  ]);
  apple = new Apple([10, 10]);
  score = 0;
  intervalId = setInterval(refreshCanvas, delay);
}

function drawBlock(ctx, postion) {
  let x = postion[0] * blockSize;
  let y = postion[1] * blockSize;
  ctx.fillStyle = "orange";
  ctx.fillRect(x, y, blockSize, blockSize);
}

function Snake(body) {
  this.body = body;
  this.ateApple = false;
  this.direction = "down";

  this.setDirection = function (direction) {
    let allowedDirection;
    switch (this.direction) {
      case "left":
      case "right":
        allowedDirection = ["up", "down"];
        break;
      case "up":
      case "down":
        allowedDirection = ["left", "right"];
        break;
      default:
        throw "Invald direction";
    }

    if (allowedDirection.includes(direction)) {
      this.direction = direction;
    } else {
      console.log("direction non permise");
    }
  };

  this.draw = function () {
    ctx.save();
    for (let i = 0; i < this.body.length; i++) {
      drawBlock(ctx, this.body[i]);
    }
    ctx.restore();
  };

  this.advance = function () {
    let nextPosition = this.body[0].slice();
    switch (this.direction) {
      case "left":
        nextPosition[0]--;
        break;
      case "right":
        nextPosition[0]++;
        break;
      case "up":
        nextPosition[1]--;
        break;
      case "down":
        nextPosition[1]++;
        break;
    }

    this.body.unshift(nextPosition);
    this.ateApple ? (this.ateApple = false) : this.body.pop();
  };

  this.checkCollision = function () {
    let wallCollision = false;
    let snakeCollision = false;
    let head = this.body[0];
    let rest = this.body.slice(1);
    let snakeX = head[0];
    let snakeY = head[1];
    let minX = 0;
    let minY = 0;
    let maxX = widthInBlock - 1;
    let maxY = heightInBlock - 1;

    let isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
    let isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

    if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
      wallCollision = true;
    }

    for (let i = 0; i < rest.length; i++) {
      if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
        snakeCollision = true;
      }
    }
    return snakeCollision || wallCollision;
  };

  this.hasEatenApple = function (apple) {
    let head = this.body[0];
    return head[0] === apple.position[0] && head[1] === apple.position[1]
      ? true
      : false;
  };
}

function Apple(position) {
  this.position = position;
  this.draw = function () {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "green";
    let radius = blockSize / 2;
    let x = this.position[0] * blockSize + radius;
    let y = this.position[1] * blockSize + radius;
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  };

  this.setNewPosition = function () {
    let newX = Math.floor(Math.random() * (widthInBlock - 1));
    let newY = Math.floor(Math.random() * (heightInBlock - 1));
    this.position = [newX, newY];
  };

  this.isOnSnake = function (snake) {
    let isOnSnake = false;
    for (let i = 0; i < snake.body.length; i++) {
      if (
        snake.body[i][0] === this.position[0] &&
        snake.body[i][1] === this.position[1]
      ) {
        isOnSnake = true;
      }
    }
    return isOnSnake;
  };
}

document.onkeydown = function handleKeyDown(e) {
  let key = e.code;
  let newDirection;

  switch (key) {
    case "ArrowLeft":
      newDirection = "left";
      break;
    case "ArrowUp":
      newDirection = "up";
      break;
    case "ArrowRight":
      newDirection = "right";
      break;
    case "ArrowDown":
      newDirection = "down";
      break;
    case "Space":
      restart();
      return;
    default:
      return;
  }
  snakee.setDirection(newDirection);
};
