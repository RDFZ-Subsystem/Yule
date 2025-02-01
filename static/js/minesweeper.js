let rows = 25;
let cols = 50;
let minesCount = 230;
let board = [];
let revealedCount = 0;
let gameOver = false;
let isFirstClick = true;
let noGuessMode = false;
let remainingMines;
let timer;
let timeElapsed = 0;

function createBoard() {
    board = Array.from({ length: rows }, () => Array(cols).fill(0));
    renderBoard();
}

function placeMines(excludeRow, excludeCol) {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        // 清空棋盘
        board = Array.from({ length: rows }, () => Array(cols).fill(0));
        let minesPlaced = 0;

        // 放置地雷
        while (minesPlaced < minesCount) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            
            if (Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1) {
                continue;
            }
            
            if (board[row][col] !== 'M') {
                board[row][col] = 'M';
                minesPlaced++;
            }
        }

        calculateNumbers();

        // 在无猜模式下验证布局
        if (!noGuessMode || isValidNoGuessBoard(excludeRow, excludeCol)) {
            return true;
        }

        attempts++;
    }

    if (noGuessMode) {
        console.log("Failed to generate a valid no-guess board, falling back to normal mode");
    }
    return false;
}

function calculateNumbers() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === 'M') {
                continue;
            }
            let minesAround = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = r + i;
                    const newCol = c + j;
                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                        if (board[newRow][newCol] === 'M') {
                            minesAround++;
                        }
                    }
                }
            }
            board[r][c] = minesAround;
        }
    }
}

function renderBoard() {
    const gameDiv = document.getElementById('game');
    gameDiv.innerHTML = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick);
            cell.addEventListener('mousedown', handleMouseDown);
            cell.addEventListener('mouseup', handleMouseUp);
            gameDiv.appendChild(cell);
        }
    }
}

function handleCellClick(event) {
    if (gameOver) return;
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    revealCell(row, col);
}

function handleRightClick(event) {
    event.preventDefault();
    if (gameOver) return;

    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

    if (!cell.classList.contains('revealed')) {
        if (cell.classList.contains('flagged')) {
            cell.classList.remove('flagged');
            remainingMines++;
        } else {
            cell.classList.add('flagged');
            remainingMines--;
        }
        document.getElementById('minesLeft').textContent = remainingMines;
    }
}

function handleMouseDown(event) {
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

    let flagCount = 0;
    if (cell.classList.contains('revealed')) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = parseInt(row) + i;
                const newCol = parseInt(col) + j;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    const neighborCell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                    if (!neighborCell.classList.contains('revealed') && !neighborCell.classList.contains('flagged')) {
                        neighborCell.classList.add('highlighted');
                    }
                    else if (neighborCell.classList.contains('flagged')) {
                        flagCount++;
                    }
                }
            }
        }
    }
    
    if (flagCount === board[row][col]) {
        if (isFirstClick) {
            placeMines(row, col);
            isFirstClick = false;
        }
        
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (!(i === 0 && j === 0)) {
                    const newRow = parseInt(row) + i;
                    const newCol = parseInt(col) + j;
                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                        const neighborCell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                        if (!neighborCell.classList.contains('flagged')) {
                            neighborCell.classList.remove('highlighted');
                            revealCell(newRow, newCol);
                        }
                    }
                }
            }
        }
    }
}

function handleMouseUp(event) {
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

    if (cell.classList.contains('revealed')) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = parseInt(row) + i;
                const newCol = parseInt(col) + j;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    const neighborCell = document.querySelector(`.cell[data-row="${newRow}"][data-col="${newCol}"]`);
                    if (!neighborCell.classList.contains('revealed')) {
                        neighborCell.classList.remove('highlighted');
                    }
                }
            }
        }
    }
}

function revealCell(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    
    if (cell.classList.contains('flagged')) return;
    if (cell.classList.contains('revealed')) return;

    if (isFirstClick) {
        placeMines(row, col);
        isFirstClick = false;
        clearInterval(timer);  // 清除可能存在的旧计时器
        startTimer();  // 开始新的计时
    }

    cell.classList.add('revealed');
    revealedCount++;

    if (board[row][col] === 'M') {
        cell.classList.add('mine');
        gameOver = true;
        document.getElementById('message').textContent = 'Game Over! You step on a mine!';
        revealAllMines();
        clearInterval(timer);  // 游戏结束时停止计时
        return;
    }

    if (board[row][col] > 0) {
        cell.textContent = board[row][col];
    } else {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = parseInt(row) + i;
                const newCol = parseInt(col) + j;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    revealCell(newRow, newCol);
                }
            }
        }
    }

    if (revealedCount === rows * cols - minesCount) {
        document.getElementById('message').textContent = 'Congratulations! You won!';
        gameOver = true;
        clearInterval(timer);  // 游戏胜利时停止计时
    }
}

function revealAllMines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === 'M') {
                const mineCell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                mineCell.classList.add('mine');
            }
        }
    }
}

