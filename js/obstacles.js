const segmentWidth = 80;

function spawnSegment(x) {
  const index = state.segmentCount++;

  // ---- PHASE TRANSITIONS ----
  if (index === 105) { state.phase = 'cave'; UI.stage.textContent="Cave";}
  if (index === 210) { state.phase = 'darkcave'; UI.stage.textContent = "Deep Cave"; }

  const wave = Math.sin((x + world.scroll) * 0.007) * 40;
  let cY, gap;

  if (state.phase === 'ocean') {
    gap = 2500;                         // so wide the walls are invisible
    cY  = H - 1250 - rand(10, 30);

  } else if (state.phase === 'transition') {
    const progress  = (index - 105) / 30;          // 0 → 1 over 30 segments
    const targetGap = Math.max(160, 260 - world.difficulty * 2);
    const targetCY  = H * 0.5 + wave;
    gap = 2500       * (1 - progress) + targetGap * progress;
    cY  = (H - 1250) * (1 - progress) + targetCY  * progress;

  } else {  // cave
    const last  = entities.segments[entities.segments.length - 1];
    const lastY = last ? last.cY : H * 0.5;
    gap = Math.max(160, 260 - world.difficulty * 2 + Math.sin(x * 0.01) * 20);
    cY  = Math.min(Math.max(lastY + wave * 0.1 + rand(-20, 20), 100), H - 100);
  }
  entities.segments.push({ x, w: segmentWidth, cY, gap });
  
  
  // Jellyfish only appear in cave
  if (state.phase === 'cave' && Math.random() < 0.15 && index > 5) {
    entities.jellyfish.push({
      x: x + segmentWidth / 2,
      y: cY + rand(-40, 40),
      r: 15,
      phase: rand(0, Math.PI * 2)
    });
  }

  // Pearls spawn in all phases
  const midX = x + segmentWidth / 2;
const playY = state.phase === 'ocean' ? rand(100, H - 100) : cY + rand(-30, 30);

if (Math.random() < 0.20 && index > 3) {
  entities.pearls.push({ x: midX, y: playY, r: 20, phase: rand(0, Math.PI * 2) });
} else if (Math.random() < 0.04) {
  entities.powerups.push({ x: midX, y: playY, r: 12, type: Math.random() < 0.5 ? 'shield' : 'magnet', p: rand(0, 7) });
}
}

function updateObstacles(dt) {
  // Move the camera forward
  world.scroll += world.speed * dt;

  // 1. Delete old walls that have moved off the left side of the screen
  while (entities.segments.length > 0 && entities.segments[0].x - world.scroll < -150) {
    entities.segments.shift();
  }

  // 2. Spawn new walls just off the right side of the screen so it goes on forever
  while (entities.segments.length === 0 || (entities.segments[entities.segments.length - 1].x - world.scroll) < W + 300) {
    const lastSegment = entities.segments[entities.segments.length - 1];
    const nextX = lastSegment ? lastSegment.x + segmentWidth : 0;
    spawnSegment(nextX);
  }

  // update Jellyfish logic
  updateArray(entities.jellyfish, (j) => {
    // bob up and down using a sine wave
    j.y += Math.sin(performance.now() * 0.003 + j.phase) * 60 * dt;
    return (j.x - world.scroll > -100);
  });

  //shields
  updateArray(entities.powerups, (p) => {
  const x = p.x - world.scroll; if (x < -100) return false;
  p.p += dt * 2;
  p.y += Math.sin(p.p) * 0.4;  // gentle bob

  if (circleHit(fish.x, fish.y, fish.r, x, p.y, p.r + 5)) {
  if (p.type === 'shield') {
    fish.buffs.shield = 1;
    UI.shield.style.display = 'flex';
    floatingText(x, p.y, "SHIELD!", "#49c7ff");
    spawnParticles(x, p.y, 15, 120, '#49c7ff');
  }
  if (p.type === 'magnet') {
    fish.buffs.magnet = 10;  // 10 seconds
    UI.magnet.style.display = 'flex';
    floatingText(x, p.y, "MAGNET!", "#ba55d3");
    spawnParticles(x, p.y, 15, 120, '#ba55d3');
  }
  return false;
}
  return true;
});
}

