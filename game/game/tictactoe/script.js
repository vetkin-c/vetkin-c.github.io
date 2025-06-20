const boardElement = document.getElementById('board');
const turnElement = document.getElementById('turn');
const resultElement = document.getElementById('result');
const resetBtn = document.getElementById('resetBtn');
const levelSelect = document.getElementById('level');
const playerInfo = document.getElementById('playerInfo');
const modeSelect = document.getElementById('mode');

let board = Array(9).fill('');
let userMark = 'X';
let aiMark = 'O';
let currentPlayer = 'X';
let gameActive = true;
let level = 'easy';
let mode = 'pvc';
let winLine = null;

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, idx) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        cellDiv.textContent = cell;
        cellDiv.dataset.idx = idx;
        if (cell !== '') {
            cellDiv.classList.add('filled');
            if (cell === 'X') cellDiv.classList.add('x');
            if (cell === 'O') cellDiv.classList.add('o');
        }
        cellDiv.addEventListener('click', handleCellClick);
        boardElement.appendChild(cellDiv);
    });
    if (winLine) renderWinLine(winLine);
}

function handleCellClick(e) {
    const idx = e.target.dataset.idx;
    if (!gameActive || board[idx] !== '') return;
    if (mode === 'pvc') {
        if (currentPlayer !== userMark) return;
        board[idx] = userMark;
        animateCell(idx);
        if (checkWin(userMark)) {
            winLine = getWinLine(userMark);
            renderBoard();
            endGame('Kamu menang!');
            return;
        }
        if (board.every(cell => cell !== '')) {
            renderBoard();
            endGame('Seri!');
            return;
        }
        currentPlayer = aiMark;
        turnElement.textContent = currentPlayer;
        renderBoard();
        setTimeout(aiMove, 500);
    } else {
        // PvP
        board[idx] = currentPlayer;
        animateCell(idx);
        if (checkWin(currentPlayer)) {
            winLine = getWinLine(currentPlayer);
            renderBoard();
            endGame(`Pemain ${currentPlayer} menang!`);
            return;
        }
        if (board.every(cell => cell !== '')) {
            renderBoard();
            endGame('Seri!');
            return;
        }
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        turnElement.textContent = currentPlayer;
        renderBoard();
    }
}

function aiMove() {
    if (!gameActive) return;
    let move;
    if (level === 'easy') {
        move = getRandomMove();
    } else if (level === 'medium') {
        move = getMediumMove();
    } else {
        move = getBestMove();
    }
    if (move === undefined) return;
    board[move] = aiMark;
    animateCell(move);
    if (checkWin(aiMark)) {
        winLine = getWinLine(aiMark);
        renderBoard();
        endGame('Komputer menang!');
        return;
    }
    if (board.every(cell => cell !== '')) {
        renderBoard();
        endGame('Seri!');
        return;
    }
    currentPlayer = userMark;
    turnElement.textContent = currentPlayer;
    renderBoard();
}

function getRandomMove() {
    const emptyCells = board.map((cell, idx) => cell === '' ? idx : null).filter(idx => idx !== null);
    if (emptyCells.length === 0) return undefined;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getMediumMove() {
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = aiMark;
            if (checkWin(aiMark)) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = userMark;
            if (checkWin(userMark)) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    return getRandomMove();
}

function getBestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = aiMark;
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(newBoard, depth, isMaximizing) {
    if (checkWin(aiMark, newBoard)) return 10 - depth;
    if (checkWin(userMark, newBoard)) return depth - 10;
    if (newBoard.every(cell => cell !== '')) return 0;
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = aiMark;
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = userMark;
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWin(player, customBoard) {
    const b = customBoard || board;
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    return winPatterns.some(pattern => pattern.every(idx => b[idx] === player));
}

function getWinLine(player, customBoard) {
    const b = customBoard || board;
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let pattern of winPatterns) {
        if (pattern.every(idx => b[idx] === player)) return pattern;
    }
    return null;
}

function renderWinLine(pattern) {
    // pattern: array of 3 index
    // Map index ke posisi grid
    const pos = [
        [0,0],[1,0],[2,0],
        [0,1],[1,1],[2,1],
        [0,2],[1,2],[2,2]
    ];
    const cell = boardElement.querySelector('.cell');
    if (!cell) return;
    const cellSize = cell.offsetWidth;
    const computedStyle = window.getComputedStyle(boardElement);
    const gap = parseInt(computedStyle.gap) || 0;
    const gridSize = 3;
    const boardSize = cellSize * gridSize + gap * (gridSize - 1);
    // Hitung posisi tengah cell pada grid
    function getCenter(x, y) {
        return {
            x: x * (cellSize + gap) + cellSize / 2,
            y: y * (cellSize + gap) + cellSize / 2
        };
    }
    const [a, b, c] = pattern.map(i => pos[i]);
    const p1 = getCenter(a[0], a[1]);
    const p2 = getCenter(c[0], c[1]);
    // SVG overlay dengan viewBox dinamis
    let svg = `<div class="win-line" style="position:absolute;left:0;top:0;width:${boardSize}px;height:${boardSize}px;pointer-events:none;z-index:2;">
        <svg width="100%" height="100%" viewBox="0 0 ${boardSize} ${boardSize}">
            <path d="M${p1.x},${p1.y} L${p2.x},${p2.y}"/>
        </svg>
    </div>`;
    boardElement.insertAdjacentHTML('beforeend', svg);
}

function animateCell(idx) {
    // Tambahkan class filled untuk animasi
    setTimeout(() => {
        const cell = boardElement.children[idx];
        if (cell) cell.classList.add('filled');
    }, 10);
}

function endGame(message) {
    gameActive = false;
    resultElement.textContent = message;
}

function resetGame() {
    board = Array(9).fill('');
    winLine = null;
    if (mode === 'pvc') {
        // Random user X/O
        if (Math.random() < 0.5) {
            userMark = 'X';
            aiMark = 'O';
        } else {
            userMark = 'O';
            aiMark = 'X';
        }
        currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
        playerInfo.textContent = `Kamu: ${userMark} | Komputer: ${aiMark}`;
        levelSelect.disabled = false;
    } else {
        userMark = 'X';
        aiMark = 'O';
        currentPlayer = 'X';
        playerInfo.textContent = 'Player 1: X | Player 2: O';
        levelSelect.disabled = true;
    }
    gameActive = true;
    resultElement.textContent = '';
    turnElement.textContent = currentPlayer;
    renderBoard();
    // Jika AI dapat giliran pertama
    if (mode === 'pvc' && currentPlayer === aiMark) {
        setTimeout(aiMove, 500);
    }
}

levelSelect.addEventListener('change', function() {
    level = levelSelect.value;
    resetGame();
});

modeSelect.addEventListener('change', function() {
    mode = modeSelect.value;
    resetGame();
});

resetBtn.addEventListener('click', resetGame);

// Inisialisasi
level = levelSelect.value;
mode = modeSelect.value;
resetGame(); 