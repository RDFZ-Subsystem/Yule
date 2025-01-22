const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// 游戏状态
let score = 0;
let gameOver = false;

// 马里奥
const mario = {
    x: 50,
    y: 300,
    width: 30,
    height: 40,
    speed: 3,
    jumpForce: -12,
    velocityY: 0,
    isJumping: false,
    direction: 'right'
};

// 平台
const platforms = [
    { x: 0, y: 340, width: 800, height: 60 },  // 地面
    { x: 300, y: 240, width: 100, height: 20 },
    { x: 500, y: 180, width: 100, height: 20 },
    { x: 200, y: 280, width: 100, height: 20 }
];

// 金币
const coins = [
    { x: 320, y: 200, width: 20, height: 20, collected: false },
    { x: 520, y: 140, width: 20, height: 20, collected: false },
    { x: 220, y: 240, width: 20, height: 20, collected: false }
];

// 敌人
const enemies = [
    { x: 400, y: 300, width: 30, height: 30, direction: 1, speed: 1.2 }
];

// 重力和地面摩擦
const gravity = 0.6;
const friction = 0.8;

// 按键状态
const keys = {
    left: false,
    right: false,
    up: false
};

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = true;
        mario.direction = 'left';
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = true;
        mario.direction = 'right';
    }
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') {
        keys.up = true;
        if (!mario.isJumping) {
            mario.velocityY = mario.jumpForce;
            mario.isJumping = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = false;
    }
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') {
        keys.up = false;
    }
});

// 碰撞检测
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 更新游戏状态
function update() {
    if (gameOver) return;

    // 水平移动
    if (keys.left) {
        mario.x -= mario.speed;
    }
    if (keys.right) {
        mario.x += mario.speed;
    }

    // 应用重力
    mario.velocityY += gravity;
    mario.y += mario.velocityY;

    // 边界检查
    if (mario.x < 0) mario.x = 0;
    if (mario.x + mario.width > canvas.width) mario.x = canvas.width - mario.width;

    // 平台碰撞检测
    mario.isJumping = true;
    platforms.forEach(platform => {
        if (checkCollision(mario, platform)) {
            if (mario.velocityY > 0 && mario.y + mario.height - mario.velocityY <= platform.y) {
                mario.y = platform.y - mario.height;
                mario.velocityY = 0;
                mario.isJumping = false;
            }
        }
    });

    // 收集金币
    coins.forEach(coin => {
        if (!coin.collected && checkCollision(mario, coin)) {
            coin.collected = true;
            score += 10;
            scoreElement.textContent = score;
        }
    });

    // 更新敌人
    enemies.forEach(enemy => {
        enemy.x += enemy.speed * enemy.direction;
        
        // 敌人移动边界
        if (enemy.x <= 300 || enemy.x >= 500) {
            enemy.direction *= -1;
        }

        // 检查与马里奥的碰撞
        if (checkCollision(mario, enemy)) {
            if (mario.velocityY > 0 && mario.y + mario.height - mario.velocityY <= enemy.y) {
                // 踩到敌人
                enemy.y = 1000; // 移除敌人
                mario.velocityY = mario.jumpForce;
                score += 20;
                scoreElement.textContent = score;
            } else {
                // 碰到敌人
                gameOver = true;
                alert('Game Over！Score：' + score);
                location.reload();
            }
        }
    });
}

// 绘制游戏画面
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制平台
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // 绘制金币
    ctx.fillStyle = '#FFD700';
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x + 10, coin.y + 10, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // 绘制敌人
    ctx.fillStyle = '#FF0000';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // 绘制马里奥
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(mario.x, mario.y, mario.width, mario.height);
}

// 游戏循环
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 开始游戏
gameLoop(); 