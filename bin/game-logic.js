// javascripts/game-logic.js

const projectileSpeed = 5;

let gameLoopInterval = null;

function moveAndCleanProjectiles(projectiles, boardWidth, boardHeight) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    proj.pos.x += Math.cos(proj.rotation) * projectileSpeed;
    proj.pos.y += Math.sin(proj.rotation) * projectileSpeed;

    if (proj.pos.x < 0 || proj.pos.x > boardWidth || proj.pos.y < 0 || proj.pos.y > boardHeight) {
      projectiles.splice(i, 1);
    }
  }
}

function dealWithDeaths(players, projectiles, playerRadius, gameNamespace) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    const projOwner = proj.ownerId;

    Object.keys(players).forEach(playerId => {
      const player = players[playerId];
      const distance = Math.hypot(proj.pos.x - player.pos.x, proj.pos.y - player.pos.y);

      if (distance < playerRadius) {
        if (projOwner === playerId) {
          gameNamespace.emit('suicide', { playerId });
          console.log(`Player ID ${playerId} committed suicide`);
        } else {
          gameNamespace.emit('killed', { killedId: playerId, killerId: projOwner });
          console.log(`Player ID ${playerId} was killed by ${projOwner}`)
        }
        projectiles.splice(i, 1);
      }
    });
  }
}

function dealWithPlayerCollisions(players, playerRadius) {
  const playerIds = Object.keys(players);
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      const playerA = players[playerIds[i]];
      const playerB = players[playerIds[j]];
      const distance = Math.hypot(playerA.pos.x - playerB.pos.x, playerA.pos.y - playerB.pos.y);

      if (distance < playerRadius * 2) {
        const overlap = (playerRadius * 2) - distance;
        const dx = (playerB.pos.x - playerA.pos.x) / distance;
        const dy = (playerB.pos.y - playerA.pos.y) / distance;

        playerA.pos.x -= dx * overlap / 2;
        playerA.pos.y -= dy * overlap / 2;
        playerB.pos.x += dx * overlap / 2;
        playerB.pos.y += dy * overlap / 2;
      }
    }
  }
}

function startGameLoop(players, projectiles, playerRadius, boardWidth, boardHeight, gameNamespace) {
  if (!gameLoopInterval) {
    gameLoopInterval = setInterval(() => {
      dealWithPlayerCollisions(players, playerRadius);
      moveAndCleanProjectiles(projectiles, boardWidth, boardHeight);
      dealWithDeaths(players, projectiles, playerRadius, gameNamespace);
      gameNamespace.emit('updateProjectiles', projectiles); // Broadcast updated projectiles to all clients
    }, 1000 / 60); // 60 fps
    console.log('Game loop started');
  }
}

function stopGameLoop(activePlayers) {
  if (gameLoopInterval && activePlayers === 0) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
    console.log('Game loop stopped');
  }
}

module.exports = {
  moveAndCleanProjectiles,
  dealWithDeaths,
  dealWithPlayerCollisions,
  startGameLoop,
  stopGameLoop
};
