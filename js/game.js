document.getElementById('startBtn').addEventListener('click',resetAndPlay);
document.getElementById('restartBtn').addEventListener('click',resetAndPlay);

//red damage effect
function spawnParticles(x, y, count, power, color) {
  for (let i = 0; i < count; i++) {
    entities.particles.push({
      x, y,
      vx: rand(-power, power),
      vy: rand(-power, power),
      r: rand(2, 6),
      life: rand(0.4, 0.8),
      c: color
    });
  }
}
// colleting pearls effect
function floatingText(x, y, text, color) {
  entities.floatingTexts.push({ x, y, text, color, life: 1.0 });
}

function resetAndPlay(){
  state.phase='ocean';
  UI.stage.textContent='Open Sea'
  // hide menus using the new 'hide' CSS class
  UI.menu.classList.add('hide');
  UI.gameOver.classList.add('hide');

  //reset world
  world.scroll=0;
  world.speed = 280;         
  world.targetSpeed = 280;    
  world.difficulty = 0;  

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
  state.multiplier = 1;    
  state.comboTimer = 0;    
  UI.mult.textContent = 'x1';  
  fish.buffs.shield=0;
  UI.shield.style.display='none'; 

  if (rafId) cancelAnimationFrame(rafId);  // prevent double loops on restart
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
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
  world.difficulty+=dt*0.15;
  
  // Calculate the baseline speed (using const for a temporary variable)
  const baseTargetSpeed = 280 + Math.min(120, world.difficulty * 15);
  
  // Spike the target speed to 450 if dashing, otherwise use the baseline
  world.targetSpeed = fish.dashT > 0 ? 450 : baseTargetSpeed;

  state.screenShake*=0.85;

  // Smoothly lerp actual speed toward the target speed
  const lerpSpeed = fish.dashT > 0 ? 8 : 4;
  world.speed += (world.targetSpeed - world.speed) * Math.min(1, dt * lerpSpeed);

  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) {
      state.multiplier = 1;
      UI.mult.textContent = 'x1';
      UI.mult.style.color = '#fff';
    }
  }

  // adding red particle when fish damage
  updateArray(entities.particles, (p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 300 * dt;
    p.life -= dt;
    return p.life > 0;
  });

  // effect when it collect pearls
updateArray(entities.floatingTexts, (ft) => {
  ft.life -= dt;
  ft.y -= dt * 40;  // drifts upward
  return ft.life > 0;
});

   if (typeof updateBackgroundLogic === 'function') updateBackgroundLogic(dt); // move background

   if(state.phase ==='start' || state.phase==='gameover')return; // only run physics if playing

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
  if(typeof drawBackground==='function') drawBackground();
  if (typeof drawObstacles === 'function') drawObstacles();
  if(typeof drawPearls==='function') drawPearls();
  if (typeof drawJellyfish === 'function') drawJellyfish();

  drawPlayerFish();  // draw fish

// Only particles and text shake
  ctx.save();
  if (state.screenShake>0){
    const s=state.screenShake;
    ctx.translate(rand(-s,s), rand(-s,s));
  }
 
  // red damage
entities.particles.forEach(p => {
  ctx.globalAlpha = p.life;
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
});

// collecting pearls
ctx.font = 'bold 18px "Segoe UI"';
ctx.textAlign = 'center';
entities.floatingTexts.forEach(ft => {
  ctx.globalAlpha = Math.min(1, ft.life * 2);
  ctx.fillStyle = ft.color;
  ctx.fillText(ft.text, ft.x, ft.y);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeText(ft.text, ft.x, ft.y);
});

ctx.globalAlpha = 1;
  ctx.restore();

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
draw(); // just draws the menu background once no loop