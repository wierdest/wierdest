document.addEventListener('DOMContentLoaded', () => {
	const statusElement = document.getElementById('status');
	const canvasElement = document.getElementById('board');
	const ctx = canvasElement.getContext('2d');
	// Connect to our play Namespace
	const socket = io("/game/play");

	// Store game's working data in the client side
	let myId = undefined;
	const positions = {};
	const rotations = {};
	// Array to store the bullets
	const projectiles = [];
	const renderer = new GameRenderer(ctx, canvasElement.width, canvasElement.height);

	let rotationAngle = 0;
	const rotationSpeed = 0.05;

	socket.on('init', (data) => {
		statusElement.textContent = `You're user ${data.userId}`;
		myId = data.userId;
	});

	socket.on('updatePlayers', (data) => {
		
		// sync the positions with the players that are really there
		Object.keys(positions).forEach(userId => {
			if (!data[userId]) {
			  delete positions[userId];
			  delete rotations[userId];
			}
		});

		// apply the date to positions and rotations
		Object.keys(data).forEach(userId => {
			positions[userId] = data[userId].pos;
			rotations[userId] = data[userId].rotation;
		});
	});

	socket.on('updateProjectiles', (data) => {
		// Simply replace the local projectiles array with the data from the server
		projectiles.length = 0;
		data.forEach(proj => projectiles.push(proj));
	});

	canvasElement.addEventListener('mousemove', (event) => {
		const rect = canvasElement.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		// Emite o signal de update para o server atualizar a posição do jogador no objeto players
		socket.emit('update', { pos: { x, y }, rotation: rotationAngle });
		rotationAngle += rotationSpeed;

		if (rotationAngle >= 2 * Math.PI) {
			rotationAngle -= 2 * Math.PI; 
		}
	});

	canvasElement.addEventListener('click', () => {
		if (myId) {
			// Get the player's current position and rotation
			const playerPos = positions[myId];
			const playerRotation = rotations[myId];

			// Calculate the firing position based on the player's nose (arm)
			const playerRadius = 10;
			const noseSize = 5;
			const firingPos = {
				x: playerPos.x + Math.cos(playerRotation) * (playerRadius + noseSize / 2),
				y: playerPos.y + Math.sin(playerRotation) * (playerRadius + noseSize / 2),
			};

			// Create the projectile data
			const proj = { pos: firingPos, rotation: playerRotation, ownerId: myId };

			// Emit the 'fire' event with the projectile data
			socket.emit('fire', proj);
			console.log('FIRED!!');
		}
	});

	function draw() {
		renderer.clearCanvas();
		drawPlayers();
		drawProjectiles(); // Just draw the projectiles now
	}

	function drawPlayers() {
		Object.keys(positions).forEach(userId => {
			const { x, y } = positions[userId];
			const rotation = rotations[userId] || 0;
			renderer.drawPlayer(x, y, userId === myId, rotation);
		});
	}

	function drawProjectiles() {
		projectiles.forEach(proj => {
			renderer.drawProjectile(proj.pos.x, proj.pos.y, proj.rotation);
		});
	}

	function gameLoop() {
		draw();
		requestAnimationFrame(gameLoop);
	}

	gameLoop();
});
