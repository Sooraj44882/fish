const segmentWidth = 80;

function spawnSegment(x) {
  const index = state.segmentCount++;
  
  // create a wavy gap that moves up and down
  const wave = Math.sin((x + world.scroll) * 0.007) * 40;
  const gap = 260; // opening wide 
  const cY = (H * 0.5) + wave + rand(-20, 20); // The center Y position of the gap
  
  entities.segments.push({ x, w: segmentWidth, cY, gap });
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