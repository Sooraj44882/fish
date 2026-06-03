let rafId = 0;
let lastTime = performance.now();

function update(dt) {
    updateFishPhysics(dt);   // fish postion update

   if (typeof updateBackgroundLogic === 'function') updateBackgroundLogic(dt); // move background
   if (typeof updateObstacles === 'function') updateObstacles(dt);
  
   //  crash logic for both  cave Walls and Jellyfish 
  const hitWall = typeof checkWallCollisions === 'function' && checkWallCollisions();
  const hitJelly = typeof checkJellyCollisions === 'function' && checkJellyCollisions();

  if (hitWall || hitJelly) {
    world.scroll = 0; 
    fish.x = W * 0.25; 
    fish.y = H * 0.5; 
    fish.vx = 0; 
    fish.vy = 0;
    entities.segments = []; 
    entities.jellyfish = [];    //the entities clear when crash
    entities.pearls=[];
    state.segmentCount = 0;
  }
}

function draw() {
  // Paint the canvas a ocean blue using background js
  if(typeof drawBackground==='function') drawBackground();


  // Draw the cave walls BEFORE we draw the fish, so the fish is on top
  if (typeof drawObstacles === 'function') drawObstacles();

  // draw the pearls
  if(typeof drawPearls==='function') drawPearls();

  // draw jellyfish before the player fish
  if (typeof drawJellyfish === 'function') drawJellyfish();

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