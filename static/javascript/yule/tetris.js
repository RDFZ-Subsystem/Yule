const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// 定义方块形状
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]]  // Z
];

const COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000'];

let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let score = 0;
let currentShape;
let currentColor;
let currentX;
let currentY;

let isPaused = false;
let gameInterval;

let nextShape;
let nextColor;

function createNewShape() {
    if (nextShape === undefined) {
        const randomIndex = Math.floor(Math.random() * SHAPES.length);
        currentShape = SHAPES[randomIndex];
        currentColor = COLORS[randomIndex];
    } else {
        currentShape = nextShape;
        currentColor = nextColor;
    }
    
    // 生成下一个形状
    const nextIndex = Math.floor(Math.random() * SHAPES.length);
    nextShape = SHAPES[nextIndex];
    nextColor = COLORS[nextIndex];
    
    currentX = Math.floor((BOARD_WIDTH - currentShape[0].length) / 2);
    currentY = 0;
    
    if (!canMove(0, 0)) {
        gameOver();
    }
    
    // 显示下一个形状
    drawNextPiece();
}

function draw() {
    const gameBoard = document.getElementById('gameBoard');
    // 保存pause界面的状态
    const pauseScreen = document.getElementById('pauseScreen');
    const isPauseVisible = pauseScreen ? pauseScreen.style.display === 'block' : false;
    
    gameBoard.innerHTML = '<div id="pauseScreen" class="pause-screen">Pause</div>';
    
    // 恢复pause界面的状态
    if (isPauseVisible) {
        document.getElementById('pauseScreen').style.display = 'block';
    }
    
    // 添加网格
    gameBoard.appendChild(createGrid());
    
    // 绘制已固定的方块
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
    
    // 绘制当前移动的方块
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                drawBlock(currentX + x, currentY + y, currentColor);
            }
        }
    }
}

function drawBlock(x, y, color) {
    const block = document.createElement('div');
    block.className = 'block';
    block.style.backgroundColor = color;
    block.style.left = x * BLOCK_SIZE + 'px';
    block.style.top = y * BLOCK_SIZE + 'px';
    document.getElementById('gameBoard').appendChild(block);
}

function canMove(offsetX, offsetY) {
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                const newX = currentX + x + offsetX;
                const newY = currentY + y + offsetY;
                
                // 检查边界，包括上边界
                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || newY < 0) {
                    return false;
                }
                
                // 检查与其他方块的碰撞
                if (newY >= 0 && board[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function merge() {
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                board[currentY + y][currentX + x] = currentColor;
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    let y = BOARD_HEIGHT - 1;
    
    while (y >= 0) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
        } else {
            y--;
        }
    }
    
    if (linesCleared > 0) {
        //playSound('clearSound');
        const scoreMultiplier = [0, 100, 300, 500, 800];
        score += scoreMultiplier[linesCleared];
        document.getElementById('scoreValue').textContent = score;
    }
}

function rotate() {
    const newShape = Array(currentShape[0].length).fill()
        .map((_, i) => currentShape.map(row => row[row.length - 1 - i]));
    
    const oldShape = currentShape;
    const oldX = currentX;
    const oldY = currentY;
    
    currentShape = newShape;
    
    // 计算旧形状的中心点
    const oldWidth = oldShape[0].length;
    const oldHeight = oldShape.length;
    const oldCenterX = oldX + Math.floor(oldWidth / 2);
    const oldCenterY = oldY + Math.floor(oldHeight / 2);
    
    // 计算新形状的尺寸
    const newWidth = newShape[0].length;
    const newHeight = newShape.length;
    
    // 计算新的基准位置，保持中心点不变
    const baseX = oldCenterX - Math.floor(newWidth / 2);
    const baseY = oldCenterY - Math.floor(newHeight / 2);
    
    // 定义墙踢检查的顺序，优先检查原位置
    const kicks = [
        {x: 0, y: 0},     // 原位置
        {x: -1, y: 0},    // 左移1格
        {x: 1, y: 0},     // 右移1格
        {x: 0, y: -1},    // 上移1格
        {x: 0, y: 1},     // 下移1格
        {x: -1, y: -1},   // 左上
        {x: 1, y: -1},    // 右上
        {x: -1, y: 1},    // 左下
        {x: 1, y: 1}      // 右下
    ];
    
    // 尝试每个可能的位置
    for (let kick of kicks) {
        currentX = baseX + kick.x;
        currentY = baseY + kick.y;
        
        if (canMove(0, 0)) {
            return true;  // 找到有效位置
        }
    }
    
    // 如果所有位置都无效，恢复原状
    currentShape = oldShape;
    currentX = oldX;
    currentY = oldY;
    return false;
}

