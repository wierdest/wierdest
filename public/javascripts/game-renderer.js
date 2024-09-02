class GameRenderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;

        // Angle for rotation will be managed individually for each player
        this.rotationAngle = 0;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawPlayer(x, y, isMe, rotation) {
        const playerRadius = 10;
        const noseSize = 5;

        // Save the context state
        this.ctx.save();
        
        // Move the context to the player's position
        this.ctx.translate(x, y);
        
        // Apply rotation
        this.ctx.rotate(rotation);
        
        // Draw the player circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, playerRadius, 0, 2 * Math.PI);
        this.ctx.fillStyle = isMe ? 'blue' : 'red';
        this.ctx.fill();
        this.ctx.closePath();
        
        // Draw the nose (small square)
        const noseX = playerRadius + noseSize / 2;
        const noseY = 0;
        this.ctx.fillStyle = isMe ? 'darkblue' : 'darkred'; // Nose color
        this.ctx.fillRect(noseX - noseSize / 2, noseY - noseSize / 2, noseSize, noseSize);
        
        // Restore the context state
        this.ctx.restore();

        // Return the position of the nose to use for projectile firing
        return {
            x: x + Math.cos(rotation) * (playerRadius + noseSize / 2),
            y: y + Math.sin(rotation) * (playerRadius + noseSize / 2)
        };
    }

    drawProjectile(x, y, rotation) {
        const projectileSize = 5;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
    
        this.ctx.beginPath();
        this.ctx.arc(0, 0, projectileSize, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
        this.ctx.closePath();
    
        this.ctx.restore();
    }
}
window.GameRenderer = GameRenderer;
