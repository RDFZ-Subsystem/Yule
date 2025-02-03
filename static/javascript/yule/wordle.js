// 为不同长度的单词创建单独的词典
const wordDicts = {
    4: {},
    5: {},
    6: {}
};
let wordLength = 5; // 默认单词长度

// 添加CSW19词典（这里只是一个示例，实际需要完整的词典）
const validWords = new Set([
    "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ACUTE", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER",
    // ... 需要添加更多有效单词
]);

// 修改加载词典的逻辑，只使用wordlist
fetch('/yulewordlist')
    .then(response => response.text())
    .then(text => {
        processWordList(text);
        
        // 输出每个长度的单词数量
        for (let length in wordDicts) {
            console.log(`${length}-letter words: ${Object.keys(wordDicts[length]).length}`);
        }
        
        initializeGame();
    })
    .catch(error => {
        console.error('Error loading word list:', error);
    });

// 简化processWordList函数，移除isExplained参数
function processWordList(text) {
    const lines = text.split('\n');
    lines.forEach(line => {
        if (line.trim() === '') return;
        
        const parts = line.split(' ');
        const word = parts[0].toUpperCase();
        const meaningStart = line.indexOf(' ');
        if (meaningStart !== -1 && /^[A-Za-z]+$/.test(word) && 
            word.length >= 4 && word.length <= 6) {
            const meaning = line.substring(meaningStart + 1).trim();
            if (!wordDicts[word.length].hasOwnProperty(word)) {
                wordDicts[word.length][word] = meaning;
            }
        }
    });
}

// 修改初始化游戏函数以使用当前长度的词典
function initializeGame() {
    const currentDict = wordDicts[wordLength];
    const words = Object.keys(currentDict);
    if (words.length > 0) {
        targetWord = words[Math.floor(Math.random() * words.length)];
        currentRow = 0;
        currentTile = 0;
        isGameOver = false;
        console.log(`Using ${wordLength}-letter words dictionary with ${words.length} words`);
    } else {
        console.error(`No ${wordLength}-letter words available`);
    }
}

// 修改changeWordLength函数
function changeWordLength(length) {
    if (wordDicts[length] && Object.keys(wordDicts[length]).length > 0) {
        wordLength = length;
        updateGameBoard();
        restartGame();
        hideSettings();
    } else {
        alert(`No ${length}-letter words available in the dictionary`);
    }
}

// 修改showGameOver函数以使用当前长度的词典
function showGameOver(won) {
    const modal = document.getElementById('gameOverModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalInfo = document.getElementById('modalInfo');
    const modalWord = document.getElementById('modalWord');
    const modalMeaning = document.getElementById('modalMeaning');
    const modalAttempts = document.getElementById('modalAttempts');

    if (won) {
        modalTitle.textContent = 'Congratulations!';
        modalInfo.textContent = 'You won!';
    } else {
        modalTitle.textContent = 'Game Over';
        modalInfo.textContent = 'Better luck next time!';
    }

    modalWord.textContent = `The word was: ${targetWord}`;
    modalMeaning.textContent = `Meaning: ${wordDicts[wordLength][targetWord]}`;
    modalAttempts.textContent = `Attempts: ${currentRow + 1}/6`;
    
    modal.style.display = 'flex';
}

// 创建游戏板
const gameBoard = document.getElementById('gameBoard');
for (let i = 0; i < 6; i++) {
    const row = document.createElement('div');
    row.className = 'word-row';
    for (let j = 0; j < 5; j++) {
        const box = document.createElement('div');
        box.className = 'letter-box';
        row.appendChild(box);
    }
    gameBoard.appendChild(row);
}

// 键盘事件处理
document.addEventListener('keydown', handleKeyPress);
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const letter = key.textContent;
        if (letter === '⌫') {
            deleteLetter();
        } else if (letter === 'Enter') {
            checkWord();
        } else {
            addLetter(letter);
        }
    });
});

function handleKeyPress(e) {
    if (isGameOver) return;

    if (e.key === 'Enter') {
        checkWord();
    } else if (e.key === 'Backspace') {
        deleteLetter();
    } else if (e.key.match(/^[a-zA-Z]$/)) {
        addLetter(e.key);
    }
}

function addLetter(letter) {
    if (currentTile < wordLength && currentRow < 6) {
        const row = gameBoard.children[currentRow];
        const box = row.children[currentTile];
        box.textContent = letter.toUpperCase();
        currentTile++;
    }
}

function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const row = gameBoard.children[currentRow];
        const box = row.children[currentTile];
        box.textContent = '';
    }
}

