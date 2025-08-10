const GRID_SIZE = 15;
const BASE_CELL_SIZE = 60;
const BASE_GRID_WIDTH = GRID_SIZE * BASE_CELL_SIZE;
const BASE_GRID_HEIGHT = GRID_SIZE * BASE_CELL_SIZE;
const MARGIN = 50;
const DOT_SPACING = 1.5;

let rippleCenters;

function setup() {
  createCanvas(windowWidth, windowHeight);

  rippleCenters = [
    {
      x: BASE_GRID_WIDTH / 2,
      y: BASE_GRID_HEIGHT / 2,
    },
    {
      x: BASE_GRID_WIDTH / 2 - 110,
      y: BASE_GRID_HEIGHT / 2 + 80,
    },
    {
      x: BASE_GRID_WIDTH / 2 + 100,
      y: BASE_GRID_HEIGHT / 2 - 60,
    },
    {
      x: BASE_GRID_WIDTH / 2 - 80,
      y: BASE_GRID_HEIGHT / 2 - 100,
    },
  ];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(20);

  push();

  const scaleX = (width - MARGIN * 2) / BASE_GRID_WIDTH;
  const scaleY = (height - MARGIN * 2) / BASE_GRID_HEIGHT;
  const scaleFactor = min(scaleX, scaleY, 1);

  translate(width / 2, height / 2);
  scale(scaleFactor);
  translate(-BASE_GRID_WIDTH / 2, -BASE_GRID_HEIGHT / 2);

  stroke(245);
  strokeWeight(1 / scaleFactor);

  const startX = 0;
  const startY = 0;

  const time = millis() * 0.0003;
  const breathingTime = millis() * 0.00005;
  const heartbeatTime = millis() / 1600.0;
  const heartbeatPhase = heartbeatTime % 1.0; // 0 to 1 every second
  let heartbeatPulse = 0;

  // Two-phase heartbeat with sharper easing
  if (heartbeatPhase < 0.08) {
    // First beat - very quick rise with sharp ease-out
    const t = heartbeatPhase / 0.08;
    heartbeatPulse = pow(t, 0.15) * 0.3; // Sharper ease out - very quick start
  } else if (heartbeatPhase < 0.11) {
    // Sharp fall with strong ease-in
    const t = (heartbeatPhase - 0.08) / 0.03;
    heartbeatPulse = (1 - pow(t, 3)) * 0.35; // Stronger ease in - sharper fall
  } else if (heartbeatPhase < 0.22) {
    // Second smaller beat - quick and punchy
    const t = (heartbeatPhase - 0.15) / 0.07;
    const secondBeat = sin(t * PI) * 0.18;
    heartbeatPulse = secondBeat * pow(1 - t, 0.5); // Fade out effect
  }

  const heartbeatFactor = 1 + heartbeatPulse;
  const breathingFactor = sin(breathingTime) * 0.7 + 0.9;
  const minDimension = min(BASE_GRID_WIDTH, BASE_GRID_HEIGHT);

  const rippleParams = [
    {
      strength:
        (0.25 * breathingFactor + sin(time * 4) * 0.05) * heartbeatFactor,
      radius:
        minDimension *
        (0.5 + sin(breathingTime * 1.2) * 0.15) *
        (1 + heartbeatPulse * 0.3),
      radiusSquared: 0,
    },
    {
      strength:
        (0.2 * breathingFactor + sin(time * 3.5 + PI / 4) * 0.04) *
        heartbeatFactor,
      radius:
        minDimension *
        (0.45 + sin(breathingTime * 1.5 + PI / 4) * 0.12) *
        (1 + heartbeatPulse * 0.3),
      radiusSquared: 0,
    },
    {
      strength:
        (0.1 * breathingFactor + sin(time * 3.5 + PI / 4) * 0.05) *
        heartbeatFactor,
      radius:
        minDimension *
        (0.45 + sin(breathingTime * 1.5 + PI / 4) * 0.12) *
        (1 + heartbeatPulse * 0.3),
      radiusSquared: 0,
    },
    {
      strength:
        (0.18 * breathingFactor + sin(time * 4.2 + PI / 2) * 0.03) *
        heartbeatFactor,
      radius:
        minDimension *
        (0.4 + sin(breathingTime * 1.8 + PI / 2) * 0.1) *
        (1 + heartbeatPulse * 0.3),
      radiusSquared: 0,
    },
    {
      strength:
        (0.15 * breathingFactor + sin(time * 3.8 + PI) * 0.02) *
        heartbeatFactor,
      radius:
        minDimension *
        (0.35 + sin(breathingTime * 2.1 + PI) * 0.08) *
        (1 + heartbeatPulse * 0.3),
      radiusSquared: 0,
    },
  ];

  for (let i = 0; i < rippleParams.length; i++) {
    rippleParams[i].radiusSquared =
      rippleParams[i].radius * rippleParams[i].radius;
  }

  function applyMultipleFisheye(x, y) {
    let resultX = x;
    let resultY = y;

    for (let i = 0; i < rippleCenters.length; i++) {
      const center = rippleCenters[i];
      const params = rippleParams[i];

      const dx = resultX - center.x;
      const dy = resultY - center.y;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared < params.radiusSquared) {
        const distance = sqrt(distanceSquared);
        const normalizedDist = distance / params.radius;
        const distortionFactor =
          1 + params.strength * (1 - normalizedDist * normalizedDist);

        resultX = center.x + dx * distortionFactor;
        resultY = center.y + dy * distortionFactor;
      }
    }

    return { x: resultX, y: resultY };
  }

  const shakeIntensity = heartbeatPulse * 2;
  const noiseTime = millis() * 0.01;
  const shakeX = (noise(noiseTime, 0) - 0.5) * shakeIntensity;
  const shakeY = (noise(noiseTime, 100) - 0.5) * shakeIntensity;

  const baseDotSize = 1 / scaleFactor;
  const dotSizePulse = 1 + heartbeatPulse * 3;

  for (let i = 0; i <= GRID_SIZE; i++) {
    const baseX = startX + i * BASE_CELL_SIZE;
    for (let y = startY; y <= startY + BASE_GRID_HEIGHT; y += DOT_SPACING * 2) {
      const distorted = applyMultipleFisheye(baseX, y);
      strokeWeight(baseDotSize * dotSizePulse);
      point(distorted.x + shakeX, distorted.y + shakeY);
    }
  }

  for (let i = 0; i <= GRID_SIZE; i++) {
    const baseY = startY + i * BASE_CELL_SIZE;
    for (let x = startX; x <= startX + BASE_GRID_WIDTH; x += DOT_SPACING * 2) {
      const distorted = applyMultipleFisheye(x, baseY);
      strokeWeight(baseDotSize * dotSizePulse);
      point(distorted.x + shakeX, distorted.y + shakeY);
    }
  }
  pop();
}
