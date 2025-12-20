const canvas = document.getElementById("lane");
const ctx = canvas.getContext("2d");

const theme = {
  laneStart: 70,
  laneMarginBottom: 60,
  laneMarginTop: 42,
  foulLineWidth: 6,
  pinRadius: 16,
  ballRadius: 30,
};

function drawEllipse(ctx, x, y, rx, ry, rotation = 0) {
  if (typeof ctx.ellipse === "function") {
    ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  } else {
    // Fallback для старых движков canvas без ellipse
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(rx, ry);
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.restore();
  }
}

function setCanvasSize() {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 960;
  const cssHeight = Math.round(cssWidth / (16 / 8));
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);
  canvas.style.height = `${cssHeight}px`;
  if (typeof ctx.resetTransform === "function") {
    ctx.resetTransform();
  } else {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.scale(dpr, dpr);
}

function createPins(laneWidth, laneHeight) {
  const pins = [];
  const spacing = theme.pinRadius * 2.4;
  const pyramidBaseY =
    theme.laneMarginTop + laneHeight * 0.4 + theme.pinRadius * 2;
  const pyramidBaseX = theme.laneStart + laneWidth - spacing * 1.2;

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col <= row; col += 1) {
      pins.push({
        x: pyramidBaseX - row * (spacing * 0.8) + col * spacing - (row * spacing) / 2,
        y: pyramidBaseY + row * (theme.pinRadius * 2.1),
      });
    }
  }
  return pins;
}

function drawLane(laneWidth, laneHeight) {
  const { laneStart, laneMarginTop, laneMarginBottom, foulLineWidth } = theme;

  ctx.fillStyle = "#c08a5d";
  ctx.fillRect(laneStart, laneMarginTop, laneWidth, laneHeight);

  // Границы дорожки
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(laneStart - 20, laneMarginTop, 20, laneHeight);
  ctx.fillRect(laneStart + laneWidth, laneMarginTop, 20, laneHeight);

  // Линии досок
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 12; i += 1) {
    const x = laneStart + (laneWidth / 12) * i;
    ctx.beginPath();
    ctx.moveTo(x, laneMarginTop);
    ctx.lineTo(x + 24, laneMarginTop + laneHeight);
    ctx.stroke();
  }

  // Фол-лайн
  ctx.fillStyle = "rgba(226, 232, 240, 0.6)";
  ctx.fillRect(laneStart + 36, laneMarginTop, foulLineWidth, laneHeight);

  // Свет от прожектора
  const gradient = ctx.createRadialGradient(
    laneStart + laneWidth * 0.3,
    laneMarginTop + laneHeight * 0.2,
    80,
    laneStart + laneWidth * 0.4,
    laneMarginTop + laneHeight * 0.45,
    laneWidth
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.2)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(laneStart, laneMarginTop, laneWidth, laneHeight);

  // Подписи
  ctx.fillStyle = "rgba(226, 232, 240, 0.55)";
  ctx.font = "14px 'Inter', system-ui, sans-serif";
  ctx.fillText("фол-лайн", laneStart + 12, laneMarginTop + 24);
  ctx.fillText("кегли", laneStart + laneWidth - 60, laneMarginTop + laneHeight * 0.55);
}

function drawPins(pins) {
  const { pinRadius } = theme;

  pins.forEach(({ x, y }) => {
    // Тень
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    drawEllipse(ctx, x + 8, y + pinRadius * 1.15, pinRadius * 0.75, pinRadius * 0.5, 0);
    ctx.fill();

    // Тело
    ctx.beginPath();
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 3;
    drawEllipse(ctx, x, y, pinRadius, pinRadius * 1.7, 0);
    ctx.fill();
    ctx.stroke();

    // Полоска
    ctx.beginPath();
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 4;
    ctx.moveTo(x - pinRadius + 4, y);
    ctx.lineTo(x + pinRadius - 4, y);
    ctx.stroke();

    // Блик
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    drawEllipse(
      ctx,
      x - pinRadius * 0.2,
      y - pinRadius * 0.8,
      pinRadius * 0.25,
      pinRadius * 0.4,
      0
    );
    ctx.fill();
  });
}

function drawBall(laneWidth, laneHeight) {
  const { laneStart, laneMarginTop, ballRadius } = theme;
  const ball = {
    x: laneStart + laneWidth * 0.22,
    y: laneMarginTop + laneHeight * 0.58,
  };

  // Тень
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.ellipse(ball.x + 10, ball.y + ballRadius * 0.9, ballRadius * 0.8, ballRadius * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Тело шара
  const gradient = ctx.createRadialGradient(ball.x - 12, ball.y - 16, 8, ball.x, ball.y, ballRadius);
  gradient.addColorStop(0, "#a0e5ff");
  gradient.addColorStop(1, "#075985");

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.strokeStyle = "#0ea5e9";
  ctx.lineWidth = 4;
  ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Отверстия
  const holes = [
    { dx: -10, dy: -6 },
    { dx: 8, dy: -12 },
    { dx: 2, dy: 6 },
  ];

  holes.forEach(({ dx, dy }) => {
    ctx.beginPath();
    ctx.fillStyle = "#0b496c";
    ctx.arc(ball.x + dx, ball.y + dy, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawScene() {
  setCanvasSize();

  const laneWidth = canvas.width / (window.devicePixelRatio || 1) - theme.laneStart * 2 + 10;
  const laneHeight =
    (canvas.height / (window.devicePixelRatio || 1)) - theme.laneMarginTop - theme.laneMarginBottom;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLane(laneWidth, laneHeight);
  const pins = createPins(laneWidth, laneHeight);
  drawPins(pins);
  drawBall(laneWidth, laneHeight);
}

window.addEventListener("resize", drawScene);
drawScene();
