let randomNumber = Math.floor(Math.random() * 100) + 1;
let guessBtn = document.getElementById('guessBtn');
let guessInput = document.getElementById('guessInput');
let message = document.getElementById('message');
let restartBtn = document.getElementById('restartBtn');
let startBtn = document.getElementById('startBtn');
let startScreen = document.getElementById('startScreen');
let gameScreen = document.getElementById('gameScreen');
let attempts = 0;

function showStartScreen() {
    startScreen.style.display = 'block';
    gameScreen.style.display = 'none';
    resetGame();
}

function showGameScreen() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    guessInput.focus();
}

function resetGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    message.textContent = '';
    message.className = '';
    guessInput.value = '';
    guessInput.disabled = false;
    guessBtn.disabled = false;
    restartBtn.style.display = 'none';
}

function makeGuess() {
    const userGuess = Number(guessInput.value);
    attempts++;
    
    if (!userGuess || userGuess < 1 || userGuess > 100) {
        message.textContent = 'Masukkan angka antara 1 sampai 100!';
        message.className = '';
        return;
    }
    
    if (userGuess === randomNumber) {
        message.textContent = `Selamat! Kamu benar dalam ${attempts} percobaan.`;
        message.className = 'correct';
        guessInput.disabled = true;
        guessBtn.disabled = true;
        restartBtn.style.display = 'block';
    } else if (userGuess < randomNumber) {
        message.textContent = 'Terlalu kecil! Coba angka yang lebih besar.';
        message.className = 'low';
    } else {
        message.textContent = 'Terlalu besar! Coba angka yang lebih kecil.';
        message.className = 'high';
    }
    
    // Clear input and focus for next guess
    guessInput.value = '';
    guessInput.focus();
}

// Start button click handler
startBtn.addEventListener('click', showGameScreen);

// Guess button click handler
guessBtn.addEventListener('click', makeGuess);

// Enter key handler
guessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        makeGuess();
    }
});

// Restart button click handler
restartBtn.addEventListener('click', function() {
    resetGame();
    guessInput.focus();
});

// Prevent zoom on iOS when focusing input
guessInput.addEventListener('focus', function() {
    // Add a small delay to prevent zoom
    setTimeout(() => {
        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
});

// Initialize the game with start screen
document.addEventListener('DOMContentLoaded', function() {
    showStartScreen();
}); 