// 基本常量定义
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// 方块形状定义
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

class TetrisGame {
    constructor(boardId, nextPieceId, scoreValueId) {
        this.boardId = boardId;
        this.nextPieceId = nextPieceId;
        this.scoreValueId = scoreValueId;
        this.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
        this.score = 0;
        this.currentShape = null;
        this.currentColor = null;
        this.currentX = 0;
        this.currentY = 0;
        this.nextShape = null;
        this.nextColor = null;
        this.isPaused = false;
        this.isGameOver = false;
        this.opponent = null;
    }

    // 移动方法
    moveLeft() {
        if (this.canMove(-1, 0)) {
            //playSound('moveSound');
            this.currentX--;
            this.draw();
            return true;
        }
        return false;
    }

    moveRight() {
        if (this.canMove(1, 0)) {
            //playSound('moveSound');
            this.currentX++;
            this.draw();
            return true;
        }
        return false;
    }

    moveDown() {
        if (this.isPaused || this.isGameOver) return false;
        
        if (this.canMove(0, 1)) {
            this.currentY++;
            this.draw();
            return true;
        } else {
            this.merge();
            this.clearLines();
            if (!this.createNewShape()) {
                this.isGameOver = true;
                this.updateGameOverStatus();  // 更新状态显示
                if (this.opponent && this.opponent.isGameOver) {
                    showGameOver();
                }
                return false;
            }
            this.draw();
            return false;
        }
    }

    // 旋转方法
    rotate() {
        const newShape = Array(this.currentShape[0].length).fill()
            .map((_, i) => this.currentShape.map(row => row[row.length - 1 - i]));
        
        const oldShape = this.currentShape;
        const oldX = this.currentX;
        const oldY = this.currentY;
        
        this.currentShape = newShape;
        
        // 计算旧形状的中心点
        const oldWidth = oldShape[0].length;
        const oldHeight = oldShape.length;
        const oldCenterX = oldX + Math.floor(oldWidth / 2);
        const oldCenterY = oldY + Math.floor(oldHeight / 2);
        
        // 计算新���状的尺寸
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
        
        for (let kick of kicks) {
            this.currentX = baseX + kick.x;
            this.currentY = baseY + kick.y;
            
            if (this.canMove(0, 0)) {
                //playSound('rotateSound');
                this.draw();
                return true;
            }
        }
        
        this.currentShape = oldShape;
        this.currentX = oldX;
        this.currentY = oldY;
        return false;
    }

    // 快速下落
    hardDrop() {
        if (this.isPaused || this.isGameOver) return;
        
        let dropDistance = 0;
        while (this.canMove(0, 1)) {
            this.currentY++;
            dropDistance++;
        }
        
        if (dropDistance > 0) {
            //playSound('dropSound');
            this.merge();
            this.clearLines();
            if (!this.createNewShape()) {
                this.isGameOver = true;
                this.updateGameOverStatus();  // 更新状态显示
                if (this.opponent && this.opponent.isGameOver) {
                    showGameOver();
                }
                return false;
            }
            this.draw();
        }
    }

