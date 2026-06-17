//fish
function updateHealthBar() {
  if (UI.hp) {
    UI.hp.style.width = `${(fish.hp / fish.maxHp) * 100}%`;
    UI.hp.style.background = fish.hp === 1 ? '#ff3b3b' : 'linear-gradient(90deg, #ff3b3b, #ff8e52)';
  }
}

function takeDamage() {
  if (fish.invuln > 0) return; // prevent taking damage twice instantly
  
  state.screenShake=15;
  state.multiplier=1;
  UI.mult.textContent='x1';
  spawnParticles(fish.x,fish.y,25,200, '#ff4a4a');


    if (fish.buffs.shield > 0) {
    fish.buffs.shield = 0;
    fish.invuln = 1.5;
    UI.shield.style.display = 'none';
    floatingText(fish.x, fish.y, "SHIELD BROKEN!", "#49c7ff");
    return;
  }

  fish.hp--; 
  updateHealthBar(); 
  fish.invuln = 1.5; // flash for 1.5 seconds
  
  if (fish.hp <= 0 && typeof triggerGameOver === 'function') {
    triggerGameOver();
  }
}

function updateFishPhysics(dt){
    const accel=state.selectedFish==='puff'?500:850;    
    const maxSpd=state.selectedFish==='puff'?240:380; // speed limit
    const drag=0.88;    //water friction

    let ax=0,ay=0;

//calculate accelration
if(keys.has('ArrowUp') ||keys.has('KeyW')) ay-=accel;
if(keys.has('ArrowDown') || keys.has('KeyS')) ay+=accel;
if(keys.has('ArrowLeft') || keys.has('KeyA')) ax-=accel;
if(keys.has('ArrowRight') || keys.has('KeyD')) ax+=accel;

// change velocity according to accelration
fish.vx +=ax*dt;
fish.vy +=ay*dt;

//dash 
const dashing=keys.has('ShiftLeft')|| keys.has('Space');

//dash time and cooldown
if(dashing && fish.dashCd<=0 && state.selectedFish === 'orange'){
    fish.dashT=0.2;
    fish.dashCd=0.6;

    let dx=0 , dy=0;
    if(keys.has('ArrowRight') || keys.has('KeyD')) dx=1;
    if(keys.has('ArrowLeft') || keys.has('KeyA')) dx=-1;
    if(keys.has('ArrowDown') || keys.has('KeyS')) dy=1; 
    if(keys.has('ArrowUp') || keys.has('KeyW')) dy=-1;

    if(dx===0 && dy===0) dx=1;

    fish.vx+=dx*800;
    fish.vy+=dy*800;
  }      

//timer
fish.dashCd=Math.max(0,fish.dashCd -dt);
fish.dashT=Math.max(0,fish.dashT-dt);

// friction 
    const frict=fish.dashT>0 ? 0.98: Math.pow(drag,dt*60);
    fish.vx *=frict;
    fish.vy *=frict;

// enforce the speed limit
  const currentMaxSpd=fish.dashT>0?1000:maxSpd;
  fish.vx = clamp(fish.vx, -currentMaxSpd, currentMaxSpd); 
  fish.vy = clamp(fish.vy, -currentMaxSpd, currentMaxSpd);

  // fish coordinates
  fish.x +=fish.vx*dt;
  fish.y +=fish.vy*dt;

  //shrink 
  const isShrinking=keys.has('ControlLeft') || keys.has('KeyX') && state.selectedFish==='puff';

  fish.shrink+=((isShrinking? 1 : 0)- fish.shrink)*Math.min(1,dt*15);

  // screen boundary
  const currentRadius = fish.r * (state.selectedFish === 'puff' ? (1.0 - fish.shrink * 0.1) : 1.0);
  fish.x=clamp(fish.x, currentRadius, W - currentRadius);
  fish.y=clamp(fish.y, currentRadius, H - currentRadius);

  //animation tilt and wag

 fish.angle += (clamp(fish.vy * 0.0025 + fish.vx * 0.001, -0.7, 0.7) - fish.angle) * Math.min(1, dt * 10);
  fish.phase += dt * (3 + Math.hypot(fish.vx, fish.vy) / 50);

  // Tick down invincibility
  if (fish.invuln > 0) fish.invuln -= dt;

if (fish.buffs.magnet > 0) {
  fish.buffs.magnet -= dt;
  UI.magnet.style.display = fish.buffs.magnet > 0 ? 'flex' : 'none';
}

}