function drawObstacles() {
  ctx.save();
  ctx.fillStyle = '#0b1d30'; // Dark cave rock color

  entities.segments.forEach(seg => {
    const x = seg.x - world.scroll; 
    if (x < -seg.w || x > W) return; // Don't draw if it's off screen
    
    // Calculate where the top and bottom rock walls end
    const top = seg.cY - seg.gap / 2;
    const bot = seg.cY + seg.gap / 2;
    
    // Draw top Wall
    if (top > 0) ctx.fillRect(x, 0, seg.w + 1, top);
    
    // Draw bottom Wall
    ctx.fillRect(x, bot, seg.w + 1, H - bot);
  });

entities.powerups.forEach(p => {
  const x = p.x - world.scroll; if (x < -50 || x > W + 50) return;
  const c1 = p.type === 'shield' ? '#49c7ff' : '#ba55d3';  // blue or purple
  ctx.save(); ctx.translate(x, p.y);
  ctx.fillStyle = c1;
  ctx.globalAlpha = 0.4 + Math.sin(p.p) * 0.2;
  ctx.beginPath(); ctx.arc(0, 0, p.r + 6, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = c1;
  ctx.beginPath(); ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
});
  
}
// collision detection 
function checkWallCollisions() {

  const r=state.selectedFish==='puff' ? fish.r*(1.0-fish.shrink*0.1):fish.r;
  for (let seg of entities.segments) {
    // get the wall actual position on the screen
    const x = seg.x - world.scroll;
    // check if the fish is inside this specific wall segment
    if (fish.x + fish.r > x && fish.x - fish.r < x + seg.w) {
      // calculate where the rock walls are
      const topWall = seg.cY - seg.gap / 2;
      const bottomWall = seg.cY + seg.gap / 2;
      // did the fish hit the top rock or the bottom rock
      if (fish.y - fish.r < topWall || fish.y + fish.r > bottomWall) {
        return true; 
      }
    }
  }
  return false; 
}

function drawJellyfish() {
  entities.jellyfish.forEach(j => {
    const x = j.x - world.scroll;
    if (x < -50 || x > W + 50) return;

    ctx.save();
    ctx.translate(x, j.y);

    ctx.fillStyle = 'rgba(255, 100, 150, 0.3)';
    ctx.beginPath(); ctx.arc(0, 0, j.r * 1.8, 0, Math.PI * 2); ctx.fill();

    // dome
    ctx.fillStyle = '#ff7aad';
    ctx.beginPath(); ctx.arc(0, 0, j.r, Math.PI, 0); ctx.closePath(); ctx.fill();

    // tentacles
    ctx.strokeStyle = '#ffb3d1';
    ctx.lineWidth = 2;
    for(let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * j.r * 0.5, 0);
      ctx.lineTo(i * j.r * 0.8, j.r * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  });
}

function checkJellyCollisions() {
  const r=state.selectedFish==='puff' ? fish.r*(1.0-fish.shrink*0.1):fish.r;

  for (let j of entities.jellyfish) {
    const x = j.x - world.scroll;
    // calculate the distance between the fish center and jelly center
    const dist = Math.hypot(fish.x - x, fish.y - j.y);
    
    // if the distance is less than their combined radius they crashed
    if (dist < fish.r + j.r) {
      return true; 
    }
  }
  return false;
}
// pearl 
function drawPearls(){
  entities.pearls.forEach(p=>{
    const x=p.x- world.scroll;
    if(x<-50 || x>W+50)return;
    ctx.save();
    ctx.translate(x,p.y);

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#e6ffff';

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5, -5, p.r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  });
}

// collect pearls

function checkPearlCollisions(dt){
  updateArray(entities.pearls,(p)=>{
    const x=p.x-world.scroll;

    const dist=Math.hypot(fish.x-x,fish.y-p.y);  // distance between fish and pearl

    if (fish.buffs.magnet > 0 && dist < 250) {
      const pull = (250 - dist) * 2 * dt;
      p.x -= (x - fish.x) / dist * pull;
      p.y -= (p.y - fish.y) / dist * pull;
    }

    // increasse the score and delete the pearls
    if (dist < fish.r + p.r) {
      state.comboTimer = 2.0;
      state.multiplier = Math.min(5, state.multiplier + 1);
      const m = Math.floor(state.multiplier);

      UI.mult.textContent = `x${m}`;
      UI.mult.style.color = m >= 5 ? '#ff4a4a' : m >= 3 ? '#ff9e4a' : '#ffdb4d';

      const gained = 1 * m;
      state.score += gained;
      floatingText(x, p.y, `+${gained}`, '#ffe47a');
      return false;
    }
    return true;
  });
}