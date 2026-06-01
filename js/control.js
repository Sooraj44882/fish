// a set to hold which keys are currently using pressed down 
const keys=new Set();

window.addEventListener('keydown',e=>{
//prevent aroow and spacebar key from scrolling the webpage
const preventScrollKeys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD']; 
  if(preventScrollKeys.includes(e.code)) e.preventDefault();

 keys.add(e.code);
},{passive:false});

//remove key from set 
window.addEventListener('keyup',e=>keys.delete(e.code));
