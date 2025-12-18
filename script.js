// State management
let isLoggedIn = false;
let currentUser = '';
let totalScans = 0;
let safeCount = 0;
let warningCount = 0;
let scanResults = [];

// DOM elements
const loginPage = document.getElementById('loginPage');
const mainPage = document.getElementById('mainPage');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const userInfo = document.getElementById('userInfo');
const welcomeUser = document.getElementById('welcomeUser');
const logoutBtn = document.getElementById('logoutBtn');
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const analyzeBtn = document.getElementById('analyzeBtn');
const results = document.getElementById('results');
const resultList = document.getElementById('resultList');
const totalScansEl = document.getElementById('totalScans');
const safeCountEl = document.getElementById('safeCount');
const warningCountEl = document.getElementById('warningCount');

// Demo credentials
const demoUsers = {
    'admin': 'admin123',
    'user': '123456'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    initDragDrop();
    initNavigation();
    initParallax();
});

// Check login status (from localStorage)
function checkLoginStatus() {
    const savedUser = localStorage.getItem('ecoclass_user');
    if (savedUser) {
        loginSuccess(savedUser);
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    loginPage.classList.remove('hidden');
    mainPage.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    userInfo.classList.add('hidden');
}

// Login handler
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (demoUsers[username] && demoUsers[username] === password) {
        loginSuccess(username);
    } else {
        alert('Username atau password salah!\nDemo:\nadmin / admin123\nuser / 123456');
        document.getElementById('username').focus();
    }
});

function loginSuccess(username) {
    isLoggedIn = true;
    currentUser = username;
    localStorage.setItem('ecoclass_user', username);
    
    loginPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
    
    loginBtn.classList.add('hidden');
    userInfo.classList.remove('hidden');
    welcomeUser.textContent = `Halo, ${username}!`;
    
    loadStats();
    results.classList.add('hidden');
    resultList.innerHTML = '';
}

// Logout handler
logoutBtn.addEventListener('click', function() {
    if (confirm('Yakin ingin logout? Data statistik akan disimpan.')) {
        logout();
    }
});

function logout() {
    isLoggedIn = false;
    localStorage.removeItem('ecoclass_user');
    mainPage.classList.add('hidden');
    showLoginPage();
    document.getElementById('loginForm').reset();
}

// Drag & Drop functionality
function initDragDrop() {
    const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
    
    events.forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    uploadArea.addEventListener('drop', handleDrop, false);
    imageInput.addEventListener('change', handleImageSelect);
    uploadArea.addEventListener('click', () => imageInput.click());
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    uploadArea.classList.add('dragover');
}

function unhighlight(e) {
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleImageSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    const file = Array.from(files).find(f => f.type.startsWith('image/'));
    if (file && file.size < 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            preview.classList.add('preview-img');
            analyzeBtn.style.display = 'inline-block';
            results.classList.add('hidden');
        };
        reader.readAsDataURL(file);
        imageInput.value = '';
    } else {
        alert('Pilih file gambar yang valid (JPG, PNG, WEBP <5MB)');
    }
}

// AI Analysis (simulated)
analyzeBtn.addEventListener('click', async function() {
    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menganalisis...';
    analyzeBtn.disabled = true;

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const result = simulateAIResult();
    displayResults(result);
    
    updateStats(result);
    
    analyzeBtn.innerHTML = '<i class="fas fa-redo"></i> Analisis Lagi';
    analyzeBtn.disabled = false;
    
    setTimeout(() => {
        analyzeBtn.innerHTML = originalText;
    }, 2000);
});

function simulateAIResult() {
    const types = [
        { name: 'Sampah Plastik', confidence: 92, status: 'danger' },
        { name: 'Kemasan Makanan', confidence: 87, status: 'warning' },
        { name: 'Lingkungan Bersih', confidence: 95, status: 'safe' },
        { name: 'Botol Plastik', confidence: 78, status: 'danger' },
        { name: 'Polusi Air', confidence: 65, status: 'warning' },
        { name: 'Daun Kering', confidence: 88, status: 'safe' },
        { name: 'Kaleng Minuman', confidence: 91, status: 'danger' }
    ];

    return types[Math.floor(Math.random() * types.length)];
}

function displayResults(result) {
    results.classList.remove('hidden');
    scanResults.unshift(result);
    
    const resultHtml = `
        <div class="result-item">
            <div class="result-icon ${result.status}">
                <i class="fas fa-${result.status === 'safe' ? 'check-circle' : result.status === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
            </div>
            <div style="flex: 1;">
                <h4>${result.name}</h4>
                <p><strong>Keyakinan AI:</strong> ${result.confidence}%</p>
                <div style="margin-top: 0.5rem;">
                    <div class="progress-bar" style="width: 0%;"></div>
                </div>
            </div>
        </div>
    `;
    
    resultList.innerHTML = resultHtml + resultList.innerHTML;
    
    // Animate progress bar
    const progressBar = resultList.querySelector('.progress-bar');
    setTimeout(() => {
        progressBar.style.width = `${result.confidence}%`;
    }, 500);
}

function updateStats(result) {
    totalScans++;
    if (result.confidence > 80) safeCount++;
    else if (result.confidence > 50) warningCount++;
    
    totalScansEl.textContent = totalScans;
    safeCountEl.textContent = safeCount;
    warningCountEl.textContent = warningCount;
    
    saveStats();
}

function loadStats() {
    const savedStats = localStorage.getItem('ecoclass_stats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        totalScans = stats.totalScans || 0;
        safeCount = stats.safeCount || 0;
        warningCount = stats.warningCount || 0;
        updateDisplayStats();
    }
}

function saveStats() {
    localStorage.setItem('ecoclass_stats', JSON.stringify({
        totalScans,
        safeCount,
        warningCount,
        lastUpdated: new Date().toISOString()
    }));
}

function updateDisplayStats() {
    totalScansEl.textContent = totalScans;
    safeCountEl.textContent = safeCount;
    warningCountEl.textContent = warningCount;
}

// Navigation
function initNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        });
    });
}

// Parallax effect
function initParallax() {
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Login button navigation
loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    loginPage.scrollIntoView({ behavior: 'smooth' });
});
