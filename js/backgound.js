// enivornment
function drawBackground(){
    const bgGrad=ctx.createLinearGradient(0,0,0,H);
    bgGrad.addColorStop(0,'#6fc9fe');
    bgGrad.addColorStop(1,'#075786');    // top blue 

    ctx.fillStyle=bgGrad;
    ctx.fillRect(0,0,W,H);
}