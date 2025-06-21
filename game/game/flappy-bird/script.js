class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        
        // Game state
        this.gameRunning = false;
        this.gameOver = false;
        this.gameStarted = false;
        this.score = 0;
        this.highScore = localStorage.getItem('flappyBirdHighScore') || 0;
        
        // Responsive canvas sizing
        this.setupResponsiveCanvas();
        
        // Bird properties
        this.bird = {
            x: 80,
            y: 300,
            width: 30,
            height: 30,
            velocity: 0,
            gravity: 0.5,
            jumpPower: -8,
            initialGravity: 0.2 // Slower gravity when game first starts
        };
        
        // Pipes
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpacing = 200;
        
        // Background
        this.clouds = [];
        this.groundY = this.canvas.height - 50;
        
        // Button properties
        this.startBtn = {
            x: 0,
            y: 0,
            width: 120,
            height: 40
        };
        
        this.restartBtn = {
            x: 0,
            y: 0,
            width: 120,
            height: 40
        };
        
        this.init();
    }
    
    setupResponsiveCanvas() {
        // Get the canvas container size
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = window.innerHeight * 0.7; // 70% of viewport height
        
        // Set canvas size based on container
        const maxWidth = Math.min(400, containerWidth - 40); // Max 400px or container width - padding
        const maxHeight = Math.min(600, containerHeight);
        
        // Maintain aspect ratio
        const aspectRatio = 400 / 600;
        let canvasWidth = maxWidth;
        let canvasHeight = maxWidth / aspectRatio;
        
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = maxHeight * aspectRatio;
        }
        
        // Set canvas size
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        // Scale game elements proportionally
        const scaleX = canvasWidth / 400;
        const scaleY = canvasHeight / 600;
        this.scale = Math.min(scaleX, scaleY);
        
        // Update game elements for new size
        this.bird.x = 80 * this.scale;
        this.bird.y = 300 * this.scale;
        this.bird.width = 30 * this.scale;
        this.bird.height = 30 * this.scale;
        this.pipeWidth = 60 * this.scale;
        this.pipeGap = 150 * this.scale;
        this.pipeSpacing = 200 * this.scale;
        this.groundY = this.canvas.height - (50 * this.scale);
        
        // Update button sizes
        this.startBtn.width = 120 * this.scale;
        this.startBtn.height = 40 * this.scale;
        this.restartBtn.width = 120 * this.scale;
        this.restartBtn.height = 40 * this.scale;
    }
    
    init() {
        this.updateHighScore();
        this.createClouds();
        this.bindEvents();
        this.draw();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupResponsiveCanvas();
            this.createClouds(); // Recreate clouds for new canvas size
        });
    }
    
    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameRunning) {
                e.preventDefault();
                this.jump();
            }
        });
        
        // Mouse controls
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleCanvasClick(e);
        });
        
        // Touch controls with better mobile support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleCanvasClick(e);
        }, { passive: false });
        
        // Prevent default touch behaviors
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    handleCanvasClick(e) {
        if (this.gameRunning) {
            this.jump();
        } else {
            // Check if click is on start or restart button
            const rect = this.canvas.getBoundingClientRect();
            let x, y;
            
            if (e.type === 'touchstart') {
                const touch = e.touches[0];
                x = touch.clientX - rect.left;
                y = touch.clientY - rect.top;
            } else {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }
            
            // Scale coordinates to canvas size
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            x *= scaleX;
            y *= scaleY;
            
            if (!this.gameStarted) {
                // Check start button
                if (x >= this.startBtn.x && x <= this.startBtn.x + this.startBtn.width &&
                    y >= this.startBtn.y && y <= this.startBtn.y + this.startBtn.height) {
                    this.startGame();
                }
            } else if (this.gameOver) {
                // Check restart button
                if (x >= this.restartBtn.x && x <= this.restartBtn.x + this.restartBtn.width &&
                    y >= this.restartBtn.y && y <= this.restartBtn.y + this.restartBtn.height) {
                    this.restartGame();
                }
            }
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.gameStarted = true;
        this.score = 0;
        this.bird.y = 300 * this.scale;
        this.bird.velocity = 0;
        this.bird.gravity = this.bird.initialGravity; // Use slower gravity initially
        this.pipes = [];
        this.createInitialPipes();
        
        this.gameLoop();
    }
    
    restartGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.score = 0;
        this.bird.y = 300 * this.scale;
        this.bird.velocity = 0;
        this.bird.gravity = this.bird.initialGravity; // Use slower gravity on restart too
        this.pipes = [];
        this.createInitialPipes();
        
        this.gameLoop();
    }
    
    jump() {
        if (this.gameRunning && !this.gameOver) {
            this.bird.velocity = this.bird.jumpPower;
            // Increase gravity to normal speed after first jump
            this.bird.gravity = 0.5;
        }
    }
    
    createInitialPipes() {
        for (let i = 0; i < 3; i++) {
            this.createPipe();
        }
    }
    
    createPipe() {
        const gapY = Math.random() * (this.canvas.height - this.pipeGap - 100 * this.scale) + 50 * this.scale;
        const pipe = {
            x: this.canvas.width + (this.pipes.length * this.pipeSpacing),
            gapY: gapY,
            passed: false
        };
        this.pipes.push(pipe);
    }
    
    createClouds() {
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 200 * this.scale + 50 * this.scale,
                size: (Math.random() * 30 + 20) * this.scale,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Update pipes
        this.pipes.forEach(pipe => {
            pipe.x -= 2 * this.scale;
            
            // Check if bird passed pipe
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.updateScore();
            }
        });
        
        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x > -this.pipeWidth);
        
        // Create new pipes
        if (this.pipes.length < 3) {
            this.createPipe();
        }
        
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed * this.scale;
            if (cloud.x + cloud.size < 0) {
                cloud.x = this.canvas.width + cloud.size;
                cloud.y = Math.random() * 200 * this.scale + 50 * this.scale;
            }
        });
        
        // Check collisions
        this.checkCollisions();
    }
    
    checkCollisions() {
        // Ground collision
        if (this.bird.y + this.bird.height > this.groundY) {
            this.gameOver = true;
        }
        
        // Ceiling collision
        if (this.bird.y < 0) {
            this.bird.y = 0;
            this.bird.velocity = 0;
        }
        
        // Pipe collisions
        this.pipes.forEach(pipe => {
            if (this.bird.x < pipe.x + this.pipeWidth &&
                this.bird.x + this.bird.width > pipe.x) {
                
                if (this.bird.y < pipe.gapY || 
                    this.bird.y + this.bird.height > pipe.gapY + this.pipeGap) {
                    this.gameOver = true;
                }
            }
        });
        
        if (this.gameOver) {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameRunning = false;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('flappyBirdHighScore', this.highScore);
            this.updateHighScore();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.drawClouds();
        
        // Draw pipes
        this.drawPipes();
        
        // Draw ground
        this.drawGround();
        
        // Draw bird
        this.drawBird();
        
        // Draw appropriate overlay based on game state
        if (!this.gameStarted) {
            this.drawStartScreen();
        } else if (this.gameOver) {
            this.drawGameOver();
        }
        
        requestAnimationFrame(() => this.draw());
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawPipes() {
        this.ctx.fillStyle = '#228B22';
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.gapY + this.pipeGap, this.pipeWidth, this.canvas.height - pipe.gapY - this.pipeGap);
            
            // Pipe caps
            this.ctx.fillStyle = '#006400';
            this.ctx.fillRect(pipe.x - 5 * this.scale, pipe.gapY - 20 * this.scale, this.pipeWidth + 10 * this.scale, 20 * this.scale);
            this.ctx.fillRect(pipe.x - 5 * this.scale, pipe.gapY + this.pipeGap, this.pipeWidth + 10 * this.scale, 20 * this.scale);
            this.ctx.fillStyle = '#228B22';
        });
    }
    
    drawGround() {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
        // Grass
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 10 * this.scale);
    }
    
    drawBird() {
        // Bird body
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.ellipse(this.bird.x + this.bird.width/2, this.bird.y + this.bird.height/2, 
                        this.bird.width/2, this.bird.height/2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird wing
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.ellipse(this.bird.x + this.bird.width/2 - 5 * this.scale, this.bird.y + this.bird.height/2 - 5 * this.scale, 
                        8 * this.scale, 5 * this.scale, Math.PI/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird eye
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + this.bird.width - 8 * this.scale, this.bird.y + 8 * this.scale, 3 * this.scale, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird beak
        this.ctx.fillStyle = '#FF6347';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x + this.bird.width, this.bird.y + this.bird.height/2);
        this.ctx.lineTo(this.bird.x + this.bird.width + 8 * this.scale, this.bird.y + this.bird.height/2 - 3 * this.scale);
        this.ctx.lineTo(this.bird.x + this.bird.width + 8 * this.scale, this.bird.y + this.bird.height/2 + 3 * this.scale);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawStartScreen() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game title
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${36 * this.scale}px Montserrat`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Flappy Bird', this.canvas.width/2, this.canvas.height/2 - 80 * this.scale);
        
        // Instructions
        this.ctx.font = `${16 * this.scale}px Montserrat`;
        this.ctx.fillText('Tap untuk terbang', this.canvas.width/2, this.canvas.height/2 - 40 * this.scale);
        this.ctx.fillText('Hindari pipa dan jangan jatuh ke tanah', this.canvas.width/2, this.canvas.height/2 - 20 * this.scale);
        
        // Draw start button
        this.drawStartButton();
    }
    
    drawStartButton() {
        // Calculate button position (center of canvas)
        this.startBtn.x = this.canvas.width/2 - this.startBtn.width/2;
        this.startBtn.y = this.canvas.height/2 + 20 * this.scale;
        
        // Button background
        this.ctx.fillStyle = '#3a8dde';
        this.ctx.fillRect(this.startBtn.x, this.startBtn.y, this.startBtn.width, this.startBtn.height);
        
        // Button border
        this.ctx.strokeStyle = '#5ec6fa';
        this.ctx.lineWidth = 2 * this.scale;
        this.ctx.strokeRect(this.startBtn.x, this.startBtn.y, this.startBtn.width, this.startBtn.height);
        
        // Button text
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${16 * this.scale}px Montserrat`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Start Game', this.canvas.width/2, this.startBtn.y + this.startBtn.height/2 + 5 * this.scale);
    }
    
    drawGameOver() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game over text
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${32 * this.scale}px Montserrat`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2 - 60 * this.scale);
        
        // Score text
        this.ctx.font = `${20 * this.scale}px Montserrat`;
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 - 20 * this.scale);
        
        // Draw restart button
        this.drawRestartButton();
    }
    
    drawRestartButton() {
        // Calculate button position (center of canvas)
        this.restartBtn.x = this.canvas.width/2 - this.restartBtn.width/2;
        this.restartBtn.y = this.canvas.height/2 + 20 * this.scale;
        
        // Button background
        this.ctx.fillStyle = '#3a8dde';
        this.ctx.fillRect(this.restartBtn.x, this.restartBtn.y, this.restartBtn.width, this.restartBtn.height);
        
        // Button border
        this.ctx.strokeStyle = '#5ec6fa';
        this.ctx.lineWidth = 2 * this.scale;
        this.ctx.strokeRect(this.restartBtn.x, this.restartBtn.y, this.restartBtn.width, this.restartBtn.height);
        
        // Button text
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${16 * this.scale}px Montserrat`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Restart Game', this.canvas.width/2, this.restartBtn.y + this.restartBtn.height/2 + 5 * this.scale);
    }
    
    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }
    
    updateHighScore() {
        this.highScoreElement.textContent = `High Score: ${this.highScore}`;
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.update();
            setTimeout(() => this.gameLoop(), 16); // ~60 FPS
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FlappyBird();
}); 