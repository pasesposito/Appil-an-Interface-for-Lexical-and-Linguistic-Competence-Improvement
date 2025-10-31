const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const incorrectAttemptsDisplay = document.getElementById('incorrect-attempts');
const finalScoreDisplay = document.getElementById('final-score');
const finalIncorrectAttemptsDisplay = document.getElementById('final-incorrect-attempts');
const gameOverModal = document.getElementById('gameOverModal');
const instructionModal = document.getElementById('instructionModal');
const closeButtons = document.querySelectorAll('.close');
let flippedCards = [];
let matchedCards = [];
let score = 0;
let incorrectAttempts = 0;
let currentDifficulty = 1; // Default difficulty level

// Define 5 sets of verbs with increasing difficulty
const verbSets = {
    1: [ // Easy - More regular verbs
        { present: 'play', past: 'played' },
        { present: 'work', past: 'worked' },
        { present: 'watch', past: 'watched' },
        { present: 'start', past: 'started' },
        { present: 'talk', past: 'talked' },
        { present: 'cook', past: 'cooked' },
        { present: 'jump', past: 'jumped' },
        { present: 'clean', past: 'cleaned' }
    ],
    2: [ // Medium - Mix of regular and irregular
        { present: 'go', past: 'went' },
        { present: 'have', past: 'had' },
        { present: 'get', past: 'got' },
        { present: 'eat', past: 'ate' },
        { present: 'sleep', past: 'slept' },
        { present: 'play', past: 'played' },
        { present: 'work', past: 'worked' },
        { present: 'watch', past: 'watched' }
    ],
    3: [ // Hard - More irregular verbs
        { present: 'write', past: 'wrote' },
        { present: 'sing', past: 'sang' },
        { present: 'read', past: 'read' },
        { present: 'speak', past: 'spoke' },
        { present: 'drink', past: 'drank' },
        { present: 'catch', past: 'caught' },
        { present: 'think', past: 'thought' },
        { present: 'teach', past: 'taught' }
    ],
    4: [ // Very Hard - Challenging irregular verbs
        { present: 'swim', past: 'swam' },
        { present: 'begin', past: 'began' },
        { present: 'choose', past: 'chose' },
        { present: 'draw', past: 'drew' },
        { present: 'find', past: 'found' },
        { present: 'forget', past: 'forgot' },
        { present: 'give', past: 'gave' },
        { present: 'sell', past: 'sold' }
    ],
    5: [ // Expert - Complex and less common irregular verbs
        { present: 'fly', past: 'flew' },
        { present: 'forget', past: 'forgot' },
        { present: 'leave', past: 'left' },
        { present: 'meet', past: 'met' },
        { present: 'take', past: 'took' },
        { present: 'become', past: 'became' },
        { present: 'break', past: 'broke' },
        { present: 'steal', past: 'stole' }
    ]
};

function createCard(wordData, type) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.text = wordData[type];
    card.dataset.pairId = type === 'present' ? wordData.present : wordData.past;
    card.dataset.type = type;

    card.classList.add(type === 'present' ? 'present-card' : 'past-card');

    const front = document.createElement('div');
    front.classList.add('front');

    const back = document.createElement('div');
    back.classList.add('back');
    back.textContent = wordData[type];

    card.appendChild(front);
    card.appendChild(back);

    card.addEventListener('click', flipCard);

    return card;
}

function initGame() {
    scoreDisplay.textContent = score;
    incorrectAttemptsDisplay.textContent = incorrectAttempts;

    const pairs = [];
    const verbData = verbSets[currentDifficulty];

    verbData.forEach(word => {
        pairs.push({ ...word, type: 'present' });
        pairs.push({ ...word, type: 'past' });
    });

    shuffleArray(pairs);

    const gridSize = 16; // For a 4x4 grid
    const limitedPairs = pairs.slice(0, gridSize);

    gameBoard.innerHTML = ''; // Clear previous cards
    limitedPairs.forEach(wordData => {
        const card = createCard(wordData, wordData.type);
        gameBoard.appendChild(card);
    });

    gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
    gameBoard.style.gridTemplateRows = 'repeat(4, 1fr)';
}

function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flipped') && !matchedCards.includes(this)) {
        this.classList.add('flipped');
        flippedCards.push(this);

        // Pronounce the word on the card
        pronounceWord(this.dataset.text);

        if (flippedCards.length === 2) {
            setTimeout(checkForMatch, 1000);
        }
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;

    const isMatch = (card1.dataset.type === 'present' && card2.dataset.type === 'past' && isMatchingPresentPast(card1, card2)) ||
                    (card1.dataset.type === 'past' && card2.dataset.type === 'present' && isMatchingPresentPast(card2, card1));

    if (isMatch) {
        matchedCards.push(card1, card2);
        score += 10;
        scoreDisplay.textContent = score;
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        incorrectAttempts++;
        incorrectAttemptsDisplay.textContent = incorrectAttempts;
    }

    flippedCards = [];

    if (matchedCards.length === document.querySelectorAll('.card').length) {
        gameOver();
    }
}

function isMatchingPresentPast(presentCard, pastCard) {
    const present = presentCard.dataset.pairId;
    const past = pastCard.dataset.pairId;

    const validMatches = verbSets[currentDifficulty].reduce((acc, word) => {
        acc[word.present] = word.past;
        return acc;
    }, {});

    return validMatches[present] === past;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

function gameOver() {
    // Display game over modal
    finalScoreDisplay.textContent = score;
    finalIncorrectAttemptsDisplay.textContent = incorrectAttempts;
    openModal(gameOverModal);
}

function resetGame() {
    // Reset score and incorrect attempts
    score = 0;
    incorrectAttempts = 0;
    scoreDisplay.textContent = score;
    incorrectAttemptsDisplay.textContent = incorrectAttempts;
    initGame();
}

function setDifficulty(level) {
    currentDifficulty = level;
    // Reset score and attempts for new difficulty
    score = 0;
    incorrectAttempts = 0;
    scoreDisplay.textContent = score;
    incorrectAttemptsDisplay.textContent = incorrectAttempts;
    initGame(); // Reinitialize the game with the new difficulty level
}

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        closeModal(instructionModal);
        closeModal(gameOverModal);
    });
});

initGame(); // Initialize the game when the page loads
