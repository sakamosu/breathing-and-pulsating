function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(20);

  push();

  const gridSize = 15;
  const baseCellSize = 60;
  const baseGridWidth = gridSize * baseCellSize;
  const baseGridHeight = gridSize * baseCellSize;

  const margin = 50;
  const scaleX = (width - margin * 2) / baseGridWidth;
  const scaleY = (height - margin * 2) / baseGridHeight;
  const scaleFactor = min(scaleX, scaleY, 1);

  translate(width / 2, height / 2);
  scale(scaleFactor);
  translate(-baseGridWidth / 2, -baseGridHeight / 2);

  stroke(245);
  strokeWeight(1 / scaleFactor);

  const cellSize = baseCellSize;
  const gridWidth = baseGridWidth;
  const gridHeight = baseGridHeight;

  const startX = 0;
  const startY = 0;

  const dotSpacing = 1.5;

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

  const rippleCenters = [
    {
      x: baseGridWidth / 2,
      y: baseGridHeight / 2,
    },
    {
      x: baseGridWidth / 2 - 110,
      y: baseGridHeight / 2 + 80,
    },
    {
      x: baseGridWidth / 2 + 100,
      y: baseGridHeight / 2 - 60,
    },
    {
      x: baseGridWidth / 2 - 80,
      y: baseGridHeight / 2 - 100,
    },
  ];

  const breathingFactor = sin(breathingTime) * 0.7 + 0.9;

  const rippleParams = [
    {
      strength:
        (0.25 * breathingFactor + sin(time * 4) * 0.05) * heartbeatFactor,
      radius:
        min(gridWidth, gridHeight) *
        (0.5 + sin(breathingTime * 1.2) * 0.15) *
        (1 + heartbeatPulse * 0.3),
    },
    {
      strength:
        (0.2 * breathingFactor + sin(time * 3.5 + PI / 4) * 0.04) *
        heartbeatFactor,
      radius:
        min(gridWidth, gridHeight) *
        (0.45 + sin(breathingTime * 1.5 + PI / 4) * 0.12) *
        (1 + heartbeatPulse * 0.3),
    },
    {
      strength:
        (0.1 * breathingFactor + sin(time * 3.5 + PI / 4) * 0.05) *
        heartbeatFactor,
      radius:
        min(gridWidth, gridHeight) *
        (0.45 + sin(breathingTime * 1.5 + PI / 4) * 0.12) *
        (1 + heartbeatPulse * 0.3),
    },
    {
      strength:
        (0.18 * breathingFactor + sin(time * 4.2 + PI / 2) * 0.03) *
        heartbeatFactor,
      radius:
        min(gridWidth, gridHeight) *
        (0.4 + sin(breathingTime * 1.8 + PI / 2) * 0.1) *
        (1 + heartbeatPulse * 0.3),
    },
    {
      strength:
        (0.15 * breathingFactor + sin(time * 3.8 + PI) * 0.02) *
        heartbeatFactor,
      radius:
        min(gridWidth, gridHeight) *
        (0.35 + sin(breathingTime * 2.1 + PI) * 0.08) *
        (1 + heartbeatPulse * 0.3),
    },
  ];

  function applyMultipleFisheye(x, y) {
    let resultX = x;
    let resultY = y;

    for (let i = 0; i < rippleCenters.length; i++) {
      const center = rippleCenters[i];
      const params = rippleParams[i];

      const dx = resultX - center.x;
      const dy = resultY - center.y;
      const distance = sqrt(dx * dx + dy * dy);

      if (distance < params.radius) {
        const normalizedDist = distance / params.radius;
        const distortionFactor =
          1 + params.strength * (1 - normalizedDist * normalizedDist);

        resultX = center.x + dx * distortionFactor;
        resultY = center.y + dy * distortionFactor;
      }
    }

    return { x: resultX, y: resultY };
  }

  // Grid shake effect synchronized with heartbeat
  const shakeIntensity = heartbeatPulse * 2;
  const shakeX = (noise(millis() * 0.01, 0) - 0.5) * shakeIntensity;
  const shakeY = (noise(millis() * 0.01, 100) - 0.5) * shakeIntensity;

  for (let i = 0; i <= gridSize; i++) {
    const baseX = startX + i * cellSize;
    for (let y = startY; y <= startY + gridHeight; y += dotSpacing * 2) {
      const distorted = applyMultipleFisheye(baseX, y);
      point(distorted.x + shakeX, distorted.y + shakeY);
    }
  }

  for (let i = 0; i <= gridSize; i++) {
    const baseY = startY + i * cellSize;
    for (let x = startX; x <= startX + gridWidth; x += dotSpacing * 2) {
      const distorted = applyMultipleFisheye(x, baseY);
      point(distorted.x + shakeX, distorted.y + shakeY);
    }
  }

  pop();
}