    // 碰撞检测
    canMove(offsetX, offsetY) {
        for (let y = 0; y < this.currentShape.length; y++) {
            for (let x = 0; x < this.currentShape[y].length; x++) {
                if (this.currentShape[y][x]) {
                    const newX = this.currentX + x + offsetX;
                    const newY = this.currentY + y + offsetY;
                    
                    if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || newY < 0) {
                        return false;
                    }
                    
                    if (this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // 合并方块到游戏板
    merge() {
        for (let y = 0; y < this.currentShape.length; y++) {
            for (let x = 0; x < this.currentShape[y].length; x++) {
                if (this.currentShape[y][x]) {
                    this.board[this.currentY + y][this.currentX + x] = this.currentColor;
                }
            }
        }
    }

    // 游戏结束检查
    checkGameOver() {
        if (!this.canMove(0, 0)) {
            this.isGameOver = true;
            this.updateGameOverStatus();
            
            // 显示个人游戏结束界面
            const gameOverScreen = document.getElementById(
                `gameOverScreen${this.boardId === 'gameBoard1' ? '1' : '2'}`
            );
            if (gameOverScreen) {
                gameOverScreen.style.display = 'flex';
            }
            
            // 检查是否两个玩家都结束了
            if (this.opponent && this.opponent.isGameOver) {
                showGameOver();
            }
            return true;
        }
        return false;
    }

    // 创建新方块
    createNewShape() {
        const randomIndex = Math.floor(Math.random() * SHAPES.length);
        
        if (this.nextShape === null) {
            this.currentShape = SHAPES[randomIndex];
            this.currentColor = COLORS[randomIndex];
        } else {
            this.currentShape = this.nextShape;
            this.currentColor = this.nextColor;
        }

        const nextIndex = Math.floor(Math.random() * SHAPES.length);
        this.nextShape = SHAPES[nextIndex];
        this.nextColor = COLORS[nextIndex];

        this.currentX = Math.floor((BOARD_WIDTH - this.currentShape[0].length) / 2);
        this.currentY = 0;

        // 检查新方块是否能放置在起始位置
        if (!this.canMove(0, 0)) {
            this.isGameOver = true;
            this.updateGameOverStatus();  // 更新状态显示
            if (this.opponent && this.opponent.isGameOver) {
                showGameOver();
            }
            return false;
        }

        this.drawNextPiece();
        return true;
    }

    // 绘制下一个方块预览
    drawNextPiece() {
        const nextPiece = document.getElementById(this.nextPieceId);
        nextPiece.innerHTML = '';
        
        const offsetX = (150 - this.nextShape[0].length * BLOCK_SIZE) / 2;
        const offsetY = (150 - this.nextShape.length * BLOCK_SIZE) / 2;
        
        for (let y = 0; y < this.nextShape.length; y++) {
            for (let x = 0; x < this.nextShape[y].length; x++) {
                if (this.nextShape[y][x]) {
                    const block = document.createElement('div');
                    block.className = 'block';
                    block.style.backgroundColor = this.nextColor;
                    block.style.left = offsetX + x * BLOCK_SIZE + 'px';
                    block.style.top = offsetY + y * BLOCK_SIZE + 'px';
                    nextPiece.appendChild(block);
                }
            }
        }
    }

    // 修改draw方法
    draw() {
        const gameBoard = document.getElementById(this.boardId);
        const pauseScreen = gameBoard.querySelector('.pause-screen');
        const gameOverScreen = gameBoard.querySelector('.game-over-screen');
        const isPauseVisible = pauseScreen ? pauseScreen.style.display === 'flex' : false;
        const isGameOverVisible = this.isGameOver;  // 使用isGameOver状态
        
        // 清空游戏板，但保留暂停和游戏结束屏幕
        gameBoard.innerHTML = `
            <div class="pause-screen" style="display: ${isPauseVisible ? 'flex' : 'none'}">
                <div class="pause-text">PAUSE</div>
            </div>
            <div class="game-over-screen" style="display: ${isGameOverVisible ? 'flex' : 'none'}">
                <div class="game-over-text">
                    Your Game Is Over<br>
                    Score: ${this.score}
                </div>
            </div>
        `;

        // 添加网格
        gameBoard.appendChild(this.createGrid());

        // 绘制已固定的方块
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x]);
                }
            }
        }

