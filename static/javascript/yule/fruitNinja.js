const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let score = 0;
let fruits = [];
let lastSpawnTime = 0;
let mouseTrail = [];

let maxHealth = 100;
let currentHealth = maxHealth;
const healthBar = document.getElementById('healthBar');
const healthLossPerMiss = 35;

// 水果类型
const fruitTypes = [
    { name: '🍎', color: '#ff0000', points: 10, radius: 25 },
    { name: '🍊', color: '#ffa500', points: 15, radius: 20 },
    { name: '🍇', color: '#800080', points: 20, radius: 22 },
    { name: '🍉', color: '#ff6b6b', points: 25, radius: 30 },
    { name: '🍌', color: '#ffff00', points: 15, radius: 25 },
    { name: '💣', color: '#000000', points: -20, radius: 25}
];

// 创建水果
class Fruit {
    constructor() {
        const type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
        this.x = Math.random() * (canvas.width - 50) + 25;
        this.y = canvas.height + 30;
        this.speedY = -15 - Math.random() * 2.5;
        this.speedX = (Math.random() - 0.5) * 5;
        this.gravity = 0.25;
        this.isSliced = false;
        this.type = type;
        this.radius = type.radius;
        this.rotationAngle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.speedY += this.gravity;
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotationAngle += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);
        ctx.font = `${this.radius * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.name, 0, 0);
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 10 + 2;
        this.speedX = (Math.random() - 0.5) * 10;
        this.speedY = (Math.random() - 0.5) * 10;
        this.alpha = 2;
        this.gravity = 0.05;
    }

    update() {
        this.x += this.speedX;
        this.speedY += this.gravity;
        this.y += this.speedY;
        this.alpha -= 0.02;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (currentHealth <= 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 50);
        
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2);
        ctx.fillText('Press Space to Restart', canvas.width/2, canvas.height/2 + 50);
        
        return;
    }
    
    if (Date.now() - lastSpawnTime > 1000) {
        fruits.push(new Fruit());
        lastSpawnTime = Date.now();
    }

    fruits = fruits.filter(fruit => {
        fruit.update();
        
        if (!fruit.isSliced && checkSlice(fruit)) {
            fruit.isSliced = true;
            score += fruit.type.points;
            scoreElement.textContent = score;
            if(fruit.type.points < 0) {
                currentHealth -= healthLossPerMiss;
                updateHealthBar();
            }
            
            createSliceEffect(fruit);
        }
        
        if (!fruit.isSliced) {
            fruit.draw();
        }
        
        return fruit.y < canvas.height + 50;
    });

    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return particle.alpha > 0;
    });

    drawMouseTrail();
    requestAnimationFrame(gameLoop);
    updateHealthBar();
}

function createSliceEffect(fruit) {
    for (let i = 0; i < 25; i++) {
        particles.push(new Particle(fruit.x, fruit.y, fruit.type.color));
    }
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(fruit.x, fruit.y, fruit.radius * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    ctx.restore();
    
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fruit.x - fruit.radius * 2, fruit.y);
    ctx.lineTo(fruit.x + fruit.radius * 2, fruit.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function updateMouseTrail(x, y) {
    mouseTrail.push({ x, y, time: Date.now() });
    if (mouseTrail.length > 10) {
        mouseTrail.shift();
    }
}

function drawMouseTrail() {
    if (mouseTrail.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(mouseTrail[0].x, mouseTrail[0].y);
    
    for (let i = 1; i < mouseTrail.length; i++) {
        ctx.lineTo(mouseTrail[i].x, mouseTrail[i].y);
    }
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function checkSlice(fruit) {
    if (fruit.isSliced) return false;
    
    for (let i = 1; i < mouseTrail.length; i++) {
        const dx = mouseTrail[i].x - fruit.x;
        const dy = mouseTrail[i].y - fruit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < fruit.radius) {
            return true;
        }
    }
    return false;
}

function updateHealthBar() {
    healthBar.style.width = (currentHealth / maxHealth * 100) + '%';
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    updateMouseTrail(x, y);
});

canvas.addEventListener('mouseout', () => {
    mouseTrail = [];
});

function resetGame() {
    score = 0;
    currentHealth = maxHealth;
    fruits = [];
    particles = [];
    mouseTrail = [];
    scoreElement.textContent = '0';
    updateHealthBar();
    lastSpawnTime = Date.now();
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && currentHealth <= 0) {
        resetGame();
        requestAnimationFrame(gameLoop);
    }
});

gameLoop(); 