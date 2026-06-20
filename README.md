# DeepCaves

Imagine being a tiny fish stuck in the deep caves. You basically have to guide it through a bunch of dangerous tunnels, dodging obstacles and just trying to survive for as long as you possibly can.

![alt text](<Screenshot 2026-06-19 132525.png>)


## Play it

[Play on itch.io](https://sooraj4.itch.io/deepcaves)


## Controls

| Action | Keys |
|---|---|
| Move | WASD / Arrow keys |
| Dash | Shift / Space (orange only )|
| Shrink | Ctrl / X (puff only) |



## Characters

Pick one 

**Orange fish** : faster, has a  dash . Press shift/space. Good for reacting quickly and blasting through gaps at speed.

![orange](image.png)

**Puff fish** : slower movement, no dash. Hold Ctrl or X and the hitbox shrinks way down so you can squeeze through really tight sections.

![puff](image-1.png)



## Powerups

Two types spawn as glowing orbs in the cave:

**Shield** (blue orb) : absorbs one hit. The aura around the fish shows it's active. Breaks before your HP goes down.


**Magnet** (purple orb) : pulls nearby pearls toward you for 10 seconds. Good for building combos without chasing everything.


## Scoring

Collect white pearls to score. Pick them up in quick succession and you build a combo multiplier up to x5. Wait too long between pearls and it resets. Taking damage also resets it immediately.

---

## Stages


Open Sea : Wide open, no walls, relaxed 

![open sea](<Screenshot 2026-06-19 134507.png>)

Cave : Walls appear, jellyfish start showing up

![cave](<Screenshot 2026-06-19 134529.png>)

Deep Cave:Darker, eels on the walls shooting bolts

![daark cave](image-2.png)


## Files

```
index.html      
style.css       
js/
  utils.js     
  control.js    
  fish.js       
  backgound.js  
  obstacles.js  
  game.js       
```



## Tech

Just HTML, CSS and JS. Canvas API for all the drawing.




Made with love .Probably not perfect but I'm pretty happy with how it turned out.
