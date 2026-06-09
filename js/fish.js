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

  fish.hp--; 
  updateHealthBar(); 
  fish.invuln = 1.5; // flash for 1.5 seconds
  
  if (fish.hp <= 0 && typeof triggerGameOver === 'function') {
    triggerGameOver();
  }
}

function updateFishPhysics(dt){
    const accel=850;    
    const maxSpd=380; // speed limit
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
if(dashing && fish.dashCd<=0){
    fish.dashT=0.2;
    fish.dashCd=0.6;

    fish.vx+=fish.vx===0 && fish.vy===0? 800: Math.sign(fish.vx)*800;
    fish.vy+=Math.sign(fish.vy)*800;
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
  const isShrinking=keys.has('ControlLeft') || keys.has('KeyX');

  fish.shrink+=((isShrinking? 1 : 0)- fish.shrink)*Math.min(1,dt*15);

  // screen boundary
  const fr =fish.r*(fish.shrink>0.5? 0.65:1);
  fish.x=clamp(fish.x,fish.r,W-fish.r);
  fish.y=clamp(fish.y,fish.r,H-fish.r);

  //animation tilt and wag

 fish.angle += (clamp(fish.vy * 0.0025 + fish.vx * 0.001, -0.7, 0.7) - fish.angle) * Math.min(1, dt * 10);
  fish.phase += dt * (3 + Math.hypot(fish.vx, fish.vy) / 50);

  // Tick down invincibility
  if (fish.invuln > 0) fish.invuln -= dt;

}

function drawPlayerFish() {
  const blink = fish.invuln > 0 && Math.floor(performance.now() / 100) % 2 === 0;
  
  if (!blink) {
    ctx.save(); 
    ctx.translate(fish.x, fish.y); 
    ctx.rotate(fish.angle); 
    
    const sc = fish.shrink > 0.5 ? 0.65 : 1; 
    ctx.scale(sc, sc);

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