function drawPlayerFish() {
  const blink = fish.invuln > 0 && Math.floor(performance.now() / 100) % 2 === 0;
  
  if (!blink) {
    ctx.save(); 
    ctx.translate(fish.x, fish.y); 
    ctx.rotate(fish.angle); 
    
    const sc = fish.shrink > 0.5 ? 0.65 : 1; 
    ctx.scale(sc, sc);

  if (fish.buffs.shield > 0) {
  ctx.fillStyle = 'rgba(73, 199, 255, 0.55)'; 
  ctx.beginPath(); ctx.arc(0, 0, fish.r * 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#49c7ff'; ctx.lineWidth = 3; ctx.stroke();  
}

  if (fish.buffs.magnet > 0) {
  ctx.fillStyle = 'rgba(186, 85, 211, 0.45)';  
  ctx.beginPath(); ctx.arc(0, 0, fish.r * 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ba55d3'; ctx.lineWidth = 3; ctx.stroke(); 
}

if (state.selectedFish==='orange'){
   const tail = Math.sin(fish.phase) * 5;  
    // draw Tail
    ctx.fillStyle = '#ff7b00'; 
    ctx.beginPath(); 
    ctx.moveTo(-fish.r, 0); 
    ctx.lineTo(-fish.r*2, -fish.r*0.8 + tail); 
    ctx.lineTo(-fish.r*2, fish.r*0.8 + tail); 
    ctx.fill();
    
    // draw Body
    ctx.fillStyle = '#ff9e22'; 
    ctx.beginPath(); 
    ctx.ellipse(0, 0, fish.r*1.4, fish.r, 0, 0, Math.PI*2); 
    ctx.fill();
} else{
  const pScale=1.2-(fish.shrink * 0.1);
  ctx.scale(pScale, pScale);
  //tail
  const tail=Math.sin(fish.phase)*4;
  ctx.fillStyle='#cf3030';
  ctx.beginPath();
  ctx.moveTo(-fish.r,0);
  ctx.lineTo(-fish.r * 1.6, -fish.r * 0.5 + tail); 
  ctx.lineTo(-fish.r * 1.6, fish.r * 0.5 + tail);
  ctx.fill();

  //body
  ctx.fillStyle='#ffffff';
  ctx.beginPath();
  ctx.beginPath();
  ctx.arc(0,0,fish.r,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle='#cf3030';
  ctx.beginPath();
  ctx.arc(0,0,fish.r,Math.PI,0);
  ctx.fill();

  //spikes
  if (fish.shrink < 0.3) {
    ctx.strokeStyle = '#cf3030';
    ctx.lineWidth = 2;
    for (let a = Math.PI; a <= Math.PI * 2; a += Math.PI / 5) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * fish.r, Math.sin(a) * fish.r);
      ctx.lineTo(Math.cos(a) * (fish.r + 6), Math.sin(a) * (fish.r + 6));
      ctx.stroke();
    }
  }
}
    
    // ko eyes
    if (fish.hp <= 0) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(fish.r * 0.4, -fish.r * 0.15); 
      ctx.lineTo(fish.r * 0.8, -fish.r * 0.45);
      ctx.moveTo(fish.r * 0.4, -fish.r * 0.45); 
      ctx.lineTo(fish.r * 0.8, -fish.r * 0.15);
      ctx.stroke();
    } else {
      // normal Eyes
      ctx.fillStyle = '#fff'; 
      ctx.beginPath(); 
      ctx.arc(fish.r*0.6, -fish.r*0.3, fish.r*0.3, 0, Math.PI*2); 
      ctx.fill();
      ctx.fillStyle = '#000'; 
      ctx.beginPath(); 
      ctx.arc(fish.r*0.7, -fish.r*0.3, fish.r*0.15, 0, Math.PI*2); 
      ctx.fill();
    }
    
    ctx.restore();
  }
}