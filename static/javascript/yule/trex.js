const trex = document.getElementById('trex');
const game = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
let score = 0;
let isJumping = false;
let cactusArray = [];
let gameInterval;

function jump() {
    if (isJumping) return;
    isJumping = true;
    let jumpHeight = 0;

    const jumpInterval = setInterval(() => {
        if (jumpHeight >= 100) {
            clearInterval(jumpInterval);
            const fallInterval = setInterval(() => {
                if (jumpHeight <= 0) {
                    clearInterval(fallInterval);
                    isJumping = false;
                } else {
                    jumpHeight -= 5;
                    trex.style.bottom = (20 + jumpHeight) + 'px';
                }
            }, 20);
        } else {
            jumpHeight += 5;
            trex.style.bottom = (20 + jumpHeight) + 'px';
        }
    }, 20);
}

function createCactus() {
    const cactus = document.createElement('div');
    cactus.className = 'cactus';
    cactus.style.left = '600px'; // 从右侧生成
    game.appendChild(cactus);
    cactusArray.push(cactus);

    const moveCactus = setInterval(() => {
        const cactusPosition = parseInt(cactus.style.left);
        if (cactusPosition < -20) {
            clearInterval(moveCactus);
            game.removeChild(cactus);
            cactusArray.shift();
            score++;
            scoreDisplay.textContent = 'Score: ' + score;
        } else {
            cactus.style.left = (cactusPosition - 5) + 'px';
        }

        // 碰撞检测
        if (cactusPosition < 90 && cactusPosition > 50 && !isJumping) {
            alert('Game Over! Your score: ' + score);
            clearInterval(moveCactus);
            resetGame();
        }
    }, 20);
}

function resetGame() {
    score = 0;
    scoreDisplay.textContent = 'Score: 0';
    cactusArray.forEach(cactus => game.removeChild(cactus));
    cactusArray = [];
    clearInterval(gameInterval);
    gameInterval = setInterval(createCactus, 2000);
}

document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') {
        jump();
    }
});

// 启动游戏
gameInterval = setInterval(createCactus, 2000);