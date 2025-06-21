const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Mobile control buttons
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

const gridSize = 20;
let snake = [];
let food = {};
let score = 0;
let direction = 'right';
let changingDirection = false;
let gameRunning = false;
let gameOver = false;
let gameLoop = null;

// Responsive canvas setup
function setupResponsiveCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = window.innerHeight * 0.6; // 60% of viewport height
    
    // Set canvas size based on container
    const maxWidth = Math.min(400, containerWidth - 40);
    const maxHeight = Math.min(400, containerHeight);
    
    // Maintain aspect ratio
    const size = Math.min(maxWidth, maxHeight);
    
    canvas.width = size;
    canvas.height = size;
    
    // Update grid size proportionally
    const scale = size / 400;
    window.currentGridSize = gridSize * scale;
}

// Initialize game
function initGame() {
    snake = [{ x: 10, y: 10 }];
    score = 0;
    direction = 'right';
    changingDirection = false;
    gameOver = false;
    scoreElement.textContent = 'Score: 0';
    createFood();
    drawGame();
}

// Start game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameOver = false;
        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        gameLoop = setInterval(main, 100);
    }
}

// Restart game
function restartGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    initGame();
    startBtn.style.display = 'inline-block';
    restartBtn.style.display = 'none';
}

// Main game loop
function main() {
    if (gameOver) {
        clearInterval(gameLoop);
        gameRunning = false;
        drawGameOver();
        return;
    }

    changingDirection = false;
    clearCanvas();
    drawFood();
    moveSnake();
    drawSnake();
}

// Clear canvas
function clearCanvas() {
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
}

// Draw grid
function drawGrid() {
    ctx.strokeStyle = '#b8d4f0';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += window.currentGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += window.currentGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Draw snake
function drawSnake() {
    snake.forEach((part, index) => {
        if (index === 0) {
            drawSnakeHead(part);
        } else {
            drawSnakeBody(part);
        }
    });
}

// Draw snake head
function drawSnakeHead(snakePart) {
    ctx.fillStyle = '#3a8dde';
    ctx.fillRect(snakePart.x * window.currentGridSize, snakePart.y * window.currentGridSize, window.currentGridSize, window.currentGridSize);
    ctx.strokeStyle = '#1a2233';
    ctx.lineWidth = 2;
    ctx.strokeRect(snakePart.x * window.currentGridSize, snakePart.y * window.currentGridSize, window.currentGridSize, window.currentGridSize);
    
    // Draw eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(snakePart.x * window.currentGridSize + 4, snakePart.y * window.currentGridSize + 4, 3, 3);
    ctx.fillRect(snakePart.x * window.currentGridSize + 13, snakePart.y * window.currentGridSize + 4, 3, 3);
    ctx.fillStyle = '#1a2233';
    ctx.fillRect(snakePart.x * window.currentGridSize + 5, snakePart.y * window.currentGridSize + 5, 1, 1);
    ctx.fillRect(snakePart.x * window.currentGridSize + 14, snakePart.y * window.currentGridSize + 5, 1, 1);
}

// Draw snake body
function drawSnakeBody(snakePart) {
    ctx.fillStyle = '#5ec6fa';
    ctx.fillRect(snakePart.x * window.currentGridSize, snakePart.y * window.currentGridSize, window.currentGridSize, window.currentGridSize);
    ctx.strokeStyle = '#3a8dde';
    ctx.lineWidth = 1;
    ctx.strokeRect(snakePart.x * window.currentGridSize, snakePart.y * window.currentGridSize, window.currentGridSize, window.currentGridSize);
}

// Create food
function createFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / window.currentGridSize)),
        y: Math.floor(Math.random() * (canvas.height / window.currentGridSize))
    };

    // Check if food is on snake
    snake.forEach(function isFoodOnSnake(part) {
        const foodIsOnSnake = part.x === food.x && part.y === food.y;
        if (foodIsOnSnake) {
            createFood();
        }
    });
}

// Draw food
function drawFood() {
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x * window.currentGridSize, food.y * window.currentGridSize, window.currentGridSize, window.currentGridSize);
    ctx.strokeStyle = '#E64A19';
    ctx.lineWidth = 2;
    ctx.strokeRect(food.x * window.currentGridSize, food.y * window.currentGridSize, window.currentGridSize, window.currentGridSize);
}

// Move snake
function moveSnake() {
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }

    snake.unshift(head);

    const hasEatenFood = snake[0].x === food.x && snake[0].y === food.y;
    if (hasEatenFood) {
        score += 10;
        scoreElement.textContent = 'Score: ' + score;
        createFood();
    } else {
        snake.pop();
    }
    checkCollision();
}

// Change direction
function changeDirection(newDirection) {
    if (!gameRunning || changingDirection) return;
    
    // Prevent reverse direction
    if ((newDirection === 'up' && direction === 'down') ||
        (newDirection === 'down' && direction === 'up') ||
        (newDirection === 'left' && direction === 'right') ||
        (newDirection === 'right' && direction === 'left')) {
        return;
    }
    
    direction = newDirection;
    changingDirection = true;
}

// Keyboard controls
function handleKeyDown(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    
    if (keyPressed === LEFT_KEY) {
        changeDirection('left');
    } else if (keyPressed === RIGHT_KEY) {
        changeDirection('right');
    } else if (keyPressed === UP_KEY) {
        changeDirection('up');
    } else if (keyPressed === DOWN_KEY) {
        changeDirection('down');
    }
}

// Touch controls
function setupTouchControls() {
    upBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection('up');
    }, { passive: false });
    
    downBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection('down');
    }, { passive: false });
    
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection('left');
    }, { passive: false });
    
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection('right');
    }, { passive: false });
    
    // Mouse controls for desktop testing
    upBtn.addEventListener('click', () => changeDirection('up'));
    downBtn.addEventListener('click', () => changeDirection('down'));
    leftBtn.addEventListener('click', () => changeDirection('left'));
    rightBtn.addEventListener('click', () => changeDirection('right'));
}

// Check collision
function checkCollision() {
    // Check collision with walls
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > canvas.width / window.currentGridSize - 1;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > canvas.height / window.currentGridSize - 1;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        gameOver = true;
        return;
    }

    // Check collision with self
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            gameOver = true;
            return;
        }
    }
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.font = '24px Arial';
    ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Click Restart to play again', canvas.width / 2, canvas.height / 2 + 60);
}

// Draw initial game state
function drawGame() {
    clearCanvas();
    drawFood();
    drawSnake();
}

// Event listeners
document.addEventListener('keydown', handleKeyDown);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);

// Initialize game on load
setupResponsiveCanvas();
initGame();

// Setup touch controls
setupTouchControls();

// Handle window resize
window.addEventListener('resize', () => {
    setupResponsiveCanvas();
    if (!gameRunning) {
        drawGame();
    }
});