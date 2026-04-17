const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = {};
let items = [];
let projectiles = [];

let clans = { red: { score: 0 }, blue: { score: 0 } };

let boss = {
  x: 800,
  y: 800,
  hp: 500,
  maxHp: 500,
  phase: 1
};

let zone = { x: 1000, y: 1000, r: 800 };

// spawn loot
setInterval(() => {
  if (items.length < 10) {
    items.push({
      id: Math.random(),
      x: Math.random() * 1200,
      y: Math.random() * 1200,
      type: ["sword","firebook","bow"][Math.floor(Math.random()*3)]
    });
  }
  io.emit("items", items);
}, 3000);

// game loop
setInterval(() => {

  // zone shrink
  if(zone.r > 200) zone.r -= 0.5;

  // boss AI
  if(boss.hp < 250) boss.phase = 2;

  boss.x += (Math.random()-0.5)*(boss.phase===1?2:5);
  boss.y += (Math.random()-0.5)*(boss.phase===1?2:5);

  for(let id in players){
    let p = players[id];

    let dx = p.x - boss.x;
    let dy = p.y - boss.y;
    let dist = Math.sqrt(dx*dx+dy*dy);

    if(dist < 120){
      p.hp -= boss.phase===1?0.5:1.5;
    }

    // zone damage
    let dzx = p.x - zone.x;
    let dzy = p.y - zone.y;
    let d = Math.sqrt(dzx*dzx+dzy*dzy);

    if(d > zone.r) p.hp -= 0.5;
  }

  // projectiles
  projectiles.forEach(pr=>{
    pr.x += pr.vx;
    pr.y += pr.vy;

    for(let id in players){
      let p = players[id];
      let dx = p.x - pr.x;
      let dy = p.y - pr.y;
      let dist = Math.sqrt(dx*dx+dy*dy);

      if(dist < 20){
        p.hp -= 15;
        pr.hit = true;
      }
    }

    // boss hit
    let dx = boss.x - pr.x;
    let dy = boss.y - pr.y;
    let dist = Math.sqrt(dx*dx+dy*dy);

    if(dist < 60){
      boss.hp -= 10;
      pr.hit = true;
    }
  });

  projectiles = projectiles.filter(p=>!p.hit);

  io.emit("players", players);
  io.emit("boss", boss);
  io.emit("zone", zone);
  io.emit("projectiles", projectiles);

}, 100);

// socket
io.on("connection", (socket) => {

  players[socket.id] = {
    x: Math.random()*1000,
    y: Math.random()*1000,
    hp: 100,
    team: Math.random()>0.5?"red":"blue",
    weapon: null
  };

  socket.on("move",(d)=>{
    let p = players[socket.id];
    if(!p) return;

    p.x += d.x;
    p.y += d.y;

    io.emit("players", players);
  });

  socket.on("joinTeam",(t)=>{
    if(players[socket.id]) players[socket.id].team = t;
  });

  socket.on("pickup",()=>{
    let p = players[socket.id];
    if(!p) return;

    items = items.filter(i=>{
      let dx = i.x - p.x;
      let dy = i.y - p.y;
      let dist = Math.sqrt(dx*dx+dy*dy);

      if(dist < 40){
        p.weapon = i.type;
        return false;
      }
      return true;
    });

    io.emit("items", items);
  });

  socket.on("attack",(data)=>{
    let attacker = players[socket.id];
    if(!attacker) return;

    for(let id in players){
      let p = players[id];
      if(id===socket.id) continue;
      if(p.team===attacker.team) continue;

      let dx = p.x - attacker.x;
      let dy = p.y - attacker.y;
      let dist = Math.sqrt(dx*dx+dy*dy);

      if(dist < 60){
        p.hp -= data.damage;

        if(p.hp <= 0){
          clans[attacker.team].score++;
          p.hp = 100;
          p.x = Math.random()*1000;
          p.y = Math.random()*1000;
        }
      }
    }
  });

  socket.on("skill",(s)=>{
    let p = players[socket.id];
    if(!p) return;

    if(s.type==="fireball"){
      projectiles.push({
        x:p.x,
        y:p.y,
        vx:s.dirX*6,
        vy:s.dirY*6
      });
    }

    if(s.type==="teleport"){
      p.x += s.dirX*120;
      p.y += s.dirY*120;
    }

    if(s.type==="ultimate"){
      for(let id in players){
        if(id!==socket.id){
          let p2 = players[id];
          let dx = p2.x - p.x;
          let dy = p2.y - p.y;
          let dist = Math.sqrt(dx*dx+dy*dy);

          if(dist<150) p2.hp -= 25;
        }
      }
    }
  });

  socket.on("disconnect",()=>{
    delete players[socket.id];
  });

});

http.listen(3000, ()=>console.log("RUNNING"));