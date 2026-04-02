const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 500;

const tapSound = document.getElementById("tapSound");

// Game state
let score = 0;
let coins = 0;
let time = 30;
let combo = 0;
let highScore = localStorage.getItem("highscore") || 0;
let gameRunning = false;

// Target
let circle = { x:200, y:250, r:40, pulse:0 };

// Particles
let particles = [];

// Background anim
let stars = [];
for (let i=0;i<50;i++){
  stars.push({
    x: Math.random()*400,
    y: Math.random()*500,
    size: Math.random()*2
  });
}

// Start game
function startGame() {
  score = 0;
  coins = 0;
  combo = 0;
  time = 30;
  gameRunning = true;
  document.getElementById("menu").style.display = "none";
}

// New target
function newTarget() {
  circle.x = Math.random()*350+25;
  circle.y = Math.random()*450+25;
}

// Tap / click
function tap(mx,my){
  if (!gameRunning) return;

  let dist = Math.hypot(mx-circle.x,my-circle.y);

  if (dist < circle.r) {
    combo++;
    let bonus = 1 + Math.floor(combo/5);
    score += bonus;
    coins += bonus;

    tapSound.currentTime = 0;
    tapSound.play();

    newTarget();
    createParticles(circle.x,circle.y);

  } else {
    combo = 0;
  }
}

// Mouse
canvas.addEventListener("click",(e)=>{
  const rect = canvas.getBoundingClientRect();
  tap(e.clientX-rect.left,e.clientY-rect.top);
});

// Touch (HP)
canvas.addEventListener("touchstart",(e)=>{
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  tap(t.clientX-rect.left,t.clientY-rect.top);
});

// Particles
function createParticles(x,y){
  for(let i=0;i<20;i++){
    particles.push({
      x,y,
      dx: Math.random()*6-3,
      dy: Math.random()*6-3,
      life: 30,
      color: `hsl(${Math.random()*360},100%,50%)`
    });
  }
}

// Timer
setInterval(()=>{
  if(gameRunning){
    time--;
    if(time<=0){
      gameRunning=false;

      if(score>highScore){
        highScore=score;
        localStorage.setItem("highscore",highScore);
      }

      alert("Game Over!\nScore: "+score+"\nHigh Score: "+highScore);
      document.getElementById("menu").style.display="block";
    }
  }
},1000);

// Draw loop
function draw(){
  ctx.clearRect(0,0,400,500);

  // Background anim
  ctx.fillStyle="black";
  ctx.fillRect(0,0,400,500);
  ctx.fillStyle="white";
  stars.forEach(s=>{
    ctx.fillRect(s.x,s.y,s.size,s.size);
    s.y+=0.5;
    if(s.y>500) s.y=0;
  });

  // Target glow + pulse
  circle.pulse += 0.1;
  let pulseSize = circle.r + Math.sin(circle.pulse)*5;

  let grad = ctx.createRadialGradient(circle.x,circle.y,10,circle.x,circle.y,pulseSize);
  grad.addColorStop(0,"#00ffff");
  grad.addColorStop(1,"#ff00ff");

  ctx.fillStyle=grad;
  ctx.beginPath();
  ctx.arc(circle.x,circle.y,pulseSize,0,Math.PI*2);
  ctx.fill();

  // Particles
  particles.forEach((p,i)=>{
    ctx.fillStyle=p.color;
    ctx.fillRect(p.x,p.y,4,4);
    p.x+=p.dx;
    p.y+=p.dy;
    p.life--;
    if(p.life<=0) particles.splice(i,1);
  });

  // UI
  ctx.fillStyle="white";
  ctx.font="16px Arial";
  ctx.fillText("Score: "+score,10,20);
  ctx.fillText("Coins: "+coins,10,40);
  ctx.fillText("Combo: x"+combo,10,60);
  ctx.fillText("Time: "+time,10,80);
  ctx.fillText("High: "+highScore,10,100);

  requestAnimationFrame(draw);
}

draw();