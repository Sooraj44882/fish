let rafId = 0;
let lastTime = performance.now();

function update(dt) {
    updateFishPhysics(dt);   // fish postion update

   if (typeof updateBackgroundLogic === 'function') updateBackgroundLogic(dt); // move background

   //  Update the cave walls
  if (typeof updateObstacles === 'function') updateObstacles(dt);

}

function draw() {
  // Paint the canvas a ocean blue using background js
  if(typeof drawBackground==='function') drawBackground();


  // Draw the cave walls BEFORE we draw the fish, so the fish is on top
  if (typeof drawObstacles === 'function') drawObstacles();


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