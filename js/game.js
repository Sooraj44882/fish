document.getElementById('startBtn').addEventListener('click',resetAndPlay);
document.getElementById('restartBtn').addEventListener('click',resetAndPlay);

function resetAndPlay(){
  state.phase='playing';

  // hide menus using the new 'hide' CSS class
  UI.menu.classList.add('hide');
  UI.gameOver.classList.add('hide');

  //reset world
  world.scroll=0;
  fish.x=W*0.25;
  fish.y=H*0.5;
  fish.hp = fish.maxHp;
  if (typeof updateHealthBar === 'function') updateHealthBar();
  fish.vx=0;
  fish.vy=0;
  entities.segments=[];
  entities.jellyfish=[];
  entities.pearls=[];
  state.segmentCount=0;
  state.score=0;
  state.distance=0;

}

function triggerGameOver(){
  state.phase='gameover';
  
  // Update the new final score IDs
  UI.finalDistance.innerText=Math.floor(state.distance);
  UI.finalPearls.innerText=state.score;

  // Show the game over screen by removing the 'hide' class
  UI.gameOver.classList.remove('hide');
}


function update(dt) {
   if (typeof updateBackgroundLogic === 'function') updateBackgroundLogic(dt); // move background

   if(state.phase !=='playing')return; // only run physics if playing

   updateFishPhysics(dt);
   if (typeof updateObstacles === 'function') updateObstacles(dt);

  state.distance+=world.speed*dt*0.01;

   // check if fish touch the pearls
   if(typeof checkPearlCollisions==='function') checkPearlCollisions();
  
   //  crash logic for both  cave Walls and Jellyfish 
  const hitWall = typeof checkWallCollisions === 'function' && checkWallCollisions();
  const hitJelly = typeof checkJellyCollisions === 'function' && checkJellyCollisions();

  if (hitWall || hitJelly) {
    if (typeof takeDamage === 'function') takeDamage();
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

 // score of pearl and distance
if (UI.distance) UI.distance.innerText = Math.floor(state.distance);
  if (UI.pearls) UI.pearls.innerText = state.score;

}

let rafId = 0;
let lastTime = performance.now();

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