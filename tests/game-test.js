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
  let angle = 0;


  // Function to update client position
  const updatePositionAndRotation = () => {
    const now = Date.now();
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / MOVE_DURATION, 1);

    // Linear interpolation between pointA and pointB
    const x = pointA.x + (pointB.x - pointA.x) * progress;
    const y = pointA.y + (pointB.y - pointA.y) * progress;

    angle += ROTATION_SPEED;
    if (angle >= 2 * Math.PI) {
      angle -= 2 * Math.PI; 
    }

    client.emit('update', { pos: { x, y }, rotation: angle });

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
    client.emit("update", {pos: pos, rotation: 0})
    clients.push(client);

    moveClient(client);
  });


}

const QUESTION = `Press "a" to add a client or "q" to quit.\n`

function handleUserInput() {
  rl.question(QUESTION, (input) => {
    if (input === 'a') {
      addClient();
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
