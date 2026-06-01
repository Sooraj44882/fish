//fish

const fish={
    x:W*0.25,
    y:H*0.5,
    vx:0,
    vy:0,
    r:18
};

function updateFishPhysics(dt){
    const accel=850;    
    const maxSpd=380; // speed limit
    const drag=0.88;    //water friction

    let ax=0,ay=0;

//calculate acce;ration
if(keys.has('ArrowUp') ||keys.has('keyW')) ay-=accel;
if(keys.has('ArrowDown') || keys.has('keyS')) ay+=accel;
if(keys.has('ArrowLeft') || keys.has('keyA')) ax-=accel;
if(keys.has('ArrowRight') || keys.has('keyD')) ax+=accel;

// change velocity according to accelration
fish.vx +=ax*dt;
fish.vy +=ay*dt;

//apply water friction 
    const frict=Math.pow(drag,dt*60);
    fish.vx *=frict;
    fish.vy *=frict;

// enforce the speed limit
  fish.vx = clamp(fish.vx, -maxSpd, maxSpd); 
  fish.vy = clamp(fish.vy, -maxSpd, maxSpd);

  // fish coordinates
  fish.x +=fish.vx*dt;
  fish.y +=fish.vy*dt;

  // screen boundary
  fish.x=clamp(fish.x,fish.r,W-fish.r);
  fish.y=clamp(fish.y,fish.r,H-fish.r)
}

function drawPlayerFish(){
    ctx.save();
    ctx.translate(fish.x,fish.y);

    // draw an orange elliplse shape for prototype
    ctx.fillStyle = '#ff9e22'; 
    ctx.beginPath(); 
    ctx.ellipse(0, 0, fish.r * 1.4, fish.r, 0, 0, Math.PI * 2); 
    ctx.fill();
  
    ctx.restore();
}