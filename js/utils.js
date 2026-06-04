const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });

let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

// Math helpers 
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => Math.random() * (max - min) + min;

// background fish and turtles
const world={speed:280, scroll:0};

// Added state to track the phases. 
let state = {
  segmentCount: 0, 
  phase: 'start' ,
  score:0
};

const entities={bgFish:[], turtles:[],segments:[],jellyfish:[],pearls:[]};

function updateArray(arr,fn){
    for(let i=arr.length-1;i>=0;i--){
        if(!fn(arr[i],i )) arr.splice(i,1);
    }
}