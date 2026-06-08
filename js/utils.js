const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });

let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

const UI = {
  distance: document.getElementById('distance'),
  pearls: document.getElementById('pearls'),
  finalDistance: document.getElementById('finalDistance'),
  finalPearls: document.getElementById('finalPearls'),
  hp: document.getElementById('hpBar'),
  menu: document.getElementById('menuScreen'),
  gameOver: document.getElementById('gameOverScreen'),
  stage:document.getElementById('stageIndicator')
};

// Math helpers 
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => Math.random() * (max - min) + min;

// background fish and turtles
const world={speed:280, scroll:0, difficulty:0};

// Added state to track the phases. 
let state = {
  segmentCount: 0, 
  phase: 'ocean' ,
  score:0,
  screenShake:0
};

const entities={bgFish:[], turtles:[],segments:[],jellyfish:[],pearls:[],particles:[]};

const fish = {
    x: W * 0.25,
    y: H * 0.5,
    vx: 0,
    vy: 0,
    r: 18,
    dashCd: 0,   // cooldown after dash
    dashT: 0,    // dash time
    shrink: 0,   //shrink ability
    angle: 0,   //  tilting up and down
    phase: 0 ,   // tail wagging 
    hp:3,
    maxHp:3,
    invuln:0
};

function updateArray(arr,fn){
    for(let i=arr.length-1;i>=0;i--){
        if(!fn(arr[i],i )) arr.splice(i,1);
    }
}