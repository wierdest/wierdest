document.addEventListener('DOMContentLoaded', () => {
    const statusElement = document.getElementById('status');
    const playersList = document.getElementById('playersList');
    const roomSelect = document.getElementById('roomSelect');

    const socket = io('/game/lobby');

    socket.on('lobbyInit',  (data) => {
		  statusElement.textContent = `You're user ${data.userId}`;
	  	myId = data.userId;
      // client stores the userId generated in the lobby
      localStorage.setItem('userId', data.userId);
    
	});

    socket.on('updatePlayersList', (players) => {
        playersList.innerHTML = '';
        // recreate the list
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `Player ID: ${player.userId}`;
            playersList.appendChild(li);
        });
    });
  
    // Join queue button handler
    document.getElementById('joinGameButton').addEventListener('click', () => {
      const gameType = roomSelect.value;
      location.href = `/game/play/${gameType}`;
    });
  });