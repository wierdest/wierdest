document.addEventListener('DOMContentLoaded', () => {
	const statusElement = document.getElementById('status');
	const ws = new WebSocket('ws://' + window.location.host);

	ws.onopen = () => {
		statusElement.textContent = 'Connected';
	};

	ws.onmessage = (event) => {
		const data = JSON.parse(event.data);

		if (data.type === 'init') {
			statusElement.textContent = `You're user ${data.userId}`;
		} else {
			console.log('Message from server', event.data);
		}
	};

	ws.onclose = () => {
		statusElement.textContent = 'Disconnected';
	};

	ws.onerror = (error) => {
		console.error('WebSocket Error: ', error);
	};

	// Send a message to the WebSocket server
	function sendMessage(message) {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(message);
		}
	}

	// Example usage
	sendMessage('Hello, WebSocket!');
});
