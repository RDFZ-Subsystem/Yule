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
    // 创建一个模拟游戏状态的数组
    const revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
    const flagged = Array.from({ length: rows }, () => Array(cols).fill(false));
    
    // 从起始位置开始
    let queue = [{row: parseInt(startRow), col: parseInt(startCol)}];
    let progress = true;
    
    // 模拟第一次点击
    revealSimulated(parseInt(startRow), parseInt(startCol), revealed, flagged);
    
    // 持续尝试解决棋盘，直到无法取得进展
    while (progress) {
        progress = false;
        
        // 检查所有已揭示的格子
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (revealed[r][c] && board[r][c] !== 0 && board[r][c] !== 'M') {
                    // 计算周围未揭示的格子和已标记的地雷
                    let unrevealedCount = 0;
                    let flaggedCount = 0;
                    let unrevealedCells = [];
                    
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            const newRow = r + i;
                            const newCol = c + j;
                            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                                if (!revealed[newRow][newCol]) {
                                    unrevealedCount++;
                                    unrevealedCells.push({row: newRow, col: newCol});
                                }
                                if (flagged[newRow][newCol]) {
                                    flaggedCount++;
                                }
                            }
                        }
                    }
                    
                    // 情况1: 如果周围未揭示的格子数等于数字减去已标记的地雷数，则所有未揭示的格子都是地雷
                    if (unrevealedCount === board[r][c] - flaggedCount) {
                        unrevealedCells.forEach(cell => {
                            if (!flagged[cell.row][cell.col]) {
                                flagged[cell.row][cell.col] = true;
                                progress = true;
                            }
                        });
                    }
                    
                    // 情况2: 如果已标记的地雷数等于格子的数字，则所有未标记的格子都是安全的
                    if (flaggedCount === board[r][c]) {
                        unrevealedCells.forEach(cell => {
                            if (!flagged[cell.row][cell.col] && !revealed[cell.row][cell.col]) {
                                revealSimulated(cell.row, cell.col, revealed, flagged);
                                progress = true;
                            }
                        });
                    }
                }
            }
        }
    }
    
    // 检查是否所有非地雷格子都被揭示
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] !== 'M' && !revealed[r][c]) {
                return false; // 存在无法通过逻辑推理揭示的安全格子
            }
        }
    }
    
    return true;
}

// 模拟揭示格子的函数
function revealSimulated(row, col, revealed, flagged) {
    if (row < 0 || row >= rows || col < 0 || col >= cols || revealed[row][col] || flagged[row][col]) {
        return;
    }
    
    revealed[row][col] = true;
    
    // 如果是空格子，递归揭示周围的格子
    if (board[row][col] === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealSimulated(row + i, col + j, revealed, flagged);
            }
        }
    }
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