const segmentWidth = 80;

function spawnSegment(x) {
  const index = state.segmentCount++;
  
  // create a wavy gap that moves up and down
  const wave = Math.sin((x + world.scroll) * 0.007) * 40;
  const gap = 260; // opening wide 
  const cY = (H * 0.5) + wave + rand(-20, 20); // The center Y position of the gap
  
  entities.segments.push({ x, w: segmentWidth, cY, gap });
  // spawn Jellyfish 
  if (Math.random() < 0.15 && index > 5) {
    entities.jellyfish.push({
      x: x + segmentWidth / 2,
      y: cY + rand(-40, 40),   
      r: 15,                   
      phase: rand(0, Math.PI * 2) 
    });
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
  
  ctx.restore();
}
// collision detection 
function checkWallCollisions() {
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
    if (x < -50 || x > W + 50) return; // do not draw if off screen

    ctx.save();
    ctx.translate(x, j.y);
    
    // glowing neon pink effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f526f5';
    ctx.fillStyle = 'rgba(255, 77, 255, 0.8)';
    
    // draw Jellyfish Dome
    ctx.beginPath();
    ctx.arc(0, 0, j.r, Math.PI, 0);
    ctx.fill();
    
    // draw Tentacles
    ctx.strokeStyle = 'rgba(255, 77, 255, 0.6)';
    ctx.lineWidth = 2;
    for(let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 4, 0);
      // make the tentacles wiggle using Math.sin
      ctx.lineTo(i * 5 + Math.sin(performance.now() * 0.005 + j.phase) * 4, j.r * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  });
}

function checkJellyCollisions() {
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