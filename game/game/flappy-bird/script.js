class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');

        // Game state
        this.gameState = 'menu'; // 'menu', 'playing', 'gameOver'
        this.score = 0;
        this.highScore = localStorage.getItem('flappyBirdHighScore') || 0;
        this.highScoreElement.textContent = this.highScore;

        // Bird properties
        this.initialGravity = 0.25; // lebih lambat di awal
        this.normalGravity = 0.5;   // gravity normal
        this.bird = {
            x: 80,
            y: 300,
            width: 30,
            height: 30,
            velocity: 0,
            gravity: this.normalGravity,
            jumpPower: -8
        };

        // Pipe properties
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpacing = 200;
        this.pipeSpeed = 2;

        // Game settings
        this.groundY = this.canvas.height - 50;
        this.ceilingY = 0;

        // Event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameState === 'playing') {
                e.preventDefault();
                this.jump();
            }
        });

        // Mouse/touch controls
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.jump();
            }
        });

        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.jump();
            }
        });

        // Button controls
        this.startBtn.addEventListener('click', () => {
            this.startGame();
        });

        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
    }

    jump() {
        this.bird.velocity = this.bird.jumpPower;
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.bird.y = 300;
        this.bird.velocity = 0;
        this.pipes = [];
        this.overlay.style.display = 'none';
        
        // Gravity lambat di awal
        this.bird.gravity = this.initialGravity;
        setTimeout(() => {
            this.bird.gravity = this.normalGravity;
        }, 1000);
        // Create initial pipes
        this.createPipe();
    }

    restartGame() {
        this.startGame();
    }

    gameOver() {
        this.gameState = 'gameOver';
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('flappyBirdHighScore', this.highScore);
            this.highScoreElement.textContent = this.highScore;
        }

        // Show game over overlay
        this.overlayTitle.textContent = 'Game Over!';
        this.overlayMessage.textContent = `Score: ${this.score}`;
        this.startBtn.style.display = 'none';
        this.restartBtn.style.display = 'block';
        this.overlay.style.display = 'flex';
    }

    createPipe() {
        const gapY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
        
        this.pipes.push({
            x: this.canvas.width,
            gapY: gapY,
            passed: false
        });
    }

    updatePipes() {
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;

            // Remove pipes that are off screen
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                continue;
            }

            // Check if bird passed the pipe
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.scoreElement.textContent = this.score;
            }
        }

        // Create new pipes
        if (this.pipes.length === 0 || 
            this.canvas.width - this.pipes[this.pipes.length - 1].x >= this.pipeSpacing) {
            this.createPipe();
        }
    }

    checkCollision() {
        // Check ground and ceiling collision
        if (this.bird.y + this.bird.height >= this.groundY || this.bird.y <= this.ceilingY) {
            return true;
        }

        // Check pipe collision
        for (const pipe of this.pipes) {
            const birdRight = this.bird.x + this.bird.width;
            const birdLeft = this.bird.x;
            const birdTop = this.bird.y;
            const birdBottom = this.bird.y + this.bird.height;
            
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + this.pipeWidth;
            const pipeTop = pipe.gapY;
            const pipeBottom = pipe.gapY + this.pipeGap;

            if (birdRight > pipeLeft && birdLeft < pipeRight) {
                if (birdTop < pipeTop || birdBottom > pipeBottom) {
                    return true;
                }
            }
        }

        return false;
    }

    update() {
        if (this.gameState !== 'playing') return;

        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;

        // Update pipes
        this.updatePipes();

        // Check collision
        if (this.checkCollision()) {
            this.gameOver();
        }
    }

    drawBird() {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
        
        // Bird eye
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.bird.x + 20, this.bird.y + 5, 5, 5);
        
        // Bird beak
        this.ctx.fillStyle = '#FF6B35';
        this.ctx.fillRect(this.bird.x + 25, this.bird.y + 10, 8, 5);
    }

    drawPipes() {
        this.ctx.fillStyle = '#228B22';
        
        for (const pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.gapY + this.pipeGap, this.pipeWidth, this.canvas.height - (pipe.gapY + this.pipeGap));
            
            // Pipe caps
            this.ctx.fillStyle = '#006400';
            this.ctx.fillRect(pipe.x - 5, pipe.gapY - 20, this.pipeWidth + 10, 20);
            this.ctx.fillRect(pipe.x - 5, pipe.gapY + this.pipeGap, this.pipeWidth + 10, 20);
            this.ctx.fillStyle = '#228B22';
        }
    }

    drawGround() {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
        // Grass on ground
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 10);
    }

    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(50, 80, 20, 0, Math.PI * 2);
        this.ctx.arc(70, 80, 25, 0, Math.PI * 2);
        this.ctx.arc(90, 80, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(300, 120, 15, 0, Math.PI * 2);
        this.ctx.arc(320, 120, 20, 0, Math.PI * 2);
        this.ctx.arc(340, 120, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw pipes
        this.drawPipes();
        
        // Draw ground
        this.drawGround();
        
        // Draw bird
        this.drawBird();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FlappyBird();
}); 