//fish

const fish={
    x:W*0.25,
    y:H*0.5,
    vx:0,
    vy:0,
    r:18,
    dashCd:0,  // cooldown after dash
    dashT:0,    // dash time
    shrink:0      //shrink ability
};

function updateFishPhysics(dt){
    const accel=850;    
    const maxSpd=380; // speed limit
    const drag=0.88;    //water friction

    let ax=0,ay=0;

//calculate accelration
if(keys.has('ArrowUp') ||keys.has('keyW')) ay-=accel;
if(keys.has('ArrowDown') || keys.has('keyS')) ay+=accel;
if(keys.has('ArrowLeft') || keys.has('keyA')) ax-=accel;
if(keys.has('ArrowRight') || keys.has('keyD')) ax+=accel;

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
  fish.x=clamp(fish.x,fish.r,W-fish.r);
  fish.y=clamp(fish.y,fish.r,H-fish.r);
}

function drawPlayerFish(){
    ctx.save();
    ctx.translate(fish.x,fish.y);

    // shrink the size down to 65%
    const sc=fish.shrink>0.5?0.65:1;
    ctx.scale(sc,sc);
    // draw an orange elliplse shape for prototype
    ctx.fillStyle = '#ff9e22'; 
    ctx.beginPath(); 
    ctx.ellipse(0, 0, fish.r * 1.4, fish.r, 0, 0, Math.PI * 2); 
    ctx.fill();
  
    ctx.restore();
}