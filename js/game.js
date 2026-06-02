let rafId = 0;
let lastTime = performance.now();

function update(dt) {
    updateFishPhysics(dt);   // fish postion update

   if (typeof updateBackgroundLogic === 'function') updateBackgroundLogic(dt); // move background
}

function draw() {
  // Paint the canvas a ocean blue using background js
  if(typeof drawBackground==='function') drawBackground();

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

// Spawn the scenery before starting the loop
if (typeof initBackground === 'function') initBackground();

// Start the engine
loop(performance.now());