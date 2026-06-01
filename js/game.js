let rafId = 0;
let lastTime = performance.now();

function update(dt) {
    updateFishPhysics(dt);   // fish postion update
}

function draw() {
  // Paint the canvas a ocean blue
  ctx.fillStyle = '#0e699e';
  ctx.fillRect(0, 0, W, H);

  drawPlayerFish();  // draw fish
}

function loop(now) {
  // Calculate Delta Time (dt) to prevent lag
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0);
  lastTime = now;
  
  update(dt); 
  draw();
  rafId = requestAnimationFrame(loop);
}

// Start the engine
loop(performance.now());