        // 绘制当前移动的方块
        if (this.currentShape && !this.isGameOver) {  // 只在游戏未结束时绘制当前方块
            for (let y = 0; y < this.currentShape.length; y++) {
                for (let x = 0; x < this.currentShape[y].length; x++) {
                    if (this.currentShape[y][x]) {
                        this.drawBlock(this.currentX + x, this.currentY + y, this.currentColor);
                    }
                }
            }
        }
    }

    // 绘制单个方块
    drawBlock(x, y, color) {
        const block = document.createElement('div');
        block.className = 'block';
        block.style.backgroundColor = color;
        block.style.left = (x * BLOCK_SIZE) + 'px';
        block.style.top = (y * BLOCK_SIZE) + 'px';
        document.getElementById(this.boardId).appendChild(block);
    }

    // 添加setOpponent方法
    setOpponent(opponent) {
        this.opponent = opponent;
    }

    // 添加clearLines方法
    clearLines() {
        let linesCleared = 0;
        let y = BOARD_HEIGHT - 1;
        
        while (y >= 0) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(BOARD_WIDTH).fill(0));
                linesCleared++;
            } else {
                y--;
            }
        }
        
        if (linesCleared > 0) {
            // Calculate score based on lines cleared
            const scoreMultiplier = [100, 300, 500, 800]; // 1, 2, 3, or 4 lines
            this.score += scoreMultiplier[linesCleared - 1] || 800;
            
            // Update score display
            document.getElementById(this.scoreValueId).textContent = this.score;
        }
    }

    // 修改初始化方法
    init() {
        // 重置所有游戏状态
        this.board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
        this.score = 0;
        this.currentShape = null;
        this.nextShape = null;
        this.currentColor = null;
        this.nextColor = null;
        this.isPaused = false;
        this.isGameOver = false;
        
        // 更新游戏状态显示
        this.updateGameOverStatus();
        
        // 更新分数显示
        document.getElementById(this.scoreValueId).textContent = '0';
        
        // 创建第一个方块
        this.createNewShape();
        this.draw();
    }

    updateGameOverStatus() {
        const statusElement = document.getElementById(
            this.boardId === 'gameBoard1' ? 'gameOverStatus1' : 'gameOverStatus2'
        );
        if (statusElement) {
            statusElement.textContent = this.isGameOver.toString();
            // 添加视觉反馈
            if (this.isGameOver) {
                document.querySelector(`#${this.boardId}`).style.opacity = '0.7';
            }
        }
    }

    createGrid() {
        const gridOverlay = document.createElement('div');
        gridOverlay.className = 'grid-overlay';
        
        // 创建垂直线
        for (let i = 1; i < BOARD_WIDTH; i++) {
            const verticalLine = document.createElement('div');
            verticalLine.className = 'grid-line-vertical';
            verticalLine.style.left = `${(i * 100) / BOARD_WIDTH}%`;
            gridOverlay.appendChild(verticalLine);
        }
        
        // 创建水平线
        for (let i = 1; i < BOARD_HEIGHT; i++) {
            const horizontalLine = document.createElement('div');
            horizontalLine.className = 'grid-line-horizontal';
            horizontalLine.style.top = `${(i * 100) / BOARD_HEIGHT}%`;
            gridOverlay.appendChild(horizontalLine);
        }
        
        return gridOverlay;
    }
}

// 创建游戏实例
let game1 = new TetrisGame('gameBoard1', 'nextPiece1', 'scoreValue1');
let game2 = new TetrisGame('gameBoard2', 'nextPiece2', 'scoreValue2');

// 设置对手引用
game1.setOpponent(game2);
game2.setOpponent(game1);

// 添加游戏控制函数
function toggleBothPause() {
    game1.isPaused = !game1.isPaused;
    game2.isPaused = !game2.isPaused;
    
    // 正确设置pause屏幕的显示
    document.querySelector(`#${game1.boardId} .pause-screen`).style.display = 
        game1.isPaused ? 'flex' : 'none';
    document.querySelector(`#${game2.boardId} .pause-screen`).style.display = 
        game2.isPaused ? 'flex' : 'none';
    
    if (game1.isPaused) {
        clearInterval(gameInterval);
    } else {
        gameInterval = setInterval(gameLoop, 1000);
    }
}

