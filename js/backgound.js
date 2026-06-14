// spawn background random fish  and turtles
function initBackground(){
    for(let i=0;i<7;i++){
        entities.turtles.push({
            x:rand(0,W),
            y:rand(100,H-200),
            vx:rand(10,25),
            dir:Math.random() <0.5 ?1:-1,
            s:rand(0.4,0.8),
            p:rand(0,7)
        })
    }
    for(let i=0;i<40; i++){
        entities.bgFish.push({
            x:rand(0,W),
            y:rand(100,H-150),
            s:rand(0.5,1.2),
            p:rand(0,7),
            c:`hsl(${rand(0,360)},70%,60%)`,
            dir:Math.random() <0.5 ?1:-1,
            vx:rand(80,150)
        });
    }
}

//move the fish to create the parrallax effect
function updateBackgroundLogic(dt){
    updateArray(entities.bgFish,(f)=>{
        f.x += (f.vx * f.dir * dt) - (world.speed * 0.2 * dt);
        // slight up and down
        f.y+=Math.sin(performance.now()*0.002+f.p)*0.5;

        if (f.x < -200) f.x = W + 200;
        if (f.x > W + 200) f.x = -200;
    return true;
    });
}

// draw
function drawBackground(){
    const bgGrad=ctx.createLinearGradient(0,0,0,H);
    if(state.phase === 'ocean'){
    bgGrad.addColorStop(0,'#6fc9fe');
    bgGrad.addColorStop(1,'#075786');} 
    else if(state.phase === 'cave'){
    bgGrad.addColorStop(0,'#2d7cba');
    bgGrad.addColorStop(1,'#083c61');}   
    else {
    bgGrad.addColorStop(0,'#10496b');
    bgGrad.addColorStop(0.5,'#0a2a45');
    bgGrad.addColorStop(1,'#03101c');}   

    ctx.fillStyle=bgGrad;
    ctx.fillRect(0,0,W,H);

    // turtle 
    entities.turtles.forEach(t=>{
    t.x += t.vx * 0.016 * t.dir; 
   
    if (t.dir > 0 && t.x > W + 200) t.x = -200; 
    if (t.dir < 0 && t.x < -200) t.x = W + 200;
    
    ctx.save(); 
    ctx.translate(t.x, t.y + Math.sin(performance.now() * 0.001 + t.p) * 10); 
    
    ctx.scale(t.s * t.dir, t.s);
    ctx.globalAlpha = 0.4; 
    ctx.fillStyle = '#163823'; 

    ctx.beginPath(); 
    ctx.ellipse(0, 0, 25, 20, 0, 0, Math.PI * 2); 
    ctx.fill(); 
    
    ctx.beginPath(); 
    ctx.ellipse(20, -2, 8, 10, 0, 0, Math.PI * 2); 
    ctx.fill(); 
    ctx.restore();
  });

    // Draw background fish
  entities.bgFish.forEach(f => {
    ctx.save(); 
    ctx.translate(f.x, f.y); 
    ctx.scale(f.s * f.dir, f.s);
    ctx.globalAlpha = 0.5; // Make them slightly transparent to look far away
    
    // Body
    ctx.fillStyle = f.c; 
    ctx.beginPath(); 
    ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2); 
    ctx.fill(); 
    
    // Tail
    ctx.beginPath(); 
    ctx.moveTo(-10, 0); 
    ctx.lineTo(-20, -6); 
    ctx.lineTo(-20, 6); 
    ctx.fill(); 
    
    ctx.restore();
    });
}