function gameOver() {
    // 检查新方块是否能放置
    for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[0][x]) {
            //playSound('gameOverSound');
            document.getElementById('finalScore').textContent = score;
            document.getElementById('gameOverModal').style.display = 'block';
            clearInterval(gameInterval);
            return true;
        }
    }
    return false;
}

function moveDown() {
    if (isPaused) return;
    
    if (canMove(0, 1)) {
        currentY++;
        draw();
    } else {
        merge();
        if (gameOver()) {
            return;
        }
        clearLines();
        createNewShape();
        draw();
    }
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseScreen').style.display = isPaused ? 'block' : 'none';
    if (isPaused) {
        clearInterval(gameInterval);
    } else {
        gameInterval = setInterval(moveDown, 1000);
    }
}

function resetGame() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    document.getElementById('scoreValue').textContent = '0';
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('pauseScreen').style.display = 'none';
    isPaused = false;
    
    // 重置下一个形状
    nextShape = undefined;
    nextColor = undefined;
    
    clearInterval(gameInterval);
    createNewShape();
    draw();
    gameInterval = setInterval(moveDown, 1000);
}

function drawNextPiece() {
    const nextPiece = document.getElementById('nextPiece');
    nextPiece.innerHTML = '';
    
    // 计算居中偏移
    const offsetX = (120 - nextShape[0].length * 30) / 2;
    const offsetY = (120 - nextShape.length * 30) / 2;
    
    for (let y = 0; y < nextShape.length; y++) {
        for (let x = 0; x < nextShape[y].length; x++) {
            if (nextShape[y][x]) {
                const block = document.createElement('div');
                block.className = 'block';
                block.style.backgroundColor = nextColor;
                block.style.left = offsetX + x * BLOCK_SIZE + 'px';
                block.style.top = offsetY + y * BLOCK_SIZE + 'px';
                nextPiece.appendChild(block);
            }
        }
    }
}

function hardDrop() {
    let dropDistance = 0;
    while (canMove(0, 1)) {
        currentY++;
        dropDistance++;
    }
    
    if (dropDistance > 0) {
        //playSound('dropSound');
        merge();
        if (gameOver()) {
            return;
        }
        clearLines();
        createNewShape();
        draw();
    }
}

document.addEventListener('keydown', (e) => {
    
    if (isPaused && e.key !== 'p') return;
    
    switch (e.key) {
        case 'ArrowLeft':
        case 'a':
            if (canMove(-1, 0)) {
                //playSound('moveSound');
                currentX--;
                draw();
            }
            break;
        case 'ArrowRight':
        case 'd':
            if (canMove(1, 0)) {
                //playSound('moveSound');
                currentX++;
                draw();
            }
            break;
        case 'ArrowDown':
        case 's':
            e.preventDefault();
            moveDown();
            break;
        case 'ArrowUp':
        case 'w':
            e.preventDefault();
            if (rotate()) {
                //playSound('rotateSound');
                draw();
            }
            break;
        case 'p':
            togglePause();
            break;
        case ' ':  // 空格键快速下落
            e.preventDefault();
            hardDrop();
            break;
    }
});

createNewShape();
draw();
gameInterval = setInterval(moveDown, 1000);

// 添加建网格的函数
function createGrid() {
    const gridOverlay = document.createElement('div');
    gridOverlay.className = 'grid-overlay';
    
    // 创建垂直线
    for (let i = 1; i < BOARD_WIDTH; i++) {
        const verticalLine = document.createElement('div');
        verticalLine.className = 'grid-line-vertical';
        verticalLine.style.left = `${i * (100 / BOARD_WIDTH)}%`;
        gridOverlay.appendChild(verticalLine);
    }
    
    // 创建水平线
    for (let i = 1; i < BOARD_HEIGHT; i++) {
        const horizontalLine = document.createElement('div');
        horizontalLine.className = 'grid-line-horizontal';
        horizontalLine.style.top = `${i * (100 / BOARD_HEIGHT)}%`;
        gridOverlay.appendChild(horizontalLine);
    }
    
    return gridOverlay;
}

// 添加窗口大小改变事件监听
window.addEventListener('resize', function() {
    draw();
    drawNextPiece();
});