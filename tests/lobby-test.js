const io = require('socket.io-client');
const readline = require('readline');

let clients = [];

// Function to add a client to the lobby
function addClient() {
  const client = io('http://localhost:3000/game/lobby'); // Connect to the lobby namespace
  client.on('connect', () => {
    console.log('Client connected to the lobby');
    
    // Store client in the list
    clients.push(client);

    client.on('lobbyInit', (data) => {
      console.log(`Received lobbyInit, assigned userId: ${data.userId}`);
    });

    client.on('disconnect', () => {
      console.log('Client disconnected from the lobby');
    });
  });
}

// Function to add multiple clients
function addMultipleClients(num) {
  for (let i = 0; i < num; i++) {
    addClient();
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const QUESTION = `Insert the number of players to add and press enter. Press 'q' to quit.\n`;

function handleUserInput() {
  rl.question(QUESTION, (input) => {
    if (input.toLowerCase() === 'q') {
      rl.close();
      // Close all clients
      clients.forEach(client => client.close());
      process.exit(0); // Exit the script
    } else {
      const numPlayers = parseInt(input);
      if (!isNaN(numPlayers) && numPlayers > 0) {
        addMultipleClients(numPlayers);
      } else {
        console.log('Invalid input. Please enter a valid number.');
      }
      handleUserInput(); // Continue asking for input
    }
  });
}

// Start the interactive test
handleUserInput();