function checkWord() {
    if (currentTile !== wordLength) return;

    const row = gameBoard.children[currentRow];
    let guessWord = '';
    
    // 获取当前猜测的单词
    for (let i = 0; i < wordLength; i++) {
        guessWord += row.children[i].textContent;
    }

    // 检查单词是否有效
    if (!isValidWord(guessWord)) {
        showInvalidWordMessage();
        return;
    }

    const letterCount = {};
    
    // 统计目标单词中每个字母的出现次数
    for (let letter of targetWord) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    // 首先检查完全匹配的字母
    for (let i = 0; i < wordLength; i++) {
        const box = row.children[i];
        const letter = box.textContent;

        if (letter === targetWord[i]) {
            box.classList.add('correct');
            // 更新键盘按键颜色为绿色
            updateKeyboardColor(letter, 'correct');
            letterCount[letter]--;
        }
    }

    // 然后检查位置错误的字母
    for (let i = 0; i < wordLength; i++) {
        const box = row.children[i];
        const letter = box.textContent;

        if (!box.classList.contains('correct')) {
            if (letterCount[letter] > 0) {
                box.classList.add('present');
                // 更新键盘按键颜色为黄色（如果该按键还不是绿色）
                updateKeyboardColor(letter, 'present');
                letterCount[letter]--;
            } else {
                box.classList.add('absent');
                // 更新键盘按键颜色为灰色（如果该按键还没有其他颜色）
                updateKeyboardColor(letter, 'absent');
            }
        }
    }

    if (guessWord === targetWord) {
        showGameOver(true);
        isGameOver = true;
        return;
    }

    if (currentRow === 6 - 1) {
        showGameOver(false);
        isGameOver = true;
        return;
    }

    currentRow++;
    currentTile = 0;
}

// 添加更新键盘颜色的函数
function updateKeyboardColor(letter, status) {
    const key = document.querySelector(`.key:not(.Enter):not(.⌫):not([style*="background-color"])`);
    const keyButton = Array.from(document.querySelectorAll('.key')).find(k => k.textContent.toLowerCase() === letter.toLowerCase());
    
    if (keyButton) {
        // 如果按键已经是绿色，不要改变它的颜色
        if (keyButton.classList.contains('correct')) {
            return;
        }
        
        // 如果按键是黄色且新状态是灰色，不要改变它的颜色
        if (keyButton.classList.contains('present') && status === 'absent') {
            return;
        }

        // 移除所有可能的颜色类
        keyButton.classList.remove('correct', 'present', 'absent');
        // 添加新的颜色类
        keyButton.classList.add(status);
    }
}

// 修改重启游戏函数，添加重置键盘颜色的功能
function restartGame() {
    // 隐藏模态框
    document.getElementById('gameOverModal').style.display = 'none';
    
    // 重置游戏状态
    initializeGame()
    
    // 清空消息
    document.getElementById('message').textContent = '';
    
    // 重置游戏板
    const rows = gameBoard.children;
    for (let i = 0; i < rows.length; i++) {
        const boxes = rows[i].children;
        for (let j = 0; j < boxes.length; j++) {
            const box = boxes[j];
            box.textContent = '';
            box.className = 'letter-box';
        }
    }
    
    // 重置键盘颜色
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
}

// 添加设置相关的函数
function showSettings() {
    document.getElementById('settingsModal').style.display = 'flex';
}

function hideSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function updateGameBoard() {
    // 更新游戏板的列数
    const rows = document.querySelectorAll('.word-row');
    rows.forEach(row => {
        row.innerHTML = '';
        row.style.gridTemplateColumns = `repeat(${wordLength}, 60px)`;
        for (let j = 0; j < wordLength; j++) {
            const box = document.createElement('div');
            box.className = 'letter-box';
            row.appendChild(box);
        }
    });
}

// 添加事件监听器
document.getElementById('settingsButton').addEventListener('click', showSettings);

document.getElementById('settingsModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('settingsModal')) {
        hideSettings();
    }
});

document.querySelectorAll('.difficulty-button').forEach(button => {
    button.addEventListener('click', () => {
        const newLength = parseInt(button.dataset.length);
        changeWordLength(newLength);
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

// 添加主题切换功能
let currentTheme = 'light';

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // 更新按钮状态
    document.querySelectorAll('.theme-button').forEach(button => {
        button.classList.toggle('active', button.dataset.theme === theme);
    });
}

// 初始化主题
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

// 添加主题切换事件监听器
document.querySelectorAll('.theme-button').forEach(button => {
    button.addEventListener('click', () => {
        setTheme(button.dataset.theme);
    });
});

// 添加单词有效性检查函数
function isValidWord(word) {
    // 检查是否在当前长度的词典中
    return wordDicts[wordLength].hasOwnProperty(word) || validWords.has(word);
}

// 添加显示无效单词消息的函数
function showInvalidWordMessage() {
    const message = document.getElementById('invalidWordMessage');
    message.classList.add('show');
    
    // 2秒后自动隐藏消息
    setTimeout(() => {
        message.classList.remove('show');
    }, 2000);
}

// 修改加载词典的函数名和路由
function loadCSW22Dictionary() {
    fetch('/yulecsw22')  // 修改路由为csw22
        .then(response => response.text())
        .then(text => {
            text.split('\n').forEach(word => {
                word = word.trim().toUpperCase();
                if (word.length >= 4 && word.length <= 6) {
                    validWords.add(word);
                }
            });
            console.log('CSW22 dictionary loaded');
        })
        .catch(error => {
            console.error('Error loading CSW22 dictionary:', error);
        });
}

// 修改初始化调用
loadCSW22Dictionary();  // 更新函数调用