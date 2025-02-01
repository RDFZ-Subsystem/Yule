class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.init();
    }

    init() {
        // 初始添加两个数字
        this.addNewNumber();
        this.addNewNumber();
        this.updateView();
    }

    addNewNumber() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        let moved = false;
        const oldGrid = JSON.stringify(this.grid);

        if (direction === 'ArrowLeft' || direction === 'a') {
            moved = this.moveLeft();
        } else if (direction === 'ArrowRight' || direction === 'd') {
            this.grid = this.grid.map(row => row.reverse());
            moved = this.moveLeft();
            this.grid = this.grid.map(row => row.reverse());
        } else if (direction === 'ArrowUp' || direction === 'w') {
            this.grid = this.transpose(this.grid);
            moved = this.moveLeft();
            this.grid = this.transpose(this.grid);
        } else if (direction === 'ArrowDown' || direction === 's') {
            this.grid = this.transpose(this.grid);
            this.grid = this.grid.map(row => row.reverse());
            moved = this.moveLeft();
            this.grid = this.grid.map(row => row.reverse());
            this.grid = this.transpose(this.grid);
        }

        if (moved) {
            this.addNewNumber();
            this.updateView();
            
            if (this.checkGameOver()) {
                setTimeout(() => {
                    alert('Game Over！your score：' + this.score);
                    this.resetGame();
                }, 300);
            }
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1;) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                } else {
                    j++;
                }
            }
            const newRow = row.concat(Array(4 - row.length).fill(0));
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    transpose(grid) {
        return grid[0].map((_, i) => grid.map(row => row[i]));
    }

    checkGameOver() {
        // 检查是否有空格
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        // 检查是否有相邻的相同数字
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[i][j] === this.grid[i][j + 1]) return false;
                if (this.grid[j][i] === this.grid[j + 1][i]) return false;
            }
        }
        return true;
    }

    resetGame() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.init();
    }

    updateView() {
        const gridElement = document.getElementById('grid');
        const scoreElement = document.getElementById('score');
        
        gridElement.innerHTML = '';
        scoreElement.textContent = this.score;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                const value = this.grid[i][j];
                if (value !== 0) {
                    cell.textContent = value;
                    cell.classList.add(`tile-${value}`);
                }
                gridElement.appendChild(cell);
            }
        }
    }
}

// 初始化游戏
const game = new Game2048();

// 添加键盘事件监听
document.addEventListener('keydown', (e) => { game.move(e.key)});