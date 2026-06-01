//fish

const fish={
    x:W*0.25,
    y:H*0.5,
    vx:0,
    vy:0,
    r:18
};

function updateFishPhysics(dt){
    const speed=400; // flat speed

//controls
if(keys.has('ArrowUp') ||keys.has('keyW')) fish.y-=speed*dt;
if(keys.has('ArrowDown') || keys.has('keyS')) fish.y+=speed*dt;
if(keys.has('ArrowLeft') || keys.has('keyA')) fish.x-=speed*dt;
if(keys.has('ArrowRight') || keys.has('keyD')) fish.x+=speed*dt;

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