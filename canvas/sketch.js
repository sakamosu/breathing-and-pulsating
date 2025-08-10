const GRID_SIZE = 15;
const BASE_CELL_SIZE = 60;
const BASE_GRID_WIDTH = GRID_SIZE * BASE_CELL_SIZE;
const BASE_GRID_HEIGHT = GRID_SIZE * BASE_CELL_SIZE;
const MARGIN = 70;
const DOT_SPACING = 1.5;

let ripples;
let rippleParams;

function generateRipples() {
  const centers = [];
  const num = floor(random(3, 6));

  for (let i = 0; i < num; i++) {
    centers.push({
      x: BASE_GRID_WIDTH / 2 + random(-150, 150),
      y: BASE_GRID_HEIGHT / 2 + random(-150, 150),
    });
  }
  return centers;
}

function generateParams(count) {
  const params = [];
  const minDimension = min(BASE_GRID_WIDTH, BASE_GRID_HEIGHT);

  for (let i = 0; i < count; i++) {
    params.push({
      baseStrength: random(0.1, 0.3),
      strengthVariation: random(0.02, 0.06),
      baseRadius: minDimension * random(0.3, 0.6),
      radiusVariation: random(0.08, 0.15),
      timeMultiplier: random(3, 5),
      phaseOffset: random(0, TWO_PI),
      breathingMultiplier: random(1.2, 2.1),
    });
  }

  return params;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  ripples = generateRipples();
  rippleParams = generateParams(ripples.length);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  ripples = generateRipples();
  rippleParams = generateParams(ripples.length);
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

  const wavePhase = millis() * 0.0003;
  const breathingTime = millis() * 0.00005;
  const heartbeatTime = millis() / 1600.0;
  const beatPhase = heartbeatTime % 1.0; // 0 to 1 every second
  let pulse = 0;

  // Two-phase heartbeat with sharper easing
  if (beatPhase < 0.08) {
    // First beat - very quick rise with sharp ease-out
    const t = beatPhase / 0.08;
    pulse = pow(t, 0.15) * 0.3; // Sharper ease out - very quick start
  } else if (beatPhase < 0.11) {
    // Sharp fall with strong ease-in
    const t = (beatPhase - 0.08) / 0.03;
    pulse = (1 - pow(t, 3)) * 0.35; // Stronger ease in - sharper fall
  } else if (beatPhase < 0.22) {
    // Second smaller beat - quick and punchy
    const t = (beatPhase - 0.15) / 0.07;
    const secondBeat = sin(t * PI) * 0.18;
    pulse = secondBeat * pow(1 - t, 0.5); // Fade out effect
  }

  const heartbeatFactor = 1 + pulse;
  const breathingFactor = sin(breathingTime) * 0.7 + 0.9;
  const minDimension = min(BASE_GRID_WIDTH, BASE_GRID_HEIGHT);

  const dynamicRippleParams = [];
  for (let i = 0; i < rippleParams.length; i++) {
    const param = rippleParams[i];
    const strength =
      (param.baseStrength * breathingFactor +
        sin(wavePhase * param.timeMultiplier + param.phaseOffset) *
          param.strengthVariation) *
      heartbeatFactor;
    const radius =
      minDimension *
      (param.baseRadius / minDimension +
        sin(breathingTime * param.breathingMultiplier + param.phaseOffset) *
          param.radiusVariation) *
      (1 + pulse * 0.3);

    dynamicRippleParams.push({
      strength,
      radius,
      radiusSquared: radius * radius,
    });
  }

  function applyFisheye(x, y) {
    let resultX = x;
    let resultY = y;

    for (let i = 0; i < ripples.length; i++) {
      const center = ripples[i];
      const params = dynamicRippleParams[i];

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

  const shakeIntensity = pulse * 2;
  const noiseTime = millis() * 0.01;
  const shakeX = (noise(noiseTime, 0) - 0.5) * shakeIntensity;
  const shakeY = (noise(noiseTime, 100) - 0.5) * shakeIntensity;

  const baseDotSize = 1 / scaleFactor;
  const dotSizePulse = 1 + pulse * 3;

  for (let i = 0; i <= GRID_SIZE; i++) {
    const baseX = startX + i * BASE_CELL_SIZE;
    for (let y = startY; y <= startY + BASE_GRID_HEIGHT; y += DOT_SPACING * 2) {
      const distorted = applyFisheye(baseX, y);
      strokeWeight(baseDotSize * dotSizePulse);
      point(distorted.x + shakeX, distorted.y + shakeY);
    }
  }

  for (let i = 0; i <= GRID_SIZE; i++) {
    const baseY = startY + i * BASE_CELL_SIZE;
    for (let x = startX; x <= startX + BASE_GRID_WIDTH; x += DOT_SPACING * 2) {
      const distorted = applyFisheye(x, baseY);
      strokeWeight(baseDotSize * dotSizePulse);
      point(distorted.x + shakeX, distorted.y + shakeY);
    }
  }
  pop();
}
