const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const difficultySelect = document.getElementById('difficulty');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let score = 0;
let snake = [{ x: 10, y: 10 }];
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};
let dx = 0;
let dy = 0;
let speed = 5; // 初始速度
let initialSpeed = [5, 7, 10];
let gameLoop;
let changingDirection = false;
let changingDifficulty = false;
let timeElapsed = 0;
let speedIncreaseInterval = 5000;
let difficulty = 'easy';

// 根据选择的难度设置游戏参数
function setDifficulty() {
    if (changingDifficulty) return;
    const dif = difficultySelect.value;
    difficulty = dif;
    switch (dif) {
        case 'easy':
            speedIncreaseInterval = 7000; // 每7秒增加一次速度
            break;
        case 'medium':
            speedIncreaseInterval = 5000; // 每5秒增加一次速度
            break;
        case 'hard':
            speedIncreaseInterval = 3000; // 每3秒增加一次速度
            break;
    }
    changingDifficulty = true;
}

function setInitialSpeed() {
    const difficulty = difficultySelect.value;
    switch (difficulty) {
        case 'easy':
            speed = initialSpeed[0];
            break;
        case 'medium':
            speed = initialSpeed[1];
            break;
        case 'hard':
            speed = initialSpeed[2];
            break;
    }
}

// 游戏主循环
function game() {
    updateSnake();
    if (checkGameOver()) {
        return;
    }
    clearCanvas();
    drawFood();
    drawSnake();
}

// 更新蛇的位置
function updateSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
    changingDirection = false;
    changingDifficulty = false;
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#81C784';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = '#FF5252';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// 清除画布
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 生成新的食物
function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    // 确保食物不会生成在蛇身上
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

// 检查游戏是否结束
function checkGameOver() {
    // 撞墙
    if (snake[0].x < 0 || snake[0].x >= tileCount || 
        snake[0].y < 0 || snake[0].y >= tileCount) {
        showGameOver();
        return true;
    }

    // 撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            showGameOver();
            return true;
        }
    }
    return false;
}

// 添加显示游戏结束模态框的函数
function showGameOver() {
    const gameOverModal = document.getElementById('gameOverModal');
    const finalScore = document.getElementById('finalScore');
    finalScore.textContent = score;
    gameOverModal.style.display = 'flex';
}

// 重置游戏
function resetGame() {
    const gameOverModal = document.getElementById('gameOverModal');
    gameOverModal.style.display = 'none';
    snake = [{ x: 10, y: 10 }];
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    timeElapsed = 0;
    setDifficulty();
    setInitialSpeed();
    clearInterval(gameLoop);
    gameLoop = setInterval(game, 1000 / speed);
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (changingDirection) return;
    changingDirection = true;
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
        case 'p':
            setDifficulty();
            clearInterval(gameLoop);
gameLoop = setInterval(game, 1000 / speed);
            break;
    }
});

document.getElementById('applyDifficulty').addEventListener('click', setDifficulty);

// 增加速度的函数
function increaseSpeed() {
    speed += 0.5;
    clearInterval(gameLoop);
    gameLoop = setInterval(game, 1000 / speed);
}

// 开始游戏循环
setInitialSpeed();
setDifficulty();
clearInterval(gameLoop);
gameLoop = setInterval(game, 1000 / speed);
setInterval(() => {
    timeElapsed += 1000;
    if (timeElapsed >= speedIncreaseInterval) {
        increaseSpeed();
        timeElapsed = 0;
    }
}, 1000);