function resetBothGames() {
    // 清除现有的游戏循环
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // 重置游戏实例
    game1 = new TetrisGame('gameBoard1', 'nextPiece1', 'scoreValue1');
    game2 = new TetrisGame('gameBoard2', 'nextPiece2', 'scoreValue2');
    
    // 重新设置对手关系
    game1.setOpponent(game2);
    game2.setOpponent(game1);
    
    // 清除游戏板内容
    document.getElementById('gameBoard1').innerHTML = '';
    document.getElementById('gameBoard2').innerHTML = '';
    
    // 重置所有显示
    document.getElementById('scoreValue1').textContent = '0';
    document.getElementById('scoreValue2').textContent = '0';
    document.getElementById('finalScore1').textContent = '0';
    document.getElementById('finalScore2').textContent = '0';
    document.getElementById('winner').textContent = 'None';
    
    // 重置游戏状态显示
    document.getElementById('gameOverStatus1').textContent = 'false';
    document.getElementById('gameOverStatus2').textContent = 'false';
    
    // 重置游戏板透明度
    document.getElementById('gameBoard1').style.opacity = '1';
    document.getElementById('gameBoard2').style.opacity = '1';
    
    // 重新添加暂停和游戏结束屏幕
    ['gameBoard1', 'gameBoard2'].forEach(boardId => {
        const board = document.getElementById(boardId);
        board.innerHTML = `
            <div id="pauseScreen${boardId.slice(-1)}" class="pause-screen">
                <div class="pause-text">PAUSE</div>
            </div>
            <div id="gameOverScreen${boardId.slice(-1)}" class="game-over-screen">
                <div class="game-over-text">Your Game Is Over</div>
            </div>
        `;
    });
    
    // 隐藏所有游戏结束相关的显示
    document.getElementById('gameOverModal').style.display = 'none';
    document.querySelectorAll('.game-over-screen').forEach(screen => {
        screen.style.display = 'none';
    });
    document.querySelectorAll('.pause-screen').forEach(screen => {
        screen.style.display = 'none';
    });
    
    // 初始化两个游戏
    game1.init();
    game2.init();
    
    // 重启游戏循环
    gameInterval = setInterval(gameLoop, 1000);
}

// 游戏主循环
function gameLoop() {
    if (!game1.isPaused && !game1.isGameOver) {
        game1.moveDown();
    }
    if (!game2.isPaused && !game2.isGameOver) {
        game2.moveDown();
    }

    // 检查游戏是否结束
    if (game1.isGameOver && game2.isGameOver) {
        showGameOver();
        clearInterval(gameInterval);
    }
}

// 添加键盘控制
document.addEventListener('keydown', (e) => {
    // 防止方向键和空格键滚动页面
    if (['ArrowUp', 'ArrowDown', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
    }

    // 玩家1的控制（WASD）
    if (!game1.isPaused && !game1.isGameOver) {
        switch (e.key.toLowerCase()) {
            case 'a': game1.moveLeft(); break;
            case 'd': game1.moveRight(); break;
            case 's': game1.moveDown(); break;
            case 'w': game1.rotate(); break;
            case ' ': game1.hardDrop(); break;
        }
    }

    // 玩家2的控制（方向键）
    if (!game2.isPaused && !game2.isGameOver) {
        switch (e.key) {
            case 'ArrowLeft': game2.moveLeft(); break;
            case 'ArrowRight': game2.moveRight(); break;
            case 'ArrowDown': game2.moveDown(); break;
            case 'ArrowUp': game2.rotate(); break;
            case 'Enter': game2.hardDrop(); break;
            case 'y': game2.hardDrop(); break;
        }
    }

    // 通用控制
    if (e.key === 'p') {
        toggleBothPause();
    }
});

// 初始化游戏
let gameInterval;
resetBothGames();

// 添加showGameOver函数
function showGameOver() {
    clearInterval(gameInterval);
    
    // 更新最终分数
    document.getElementById('finalScore1').textContent = game1.score;
    document.getElementById('finalScore2').textContent = game2.score;
    
    // 确定获胜者
    let winnerText;
    if (game1.score > game2.score) {
        winnerText = "Player 1 Wins!";
    } else if (game2.score > game1.score) {
        winnerText = "Player 2 Wins!";
    } else {
        winnerText = "It's a Tie!";
    }
    
    // 更新游戏结束模态框的内容
    document.getElementById('winner').textContent = winnerText;
    
    // 显示游戏结束模态框
    const gameOverModal = document.getElementById('gameOverModal');
    gameOverModal.style.display = 'flex';  // 改为flex以实现居中

    // 添加游戏结束的样式
    document.querySelector(`#${game1.boardId}`).style.opacity = '0.7';
    document.querySelector(`#${game2.boardId}`).style.opacity = '0.7';
}