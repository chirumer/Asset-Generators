// Constants matching Python implementation
const TABLE_MAIN = "#E7C27D";
const TABLE_CENTER = "#F3D7A3";
const TABLE_OUTLINE = "#000000";
const RIM_DARK = "#C08E5A";
const CHAIR_OUTLINE = "#3E2A16";
const CHAIR_SEAT = "#D2A670";
const CHAIR_SEAT_INNER = "#E6C08E";
const CHAIR_BACK = "#BF9058";
const CHAIR_SHADOW_ALPHA = 0.14;
const NUM_FILL = "#7A4E22";
const NUM_STROKE_COLOR = "#FFF2DC";
const NUM_SIZE_RATIO = 0.12;
const NUM_OUTLINE_RATIO = 0.007;
const SHIRT_COLORS = ["#4F6FA3", "#6F9267", "#B25E3B", "#8A4661", "#C2A24A", "#408080"];
const SKIN_TONES = ["#F1C27D", "#E0AC69", "#C68642", "#8D5524", "#B47C4F"];
const TABLE_RADIUS = 1.0;
const SEAT_DISTANCE = 1.62;
const X_LIM = 2.3;

let numSeats = 1;
let occupied = [0];
const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');
const canvasSize = 1200;
canvas.width = canvasSize;
canvas.height = canvasSize;

function dataToCanvas(x, y) {
  const scale = canvasSize / (2 * X_LIM);
  return [(x + X_LIM) * scale, (X_LIM - y) * scale];
}

function dataToCanvasScale(val) {
  return val * canvasSize / (2 * X_LIM);
}

function seatAnglesDeg(n) {
  if (n === 1) return [90.0];
  const step = 360.0 / n;
  return Array.from({length: n}, (_, i) => 90.0 - i * step);
}

function drawEllipse(cx, cy, rx, ry, rotation = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, 2 * Math.PI);
  ctx.restore();
}

function drawCircle(cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
}

function drawRoundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawTable() {
  const [cx, cy] = dataToCanvas(0, 0);
  const r = dataToCanvasScale(TABLE_RADIUS);
  const [sx, sy] = dataToCanvas(0, -0.05);
  ctx.save();
  ctx.fillStyle = "black";
  ctx.globalAlpha = 0.12;
  drawEllipse(sx, sy, dataToCanvasScale(1.2), dataToCanvasScale(0.21));
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = TABLE_MAIN;
  ctx.strokeStyle = TABLE_OUTLINE;
  ctx.lineWidth = dataToCanvasScale(0.035);
  drawCircle(cx, cy, r);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = TABLE_CENTER;
  drawCircle(cx, cy, r * 0.82);
  ctx.fill();
  ctx.strokeStyle = RIM_DARK;
  ctx.lineWidth = dataToCanvasScale(0.017);
  ctx.globalAlpha = 0.45;
  drawCircle(cx, cy, r * 0.98);
  ctx.stroke();
  ctx.globalAlpha = 1.0;
  ctx.save();
  ctx.fillStyle = "white";
  ctx.globalAlpha = 0.18;
  const [hx, hy] = dataToCanvas(-0.28, 0.35);
  drawEllipse(hx, hy, dataToCanvasScale(0.3), dataToCanvasScale(0.175), Math.PI / 9);
  ctx.fill();
  ctx.restore();
}

function drawChair(cx, cy, angleDeg) {
  const seatW = dataToCanvasScale(0.60);
  const seatD = dataToCanvasScale(0.36);
  const backH = dataToCanvasScale(0.15);
  const backGap = dataToCanvasScale(0.06);
  const lw = dataToCanvasScale(0.025);
  const rot = (angleDeg - 90) * Math.PI / 180;
  const [ccx, ccy] = dataToCanvas(cx, cy);
  const shadowDist = dataToCanvasScale(0.07);
  const sx = ccx + shadowDist * Math.cos(angleDeg * Math.PI / 180);
  const sy = ccy - shadowDist * Math.sin(angleDeg * Math.PI / 180);
  ctx.save();
  ctx.fillStyle = "black";
  ctx.globalAlpha = CHAIR_SHADOW_ALPHA;
  ctx.translate(sx, sy);
  ctx.rotate(-rot);
  drawEllipse(0, 0, seatW * 0.45, seatD * 0.35);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(ccx, ccy);
  ctx.rotate(-rot);
  ctx.fillStyle = CHAIR_BACK;
  ctx.strokeStyle = CHAIR_OUTLINE;
  ctx.lineWidth = lw;
  drawRoundRect(-seatW/2, seatD/2 + backGap, seatW, backH, dataToCanvasScale(0.04));
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = CHAIR_SEAT;
  ctx.strokeStyle = CHAIR_OUTLINE;
  ctx.lineWidth = lw;
  drawRoundRect(-seatW/2, -seatD/2, seatW, seatD, dataToCanvasScale(0.045));
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = CHAIR_SEAT_INNER;
  ctx.globalAlpha = 0.65;
  drawEllipse(-0.06 * seatW, -0.08 * seatD, seatW * 0.275, seatD * 0.21);
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = "white";
  ctx.globalAlpha = 0.18;
  drawEllipse(-0.18 * seatW, 0.04 * seatD, seatW * 0.15, seatD * 0.075);
  ctx.fill();
  ctx.restore();
}

