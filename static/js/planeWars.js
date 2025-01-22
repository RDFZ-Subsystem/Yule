const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const gameOverElement = document.getElementById('gameOver');

// 游戏对象
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 10,
    color: '#00ff00'
};

const bullets = [];
const enemies = [];
const bulletSpeed = 7;
const enemySpeed = 2;

let score = 0;
let gameOver = false;
let animationId;

// 控制监听
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    ' ': false
};

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
    if (e.key === ' ' && gameOver) {
        resetGame();
    }
});

// 游戏循环
function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //updatePlayer();
        updatePlayerPosition();
        updateBullets();
        updateEnemies();
        checkCollisions();
        drawGame();
        animationId = requestAnimationFrame(gameLoop);
    }
}

// 添加鼠标位置跟踪
let mouseX = 0;
let mouseY = 0;

// 添加鼠标移动事件监听器
canvas.addEventListener('mousemove', (e) => {
    // 获取画布相对于视窗的位置
    const rect = canvas.getBoundingClientRect();
    // 计算鼠标在画布内的实际位置
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// 修改更新玩家位置函数
function updatePlayerPosition() {
    // 使用鼠标X坐标更新玩家位置，并确保飞机不会超出画布
    player.x = Math.max(0, Math.min(canvas.width - player.width, mouseX - player.width / 2));
    
    // 保持原有的射击逻辑
    if (keys[' ']) {
        shoot();
    }
}

// 更新玩家位置
function updatePlayer() {
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
    if (keys.ArrowDown && player.y < canvas.height - player.height) player.y += player.speed;
    if (keys[' ']) {
        shoot();
    }
}

// 发射子弹
let lastShot = 0;
function shoot() {
    const now = Date.now();
    if (now - lastShot >= 250) { // 发射冷却时间
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            color: '#fff'
        });
        lastShot = now;
    }
}

// 更新子弹位置
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

// 生成敌人
function spawnEnemy() {
    if (Math.random() < 0.01) { // 敌人生成概率
        enemies.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            color: '#ff0000',
            health: 2 // 每个敌人的初始血量
        });
    }
}

// 更新敌人位置
function updateEnemies() {
    spawnEnemy();
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemySpeed;
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            currentHealth -= healthLossPerHit;
            updateHealthBar();
        }
    }
}

// 碰撞检测
function checkCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (collision(bullets[j], enemies[i])) {
                enemies[i].health--; // 减少敌人的血量
                bullets.splice(j, 1);
                if (enemies[i].health <= 0) {
                    enemies.splice(i, 1);
                    score += 10;
                    scoreElement.textContent = score;
                }
                break;
            }
        }
    }

    // 玩家碰撞检测
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (collision(player, enemies[i])) {
            enemies.splice(i, 1); // 移除碰撞的敌人
            currentHealth -= healthLossPerHit;
            updateHealthBar();
            
            break;
        }
    }
}

// 碰撞检测函数
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
}

// 绘制游戏
function drawGame() {
    // 绘制玩家
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 绘制子弹
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // 绘制敌人
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        // 绘制敌人的血量
        ctx.fillStyle = '#fff';
        ctx.fillText(`${enemy.health}`, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2); // 显示血量在敌人方块内
    });
}

// 游戏结束
function endGame() {
    gameOver = true;
    gameOverElement.style.display = 'block';
    cancelAnimationFrame(animationId);
}

// 重置游戏
function resetGame() {
    gameOver = false;
    gameOverElement.style.display = 'none';
    score = 0;
    currentHealth = maxHealth;
    updateHealthBar();
    scoreElement.textContent = score;
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    bullets.length = 0;
    enemies.length = 0;
    gameLoop();
}

// 开始游戏
gameLoop();

// 添加血量相关变量
const maxHealth = 100;
let currentHealth = maxHealth;
const healthBar = document.getElementById('healthBar');
const healthLossPerHit = 20; // 每次被击中扣除的血量

// 添加更新血条函数
function updateHealthBar() {
    healthBar.style.width = (currentHealth / maxHealth * 100) + '%';
    if (currentHealth <= 0) {
        endGame();
    }
}