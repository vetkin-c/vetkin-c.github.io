let randomNumber = Math.floor(Math.random() * 100) + 1;
let guessBtn = document.getElementById('guessBtn');
let guessInput = document.getElementById('guessInput');
let message = document.getElementById('message');
let restartBtn = document.getElementById('restartBtn');
let attempts = 0;

function resetGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    message.textContent = '';
    guessInput.value = '';
    guessInput.disabled = false;
    guessBtn.disabled = false;
    restartBtn.style.display = 'none';
}

guessBtn.addEventListener('click', function() {
    const userGuess = Number(guessInput.value)
    attempts++;
    console.log(randomNumber);
    if (!userGuess || userGuess < 1 || userGuess > 100) {
        message.textContent = 'Masukkan angka antara 1 sampai 100!';
        return;
    }
    if (userGuess === randomNumber) {
        message.textContent = `Selamat! Kamu benar dalam ${attempts} percobaan.`;
        guessInput.disabled = true;
        guessBtn.disabled = true;
        restartBtn.style.display = 'inline-block';
    } else if (userGuess < randomNumber) {
        message.textContent = 'Terlalu kecil!';
    } else {
        message.textContent = 'Terlalu besar!';
    }
});

restartBtn.addEventListener('click', resetGame); 