function drawPeople(seatCenters) {
  const bodyR = dataToCanvasScale(0.30);
  const headR = dataToCanvasScale(0.18);
  const lw = dataToCanvasScale(0.017);
  seatCenters.forEach(([sx, sy], i) => {
    if (occupied[i] !== 1) return;
    const bodyCol = SHIRT_COLORS[i % SHIRT_COLORS.length];
    const headCol = SKIN_TONES[i % SKIN_TONES.length];
    const outline = "#2B2B2B";
    const vx = -sx, vy = -sy;
    const m = Math.hypot(vx, vy) || 1.0;
    const ux = vx / m, uy = vy / m;
    const bodyCx = sx + ux * 0.06, bodyCy = sy + uy * 0.06;
    const headCx = sx + ux * (0.30 + headR / dataToCanvasScale(1.0) * 0.7);
    const headCy = sy + uy * (0.30 + headR / dataToCanvasScale(1.0) * 0.7);
    const [bcx, bcy] = dataToCanvas(bodyCx, bodyCy);
    const [hcx, hcy] = dataToCanvas(headCx, headCy);
    const [scx, scy] = dataToCanvas(sx, sy);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = dataToCanvasScale(0.012);
    drawCircle(scx, scy, bodyR * 1.3);
    ctx.stroke();
    ctx.fillStyle = bodyCol;
    ctx.strokeStyle = outline;
    ctx.lineWidth = lw;
    drawCircle(bcx, bcy, bodyR);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = headCol;
    ctx.strokeStyle = outline;
    ctx.lineWidth = lw;
    drawCircle(hcx, hcy, headR);
    ctx.fill();
    ctx.stroke();
  });
}

function addCenterNumber(num) {
  const [cx, cy] = dataToCanvas(0, 0);
  const diameter = dataToCanvasScale(TABLE_RADIUS * 2);
  const targetSize = NUM_SIZE_RATIO * diameter;
  const outlineWidth = NUM_OUTLINE_RATIO * diameter;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${targetSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = NUM_FILL;
  ctx.strokeStyle = NUM_STROKE_COLOR;
  ctx.lineWidth = outlineWidth;
  ctx.lineJoin = "round";
  ctx.strokeText(num.toString(), cx, cy);
  ctx.fillText(num.toString(), cx, cy);
  ctx.restore();
}

function render() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawTable();
  const r = SEAT_DISTANCE * TABLE_RADIUS;
  const angles = seatAnglesDeg(numSeats);
  const seatCenters = angles.map(ang => {
    const a = ang * Math.PI / 180;
    const cx = r * Math.cos(a), cy = r * Math.sin(a);
    drawChair(cx, cy, ang);
    return [cx, cy];
  });
  drawPeople(seatCenters);
  addCenterNumber(numSeats);
}

function updateOccupancyGrid() {
  const grid = document.getElementById('occupancy-grid');
  grid.innerHTML = '';
  for (let i = 0; i < numSeats; i++) {
    const btn = document.createElement('button');
    btn.className = 'occupancy-btn' + (occupied[i] === 1 ? ' occupied' : '');
    btn.innerHTML = `<span>${occupied[i] === 1 ? 'Occupied' : 'Empty'}</span><span class="seat-label">Seat ${i}</span>`;
    btn.addEventListener('click', () => {
      occupied[i] = occupied[i] === 1 ? 0 : 1;
      updateOccupancyGrid();
      render();
    });
    grid.appendChild(btn);
  }
}

document.getElementById('seat-count-buttons').addEventListener('click', (e) => {
  if (e.target.classList.contains('seat-btn')) {
    document.querySelectorAll('.seat-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    numSeats = parseInt(e.target.dataset.seats);
    occupied = Array(numSeats).fill(0);
    updateOccupancyGrid();
    render();
  }
});

document.getElementById('download-svg').addEventListener('click', () => {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", canvasSize);
  svg.setAttribute("height", canvasSize);
  svg.setAttribute("xmlns", svgNS);
  const img = document.createElementNS(svgNS, "image");
  img.setAttribute("href", canvas.toDataURL());
  img.setAttribute("width", canvasSize);
  img.setAttribute("height", canvasSize);
  svg.appendChild(img);
  const blob = new Blob([svg.outerHTML], {type: "image/svg+xml"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `table_${numSeats}_seats.svg`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('download-png').addEventListener('click', () => {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table_${numSeats}_seats.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
});

updateOccupancyGrid();
render();
