const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const ui = document.getElementById("ui");
const menu = document.getElementById("menu");

let ball, paddle, bricks, score, lives, level, running = false;
let highScore = localStorage.getItem("breakoutHigh") || 0;

function startGame() {
  menu.style.display = "none";
  init();
}

function init() {
  level = 1;
  score = 0;
  lives = 3;
  running = true;
  setupLevel();
  draw();
}

function setupLevel() {
  ball = { x: 400, y: 250, dx: 2, dy: -2, r: 10 };
  paddle = { w: 120, h: 12, x: 340 };

  const rows = 4 + level;
  const cols = 8 + Math.min(level, 4);

  bricks = [];
  for (let c = 0; c < cols; c++) {
    bricks[c] = [];
    for (let r = 0; r < rows; r++) {
      bricks[c][r] = {
        status: 1,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        color: `hsl(${r * 50},70%,50%)`
      };
    }
  }

  updateUI();
}

function updateUI() {
  ui.innerText = `Level: ${level} | Score: ${score} | Lives: ${lives} | High: ${highScore}`;
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = "#00ffcc";
  ctx.fill();
}

function drawPaddle() {
  ctx.fillStyle = "#0095DD";
  ctx.fillRect(paddle.x, canvas.height - paddle.h - 5, paddle.w, paddle.h);
}

function drawBricks() {
  const rows = bricks[0].length;
  const cols = bricks.length;

  const pad = 10, offTop = 30, offLeft = 20;
  const bw = (canvas.width - offLeft * 2 - pad * (cols - 1)) / cols;
  const bh = 20;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      let b = bricks[c][r];
      if (b.status) {
        let bx = c * (bw + pad) + offLeft;
        let by = r * (bh + pad) + offTop;

        b.x = bx; b.y = by; b.w = bw; b.h = bh;

        ctx.fillStyle = b.color;
        ctx.fillRect(bx, by, bw, bh);
      }
    }
  }
}

function collision() {
  let remaining = 0;

  for (let c = 0; c < bricks.length; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      let b = bricks[c][r];
      if (b.status) {
        remaining++;
        if (
          ball.x > b.x &&
          ball.x < b.x + b.w &&
          ball.y > b.y &&
          ball.y < b.y + b.h
        ) {
          ball.dy *= -1;
          b.status = 0;
          score++;
          updateUI();
        }
      }
    }
  }

  if (remaining === 0) {
    level++;
    setupLevel();
  }
}

function draw() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawPaddle();
  drawBricks();
  collision();

  if (ball.x + ball.dx > canvas.width - ball.r || ball.x + ball.dx < ball.r)
    ball.dx *= -1;

  if (ball.y + ball.dy < ball.r) {
    ball.dy *= -1;
  } else if (ball.y + ball.dy > canvas.height - ball.r - 10) {
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
      ball.dy *= -1;

      ball.dx *= 1.01;
      ball.dy *= 1.01;

      const max = 5;
      ball.dx = Math.max(Math.min(ball.dx, max), -max);
      ball.dy = Math.max(Math.min(ball.dy, max), -max);
    } else {
      loseLife();
    }
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  requestAnimationFrame(draw);
}

function loseLife() {
  lives--;

  if (lives <= 0) {
    running = false;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("breakoutHigh", highScore);
    }

    menu.innerHTML = `<h1>Game Over</h1><p>Score: ${score}</p><button onclick="startGame()">Restart</button>`;
    menu.style.display = "block";
  } else {
    ball.x = 400;
    ball.y = 250;
    ball.dx = 2;
    ball.dy = -2;
    paddle.x = 340;
  }

  updateUI();
}

// controls
document.addEventListener("mousemove", e => {
  let rect = canvas.getBoundingClientRect();
  paddle.x = e.clientX - rect.left - paddle.w / 2;
});

document.addEventListener("keydown", e => {
  if (e.key === "p") {
    running = !running;
    if (running) draw();
  }
});