function resetGame() {
    gameOver = false;
    revealedCount = 0;
    isFirstClick = true;
    remainingMines = minesCount;
    timeElapsed = 0;
    document.getElementById('message').textContent = '';
    document.getElementById('minesLeft').textContent = remainingMines;
    document.getElementById('timeElapsed').textContent = '0';
    clearInterval(timer);  // 重置游戏时清除计时器
    timer = null;  // 将timer设为null以避免多个计时器
    createBoard();
}

document.getElementById('resetButton').addEventListener('click', resetGame);

function showSettings() {
    document.getElementById('settingsModal').style.display = 'flex';
}

function hideSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function changeDifficulty(newRows, newCols, newMines) {
    rows = newRows;
    cols = newCols;
    minesCount = newMines;
    remainingMines = minesCount;
    
    const gameDiv = document.getElementById('game');
    gameDiv.style.gridTemplateColumns = `repeat(${cols}, 20px)`;
    gameDiv.style.gridTemplateRows = `repeat(${rows}, 20px)`;
    
    resetGame();
    hideSettings();
}

document.getElementById('settingsButton').addEventListener('click', showSettings);

document.getElementById('settingsModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('settingsModal')) {
        hideSettings();
    }
});

document.querySelectorAll('.difficulty-button').forEach(button => {
    button.addEventListener('click', () => {
        const [newRows, newCols, newMines] = button.dataset.size.split(',').map(Number);
        changeDifficulty(newRows, newCols, newMines);
    });
});

// 添加模式切换函数
function toggleGameMode(mode) {
    noGuessMode = mode === 'noguess';
    document.querySelectorAll('.mode-button').forEach(button => {
        button.classList.toggle('active', button.dataset.mode === mode);
    });
    resetGame();
}

// 修改无猜模式验证函数
function isValidNoGuessBoard(startRow, startCol) {
    // 创建访问标记数组
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    
    // 从给定的起始位置开始
    let queue = [{row: parseInt(startRow), col: parseInt(startCol)}];
    visited[startRow][startCol] = true;

    // 广度优先搜索
    while (queue.length > 0) {
        const {row, col} = queue.shift();
        
        // 检查周围8个格子
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < rows && 
                    newCol >= 0 && newCol < cols && 
                    !visited[newRow][newCol]) {
                    
                    // 如果是安全格子
                    if (board[newRow][newCol] !== 'M') {
                        visited[newRow][newCol] = true;
                        
                        // 如果是空格子或数字为0的格子，加入队列继续搜索
                        if (board[newRow][newCol] === 0) {
                            queue.push({row: newRow, col: newCol});
                        }
                        // 如果是数字格子，检查是否有明显的下一步
                        else {
                            let mineCount = 0;
                            let unrevealedCount = 0;
                            // 检查这个数字格子周围的情况
                            for (let di = -1; di <= 1; di++) {
                                for (let dj = -1; dj <= 1; dj++) {
                                    const checkRow = newRow + di;
                                    const checkCol = newCol + dj;
                                    if (checkRow >= 0 && checkRow < rows && 
                                        checkCol >= 0 && checkCol < cols) {
                                        if (board[checkRow][checkCol] === 'M') {
                                            mineCount++;
                                        }
                                        if (!visited[checkRow][checkCol]) {
                                            unrevealedCount++;
                                        }
                                    }
                                }
                            }
                            // 如果未访问的格子数等于数字，说明这些格子都是雷
                            // 如果未访问的格子数等于周围的总雷数，说明其他格子都是安全的
                            if (unrevealedCount === board[newRow][newCol] || 
                                unrevealedCount === mineCount) {
                                queue.push({row: newRow, col: newCol});
                            }
                        }
                    }
                }
            }
        }
    }

    // 检查是否所有非地雷格子都可以被访问到
    let safeSquares = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] !== 'M') {
                safeSquares++;
                if (!visited[r][c]) {
                    return false;
                }
            }
        }
    }

    return safeSquares === (rows * cols - minesCount);
}

// 添加事件监听器
document.querySelectorAll('.mode-button').forEach(button => {
    button.addEventListener('click', () => {
        toggleGameMode(button.dataset.mode);
    });
});

// 添加帮助相关的函数
function showHelp() {
    document.getElementById('helpModal').style.display = 'flex';
}

function hideHelp() {
    document.getElementById('helpModal').style.display = 'none';
}

// 添加事件监听器
document.getElementById('helpButton').addEventListener('click', showHelp);
document.getElementById('helpModal').addEventListener('click', hideHelp);

// 添加计时器函数
function startTimer() {
    if (timer) {  // 如果已经有计时器在运行，先清除它
        clearInterval(timer);
    }
    timeElapsed = 0;  // 重置时间
    document.getElementById('timeElapsed').textContent = timeElapsed;
    timer = setInterval(() => {
        timeElapsed++;
        document.getElementById('timeElapsed').textContent = timeElapsed;
    }, 1000);
}

// 初始化游戏
resetGame();