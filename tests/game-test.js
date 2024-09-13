const io = require('socket.io-client');
const readline = require('readline');
const uuid = require('uuid');


const WIDTH = 600;
const HEIGHT = 500;
const MOVE_DURATION = 5000; 
const UPDATE_INTERVAL = 50;
const ROTATION_SPEED = 0.05;

function getRandomPos() {
  return {
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
  }
}

function moveClient(client) {
  let pointA = getRandomPos();
  let pointB = getRandomPos();
  let startTime = Date.now();
  let angle = client.rotation;
  
  // store the client position 
  client.lastPosition = pointA;

  // Function to update client position
  const updatePositionAndRotation = () => {
    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / MOVE_DURATION, 1);

    // Linear interpolation between pointA and pointB
    const x = pointA.x + (pointB.x - pointA.x) * progress;
    const y = pointA.y + (pointB.y - pointA.y) * progress;

    client.lastPosition = { x, y }

    // store the last position
    // angle += ROTATION_SPEED;
    // if (angle >= 2 * Math.PI) {
    //   angle -= 2 * Math.PI; 
    // }

    client.rotation = angle;

    client.emit('update', { pos: { x, y }, rotation: client.rotation });

    if (progress < 1) {
      setTimeout(updatePositionAndRotation, UPDATE_INTERVAL);
    } else {
      // Swap points and restart movement
      pointA = pointB;
      pointB = getRandomPos();
      startTime = Date.now();
      updatePositionAndRotation();
    }
  };

  // Start the movement
  updatePositionAndRotation();
}

function fire(shooter) {
  const shooterPos = shooter.lastPosition;
  const shooterRot = shooter.rotation;

  const playerRadius = 10;
  const noseSize = 5;

  const firingPos = {
    x: shooterPos.x + Math.cos(shooterRot) * (playerRadius + noseSize / 2),
    y: shooterPos.y + Math.sin(shooterRot) * (playerRadius + noseSize / 2)
  }

  // create a projectile
  const projectile = {
    pos: firingPos,
    rotation: shooter.rotation,
    ownerId: shooter.userId
  }

  shooter.emit('fire', projectile)

}

function calculateRotationTowardsTarget(shooterPos, targetPos) {
  const dx = targetPos.x - shooterPos.x;
  const dy = targetPos.y - shooterPos.y;
  return Math.atan2(dy, dx);
}

function rotateTowardsTarget(shooter, target) {
  const shooterPos = shooter.lastPosition;
  const targetPos = target.lastPosition;

  // Calculate the angle the shooter needs to rotate to face the target
  const angleToTarget = calculateRotationTowardsTarget(shooterPos, targetPos);
  shooter.rotation = angleToTarget;
  shooter.emit('update', {pos: shooterPos, rotation: angleToTarget});
  console.log(`Player rotated to face target: Angle ${angleToTarget}`);


}

// creates the cli interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let clients = [];

function addClient() {
  // Generate an ID
  const userId = uuid.v4();
  console.log('USER ID GENERATED ', userId)
  const client = io('http://localhost:3000/game/play/1vs1', { query: {userId}});
  client.on('connect', () => {
    console.log('Client connected');
    const pos = getRandomPos();
    client.emit("update", {pos: pos, rotation: 0});
    client.userId = userId;
    clients.push(client);
    moveClient(client);
  });


}

const QUESTION = `

Press "q" to quit.\n
Press "a" to add a player.
Press "s" to have a player shoot a projectile

`

function handleUserInput() {
  rl.question(QUESTION, (input) => {
    if (input === 'a') {
      addClient();
      handleUserInput(); 
    } else if (input === 's') {

      if(clients.length >= 2) {
        // temporariamente o shooter é sempre o primeiro
        const shooter = clients[0];
        const target = clients[1];
        rotateTowardsTarget(shooter, target);

        fire(shooter);
      } else {
        console.log('Need at least 2 players to simulate shooting!')
      }
      handleUserInput();

    } else if (input === 'q') {
      rl.close();
      // Optionally close all clients
      clients.forEach(client => client.close());
      process.exit(0); // Exit the script
    } else {
      console.log('Invalid input');
      handleUserInput(); // Continue asking for input
    }
  });
}

// Start the interactive test
handleUserInput();
