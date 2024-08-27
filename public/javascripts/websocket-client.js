
document.addEventListener('DOMContentLoaded', () => {
	const statusElement = document.getElementById('status');
	const canvasElement = document.getElementById('board');
	const ctx = canvasElement.getContext('2d');
	const socket = io();
  
	let myId = undefined;
	const positions = {};
  
	socket.on('init', (data) => {
	  statusElement.textContent = `You're user ${data.userId}`;
	  myId = data.userId;
	});
  
	socket.on('draw', (data) => {
	  positions[data.userId] = data.pos;
	  drawAllPlayers();
	});
  
	canvasElement.addEventListener('mousemove', (event) => {
	  const rect = canvasElement.getBoundingClientRect();
	  const x = event.clientX - rect.left;
	  const y = event.clientY - rect.top;
	  socket.emit('pos', { x, y });
	});
  
	function drawAllPlayers() {
	  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
	  Object.keys(positions).forEach(userId => {
		const { x, y } = positions[userId];
		drawPlayer(x, y, userId === myId);
	  });
	}
  
	function drawPlayer(x, y, isMe) {
	  ctx.beginPath();
	  ctx.arc(x, y, 10, 0, 2 * Math.PI);
	  ctx.fillStyle = isMe ? 'blue' : 'red';
	  ctx.fill();
	  ctx.closePath();
	}
  });
  