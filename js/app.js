// Game state
const gameState = {
    players: [],
    playerCount: 4,
    rounds: 12,
    currentRound: 0,
    scores: {},
    enabledPacks: ['Base Game', 'Game 2', 'Game 3'],
    prompts: [],
    usedPrompts: []
};

// DOM elements
const elements = {
    menuScreen: document.getElementById('menu-screen'),
    gameScreen: document.getElementById('game-screen'),
    resultsScreen: document.getElementById('results-screen'),
    playerCountInput: document.getElementById('player-count'),
    roundCountInput: document.getElementById('round-count'),
    packCheckboxes: document.querySelectorAll('.pack-checkbox'),
    startGameBtn: document.getElementById('start-game'),
    playAgainBtn: document.getElementById('play-again'),
    goToMenuBtn: document.getElementById('go-to-menu'),
    homeButton: document.getElementById('home-button'),
    currentRoundDisplay: document.getElementById('current-round'),
    totalRoundsDisplay: document.getElementById('total-rounds'),
    promptText: document.getElementById('prompt-text'),
    playersContainer: document.getElementById('players-container'),
    resultsContainer: document.getElementById('results-container')
};

// Player colors
const playerColors = [
    '#FF0000', '#00FFFF', '#FFA500', '#7CFC00',
    '#0000FF', '#FF00FF', '#4169E1', '#93e449',
    '#FF1493', '#00FA9A', '#bcbcbc', '#2db92d',
    '#fd95e8', '#1E90FF', '#FFD700', '#4B0082',
    '#FF6347', '#00CED1', '#FF4500', '#9932CC',
    '#9ACD32'
];

// Initialize the game
function init() {
    loadPrompts();
    setupEventListeners();
}

// Load prompts from JSON
async function loadPrompts() {
    try {
        const response = await fetch('Assets/prompts.json');
        const data = await response.json();
        
        // Flatten prompts from enabled packs
        gameState.prompts = [];
        for (const pack in data) {
            if (gameState.enabledPacks.includes(pack)) {
                gameState.prompts.push(...data[pack]);
            }
        }
    } catch (error) {
        console.error('Error loading prompts:', error);
        // Fallback prompts if JSON fails to load
        gameState.prompts = [
            "A bad campaign slogan for a congressperson",
            "A brand of cereal for the elderly",
            "A good man is hard to <BLANK>",
            "The next big superhero sidekick",
            "An embarrassing thing to forget at a wedding",
            "The worst thing to hear from your barber",
            "A terrible name for a sex toy",
            "The worst thing to say during a eulogy"
        ];
    }
}

// Set up event listeners
function setupEventListeners() {
    elements.startGameBtn.addEventListener('click', startGame);
    elements.playAgainBtn.addEventListener('click', playAgain);
    elements.goToMenuBtn.addEventListener('click', goToMenu);
    elements.homeButton.addEventListener('click', goToMenu);
    
    elements.packCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', togglePack);
    });
}

// Toggle prompt packs
function togglePack(e) {
    const pack = e.target.dataset.pack;
    if (e.target.checked) {
        if (!gameState.enabledPacks.includes(pack)) {
            gameState.enabledPacks.push(pack);
        }
    } else {
        gameState.enabledPacks = gameState.enabledPacks.filter(p => p !== pack);
    }
    loadPrompts();
}

// Start the game
function startGame() {
    // Get game settings
    gameState.playerCount = parseInt(elements.playerCountInput.value);
    gameState.rounds = parseInt(elements.roundCountInput.value);
    
    // Initialize players
    gameState.players = Array.from({ length: gameState.playerCount }, (_, i) => `Player ${i + 1}`);
    gameState.scores = {};
    gameState.players.forEach(player => {
        gameState.scores[player] = 0;
    });
    
    // Reset round counter
    gameState.currentRound = 0;
    gameState.usedPrompts = [];
    
    // Update UI
    elements.totalRoundsDisplay.textContent = gameState.rounds;
    
    // Switch to game screen
    elements.menuScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
    
    // Start first round
    nextRound();
}

// Advance to next round
function nextRound() {
    gameState.currentRound++;
    
    if (gameState.currentRound > gameState.rounds) {
        endGame();
        return;
    }
    
    elements.currentRoundDisplay.textContent = gameState.currentRound;
    
    // Get a random prompt that hasn't been used yet
    let availablePrompts = gameState.prompts.filter(p => !gameState.usedPrompts.includes(p));
    if (availablePrompts.length === 0) {
        // If we've used all prompts, reset used prompts
        gameState.usedPrompts = [];
        availablePrompts = [...gameState.prompts];
    }
    
    const randomIndex = Math.floor(Math.random() * availablePrompts.length);
    const prompt = availablePrompts[randomIndex];
    gameState.usedPrompts.push(prompt);
    
    elements.promptText.textContent = prompt;
    
    // Create player buttons
    elements.playersContainer.innerHTML = '';
    gameState.players.forEach((player, index) => {
        const playerBtn = document.createElement('button');
        playerBtn.className = 'player-btn';
        playerBtn.style.backgroundColor = playerColors[index % playerColors.length];
        playerBtn.innerHTML = `
            <span class="player-name">${player}</span>
            <span class="player-score">${gameState.scores[player]}</span>
        `;
        
        playerBtn.addEventListener('click', () => {
            awardPoint(player);
        });
        
        elements.playersContainer.appendChild(playerBtn);
    });
}

// Award point to player
function awardPoint(player) {
    gameState.scores[player]++;
    nextRound();
}

// End the game and show results
function endGame() {
    elements.gameScreen.classList.remove('active');
    elements.resultsScreen.classList.add('active');
    
    // Convert scores to array and sort
    const sortedScores = Object.entries(gameState.scores)
        .map(([player, score]) => ({ player, score }))
        .sort((a, b) => b.score - a.score);
    
    // Display results
    elements.resultsContainer.innerHTML = '';
    sortedScores.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${index === 0 ? 'winner' : ''}`;
        resultItem.innerHTML = `
            <span>${result.player}</span>
            <span>${result.score} points</span>
        `;
        elements.resultsContainer.appendChild(resultItem);
    });
}

// Play again with same settings
function playAgain() {
    elements.resultsScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
    
    // Reset scores
    gameState.scores = {};
    gameState.players.forEach(player => {
        gameState.scores[player] = 0;
    });
    
    // Reset round counter
    gameState.currentRound = 0;
    gameState.usedPrompts = [];
    
    // Start first round
    nextRound();
}

// Play Sound When Clicking Button

const Button_Sound = new Audio('Assets/click.mp3'); // Create an Audio object

// Function to play the sound
function playButton_Sound() {
  Button_Sound.play();
}

// Add event listeners to buttons
document.getElementById('start-game').addEventListener('click', playButton_Sound);
document.getElementById('play-again').addEventListener('click', playButton_Sound);
document.getElementById('go-to-menu').addEventListener('click', playButton_Sound);
document.getElementById('home-button').addEventListener('click', playButton_Sound);
document.getElementById('players-container').addEventListener('click', playButton_Sound);


// Return to main menu
function goToMenu() {
    elements.gameScreen.classList.remove('active');
    elements.resultsScreen.classList.remove('active');
    elements.menuScreen.classList.add('active');
}

// Initialize the game when loaded
window.addEventListener('DOMContentLoaded', init);