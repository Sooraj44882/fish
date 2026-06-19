document.getElementById('startBtn').addEventListener('click',resetAndPlay);
document.getElementById('restartBtn').addEventListener('click',returnToMainMenu);
document.getElementById('chooseOrange').addEventListener('click', () => {
  changeSelectedCharacter('orange');});
document.getElementById('choosePuff').addEventListener('click', () => {
  changeSelectedCharacter('puff');});

function returnToMainMenu() {
  UI.gameOver.classList.add('hide'); 
  UI.menu.classList.remove('hide'); 
}

function changeSelectedCharacter(type) {
  state.selectedFish = type;
  document.getElementById('chooseOrange').classList.remove('selected');
  document.getElementById('choosePuff').classList.remove('selected');
  
  if (type === 'orange') {
    document.getElementById('chooseOrange').classList.add('selected');
  } else {
    document.getElementById('choosePuff').classList.add('selected');
  }
}

function resize(){
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.scale(dpr, dpr);
}

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
  UI.stage.textContent='Open Sea';
  if (UI.stage) UI.stage.textContent="Open Sea";
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
  entities.powerups=[];
  entities.eels=[];
  entities.bolts=[];
  state.segmentCount=0;
  state.score=0;
  state.distance=0;
  state.multiplier = 1;    
  state.comboTimer = 0;    
  UI.mult.textContent = 'x1';  
  fish.buffs.shield=0;
  fish.buffs.magnet=0;
  UI.shield.style.display='none'; 
  UI.magnet.style.display='none';
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
  world.targetSpeed = fish.dashT > 0 ? 550 : baseTargetSpeed;

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
   if(typeof checkPearlCollisions==='function') checkPearlCollisions(dt);
  
   //  crash logic for both  cave Walls and Jellyfish 
  const hitWall = typeof checkWallCollisions === 'function' && checkWallCollisions();
  const hitJelly = typeof checkJellyCollisions === 'function' && checkJellyCollisions();
  const hitBolt = typeof checkBoltCollisions === 'function' && checkBoltCollisions();

  if (hitWall || hitJelly || hitBolt) {
    if (typeof takeDamage === 'function') takeDamage();
  }
}

function draw() {
  if(typeof drawBackground==='function') drawBackground();
  if (typeof drawObstacles === 'function') drawObstacles();
  if(typeof drawPearls==='function') drawPearls();
  if (typeof drawJellyfish === 'function') drawJellyfish();

  if (typeof drawEels === 'function') drawEels();   
  if (typeof drawBolts === 'function') drawBolts();
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

resize();  
if (typeof initBackground === 'function') initBackground();
draw();
window.addEventListener('resize', resize);

function drawPreviews() {
  // orange fish preview
  const c1 = document.getElementById('previewOrange');
  const x1 = c1.getContext('2d');
  const cx = c1.width / 2, cy = c1.height / 2;
  x1.clearRect(0, 0, c1.width, c1.height);

  // tail
  x1.fillStyle = '#ff7b00';
  x1.beginPath();
  x1.moveTo(cx - 18, cy);
  x1.lineTo(cx - 36, cy - 14);
  x1.lineTo(cx - 36, cy + 14);
  x1.fill();

  // body
  x1.fillStyle = '#ff9e22';
  x1.beginPath();
  x1.ellipse(cx, cy, 25, 18, 0, 0, Math.PI * 2);
  x1.fill();

  // eye white
  x1.fillStyle = '#fff';
  x1.beginPath();
  x1.arc(cx + 11, cy - 5, 6, 0, Math.PI * 2);
  x1.fill();

  // pupil
  x1.fillStyle = '#000';
  x1.beginPath();
  x1.arc(cx + 13, cy - 5, 3, 0, Math.PI * 2);
  x1.fill();

  // puff fish preview
  const c2 = document.getElementById('previewPuff');
  const x2 = c2.getContext('2d');
  const cx2 = c2.width / 2, cy2 = c2.height / 2;
  x2.clearRect(0, 0, c2.width, c2.height);

  // tail
  x2.fillStyle = '#cf3030';
  x2.beginPath();
  x2.moveTo(cx2 - 18, cy2);
  x2.lineTo(cx2 - 30, cy2 - 9);
  x2.lineTo(cx2 - 30, cy2 + 9);
  x2.fill();

  // body bottom white half
  x2.fillStyle = '#ffffff';
  x2.beginPath();
  x2.arc(cx2, cy2, 22, 0, Math.PI * 2);
  x2.fill();

  // body top red half
  x2.fillStyle = '#cf3030';
  x2.beginPath();
  x2.arc(cx2, cy2, 22, Math.PI, 0);
  x2.fill();

  // spikes
  x2.strokeStyle = '#cf3030';
  x2.lineWidth = 2;
  for (let a = Math.PI; a <= Math.PI * 2; a += Math.PI / 5) {
    x2.beginPath();
    x2.moveTo(cx2 + Math.cos(a) * 22, cy2 + Math.sin(a) * 22);
    x2.lineTo(cx2 + Math.cos(a) * 30, cy2 + Math.sin(a) * 30);
    x2.stroke();
  }

  // eye white
  x2.fillStyle = '#fff';
  x2.beginPath();
  x2.arc(cx2 + 10, cy2 - 5, 6, 0, Math.PI * 2);
  x2.fill();

  // pupil
  x2.fillStyle = '#000';
  x2.beginPath();
  x2.arc(cx2 + 12, cy2 - 5, 3, 0, Math.PI * 2);
  x2.fill();
}
resize();
if (typeof initBackground === 'function') initBackground();
drawPreviews();  
draw();