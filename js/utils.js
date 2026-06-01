const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });

let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

// Math helpers 
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => Math.random() * (max - min) + min;